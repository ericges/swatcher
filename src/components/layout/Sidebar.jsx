import { useAppState } from '../../hooks/useAppState.js';
import { IconButton } from '../common/IconButton.jsx';
import { ADD_PALETTE, SET_ACTIVE_PALETTE, REMOVE_PALETTE } from '../../state/actions.js';

export function Sidebar() {
  const { state, dispatch } = useAppState();
  const activeSystem = state.systems.find((s) => s.id === state.activeSystemId);

  if (!activeSystem) return null;

  return (
    <div className="w-56 border-r border-border bg-surface-1 flex flex-col shrink-0">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <span className="text-base uppercase tracking-wider text-text-tertiary font-medium">
          Palettes
        </span>
        <IconButton
          onClick={() => {
            const count = activeSystem.palettes.length;
            dispatch({
              type: ADD_PALETTE,
              payload: {
                name: `Color ${count + 1}`,
                prefix: `C${count + 1}`,
                hue: (count * 60 + 200) % 360,
                saturation: 50,
              },
            });
          }}
          title="Add palette"
          size="sm"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="6" y1="2" x2="6" y2="10" />
            <line x1="2" y1="6" x2="10" y2="6" />
          </svg>
        </IconButton>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {activeSystem.palettes.map((palette) => {
          const isActive = palette.id === state.ui.activePaletteId;
          // Generate a preview color at ~50% lightness
          const previewHue = palette.hue;

          return (
            <div
              key={palette.id}
              onClick={() => dispatch({ type: SET_ACTIVE_PALETTE, payload: palette.id })}
              className={`group flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors ${
                isActive
                  ? 'bg-surface-2 text-text-primary'
                  : 'text-text-secondary hover:bg-surface-2/50 hover:text-text-primary'
              }`}
            >
              <div
                className="w-3 h-3 rounded-sm shrink-0 border border-white/10"
                style={{
                  background: `hsl(${previewHue}, ${Math.min(palette.saturation * 2, 100)}%, 50%)`,
                }}
              />
              <span className="text-base truncate flex-1">{palette.name}</span>
              <span className="text-base font-mono text-text-tertiary">{palette.prefix}</span>
              {activeSystem.palettes.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({ type: REMOVE_PALETTE, payload: palette.id });
                  }}
                  className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-danger transition-opacity text-base"
                  title="Remove palette"
                >
                  &times;
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
