import { useMemo } from 'react';
import { ContrastCell } from './ContrastCell.jsx';
import { apcaContrastFromHex } from '../../color/apca.js';

/**
 * Grid of APCA Lc values between two palettes.
 */
export function ContrastMatrix({ paletteA, paletteB }) {
  if (!paletteA || !paletteB) {
    return (
      <div className="text-base text-text-tertiary text-center py-4">
        Select two palettes to compare contrast.
      </div>
    );
  }

  const matrix = useMemo(() => {
    return paletteA.swatches.map((swatchA) =>
      paletteB.swatches.map((swatchB) => ({
        lc: apcaContrastFromHex(swatchA.hex, swatchB.hex),
        fgHex: swatchA.hex,
        bgHex: swatchB.hex,
      }))
    );
  }, [paletteA, paletteB]);

  return (
    <div className="overflow-auto">
      <table className="border-collapse">
        <thead>
          <tr>
            <th className="px-1 py-0.5 text-base font-mono text-text-tertiary">
              {paletteA.prefix}\{paletteB.prefix}
            </th>
            {paletteB.swatches.map((s) => (
              <th
                key={s.step}
                className="px-1 py-0.5 text-base font-mono text-text-tertiary font-normal"
              >
                {s.step}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paletteA.swatches.map((swatchA, rowIdx) => (
            <tr key={swatchA.step}>
              <td className="px-1 py-0.5 text-base font-mono text-text-tertiary">
                {swatchA.step}
              </td>
              {matrix[rowIdx].map((cell, colIdx) => (
                <ContrastCell
                  key={`${rowIdx}-${colIdx}`}
                  lc={cell.lc}
                  fgHex={cell.fgHex}
                  bgHex={cell.bgHex}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
