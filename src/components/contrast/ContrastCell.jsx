import { memo, useState } from 'react';

/**
 * Get the color class for a given Lc value.
 * @param {number} lc
 * @returns {string} Tailwind text color class
 */
function getLcColorClass(lc) {
  if (lc < 30) return 'text-danger';
  if (lc < 45) return 'text-warning';
  if (lc < 60) return 'text-yellow-400';
  if (lc < 75) return 'text-success';
  return 'text-emerald-400';
}

/**
 * Individual contrast matrix cell showing Lc value.
 */
export const ContrastCell = memo(function ContrastCell({ lc, fgHex, bgHex }) {
  const [showPreview, setShowPreview] = useState(false);
  const rounded = Math.round(lc);

  return (
    <td
      className="relative px-1 py-0.5 text-center cursor-pointer hover:bg-surface-3/50 transition-colors"
      onClick={() => setShowPreview(!showPreview)}
    >
      <span className={`text-base font-mono font-medium ${getLcColorClass(rounded)}`}>
        {rounded}
      </span>

      {showPreview && (
        <div className="absolute z-30 top-full left-1/2 -translate-x-1/2 mt-1 rounded border border-border overflow-hidden shadow-lg">
          <div
            className="px-3 py-2 text-base font-medium"
            style={{ backgroundColor: bgHex, color: fgHex }}
          >
            Sample Text
          </div>
          <div
            className="px-3 py-2 text-base font-medium"
            style={{ backgroundColor: fgHex, color: bgHex }}
          >
            Sample Text
          </div>
        </div>
      )}
    </td>
  );
});
