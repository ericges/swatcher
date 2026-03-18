/**
 * APCA W3 contrast algorithm implementation.
 * Computes Lc (lightness contrast) between text and background.
 * Based on the APCA-W3 specification by Myndex/Andrew Somers.
 */

import { hexToRgb, srgbToLinear } from './colorMath.js';

// sRGB coefficients for luminance
const Rco = 0.2126729;
const Gco = 0.7151522;
const Bco = 0.0721750;

// APCA constants
const normBG = 0.56;
const normTXT = 0.57;
const revTXT = 0.62;
const revBG = 0.65;

// Clamp and scale
const blkThrs = 0.022;
const blkClmp = 1.414;
const scaleBoW = 1.14;
const scaleWoB = 1.14;
const loBoWoffset = 0.027;
const loWoBoffset = 0.027;
const loClip = 0.1;

/**
 * Compute APCA luminance from a single sRGB channel (0–1, gamma encoded).
 * Uses the piecewise sRGB linearization.
 * @param {number} r - sRGB red 0–1
 * @param {number} g - sRGB green 0–1
 * @param {number} b - sRGB blue 0–1
 * @returns {number} APCA-adapted luminance
 */
function apcaLuminance(r, g, b) {
  const rLin = srgbToLinear(r);
  const gLin = srgbToLinear(g);
  const bLin = srgbToLinear(b);

  let Y = Rco * rLin + Gco * gLin + Bco * bLin;

  // Soft clamp black
  if (Y < blkThrs) {
    Y += Math.pow(blkThrs - Y, blkClmp);
  }

  return Y;
}

/**
 * Compute APCA Lc contrast value between text and background luminances.
 * @param {number} txtY - Text luminance (from apcaLuminance)
 * @param {number} bgY - Background luminance (from apcaLuminance)
 * @returns {number} Signed Lc value. Positive = light text on dark. Negative = dark text on light.
 */
export function apca(txtY, bgY) {
  const icp = [0, 1.1]; // input clamp

  if (txtY < icp[0]) txtY = icp[0];
  if (bgY < icp[0]) bgY = icp[0];

  // Determine polarity
  if (Math.abs(bgY - txtY) < 0.0005) return 0;

  let SAPC;

  if (bgY > txtY) {
    // Black on white (BoW) — normal polarity
    SAPC = (Math.pow(bgY, normBG) - Math.pow(txtY, normTXT)) * scaleBoW;
    return (SAPC < loClip ? 0 : SAPC - loBoWoffset) * 100;
  } else {
    // White on black (WoB) — reverse polarity
    SAPC = (Math.pow(bgY, revBG) - Math.pow(txtY, revTXT)) * scaleWoB;
    return (SAPC > -loClip ? 0 : SAPC + loWoBoffset) * 100;
  }
}

/**
 * Compute APCA Lc between two hex colors.
 * Returns the absolute Lc value.
 * @param {string} textHex - Text color hex
 * @param {string} bgHex - Background color hex
 * @returns {number} Absolute Lc value
 */
export function apcaContrastFromHex(textHex, bgHex) {
  const [tr, tg, tb] = hexToRgb(textHex);
  const [br, bg, bb] = hexToRgb(bgHex);

  const txtY = apcaLuminance(tr, tg, tb);
  const bgY = apcaLuminance(br, bg, bb);

  return Math.abs(apca(txtY, bgY));
}

/**
 * Compute APCA luminance directly from a hex color.
 * @param {string} hex
 * @returns {number}
 */
export function apcaLuminanceFromHex(hex) {
  const [r, g, b] = hexToRgb(hex);
  return apcaLuminance(r, g, b);
}
