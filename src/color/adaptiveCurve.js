/**
 * APCA-adaptive lightness curve generator.
 *
 * Builds a lightness distribution anchored at step 50 — the lightness that
 * maximizes the minimum APCA Lc contrast against both black (step 100) and
 * white (step 0). This anchor becomes the junction point of two independent
 * cubic polynomial half-vectors:
 *
 *   Dark half  (100 → 50): lightness 0 → L50
 *   Light half (50  →  0): lightness L50 → 1
 *
 * Each half starts from a linear distribution. For any step whose linear
 * position would violate Lc ≥ 45 against its step-50 partner, the APCA
 * compliance boundary is computed and added as a shaping target. A cubic
 * polynomial (constrained to pass through both endpoints) is then fitted
 * via least-squares to these targets, bending the curve only where
 * compliance requires it. Steps with no binding constraint remain linear.
 *
 * A final snap pass corrects any residual violations introduced by cubic
 * fitting error, and monotonicity is enforced throughout.
 */

import { computeSwatchColor } from './colorMath.js';
import { apcaContrastFromHex } from './apca.js';

const TARGET_LC = 45;
const BISECT_ITERS = 20;

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Convert a lightness value to a hex color using the palette's hue/saturation.
 */
function toHex(colorMode, hue, saturation, l) {
  const { hex } = computeSwatchColor(colorMode, hue, saturation, l, 1);
  return hex;
}

/**
 * Find the optimal lightness for step 50 — the value that maximizes
 * min(Lc(#000 as text, hex(L) as bg), Lc(hex(L) as text, #fff as bg)).
 *
 * Uses a ternary search over [0, 1] since the min-of-two-contrasts
 * function is unimodal: Lc-vs-black rises with lightness while
 * Lc-vs-white falls, so their min peaks at the crossover.
 */
function findOptimalL50(colorMode, hue, saturation) {
  let lo = 0;
  let hi = 1;

  function score(l) {
    const hex = toHex(colorMode, hue, saturation, l);
    // Dark text on L as bg:
    const lcBlack = apcaContrastFromHex('#000000', hex);
    // L as text on white bg:
    const lcWhite = apcaContrastFromHex(hex, '#ffffff');
    return Math.min(lcBlack, lcWhite);
  }

  // Ternary search for the maximum of the unimodal score function
  for (let i = 0; i < BISECT_ITERS; i++) {
    const m1 = lo + (hi - lo) / 3;
    const m2 = hi - (hi - lo) / 3;
    if (score(m1) < score(m2)) {
      lo = m1;
    } else {
      hi = m2;
    }
  }

  return (lo + hi) / 2;
}

/**
 * Find the maximum lightness in [0, L50] for a DARK step such that
 * Lc ≥ TARGET_LC when the dark step is text and the light partner is background.
 *
 * Contrast decreases as the dark step gets lighter (closer to the partner).
 * Returns the boundary lightness (max compliant L), or null if the entire
 * range is already compliant or compliance is impossible.
 */
function findDarkBoundary(lightPartnerHex, maxL, colorMode, hue, saturation) {
  // Check at the lightest end of the range (closest to partner = lowest contrast)
  const lcAtMax = apcaContrastFromHex(toHex(colorMode, hue, saturation, maxL), lightPartnerHex);
  if (lcAtMax >= TARGET_LC) return null; // entire range is compliant

  // Check at the darkest end (L=0 = black)
  const lcAtZero = apcaContrastFromHex('#000000', lightPartnerHex);
  if (lcAtZero < TARGET_LC) return null; // impossible even at black

  // Binary search: find max L where Lc ≥ TARGET_LC
  let lo = 0;
  let hi = maxL;
  for (let i = 0; i < BISECT_ITERS; i++) {
    const mid = (lo + hi) / 2;
    const lc = apcaContrastFromHex(toHex(colorMode, hue, saturation, mid), lightPartnerHex);
    if (lc >= TARGET_LC) lo = mid; // compliant, can try lighter
    else hi = mid;                 // non-compliant, must go darker
  }
  return lo; // maximum compliant lightness
}

/**
 * Find the minimum lightness in [L50, 1] for a LIGHT step such that
 * Lc ≥ TARGET_LC when the dark partner is text and the light step is background.
 *
 * Contrast increases as the light step gets lighter (further from partner).
 * Returns the boundary lightness (min compliant L), or null if the entire
 * range is already compliant or compliance is impossible.
 */
