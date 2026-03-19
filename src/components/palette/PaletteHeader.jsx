import { useAppState } from '../../hooks/useAppState.js';
import { EditableLabel } from '../common/EditableLabel.jsx';
import { IconButton } from '../common/IconButton.jsx';
import { Badge } from '../common/Badge.jsx';
import { UPDATE_PALETTE } from '../../state/actions.js';
import { getColorName } from '../../color/colorNames.js';

/**
 * Palette header showing name, APCA badge, and gamut badge.
 */
export function PaletteHeader({ palette, computedPalette }) {
  const { dispatch } = useAppState();

  const generateName = () => {
    const name = getColorName(palette.hue, palette.saturation, palette.colorMode ?? 'OKLCH');
    dispatch({
      type: UPDATE_PALETTE,
      payload: { id: palette.id, changes: { name } },
    });
  };

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

      {/* Generate name from hue + saturation */}
      <IconButton onClick={generateName} size="sm" title="Generate name from color">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2v2M8 12v2M2 8h2M12 8h2M4.5 4.5l1 1M10.5 10.5l1 1M4.5 11.5l1-1M10.5 5.5l1-1" />
          <circle cx="8" cy="8" r="2" />
        </svg>
      </IconButton>

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
