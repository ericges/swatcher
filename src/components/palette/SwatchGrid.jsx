import { useState, useMemo, useEffect, useRef } from 'react';
import { Swatch } from './Swatch.jsx';
import { HoverSwatch } from './HoverSwatch.jsx';

/**
 * Row of color swatches + hover row for a computed palette.
 * Manages which swatch popover is currently open so clicking
 * a different swatch switches instantly without an extra close click.
 */
export function SwatchGrid({ computedPalette }) {
  const [selectedKey, setSelectedKey] = useState(null);

  const gridRef = useRef(null);

  // Close popover when clicking outside the swatch grid
  useEffect(() => {
    if (selectedKey == null) return;
    const handleClick = (e) => {
      if (gridRef.current && !gridRef.current.contains(e.target)) {
        setSelectedKey(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [selectedKey]);

  if (!computedPalette) return null;

  // Collect steps involved in failing APCA pairs
  const failingSteps = useMemo(() => {
    const steps = new Set();
    if (computedPalette.apcaResult?.failures) {
      for (const f of computedPalette.apcaResult.failures) {
        steps.add(f.stepA);
        steps.add(f.stepB);
      }
    }
    return steps;
  }, [computedPalette.apcaResult]);

  const handleSelect = (key) => {
    setSelectedKey((prev) => (prev === key ? null : key));
  };

  return (
    <div ref={gridRef} className="flex flex-col gap-2">
      {/* Main swatches */}
      <div className="flex gap-1.5 flex-wrap">
        {computedPalette.swatches.map((swatch) => (
          <Swatch
            key={swatch.step}
            swatch={swatch}
            apcaFailing={failingSteps.has(swatch.step)}
            isOpen={selectedKey === swatch.step}
            onSelect={() => handleSelect(swatch.step)}
          />
        ))}
      </div>

      {/* Hover swatches */}
      {computedPalette.hoverSwatches.length > 0 && (
        <div>
          <span className="text-base uppercase tracking-wider text-text-tertiary mb-1 block">
            Hover states
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {computedPalette.hoverSwatches.map((swatch) => {
              const key = `h${swatch.step}`;
              return (
                <HoverSwatch
                  key={swatch.step}
                  swatch={swatch}
                  isOpen={selectedKey === key}
                  onSelect={() => handleSelect(key)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
