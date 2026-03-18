import { useAppState } from '../../hooks/useAppState.js';
import { ContrastMatrix } from './ContrastMatrix.jsx';
import { SET_CONTRAST_SELECTION } from '../../state/actions.js';

/**
 * Full-width view for contrast matrix comparison.
 */
export function ContrastView({ computedPalettes }) {
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

      <div className="bg-surface-1 rounded-lg border border-border p-4 overflow-auto">
        <ContrastMatrix paletteA={paletteA} paletteB={paletteB} />
      </div>
    </div>
  );
}
