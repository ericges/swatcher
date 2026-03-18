/**
 * Default application state shape and factory functions.
 */

let _idCounter = 1;

/** Generate a unique ID. */
export function genId() {
  return `id_${Date.now()}_${_idCounter++}`;
}

/**
 * @typedef {object} ProfileConfig
 * @property {"apca-adaptive"|"linear"|"ease-in"|"ease-out"|"s-curve"|"perceptual"|"custom"} type
 * @property {[number,number][]} customPoints - Control points for custom Bézier
 */

/**
 * @typedef {object} Palette
 * @property {string} id
 * @property {string} name
 * @property {number} hue - 0–360
 * @property {number} saturation - 0–100
 * @property {number[]} steps - e.g. [100,95,90,80,70,60,50,40,30,20,15,10,0]
 * @property {ProfileConfig} lightnessProfile
 * @property {ProfileConfig} saturationProfile
 */

/**
 * @typedef {object} ColorSystem
 * @property {string} id
 * @property {string} name
 * @property {"HSL"|"OKLCH"} colorMode
 * @property {Palette[]} palettes
 */

/** Default steps for a new palette. */
export const DEFAULT_STEPS = [100, 95, 90, 80, 70, 60, 50, 40, 30, 20, 15, 10, 0];

/**
 * Create a new palette with defaults.
 * @param {Partial<Palette>} overrides
 * @returns {Palette}
 */
export function createPalette(overrides = {}) {
  return {
    id: genId(),
    name: 'Gray',
    hue: 240,
    saturation: 5,
    steps: [...DEFAULT_STEPS],
    lightnessProfile: { type: 'apca-adaptive', customPoints: [[0.25, 0.25], [0.75, 0.75]] },
    colorMode: 'OKLCH',
    saturationProfile: { type: 'flat', customPoints: [[0.25, 0.25], [0.75, 0.75]] },
    ...overrides,
  };
}

/**
 * Create a new color system with defaults.
 * @param {Partial<ColorSystem>} overrides
 * @returns {ColorSystem}
 */
export function createSystem(overrides = {}) {
  const id = genId();
  return {
    id,
    name: 'Untitled System',
    colorMode: 'OKLCH',
    palettes: [createPalette()],
    ...overrides,
  };
}

/** Build the default app state. */
export function buildInitialState() {
  const defaultSystem = createSystem({ name: 'My Color System' });

  return {
    systems: [defaultSystem],
    activeSystemId: defaultSystem.id,
    ui: {
      activePaletteId: defaultSystem.palettes[0].id,
      viewMode: 'detail',
      exportPanelOpen: false,
      contrastSelection: {
        paletteAId: null,
        paletteBId: null,
      },
    },
  };
}
