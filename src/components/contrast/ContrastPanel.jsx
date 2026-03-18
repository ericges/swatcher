import { useAppState } from '../../hooks/useAppState.js';
import { ContrastMatrix } from './ContrastMatrix.jsx';
import { SET_CONTRAST_SELECTION } from '../../state/actions.js';

/**
 * Right-panel wrapper for contrast matrix.
 */
export function ContrastPanel({ computedPalettes }) {
  const { state, dispatch } = useAppState();
  const { contrastSelection } = state.ui;

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
  };

  return (
    <div className="w-80 border-l border-border bg-surface-1 flex flex-col shrink-0 overflow-hidden">
      <div className="px-3 py-2 border-b border-border">
        <span className="text-base uppercase tracking-wider text-text-tertiary font-medium">
          Contrast Matrix
        </span>
      </div>

      <div className="px-3 py-3 space-y-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-base text-text-tertiary w-12">Rows</span>
          <select
            value={contrastSelection.paletteAId || ''}
            onChange={(e) => handleSelect('paletteAId', e.target.value || null)}
            className="flex-1 bg-surface-2 border border-border rounded px-2 py-1 text-base text-text-primary focus:border-accent focus:outline-none"
          >
            <option value="">Select palette</option>
            {computedPalettes.map((cp) => (
              <option key={cp.id} value={cp.id}>
                {cp.name} ({cp.prefix})
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base text-text-tertiary w-12">Cols</span>
          <select
            value={contrastSelection.paletteBId || ''}
            onChange={(e) => handleSelect('paletteBId', e.target.value || null)}
            className="flex-1 bg-surface-2 border border-border rounded px-2 py-1 text-base text-text-primary focus:border-accent focus:outline-none"
          >
            <option value="">Select palette</option>
            {computedPalettes.map((cp) => (
              <option key={cp.id} value={cp.id}>
                {cp.name} ({cp.prefix})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <ContrastMatrix paletteA={paletteA} paletteB={paletteB} />
      </div>
    </div>
  );
}
