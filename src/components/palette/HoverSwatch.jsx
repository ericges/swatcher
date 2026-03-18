import { memo, useState } from 'react';

/**
 * Hover variant swatch — smaller, shows the hover color for a step.
 */
export const HoverSwatch = memo(function HoverSwatch({ swatch }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="w-20 h-10 rounded flex items-center justify-center transition-transform hover:scale-105"
        style={{ backgroundColor: swatch.hex }}
      >
        <span
          className="text-base font-mono font-medium"
          style={{ color: swatch.textColor }}
        >
          {swatch.name}
        </span>
      </div>

      {hovered && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface-3 border border-border rounded px-2 py-1 text-base font-mono text-text-secondary whitespace-nowrap z-20 pointer-events-none">
          {swatch.hex}
        </div>
      )}
    </div>
  );
});
