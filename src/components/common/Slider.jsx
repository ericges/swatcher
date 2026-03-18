import { memo, useState, useRef, useEffect } from 'react';

/**
 * Styled range input with a live-gradient CSS track.
 * Clicking the value number makes it editable.
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
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef(null);

  const pct = ((value - min) / (max - min)) * 100;

  const trackStyle = gradient
    ? { background: gradient }
    : {
        background: `linear-gradient(to right, var(--color-accent) ${pct}%, var(--color-surface-3) ${pct}%)`,
      };

  const startEditing = () => {
    setEditValue(String(Math.round(value)));
    setEditing(true);
  };

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commitEdit = () => {
    const parsed = Number(editValue);
    if (!isNaN(parsed)) {
      const clamped = Math.round(Math.min(max, Math.max(min, parsed)));
      onChange(clamped);
    }
    setEditing(false);
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-base text-text-secondary">{label}</span>
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitEdit();
              if (e.key === 'Escape') setEditing(false);
            }}
            className="w-12 text-base font-mono text-text-primary tabular-nums text-right bg-surface-2 border border-accent rounded px-1 py-0 focus:outline-none"
          />
        ) : (
          <button
            onClick={startEditing}
            className="text-base font-mono text-text-secondary tabular-nums w-10 text-right hover:text-text-primary hover:bg-surface-2 rounded px-1 transition-colors cursor-text"
            title="Click to edit"
          >
            {typeof value === 'number' ? Math.round(value) : value}
          </button>
        )}
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
