/**
 * Palette computation: derives all swatch values from palette parameters.
 * Pure function — no side effects.
 */

import { computeSwatchColor, getSwatchTextColor } from './colorMath.js';
import { evaluateLightnessProfile, evaluateSaturationProfile } from './curveProfiles.js';
import { generateAdaptiveCurve, checkApcaPairs } from './adaptiveCurve.js';

/**
 * @typedef {object} ComputedSwatch
 * @property {number} step - Step number (e.g. 50)
 * @property {string} name - Full name (e.g. "G50")
 * @property {string} hex - Computed hex color
 * @property {string} cssString - CSS color function string
 * @property {boolean} inGamut - Whether color is within sRGB gamut
 * @property {string} textColor - "#000000" or "#ffffff" for readable labels
 * @property {number} lightness - Raw lightness value used (0–1)
 * @property {number} satMod - Saturation modifier applied (0–1)
 */

/**
 * @typedef {object} ComputedHoverSwatch
 * @property {number} step - Original step number
 * @property {number} hoverStep - The step it hovers to
 * @property {string} name - Hover name (e.g. "Gh50")
 * @property {string} hex
 * @property {string} cssString
 * @property {boolean} inGamut
 * @property {string} textColor
 */

/**
 * @typedef {object} ComputedPalette
 * @property {string} id - Palette ID
 * @property {string} name - Palette name
 * @property {string} prefix - Palette prefix
 * @property {ComputedSwatch[]} swatches - All computed swatches
 * @property {ComputedHoverSwatch[]} hoverSwatches - Hover variant swatches
 * @property {{ passing: boolean, failures: Array }} apcaResult - APCA compliance result
 * @property {number} gamutWarnings - Count of out-of-gamut swatches
 */

/**
 * Compute all swatches for a single palette.
 * @param {import('../state/initialState.js').Palette} palette
 * @param {string} colorMode - "HSL" or "OKLCH"
 * @returns {ComputedPalette}
 */
export function computePalette(palette, colorMode) {
  // Prefer palette-level colorMode, fall back to system-level
  colorMode = palette.colorMode || colorMode;
  const { id, name, prefix, hue, saturation, steps, lightnessProfile, saturationProfile } = palette;
  const sortedSteps = [...steps].sort((a, b) => b - a); // 100 → 0

  // Compute lightness values
  let lightnessValues;

  if (lightnessProfile.type === 'apca-adaptive') {
    lightnessValues = generateAdaptiveCurve(palette, colorMode);
  } else {
    lightnessValues = sortedSteps.map((step) => {
      // step 100 = black (lightness 0), step 0 = white (lightness 1)
      // t=0 is darkest, t=1 is lightest
      const t = 1 - step / 100;
      return evaluateLightnessProfile(lightnessProfile, t);
    });
  }

  // Compute saturation modifiers
  const satModifiers = sortedSteps.map((step) => {
    const t = 1 - step / 100;
    return evaluateSaturationProfile(saturationProfile, t);
  });

  // Compute swatches
  const swatches = sortedSteps.map((step, i) => {
    // Step 100 = always pure black, Step 0 = always pure white
    if (step === 100) {
      return {
        step, name: `${prefix}100`, hex: '#000000',
        cssString: colorMode === 'OKLCH' ? 'oklch(0 0 0)' : 'hsl(0 0% 0%)',
        inGamut: true, textColor: '#ffffff', lightness: 0, satMod: 0,
      };
    }
    if (step === 0) {
      return {
        step, name: `${prefix}0`, hex: '#ffffff',
        cssString: colorMode === 'OKLCH' ? 'oklch(1 0 0)' : 'hsl(0 0% 100%)',
        inGamut: true, textColor: '#000000', lightness: 1, satMod: 0,
      };
    }

    const lightness = lightnessValues[i];
    const satMod = satModifiers[i];
    const { hex, inGamut, cssString } = computeSwatchColor(colorMode, hue, saturation, lightness, satMod);
    const textColor = getSwatchTextColor(hex);

    return {
      step,
      name: `${prefix}${step}`,
      hex,
      cssString,
      inGamut,
      textColor,
      lightness,
      satMod,
    };
  });

  // Compute hover swatches
  const hoverSwatches = sortedSteps
    .map((step) => {
      let hoverStep;
      if (step > 60) {
        hoverStep = step - 10;
      } else {
        hoverStep = step + 10;
      }

      // Clamp to available steps
      if (!sortedSteps.includes(hoverStep)) {
        // Find nearest available step
        const available = sortedSteps.filter((s) => s !== step);
        hoverStep = available.reduce((best, s) =>
          Math.abs(s - hoverStep) < Math.abs(best - hoverStep) ? s : best
        );
      }

      // Find the swatch for the hover step
      const hoverSwatch = swatches.find((s) => s.step === hoverStep);
      if (!hoverSwatch) return null;

      return {
        step,
        hoverStep,
        name: `${prefix}${step}h`,
        hex: hoverSwatch.hex,
        cssString: hoverSwatch.cssString,
        inGamut: hoverSwatch.inGamut,
        textColor: hoverSwatch.textColor,
      };
    })
    .filter(Boolean);

  // Check APCA compliance
  const hexValues = swatches.map((s) => s.hex);
  const stepNums = swatches.map((s) => s.step);
  const apcaResult = checkApcaPairs(hexValues, stepNums);

  // Count gamut warnings
  const gamutWarnings = swatches.filter((s) => !s.inGamut).length;

  return {
    id,
    name,
    prefix,
    swatches,
    hoverSwatches,
    apcaResult,
    gamutWarnings,
  };
}

/**
 * Compute all palettes in a color system.
 * @param {import('../state/initialState.js').ColorSystem} system
 * @returns {ComputedPalette[]}
 */
export function computeAllPalettes(system) {
  return system.palettes.map((p) => computePalette(p, system.colorMode));
}
