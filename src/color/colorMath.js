/**
 * Color math utilities for HSL, OKLCH, sRGB conversions.
 * All channel values use 0–1 range internally unless noted.
 */

/**
 * Clamp a value between min and max.
 * @param {number} v
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(v, min = 0, max = 1) {
  return Math.min(max, Math.max(min, v));
}

/**
 * Convert HSL to hex string.
 * @param {number} h - Hue 0–360
 * @param {number} s - Saturation 0–100
 * @param {number} l - Lightness 0–100
 * @returns {string} Hex color like "#ff00aa"
 */
export function hslToHex(h, s, l) {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r, g, b;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  return srgbToHex(r + m, g + m, b + m);
}

/**
 * Convert HSL values to an RGB string.
 * @param {number} h - Hue 0–360
 * @param {number} s - Saturation 0–100
 * @param {number} l - Lightness 0–100
 * @returns {string} CSS hsl() string
 */
export function hslString(h, s, l) {
  return `hsl(${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%)`;
}

/**
 * Convert hex color to RGB channels (0–1).
 * @param {string} hex - Hex color string
 * @returns {[number, number, number]}
 */
export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255,
  ];
}

/**
 * Convert OKLCH to linear sRGB via OKLab intermediate.
 * @param {number} L - Lightness 0–1
 * @param {number} C - Chroma (typically 0–0.4)
 * @param {number} H - Hue in degrees 0–360
 * @returns {[number, number, number]} Linear sRGB [r, g, b]
 */
export function oklchToLinearSrgb(L, C, H) {
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  // OKLab to LMS (cube roots)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  // LMS to linear sRGB (published 3x3 matrix)
  const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bOut = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  return [r, g, bOut];
}

/**
 * Apply sRGB gamma encoding (linear → sRGB transfer function).
 * @param {number} r - Linear R 0–1
 * @param {number} g - Linear G 0–1
 * @param {number} b - Linear B 0–1
 * @returns {[number, number, number]} Gamma-encoded sRGB
 */
export function linearSrgbToSrgb(r, g, b) {
  const transfer = (c) => {
    if (c <= 0.0031308) return 12.92 * c;
    return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  };
  return [transfer(r), transfer(g), transfer(b)];
}

/**
 * Inverse sRGB transfer: sRGB → linear.
 * @param {number} c - sRGB channel 0–1
 * @returns {number} Linear channel
 */
export function srgbToLinear(c) {
  if (c <= 0.04045) return c / 12.92;
  return Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Convert sRGB channels (0–1, already gamma encoded) to hex.
 * Clamps out-of-gamut values for display.
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {string}
 */
export function srgbToHex(r, g, b) {
  const toHex = (c) => {
    const v = Math.round(clamp(c) * 255);
    return v.toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Check if linear sRGB values are within the sRGB gamut (pre-clamp).
 * @param {number} r - Linear R
 * @param {number} g - Linear G
 * @param {number} b - Linear B
 * @returns {boolean}
 */
export function isInGamut(r, g, b) {
  const EPS = -0.001; // small tolerance for floating-point
  return r >= EPS && r <= 1.001 && g >= EPS && g <= 1.001 && b >= EPS && b <= 1.001;
}

/**
 * Compute relative luminance for APCA/WCAG from sRGB channels (0–1, gamma encoded).
 * Uses sRGB linearization and luminance coefficients.
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {number}
 */
export function getRelativeLuminance(r, g, b) {
  return (
    0.2126729 * srgbToLinear(r) +
    0.7151522 * srgbToLinear(g) +
    0.0721750 * srgbToLinear(b)
  );
}

/**
 * Determine whether to use black or white text on a given background.
 * Uses APCA contrast polarity to pick the higher-contrast option.
 * @param {string} bgHex - Background color hex
 * @returns {"#000000" | "#ffffff"}
 */
export function getSwatchTextColor(bgHex) {
  const [r, g, b] = hexToRgb(bgHex);
  const lum = getRelativeLuminance(r, g, b);
  // Simple threshold: if background is light, use black text
  return lum > 0.18 ? '#000000' : '#ffffff';
}

/**
 * Convert OKLCH parameters to a display hex color.
 * @param {number} L - Lightness 0–1
 * @param {number} C - Chroma 0–0.4
 * @param {number} H - Hue 0–360
 * @returns {{ hex: string, inGamut: boolean, linearRgb: [number,number,number] }}
 */
export function oklchToHex(L, C, H) {
  const linearRgb = oklchToLinearSrgb(L, C, H);
  const inGamut = isInGamut(...linearRgb);
  const srgb = linearSrgbToSrgb(...linearRgb);
  const hex = srgbToHex(...srgb);
  return { hex, inGamut, linearRgb };
}

/**
 * Format an OKLCH color as a CSS string.
 * @param {number} L - Lightness 0–1
 * @param {number} C - Chroma
 * @param {number} H - Hue degrees
 * @returns {string}
 */
export function oklchString(L, C, H) {
  return `oklch(${L.toFixed(3)} ${C.toFixed(4)} ${H.toFixed(1)})`;
}

/**
 * Compute a swatch color from palette params.
 * @param {"HSL"|"OKLCH"} mode
 * @param {number} hue - 0–360
 * @param {number} saturation - 0–100
 * @param {number} lightness - 0–100 (for HSL) or 0–1 (for OKLCH)
 * @param {number} satMod - Saturation modifier from curve (0–1)
 * @returns {{ hex: string, inGamut: boolean, cssString: string }}
 */
export function computeSwatchColor(mode, hue, saturation, lightness, satMod = 1) {
  if (mode === 'OKLCH') {
    const L = lightness; // already 0–1
    const C = (saturation / 100) * 0.4 * satMod; // normalize to 0–0.4 range
    const H = hue;
    const { hex, inGamut } = oklchToHex(L, C, H);
    return { hex, inGamut, cssString: oklchString(L, C, H) };
  }

  // HSL mode
  const l = lightness * 100; // convert 0–1 to 0–100
  const s = saturation * satMod;
  const hex = hslToHex(hue, s, l);
  return { hex, inGamut: true, cssString: hslString(hue, s, l) };
}
