/**
 * All palettes displayed as aligned vertical strips for comparison.
 */
export function ComparisonView({ computedPalettes }) {
  if (!computedPalettes || computedPalettes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-tertiary text-base">
        No palettes to compare.
      </div>
    );
  }

  // Find the union of all steps across palettes
  const allSteps = [
    ...new Set(computedPalettes.flatMap((cp) => cp.swatches.map((s) => s.step))),
  ].sort((a, b) => b - a);

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse w-full">
        <thead>
          <tr>
            <th className="px-2 py-1 text-base font-mono text-text-tertiary font-normal text-left sticky left-0 bg-surface-0 z-10">
              Step
            </th>
            {computedPalettes.map((cp) => (
              <th
                key={cp.id}
                className="px-2 py-1 text-base font-medium text-text-secondary font-normal text-center"
              >
                {cp.name}
                <span className="text-text-tertiary ml-1">({cp.prefix})</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allSteps.map((step) => (
            <tr key={step} className="group">
              <td className="px-2 py-0.5 text-base font-mono text-text-tertiary sticky left-0 bg-surface-0 z-10">
                {step}
              </td>
              {computedPalettes.map((cp) => {
                const swatch = cp.swatches.find((s) => s.step === step);
                if (!swatch) {
                  return (
                    <td key={cp.id} className="px-1 py-0.5">
                      <div className="w-full h-8 rounded bg-surface-2/30" />
                    </td>
                  );
                }
                return (
                  <td key={cp.id} className="px-1 py-0.5">
                    <div
                      className="h-8 rounded flex items-center justify-center relative overflow-hidden min-w-[60px]"
                      style={{ backgroundColor: swatch.hex }}
                    >
                      {!swatch.inGamut && (
                        <div className="absolute inset-0 gamut-warning-stripes" />
                      )}
                      <span
                        className="text-base font-mono relative z-10"
                        style={{ color: swatch.textColor }}
                      >
                        {swatch.hex}
                      </span>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
