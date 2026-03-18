import { memo, useState } from 'react';
import { Badge } from '../common/Badge.jsx';

/**
 * Individual color swatch displaying color, step name, hex, and warnings.
 */
export const Swatch = memo(function Swatch({ swatch, apcaFailing = false }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative flex flex-col items-center group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`w-20 h-20 rounded-lg flex items-center justify-center relative overflow-hidden transition-transform hover:scale-105 ${
          apcaFailing ? 'ring-1 ring-warning/60' : ''
        }`}
        style={{ backgroundColor: swatch.hex }}
      >
        {/* Gamut warning overlay */}
        {!swatch.inGamut && (
          <div className="absolute inset-0 gamut-warning-stripes" />
        )}

        {/* Gamut warning icon */}
        {!swatch.inGamut && (
          <span className="absolute top-0.5 right-0.5" title="Out of sRGB gamut">
            <Badge variant="warning">!</Badge>
          </span>
        )}

        {/* APCA failing indicator */}
        {apcaFailing && (
          <span className="absolute bottom-0.5 left-0.5" title="APCA contrast failing for a step-50 pair">
            <Badge variant="danger">Lc</Badge>
          </span>
        )}

        {/* Step name inside swatch */}
        <span
          className="text-base font-mono font-medium relative z-10"
          style={{ color: swatch.textColor }}
        >
          {swatch.name}
        </span>
      </div>

      {/* Hex label below */}
      <span className="text-base font-mono text-text-tertiary mt-1 select-all">
        {swatch.hex}
      </span>

      {/* Tooltip on hover */}
      {hovered && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface-3 border border-border rounded px-2 py-1 text-base font-mono text-text-secondary whitespace-nowrap z-20 pointer-events-none">
          {swatch.cssString}
        </div>
      )}
    </div>
  );
});