function findLightBoundary(darkPartnerHex, minL, colorMode, hue, saturation) {
  // Check at the darkest end of the range (closest to partner = lowest contrast)
  const lcAtMin = apcaContrastFromHex(darkPartnerHex, toHex(colorMode, hue, saturation, minL));
  if (lcAtMin >= TARGET_LC) return null; // entire range is compliant

  // Check at the lightest end (L=1 = white)
  const lcAtOne = apcaContrastFromHex(darkPartnerHex, '#ffffff');
  if (lcAtOne < TARGET_LC) return null; // impossible even at white

  // Binary search: find min L where Lc ≥ TARGET_LC
  let lo = minL;
  let hi = 1;
  for (let i = 0; i < BISECT_ITERS; i++) {
    const mid = (lo + hi) / 2;
    const lc = apcaContrastFromHex(darkPartnerHex, toHex(colorMode, hue, saturation, mid));
    if (lc >= TARGET_LC) hi = mid; // compliant, can try darker
    else lo = mid;                 // non-compliant, must go lighter
  }
  return hi; // minimum compliant lightness
}

// ─── Cubic polynomial fitting ─────────────────────────────────────────────

/**
 * Evaluate the constrained cubic polynomial at parameter t.
 *
 *   f(t) = L_start + (L_end - L_start) * t + t(1-t) * [(1-t)*c1 + t*c2]
 *
 * Guarantees f(0) = L_start and f(1) = L_end.
 */
function evalCubic(t, c1, c2, lStart, lEnd) {
  const linear = lStart + (lEnd - lStart) * t;
  const blend = t * (1 - t) * ((1 - t) * c1 + t * c2);
  return linear + blend;
}

/**
 * Compute the normalized t for a step within a half-vector.
 */
function stepToT(step, stepStart, stepEnd) {
  return (stepStart - step) / (stepStart - stepEnd);
}

/**
 * Fit cubic shape parameters c1, c2 via least-squares to APCA targets.
 *
 * Minimizes sum of (f(t_i) - target_i)^2 subject to f(0)=lStart, f(1)=lEnd.
 */
function fitCubic(points, lStart, lEnd) {
  if (points.length === 0) {
    return { c1: 0, c2: 0 };
  }

  if (points.length === 1) {
    // Underdetermined: solve with c1 = c2
    const { t, target } = points[0];
    const base = lStart + (lEnd - lStart) * t;
    const residual = target - base;
    const basisSum = t * (1 - t); // (1-t)*c + t*c = c * t(1-t)
    const c = basisSum > 1e-10 ? residual / basisSum : 0;
    return { c1: c, c2: c };
  }

  // Compute A^T A and A^T b for the normal equations
  let ata00 = 0, ata01 = 0, ata11 = 0;
  let atb0 = 0, atb1 = 0;

  for (const { t, target } of points) {
    const base = lStart + (lEnd - lStart) * t;
    const residual = target - base;
    const A = t * (1 - t) * (1 - t); // basis for c1
    const B = t * t * (1 - t);       // basis for c2

    ata00 += A * A;
    ata01 += A * B;
    ata11 += B * B;
    atb0 += A * residual;
    atb1 += B * residual;
  }

  // Solve 2x2 system via Cramer's rule
  const det = ata00 * ata11 - ata01 * ata01;
  if (Math.abs(det) < 1e-12) {
    const avgResidual = atb0 / (ata00 + 1e-12);
    return { c1: avgResidual, c2: avgResidual };
  }

  const c1 = (atb0 * ata11 - atb1 * ata01) / det;
  const c2 = (ata00 * atb1 - ata01 * atb0) / det;

  return { c1, c2 };
}

// ─── Main algorithm ───────────────────────────────────────────────────────

