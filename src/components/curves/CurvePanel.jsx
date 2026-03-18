import { useAppState } from '../../hooks/useAppState.js';
import { CurveProfileSelect } from './CurveProfileSelect.jsx';
import { CurveCanvas } from './CurveCanvas.jsx';
import { UPDATE_PALETTE } from '../../state/actions.js';

/**
 * Curve panel containing profile selector and optional custom editor.
 * @param {object} props
 * @param {object} props.palette - Current palette
 * @param {"lightness"|"saturation"} props.type - Which curve to edit
 */
export function CurvePanel({ palette, type }) {
  const { dispatch } = useAppState();

  const profileKey = type === 'lightness' ? 'lightnessProfile' : 'saturationProfile';
  const profile = palette[profileKey];
  const label = type === 'lightness' ? 'Lightness Curve' : 'Saturation Curve';

  const handleProfileTypeChange = (newType) => {
    dispatch({
      type: UPDATE_PALETTE,
      payload: {
        id: palette.id,
        changes: {
          [profileKey]: {
            ...profile,
            type: newType,
          },
        },
      },
    });
  };

  const handleProfileChange = (newProfile) => {
    dispatch({
      type: UPDATE_PALETTE,
      payload: {
        id: palette.id,
        changes: { [profileKey]: newProfile },
      },
    });
  };

  return (
    <div className="bg-surface-1 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-base uppercase tracking-wider text-text-tertiary">
          {label}
        </span>
        <CurveProfileSelect
          type={type}
          value={profile.type}
          onChange={handleProfileTypeChange}
        />
      </div>

      <CurveCanvas
        profile={profile}
        onProfileChange={handleProfileChange}
        palette={palette}
        type={type}
      />
    </div>
  );
}
