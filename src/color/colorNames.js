/**
 * Deterministic color name generator based on hue, saturation, and color mode.
 *
 * Divides the 0–360 hue wheel into 24 segments (15° each) and maps
 * each to a one-word color name. Saturation selects between three tiers:
 *   Low  (< 10)  → "Gray"
 *   Mid  (10–59) → muted / earthy names
 *   High (≥ 60)  → vivid / saturated names
 *
 * OKLCH and HSL have different hue wheels (OKLCH is shifted ~30° from HSL),
 * so each mode has its own lookup table.
 */

/* ── OKLCH tables ─────────────────────────────────────────────── */

const OKLCH_MID = [
  'Blush',       // 0–14   (pink)
  'Peach',       // 15–29  (red-pink)
  'Clay',        // 30–44  (red)
  'Rust',        // 45–59  (red-orange)
  'Apricot',     // 60–74  (orange)
  'Sand',        // 75–89  (yellow-orange)
  'Wheat',       // 90–104 (yellow)
  'Khaki',       // 105–119 (yellow-green)
  'Sage',        // 120–134 (green-yellow)
  'Olive',       // 135–149 (green)
  'Moss',        // 150–164 (green)
  'Fern',        // 165–179 (green-teal)
  'Seafoam',     // 180–194 (teal)
  'Sky',         // 195–209 (cyan)
  'Steel',       // 210–224 (blue-cyan)
  'Denim',       // 225–239 (blue)
  'Periwinkle',  // 240–254 (blue)
  'Iris',        // 255–269 (blue-violet)
  'Heather',     // 270–284 (violet)
  'Mauve',       // 285–299 (purple)
  'Plum',        // 300–314 (purple-magenta)
  'Orchid',      // 315–329 (magenta)
  'Berry',       // 330–344 (pink-magenta)
  'Wine',        // 345–359 (red-pink)
];

const OKLCH_HIGH = [
  'Rose',        // 0–14   (pink)
  'Coral',       // 15–29  (red-pink)
  'Scarlet',     // 30–44  (red)
  'Vermilion',   // 45–59  (red-orange)
  'Tangerine',   // 60–74  (orange)
  'Amber',       // 75–89  (yellow-orange)
  'Gold',        // 90–104 (yellow)
  'Citrine',     // 105–119 (yellow-green)
  'Lime',        // 120–134 (green-yellow)
  'Chartreuse',  // 135–149 (green)
  'Jade',        // 150–164 (green)
  'Emerald',     // 165–179 (green-teal)
  'Teal',        // 180–194 (teal)
  'Cyan',        // 195–209 (cyan)
  'Azure',       // 210–224 (blue-cyan)
  'Cobalt',      // 225–239 (blue)
  'Sapphire',    // 240–254 (blue)
  'Indigo',      // 255–269 (blue-violet)
  'Violet',      // 270–284 (violet)
  'Purple',      // 285–299 (purple)
  'Amethyst',    // 300–314 (purple-magenta)
  'Magenta',     // 315–329 (magenta)
  'Fuchsia',     // 330–344 (pink-magenta)
  'Crimson',     // 345–359 (red-pink)
];

/* ── HSL tables (shifted ~30° from OKLCH to match the HSL hue wheel) ── */

const HSL_MID = [
  'Clay',        // 0–14   (red)
  'Rust',        // 15–29  (red-orange)
  'Apricot',     // 30–44  (orange)
  'Sand',        // 45–59  (amber)
  'Wheat',       // 60–74  (yellow)
  'Khaki',       // 75–89  (yellow-green)
  'Sage',        // 90–104 (chartreuse)
  'Olive',       // 105–119 (lime)
  'Fern',        // 120–134 (green)
  'Moss',        // 135–149 (green)
  'Seafoam',     // 150–164 (teal-green)
  'Sky',         // 165–179 (cyan-green)
  'Steel',       // 180–194 (cyan)
  'Denim',       // 195–209 (blue-cyan)
  'Periwinkle',  // 210–224 (blue)
  'Iris',        // 225–239 (blue-indigo)
  'Heather',     // 240–254 (blue-violet)
  'Mauve',       // 255–269 (violet)
  'Plum',        // 270–284 (purple)
  'Orchid',      // 285–299 (magenta-purple)
  'Berry',       // 300–314 (magenta)
  'Wine',        // 315–329 (pink-red)
  'Blush',       // 330–344 (warm pink)
  'Peach',       // 345–359 (red-pink)
];

const HSL_HIGH = [
  'Scarlet',     // 0–14   (red)
  'Vermilion',   // 15–29  (red-orange)
  'Tangerine',   // 30–44  (orange)
  'Amber',       // 45–59  (amber)
  'Gold',        // 60–74  (yellow)
  'Citrine',     // 75–89  (yellow-green)
  'Chartreuse',  // 90–104 (chartreuse)
  'Lime',        // 105–119 (lime)
  'Emerald',     // 120–134 (green)
  'Jade',        // 135–149 (green)
  'Teal',        // 150–164 (teal-green)
  'Cyan',        // 165–179 (cyan-green)
  'Azure',       // 180–194 (cyan)
  'Cobalt',      // 195–209 (blue-cyan)
  'Sapphire',    // 210–224 (blue)
  'Indigo',      // 225–239 (blue-indigo)
  'Violet',      // 240–254 (blue-violet)
  'Purple',      // 255–269 (violet)
  'Amethyst',    // 270–284 (purple)
  'Magenta',     // 285–299 (magenta-purple)
  'Fuchsia',     // 300–314 (magenta)
  'Crimson',     // 315–329 (pink-red)
  'Rose',        // 330–344 (warm pink)
  'Coral',       // 345–359 (red-pink)
];

/**
 * Return a one-word color name for the given hue + saturation.
 * @param {number} hue        0–360
 * @param {number} saturation 0–100
 * @param {"OKLCH"|"HSL"} [colorMode="OKLCH"]
 * @returns {string}
 */
export function getColorName(hue, saturation, colorMode = 'OKLCH') {
  if (saturation < 10) return 'Gray';

  const h = ((hue % 360) + 360) % 360;
  const segment = Math.min(Math.floor(h / 15), 23);

  const mid = colorMode === 'HSL' ? HSL_MID : OKLCH_MID;
  const high = colorMode === 'HSL' ? HSL_HIGH : OKLCH_HIGH;

  return saturation < 60 ? mid[segment] : high[segment];
}