/**
 * Generate an APCA-adaptive lightness array for a palette.
 *
 * Algorithm:
 * 1. Find optimal L50 — the lightness that maximizes min(Lc vs black, Lc vs white)
 * 2. Partition steps into dark half (100→50) and light half (50→0)
 * 3. For each step with a step-50 partner, find the APCA compliance boundary.
 *    Only add a cubic target when the step's linear position violates that boundary.
 * 4. Fit a cubic polynomial to each half-vector via least-squares
 * 5. Evaluate the cubic at each step position
 * 6. Snap any non-compliant points to nearest compliant lightness
 * 7. Enforce monotonicity and clamp
 *
 * @param {object} palette - Palette object with hue, saturation, steps
 * @param {string} colorMode - "HSL" or "OKLCH"
 * @returns {number[]} Array of lightness values (0–1), one per step, sorted dark→light
 */
export function generateAdaptiveCurve(palette, colorMode) {
  const { hue, saturation, steps } = palette;
  const sortedSteps = [...steps].sort((a, b) => b - a); // 100 → 0 (dark → light)
  const n = sortedSteps.length;

  // ── Step 1: Find L50 anchor ──
  const L50 = findOptimalL50(colorMode, hue, saturation);

  // ── Step 2: Partition steps ──
  const darkSteps = sortedSteps.filter((s) => s > 50 && s < 100);
  const lightSteps = sortedSteps.filter((s) => s < 50 && s > 0);

  // ── Step 3a: Compute APCA targets for dark half ──
  // Only add a target when the linear position exceeds the compliance boundary.
  const darkTargets = [];
  for (const step of darkSteps) {
    const partner = step - 50;
    if (!sortedSteps.includes(partner)) continue;

    // Estimate partner lightness proportionally within [L50, 1]
    const partnerT = stepToT(partner, 50, 0);
    const partnerLEstimate = L50 + (1 - L50) * partnerT;
    const partnerHex = toHex(colorMode, hue, saturation, partnerLEstimate);

    // Find max lightness in [0, L50] where dark step is still compliant
    const boundary = findDarkBoundary(partnerHex, L50, colorMode, hue, saturation);
    if (boundary === null) continue; // no constraint binds

    // Check if the linear position violates the boundary
    const t = stepToT(step, 100, 50);
    const linearL = t * L50;
    if (linearL > boundary) {
      // Linear is too light — push toward boundary
      darkTargets.push({ t, target: boundary });
    }
  }

  // ── Step 4a: Fit dark half cubic ──
  const darkCubic = fitCubic(darkTargets, 0, L50);

  // ── Step 3b: Compute APCA targets for light half ──
  // Use the fitted dark cubic for partner positions.
  const lightTargets = [];
  for (const step of lightSteps) {
    const partner = step + 50;
    if (!sortedSteps.includes(partner)) continue;

    // Get partner lightness from the dark cubic
    const partnerT = stepToT(partner, 100, 50);
    let partnerL;
    if (partner === 100) {
      partnerL = 0;
    } else {
      partnerL = evalCubic(partnerT, darkCubic.c1, darkCubic.c2, 0, L50);
    }
    const partnerHex = toHex(colorMode, hue, saturation, partnerL);

    // Find min lightness in [L50, 1] where light step is still compliant
    const boundary = findLightBoundary(partnerHex, L50, colorMode, hue, saturation);
    if (boundary === null) continue; // no constraint binds

    // Check if the linear position violates the boundary
    const t = stepToT(step, 50, 0);
    const linearL = L50 + (1 - L50) * t;
    if (linearL < boundary) {
      // Linear is too dark — push toward boundary
      lightTargets.push({ t, target: boundary });
    }
  }

  // ── Step 4b: Fit light half cubic ──
  const lightCubic = fitCubic(lightTargets, L50, 1);

  // ── Step 5: Evaluate cubics at each step ──
  const lightness = sortedSteps.map((step) => {
    if (step === 100) return 0;
    if (step === 0) return 1;
    if (step === 50) return L50;

    if (step > 50) {
      const t = stepToT(step, 100, 50);
      return evalCubic(t, darkCubic.c1, darkCubic.c2, 0, L50);
    } else {
      const t = stepToT(step, 50, 0);
      return evalCubic(t, lightCubic.c1, lightCubic.c2, L50, 1);
    }
  });

  // ── Step 6: Snap non-compliant values ──
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(sortedSteps[i] - sortedSteps[j]) !== 50) continue;

      const darkIdx = i;
      const lightIdx = j;
      const darkStep = sortedSteps[darkIdx];
      const lightStep = sortedSteps[lightIdx];

      const darkHex = darkStep === 100 ? '#000000' : toHex(colorMode, hue, saturation, lightness[darkIdx]);
      const lightHex = lightStep === 0 ? '#ffffff' : toHex(colorMode, hue, saturation, lightness[lightIdx]);
      const lc = apcaContrastFromHex(darkHex, lightHex);

      if (lc >= TARGET_LC) continue;

      const darkFixed = darkStep === 100;
      const lightFixed = lightStep === 0;
      if (darkFixed && lightFixed) continue;

      if (darkFixed) {
        const snapped = snapLighter(lightness[lightIdx], darkHex, colorMode, hue, saturation);
        if (snapped !== null) lightness[lightIdx] = snapped;
      } else if (lightFixed) {
        const snapped = snapDarker(lightness[darkIdx], lightHex, colorMode, hue, saturation);
        if (snapped !== null) lightness[darkIdx] = snapped;
      } else {
        const snapL = snapLighter(lightness[lightIdx], darkHex, colorMode, hue, saturation);
        const snapD = snapDarker(lightness[darkIdx], lightHex, colorMode, hue, saturation);

        const deltaL = snapL !== null ? snapL - lightness[lightIdx] : Infinity;
        const deltaD = snapD !== null ? lightness[darkIdx] - snapD : Infinity;

        if (deltaL <= deltaD && snapL !== null) {
          lightness[lightIdx] = snapL;
        } else if (snapD !== null) {
          lightness[darkIdx] = snapD;
        }
      }
    }
  }

  // ── Step 7: Enforce monotonicity + clamp ──
  for (let i = 1; i < n; i++) {
    if (lightness[i] <= lightness[i - 1]) {
      lightness[i] = lightness[i - 1] + 0.002;
    }
  }
  for (let i = 0; i < n; i++) {
    lightness[i] = Math.min(1, Math.max(0, lightness[i]));
  }

  return lightness;
}

