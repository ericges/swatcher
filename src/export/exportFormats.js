/**
 * Export format functions.
 * Each takes (system, computedPalettes, options?) and returns a string.
 */

/**
 * Convert a string to lowercase kebab-case.
 * "Gray" → "gray", "Primary Color" → "primary-color", "MyColor" → "my-color"
 */
export function toKebab(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2') // camelCase → camel-Case
    .replace(/[\s_]+/g, '-')              // spaces/underscores → hyphens
    .replace(/[^a-zA-Z0-9-]/g, '')        // strip non-alphanumeric
    .replace(/-+/g, '-')                  // collapse multiple hyphens
    .replace(/^-|-$/g, '')                // trim leading/trailing hyphens
    .toLowerCase();
}

/**
 * Get the export prefix for a palette, using override if provided.
 * @param {object} cp - Computed palette
 * @param {object} [options]
 * @param {Record<string, string>} [options.prefixOverrides] - Map of paletteId → custom prefix
 * @returns {string} kebab-case prefix
 */
function getPrefix(cp, options) {
  if (options?.prefixOverrides?.[cp.id]) {
    return options.prefixOverrides[cp.id];
  }
  return toKebab(cp.prefix);
}

/**
 * Gather all swatches (main + hover) with kebab-case variable names.
 * @param {import('../color/paletteCompute.js').ComputedPalette[]} computedPalettes
 * @param {object} [options]
 * @returns {Array<{varName: string, hex: string, cssString: string}>}
 */
function allSwatches(computedPalettes, options) {
  const result = [];
  for (const cp of computedPalettes) {
    const prefix = getPrefix(cp, options);
    for (const s of cp.swatches) {
      result.push({ varName: `${prefix}-${s.step}`, hex: s.hex, cssString: s.cssString });
    }
    for (const h of cp.hoverSwatches) {
      result.push({ varName: `${prefix}-${h.step}-hover`, hex: h.hex, cssString: h.cssString });
    }
  }
  return result;
}

/**
 * 1. CSS Custom Properties — hex values
 */
export function cssHex(system, computedPalettes, options) {
  const swatches = allSwatches(computedPalettes, options);
  const lines = swatches.map((s) => `  --${s.varName}: ${s.hex};`);
  return `:root {\n${lines.join('\n')}\n}`;
}

/**
 * 2. CSS Custom Properties — color function values
 */
export function cssColorFunctions(system, computedPalettes, options) {
  const swatches = allSwatches(computedPalettes, options);
  const lines = swatches.map((s) => `  --${s.varName}: ${s.cssString};`);
  return `:root {\n${lines.join('\n')}\n}`;
}

/**
 * 3. SCSS Variables
 */
export function scss(system, computedPalettes, options) {
  const swatches = allSwatches(computedPalettes, options);
  return swatches.map((s) => `$${s.varName}: ${s.hex};`).join('\n');
}

/**
 * 4. JSON format — each swatch as object with hex and css
 */
export function json(system, computedPalettes, options) {
  const obj = {};
  for (const cp of computedPalettes) {
    const prefix = getPrefix(cp, options);
    for (const s of cp.swatches) {
      obj[`${prefix}-${s.step}`] = {
        hex: s.hex,
        css: s.cssString,
      };
    }
    for (const h of cp.hoverSwatches) {
      obj[`${prefix}-${h.step}-hover`] = {
        hex: h.hex,
        css: h.cssString,
      };
    }
  }
  return JSON.stringify(obj, null, 2);
}

/**
 * 5. Tailwind Config
 */
export function tailwindConfig(system, computedPalettes, options) {
  const colors = {};
  for (const cp of computedPalettes) {
    const prefix = getPrefix(cp, options);
    for (const s of cp.swatches) {
      colors[`${prefix}-${s.step}`] = s.hex;
    }
    for (const h of cp.hoverSwatches) {
      colors[`${prefix}-${h.step}-hover`] = h.hex;
    }
  }
  return `module.exports = {\n  theme: {\n    extend: {\n      colors: ${JSON.stringify(colors, null, 8).replace(/^/gm, '      ').trim()}\n    }\n  }\n}`;
}

/**
 * 6. Figma Tokens (W3C Design Tokens format)
 */
export function figmaTokens(system, computedPalettes, options) {
  const tokens = {};
  for (const cp of computedPalettes) {
    const prefix = getPrefix(cp, options);
    const group = {};
    for (const s of cp.swatches) {
      group[String(s.step)] = { $value: s.hex, $type: 'color' };
    }
    tokens[prefix] = group;
  }
  return JSON.stringify(tokens, null, 2);
}

/** All export formats as an ordered array for the UI. */
export const EXPORT_FORMATS = [
  { id: 'css-hex', label: 'CSS (hex)', fn: cssHex },
  { id: 'css-fn', label: 'CSS (functions)', fn: cssColorFunctions },
  { id: 'scss', label: 'SCSS', fn: scss },
  { id: 'json', label: 'JSON', fn: json },
  { id: 'tailwind', label: 'Tailwind', fn: tailwindConfig },
  { id: 'figma', label: 'Figma Tokens', fn: figmaTokens },
];
