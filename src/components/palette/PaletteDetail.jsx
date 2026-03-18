import { useAppState } from '../../hooks/useAppState.js';
import { PaletteHeader } from './PaletteHeader.jsx';
import { ColorSliders } from './ColorSliders.jsx';
import { StepEditor } from './StepEditor.jsx';
import { SwatchGrid } from './SwatchGrid.jsx';
import { CurvePanel } from '../curves/CurvePanel.jsx';
import { SET_COLOR_MODE } from '../../state/actions.js';

/**
 * Full focused palette view in detail mode.
 */
export function PaletteDetail({ computedPalettes }) {
  const { state, dispatch } = useAppState();
  const activeSystem = state.systems.find((s) => s.id === state.activeSystemId);

  if (!activeSystem) return null;

  const palette = activeSystem.palettes.find(
    (p) => p.id === state.ui.activePaletteId
  );

  if (!palette) {
    return (
      <div className="flex items-center justify-center h-full text-text-tertiary text-base">
        Select a palette from the sidebar
      </div>
    );
  }

  const computedPalette = computedPalettes.find((cp) => cp.id === palette.id);

  return (
    <div className="space-y-6">
      <PaletteHeader palette={palette} computedPalette={computedPalette} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: sliders + steps */}
        <div className="space-y-5">
          <div className="bg-surface-1 rounded-lg border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-base uppercase tracking-wider text-text-tertiary">
                Color Input
              </span>
              <button
                onClick={() =>
                  dispatch({
                    type: SET_COLOR_MODE,
                    payload: palette.colorMode === 'HSL' ? 'OKLCH' : 'HSL',
                  })
                }
                className="px-2 py-1 text-base font-mono font-medium rounded border border-border text-text-secondary hover:text-text-primary hover:border-text-tertiary transition-colors"
              >
                {palette.colorMode ?? 'OKLCH'}
              </button>
            </div>
            <ColorSliders palette={palette} />
          </div>

          <div className="bg-surface-1 rounded-lg border border-border p-4">
            <StepEditor palette={palette} />
          </div>
        </div>

        {/* Right column: curves */}
        <div className="space-y-4">
          <CurvePanel palette={palette} type="lightness" />
          <CurvePanel palette={palette} type="saturation" />
        </div>
      </div>

      {/* Swatches */}
      <div className="bg-surface-1 rounded-lg border border-border p-4">
        <span className="text-base uppercase tracking-wider text-text-tertiary mb-3 block">
          Generated Swatches
        </span>
        <SwatchGrid computedPalette={computedPalette} />
      </div>
    </div>
  );
}
