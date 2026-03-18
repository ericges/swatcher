/**
 * Pure reducer for all application state transitions.
 */

import * as A from './actions.js';
import { createPalette, createSystem, genId } from './initialState.js';

/**
 * Find the active system in state.
 * @param {object} state
 * @returns {object|undefined}
 */
function getActiveSystem(state) {
  return state.systems.find((s) => s.id === state.activeSystemId);
}

/**
 * Replace the active system with a modified version.
 * @param {object} state
 * @param {function} updater - (system) => newSystem
 * @returns {object} Updated state
 */
function updateActiveSystem(state, updater) {
  return {
    ...state,
    systems: state.systems.map((s) =>
      s.id === state.activeSystemId ? updater(s) : s
    ),
  };
}

/**
 * Main app reducer.
 * @param {object} state - Current AppState
 * @param {{ type: string, payload?: any }} action
 * @returns {object} Next AppState
 */
export function reducer(state, action) {
  const { type, payload } = action;

  switch (type) {
    // --- Palette actions ---
    case A.ADD_PALETTE: {
      const newPalette = createPalette(payload);
      const updated = updateActiveSystem(state, (sys) => ({
        ...sys,
        palettes: [...sys.palettes, newPalette],
      }));
      return {
        ...updated,
        ui: { ...updated.ui, activePaletteId: newPalette.id },
      };
    }

    case A.REMOVE_PALETTE: {
      const sys = getActiveSystem(state);
      if (!sys || sys.palettes.length <= 1) return state; // keep at least one
      const updated = updateActiveSystem(state, (sys) => ({
        ...sys,
        palettes: sys.palettes.filter((p) => p.id !== payload),
      }));
      const remaining = getActiveSystem(updated)?.palettes;
      return {
        ...updated,
        ui: {
          ...updated.ui,
          activePaletteId:
            updated.ui.activePaletteId === payload
              ? remaining?.[0]?.id ?? null
              : updated.ui.activePaletteId,
        },
      };
    }

    case A.UPDATE_PALETTE: {
      return updateActiveSystem(state, (sys) => ({
        ...sys,
        palettes: sys.palettes.map((p) =>
          p.id === payload.id ? { ...p, ...payload.changes } : p
        ),
      }));
    }

    case A.REORDER_PALETTES: {
      return updateActiveSystem(state, (sys) => ({
        ...sys,
        palettes: payload,
      }));
    }

    // --- System actions ---
    case A.ADD_SYSTEM: {
      const newSys = createSystem(payload);
      return {
        ...state,
        systems: [...state.systems, newSys],
        activeSystemId: newSys.id,
        ui: {
          ...state.ui,
          activePaletteId: newSys.palettes[0]?.id ?? null,
        },
      };
    }

    case A.REMOVE_SYSTEM: {
      if (state.systems.length <= 1) return state;
      const remaining = state.systems.filter((s) => s.id !== payload);
      const newActive = remaining[0];
      return {
        ...state,
        systems: remaining,
        activeSystemId: newActive.id,
        ui: {
          ...state.ui,
          activePaletteId: newActive.palettes[0]?.id ?? null,
        },
      };
    }

    case A.RENAME_SYSTEM: {
      return {
        ...state,
        systems: state.systems.map((s) =>
          s.id === payload.id ? { ...s, name: payload.name } : s
        ),
      };
    }

    case A.SET_ACTIVE_SYSTEM: {
      const sys = state.systems.find((s) => s.id === payload);
      return {
        ...state,
        activeSystemId: payload,
        ui: {
          ...state.ui,
          activePaletteId: sys?.palettes[0]?.id ?? null,
        },
      };
    }

    case A.SET_COLOR_MODE: {
      const paletteId = state.ui.activePaletteId;
      return updateActiveSystem(state, (sys) => ({
        ...sys,
        palettes: sys.palettes.map((p) =>
          p.id === paletteId ? { ...p, colorMode: payload } : p
        ),
      }));
    }

    // --- UI actions ---
    case A.SET_ACTIVE_PALETTE:
      return { ...state, ui: { ...state.ui, activePaletteId: payload } };

    case A.SET_VIEW_MODE:
      return { ...state, ui: { ...state.ui, viewMode: payload } };

    case A.TOGGLE_EXPORT_PANEL:
      return {
        ...state,
        ui: { ...state.ui, exportPanelOpen: !state.ui.exportPanelOpen },
      };

    case A.SET_CONTRAST_SELECTION:
      return {
        ...state,
        ui: { ...state.ui, contrastSelection: payload },
      };

    // --- Project IO ---
    case A.LOAD_PROJECT: {
      const system = payload;
      // Check if a system with this ID already exists
      const exists = state.systems.find((s) => s.id === system.id);
      if (exists) {
        // Replace it
        return {
          ...state,
          systems: state.systems.map((s) => (s.id === system.id ? system : s)),
          activeSystemId: system.id,
          ui: {
            ...state.ui,
            activePaletteId: system.palettes[0]?.id ?? null,
          },
        };
      }
      // Add as new
      return {
        ...state,
        systems: [...state.systems, system],
        activeSystemId: system.id,
        ui: {
          ...state.ui,
          activePaletteId: system.palettes[0]?.id ?? null,
        },
      };
    }

    default:
      return state;
  }
}
