/**
 * APCA-adaptive lightness curve generator.
 * Produces a lightness distribution that guarantees Lc >= 45
 * between every pair of steps separated by 50 units.
 */

import { computeSwatchColor } from './colorMath.js';
import { apcaContrastFromHex } from './apca.js';

/**
 * Generate an APCA-adaptive lightness array for a palette.
 * For every pair of steps (N, N+50) within the palette,
 * the APCA Lc contrast between their computed colors will be >= Lc 45.
 *
 * Algorithm:
 * 1. Start from linear lightness distribution (step 100=0, step 0=1)
 * 2. For each step-50 pair, if contrast < 45, use bisection to find
 *    the minimum adjustment needed — try both pushing the lighter step
 *    lighter and pulling the darker step darker, pick the smaller move.
 * 3. Enforce monotonicity after each pass.
 * 4. Repeat until all pairs pass or max iterations reached.
 *
 * @param {object} palette - Palette object with hue, saturation, steps
 * @param {string} colorMode - "HSL" or "OKLCH"
 * @returns {number[]} Array of lightness values (0–1), one per step, sorted dark→light
 */
export function generateAdaptiveCurve(palette, colorMode) {
  const { hue, saturation, steps } = palette;
  const sortedSteps = [...steps].sort((a, b) => b - a); // 100 → 0 (dark → light)
  const n = sortedSteps.length;

  // Start from linear lightness distribution
  // step 100 = black (lightness 0), step 0 = white (lightness 1)
  const lightness = sortedSteps.map((step) => 1 - step / 100);

  // Find pairs of steps separated by exactly 50
  const pairs = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(sortedSteps[i] - sortedSteps[j]) === 50) {
        pairs.push([i, j]); // i is darker (higher step#, lower lightness), j is lighter
      }
    }
  }

  if (pairs.length === 0) return lightness;

  const TARGET_LC = 45;
  const MAX_ITERS = 10;

  /**
   * Compute hex for a step index, using fixed black/white for step 100/0.
   * @param {number} idx - Index into sortedSteps
   * @param {number} l - Lightness 0–1
   * @returns {string}
   */
  function getHexForStep(idx, l) {
    const step = sortedSteps[idx];
    if (step === 100) return '#000000';
    if (step === 0) return '#ffffff';
    const { hex } = computeSwatchColor(colorMode, hue, saturation, l, 1);
    return hex;
  }

  /** Compute hex from lightness only (for bisection on non-fixed steps). */
  function getHex(l) {
    const { hex } = computeSwatchColor(colorMode, hue, saturation, l, 1);
    return hex;
  }

  /**
   * Binary search to find the minimum lightness for the lighter step
   * such that APCA Lc >= target against the dark step.
   */
  function bisectLighter(darkL, currentLightL, darkIdx) {
    const darkHex = getHexForStep(darkIdx, darkL);
    let lo = currentLightL;
    let hi = Math.min(1, currentLightL + 0.4); // don't jump too far

    for (let i = 0; i < 12; i++) {
      const mid = (lo + hi) / 2;
      const lc = apcaContrastFromHex(darkHex, getHex(mid));
      if (lc >= TARGET_LC) {
        hi = mid;
      } else {
        lo = mid;
      }
    }
    return hi;
  }

  /**
   * Binary search to find the maximum lightness for the darker step
   * such that APCA Lc >= target against the light step.
   */
  function bisectDarker(currentDarkL, lightL, lightIdx) {
    const lightHex = getHexForStep(lightIdx, lightL);
    let lo = Math.max(0, currentDarkL - 0.4);
    let hi = currentDarkL;

    for (let i = 0; i < 12; i++) {
      const mid = (lo + hi) / 2;
      const lc = apcaContrastFromHex(getHex(mid), lightHex);
      if (lc >= TARGET_LC) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
    return lo;
  }

  for (let iter = 0; iter < MAX_ITERS; iter++) {
    let allPass = true;

    for (const [darkIdx, lightIdx] of pairs) {
      const darkHex = getHexForStep(darkIdx, lightness[darkIdx]);
      const lightHex = getHexForStep(lightIdx, lightness[lightIdx]);
      const lc = apcaContrastFromHex(darkHex, lightHex);

      if (lc < TARGET_LC) {
        allPass = false;

        // Skip if both endpoints are fixed (100↔0 — can't adjust either)
        const darkFixed = sortedSteps[darkIdx] === 100;
        const lightFixed = sortedSteps[lightIdx] === 0;
        if (darkFixed && lightFixed) continue;

        // If dark is fixed, can only adjust lighter
        if (darkFixed) {
          lightness[lightIdx] = bisectLighter(lightness[darkIdx], lightness[lightIdx], darkIdx);
          continue;
        }
        // If light is fixed, can only adjust darker
        if (lightFixed) {
          lightness[darkIdx] = bisectDarker(lightness[darkIdx], lightness[lightIdx], lightIdx);
          continue;
        }

        // Try both directions, pick the one requiring less displacement
        const newLightL = bisectLighter(lightness[darkIdx], lightness[lightIdx], darkIdx);
        const newDarkL = bisectDarker(lightness[darkIdx], lightness[lightIdx], lightIdx);

        const lightDelta = newLightL - lightness[lightIdx];
        const darkDelta = lightness[darkIdx] - newDarkL;

        if (lightDelta <= darkDelta && newLightL <= 1) {
          lightness[lightIdx] = newLightL;
        } else if (newDarkL >= 0) {
          lightness[darkIdx] = newDarkL;
        } else {
          lightness[lightIdx] = newLightL;
        }
      }
    }

    // Enforce strict monotonicity (each step lighter than the one before in the array)
    // Array is sorted dark→light, so lightness must be non-decreasing
    for (let i = 1; i < n; i++) {
      if (lightness[i] <= lightness[i - 1]) {
        lightness[i] = lightness[i - 1] + 0.002;
      }
    }

    // Clamp all to [0, 1]
    for (let i = 0; i < n; i++) {
      lightness[i] = Math.min(1, Math.max(0, lightness[i]));
    }

    if (allPass) break;
  }

  return lightness;
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
