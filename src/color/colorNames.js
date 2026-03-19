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
  'Berry',       // 0–14   (pink-red)
  'Rust',        // 15–29  (red-orange)
  'Clay',        // 30–44  (orange)
  'Copper',      // 45–59  (amber)
  'Bronze',      // 60–74  (yellow)
  'Sand',        // 75–89  (yellow-green)
  'Khaki',       // 90–104 (chartreuse)
  'Matcha',      // 105–119 (lime)
  'Fern',        // 120–134 (green)
  'Moss',        // 135–149 (emerald)
  'Pine',        // 150–164 (teal)
  'Seafoam',     // 165–179 (cyan-green)
  'Slate',       // 180–194 (cyan)
  'Steel',       // 195–209 (azure)
  'Cadet',       // 210–224 (blue)
  'Denim',       // 225–239 (blue)
  'Navy',        // 240–254 (indigo)
  'Periwinkle',  // 255–269 (violet)
  'Lavender',    // 270–284 (purple)
  'Plum',        // 285–299 (amethyst)
  'Orchid',      // 300–314 (magenta)
  'Heather',     // 315–329 (fuchsia)
  'Mauve',       // 330–344 (pink)
  'Blush',       // 345–359 (rose)
];

const OKLCH_HIGH = [
  'Crimson',     // 0–14   (pink-red)
  'Red',         // 15–29  (red)
  'Vermilion',   // 30–44  (red-orange)
  'Orange',      // 45–59  (orange)
  'Amber',       // 60–74  (amber)
  'Yellow',      // 75–89  (yellow)
  'Chartreuse',  // 90–104 (chartreuse)
  'Lime',        // 105–119 (lime)
  'Green',       // 120–134 (green)
  'Emerald',     // 135–149 (emerald)
  'Teal',        // 150–164 (teal)
  'Cyan',        // 165–179 (cyan)
  'Sky',         // 180–194 (aqua)
  'Azure',       // 195–209 (azure)
  'Sapphire',    // 210–224 (blue)
  'Blue',        // 225–239 (blue)
  'Cobalt',      // 240–254 (indigo)
  'Indigo',      // 255–269 (violet)
  'Violet',      // 270–284 (purple)
  'Purple',      // 285–299 (amethyst)
  'Magenta',     // 300–314 (magenta)
  'Fuchsia',     // 315–329 (fuchsia)
  'Pink',        // 330–344 (pink)
  'Rose',        // 345–359 (rose)
];

/* ── HSL tables (shifted ~30° from OKLCH to match the HSL hue wheel) ── */

const HSL_MID = [
  'Rust',        // 0–14   (red)
  'Brick',       // 15–29  (red-orange)
  'Copper',      // 30–44  (orange)
  'Bronze',      // 45–59  (amber)
  'Sand',        // 60–74  (yellow)
  'Khaki',       // 75–89  (chartreuse)
  'Matcha',      // 90–104 (lime)
  'Olive',       // 105–119 (green)
  'Fern',        // 120–134 (green)
  'Moss',        // 135–149 (teal)
  'Pine',        // 150–164 (cyan-green)
  'Seafoam',     // 165–179 (cyan)
  'Slate',       // 180–194 (aqua)
  'Steel',       // 195–209 (azure)
  'Cadet',       // 210–224 (blue)
  'Denim',       // 225–239 (blue)
  'Navy',        // 240–254 (indigo)
  'Periwinkle',  // 255–269 (violet)
  'Lavender',    // 270–284 (purple)
  'Plum',        // 285–299 (amethyst)
  'Orchid',      // 300–314 (magenta)
  'Heather',     // 315–329 (fuchsia)
  'Mauve',       // 330–344 (pink)
  'Blush',       // 345–359 (rose)
];

const HSL_HIGH = [
  'Red',         // 0–14   (red)
  'Vermilion',   // 15–29  (red-orange)
  'Orange',      // 30–44  (orange)
  'Amber',       // 45–59  (amber)
  'Yellow',      // 60–74  (yellow)
  'Chartreuse',  // 75–89  (chartreuse)
  'Lime',        // 90–104 (lime)
  'Emerald',     // 105–119 (green)
  'Green',       // 120–134 (green)
  'Mint',        // 135–149 (teal)
  'Teal',        // 150–164 (cyan-green)
  'Turquoise',   // 165–179 (cyan)
  'Cyan',        // 180–194 (aqua)
  'Azure',       // 195–209 (azure)
  'Sapphire',    // 210–224 (blue)
  'Cobalt',      // 225–239 (blue)
  'Blue',        // 240–254 (indigo)
  'Indigo',      // 255–269 (violet)
  'Violet',      // 270–284 (purple)
  'Purple',      // 285–299 (amethyst)
  'Magenta',     // 300–314 (magenta)
  'Fuchsia',     // 315–329 (fuchsia)
  'Pink',        // 330–344 (pink)
  'Rose',        // 345–359 (rose)
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
