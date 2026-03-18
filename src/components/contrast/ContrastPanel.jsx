import { useState } from 'react';
import { useAppState } from '../../hooks/useAppState.js';
import { ContrastMatrix } from './ContrastMatrix.jsx';
import { SET_CONTRAST_SELECTION } from '../../state/actions.js';

/**
 * Full-width view for contrast matrix comparison.
 */
export function ContrastView({ computedPalettes }) {
  const { state, dispatch } = useAppState();
  const { contrastSelection } = state.ui;
  const [selectedCell, setSelectedCell] = useState(null);

  const paletteA = computedPalettes.find(
    (p) => p.id === contrastSelection.paletteAId
  );
  const paletteB = computedPalettes.find(
    (p) => p.id === contrastSelection.paletteBId
  );

  const handleSelect = (key, value) => {
    dispatch({
      type: SET_CONTRAST_SELECTION,
      payload: { ...contrastSelection, [key]: value },
    });
    setSelectedCell(null);
  };

  const handleCellSelect = (cell) => {
    setSelectedCell((prev) =>
      prev?.fgHex === cell.fgHex && prev?.bgHex === cell.bgHex ? null : cell
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-base uppercase tracking-wider text-text-tertiary font-medium">
          Contrast Matrix
        </span>
        <div className="flex items-center gap-2">
          <span className="text-base text-text-tertiary">Rows</span>
          <select
            value={contrastSelection.paletteAId || ''}
            onChange={(e) => handleSelect('paletteAId', e.target.value || null)}
            className="bg-surface-2 border border-border rounded px-2 py-1 text-base text-text-primary focus:border-accent focus:outline-none"
          >
            <option value="">Select palette</option>
            {computedPalettes.map((cp) => (
              <option key={cp.id} value={cp.id}>
                {cp.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base text-text-tertiary">Cols</span>
          <select
            value={contrastSelection.paletteBId || ''}
            onChange={(e) => handleSelect('paletteBId', e.target.value || null)}
            className="bg-surface-2 border border-border rounded px-2 py-1 text-base text-text-primary focus:border-accent focus:outline-none"
          >
            <option value="">Select palette</option>
            {computedPalettes.map((cp) => (
              <option key={cp.id} value={cp.id}>
                {cp.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-4 items-start">
        {/* Matrix */}
        <div className="bg-surface-1 rounded-lg border border-border p-4 overflow-auto flex-1 min-w-0">
          <ContrastMatrix
            paletteA={paletteA}
            paletteB={paletteB}
            selectedCell={selectedCell}
            onCellSelect={handleCellSelect}
          />
        </div>

        {/* Preview panel */}
        <div className="w-64 shrink-0 bg-surface-1 rounded-lg border border-border p-4 space-y-3">
          <span className="text-base uppercase tracking-wider text-text-tertiary font-medium">
            Preview
          </span>

          {selectedCell ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-base text-text-tertiary">
                  Lc {Math.round(selectedCell.lc)}
                </span>
              </div>

              <div
                className="rounded-lg px-4 py-5 text-center"
                style={{
                  backgroundColor: selectedCell.bgHex,
                  color: selectedCell.fgHex,
                }}
              >
                <div className="text-xl font-semibold mb-1">Heading</div>
                <div className="text-base">Body text sample</div>
                <div className="text-sm mt-1 opacity-80">Small caption</div>
              </div>

              <div
                className="rounded-lg px-4 py-5 text-center"
                style={{
                  backgroundColor: selectedCell.fgHex,
                  color: selectedCell.bgHex,
                }}
              >
                <div className="text-xl font-semibold mb-1">Heading</div>
                <div className="text-base">Body text sample</div>
                <div className="text-sm mt-1 opacity-80">Small caption</div>
              </div>

              <div className="flex gap-2 text-base font-mono text-text-secondary">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-4 h-4 rounded border border-white/10"
                    style={{ backgroundColor: selectedCell.fgHex }}
                  />
                  <span>{selectedCell.fgHex}</span>
                </div>
                <span className="text-text-tertiary">/</span>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-4 h-4 rounded border border-white/10"
                    style={{ backgroundColor: selectedCell.bgHex }}
                  />
                  <span>{selectedCell.bgHex}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-base text-text-tertiary py-4 text-center">
              Click a cell in the matrix to preview the color combination.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
