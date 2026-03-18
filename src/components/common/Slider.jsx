import { memo } from 'react';

/**
 * Styled range input with a live-gradient CSS track.
 * @param {object} props
 * @param {string} props.label - Slider label
 * @param {number} props.value - Current value
 * @param {number} props.min - Min value
 * @param {number} props.max - Max value
 * @param {number} [props.step] - Step increment
 * @param {function} props.onChange - (newValue: number) => void
 * @param {string} [props.gradient] - CSS gradient string for the track background
 */
export const Slider = memo(function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  gradient,
}) {
  const pct = ((value - min) / (max - min)) * 100;

  const trackStyle = gradient
    ? { background: gradient }
    : {
        background: `linear-gradient(to right, var(--color-accent) ${pct}%, var(--color-surface-3) ${pct}%)`,
      };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-base text-text-secondary">{label}</span>
        <span className="text-base font-mono text-text-secondary tabular-nums w-10 text-right">
          {typeof value === 'number' ? Math.round(value) : value}
        </span>
      </div>
      <input
        type="range"
        className="custom-slider w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={trackStyle}
      />
    </div>
  );
});
