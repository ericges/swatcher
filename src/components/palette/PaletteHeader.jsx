import { useAppState } from '../../hooks/useAppState.js';
import { EditableLabel } from '../common/EditableLabel.jsx';
import { Badge } from '../common/Badge.jsx';
import { UPDATE_PALETTE } from '../../state/actions.js';

/**
 * Palette header showing name, prefix, APCA badge, and gamut badge.
 */
export function PaletteHeader({ palette, computedPalette }) {
  const { dispatch } = useAppState();

  return (
    <div className="flex items-center gap-3 mb-4">
      <EditableLabel
        value={palette.name}
        onChange={(name) =>
          dispatch({
            type: UPDATE_PALETTE,
            payload: { id: palette.id, changes: { name } },
          })
        }
        className="text-lg font-semibold"
      />

      <span className="text-base font-mono text-text-tertiary bg-surface-2 px-1.5 py-0.5 rounded">
        {palette.prefix}
      </span>

      {/* APCA badge */}
      {computedPalette?.apcaResult && (
        computedPalette.apcaResult.passing ? (
          <Badge variant="success">&#10003; APCA</Badge>
        ) : (
          <Badge variant="warning">
            &#9888; {computedPalette.apcaResult.failures.length} failing
          </Badge>
        )
      )}

      {/* Gamut badge */}
      {computedPalette?.gamutWarnings > 0 && (
        <Badge variant="warning">
          {computedPalette.gamutWarnings} clipping
        </Badge>
      )}
    </div>
  );
}
