import { useMemo } from 'react';
import { Swatch } from './Swatch.jsx';
import { HoverSwatch } from './HoverSwatch.jsx';

/**
 * Row of color swatches + hover row for a computed palette.
 */
export function SwatchGrid({ computedPalette }) {
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

  return (
    <div className="flex flex-col gap-2">
      {/* Main swatches */}
      <div className="flex gap-1.5 flex-wrap">
        {computedPalette.swatches.map((swatch) => (
          <Swatch key={swatch.step} swatch={swatch} apcaFailing={failingSteps.has(swatch.step)} />
        ))}
      </div>

      {/* Hover swatches */}
      {computedPalette.hoverSwatches.length > 0 && (
        <div>
          <span className="text-base uppercase tracking-wider text-text-tertiary mb-1 block">
            Hover states
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {computedPalette.hoverSwatches.map((swatch) => (
              <HoverSwatch key={swatch.step} swatch={swatch} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
