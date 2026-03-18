import { memo } from 'react';

const LIGHTNESS_PROFILES = [
  { id: 'apca-adaptive', label: 'APCA Adaptive' },
  { id: 'linear', label: 'Linear' },
  { id: 'ease-in', label: 'Ease In' },
  { id: 'ease-out', label: 'Ease Out' },
  { id: 's-curve', label: 'S-Curve' },
  { id: 'perceptual', label: 'Perceptual' },
  { id: 'custom', label: 'Custom' },
];

const SATURATION_PROFILES = [
  { id: 'flat', label: 'Flat' },
  { id: 'bell', label: 'Bell' },
  { id: 'dark-fade', label: 'Dark Fade' },
  { id: 'custom', label: 'Custom' },
];

/**
 * Dropdown selector for curve profiles.
 * @param {object} props
 * @param {"lightness"|"saturation"} props.type
 * @param {string} props.value - Current profile type ID
 * @param {function} props.onChange - (profileId: string) => void
 */
export const CurveProfileSelect = memo(function CurveProfileSelect({ type, value, onChange }) {
  const profiles = type === 'lightness' ? LIGHTNESS_PROFILES : SATURATION_PROFILES;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-surface-2 border border-border rounded px-2 py-1 text-base text-text-primary focus:border-accent focus:outline-none cursor-pointer"
    >
      {profiles.map((p) => (
        <option key={p.id} value={p.id}>
          {p.label}
        </option>
      ))}
    </select>
  );
});
