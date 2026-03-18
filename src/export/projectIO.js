/**
 * Project file import/export for ColorSystem objects.
 * Serializes source params only (not computed colors).
 */

/**
 * Export a ColorSystem as a downloadable JSON file.
 * @param {import('../state/initialState.js').ColorSystem} system
 */
export function exportProjectFile(system) {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    system: {
      id: system.id,
      name: system.name,
      colorMode: system.colorMode,
      palettes: system.palettes.map((p) => ({
        id: p.id,
        name: p.name,
        hue: p.hue,
        saturation: p.saturation,
        steps: p.steps,
        colorMode: p.colorMode,
        lightnessProfile: p.lightnessProfile,
        saturationProfile: p.saturationProfile,
      })),
    },
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${system.name.replace(/\s+/g, '-')}.colorproject.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import a ColorSystem from a JSON file.
 * @param {File} file
 * @returns {Promise<import('../state/initialState.js').ColorSystem>}
 */
export async function importProjectFile(file) {
  const text = await file.text();
  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON file');
  }

  if (!data.system) {
    throw new Error('Missing "system" in project file');
  }

  const sys = data.system;

  if (!sys.id || !sys.name || !Array.isArray(sys.palettes)) {
    throw new Error('Invalid project file: missing required fields (id, name, palettes)');
  }

  for (const p of sys.palettes) {
    if (!p.id || !p.name || !Array.isArray(p.steps)) {
      throw new Error(`Invalid palette "${p.name || 'unknown'}": missing required fields`);
    }
  }

  // Migrate: if palettes lack colorMode, copy from system-level
  const fallbackMode = sys.colorMode || 'OKLCH';
  for (const p of sys.palettes) {
    if (!p.colorMode) {
      p.colorMode = fallbackMode;
    }
  }

  return sys;
}