/**
 * Binary search for the minimum lightness >= current that achieves Lc >= TARGET_LC.
 * Dark partner is text, light step (being adjusted) is background.
 * @returns {number|null}
 */
function snapLighter(currentL, darkHex, colorMode, hue, saturation) {
  let lo = currentL;
  let hi = Math.min(1, currentL + 0.4);

  if (apcaContrastFromHex(darkHex, toHex(colorMode, hue, saturation, hi)) < TARGET_LC) {
    return null;
  }

  for (let i = 0; i < BISECT_ITERS; i++) {
    const mid = (lo + hi) / 2;
    const lc = apcaContrastFromHex(darkHex, toHex(colorMode, hue, saturation, mid));
    if (lc >= TARGET_LC) hi = mid;
    else lo = mid;
  }
  return hi;
}

/**
 * Binary search for the maximum lightness <= current that achieves Lc >= TARGET_LC.
 * Dark step (being adjusted) is text, light partner is background.
 * @returns {number|null}
 */
function snapDarker(currentL, lightHex, colorMode, hue, saturation) {
  let lo = Math.max(0, currentL - 0.4);
  let hi = currentL;

  if (apcaContrastFromHex(toHex(colorMode, hue, saturation, lo), lightHex) < TARGET_LC) {
    return null;
  }

  for (let i = 0; i < BISECT_ITERS; i++) {
    const mid = (lo + hi) / 2;
    const lc = apcaContrastFromHex(toHex(colorMode, hue, saturation, mid), lightHex);
    if (lc >= TARGET_LC) lo = mid;
    else hi = mid;
  }
  return lo;
}

/**
 * Check all step-50 pairs in a palette for APCA compliance.
 * @param {string[]} hexValues - Array of hex values sorted dark → light
 * @param {number[]} steps - Corresponding step numbers sorted high → low
 * @returns {{ passing: boolean, failures: Array<{stepA: number, stepB: number, lc: number}> }}
 */
export function checkApcaPairs(hexValues, steps) {
  const failures = [];

  for (let i = 0; i < steps.length; i++) {
    for (let j = i + 1; j < steps.length; j++) {
      if (Math.abs(steps[i] - steps[j]) === 50) {
        const lc = apcaContrastFromHex(hexValues[i], hexValues[j]);
        if (lc < 45) {
          failures.push({ stepA: steps[i], stepB: steps[j], lc: Math.round(lc) });
        }
      }
    }
  }

  return { passing: failures.length === 0, failures };
}
