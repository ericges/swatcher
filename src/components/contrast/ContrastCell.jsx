import { memo } from 'react';

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
export const ContrastCell = memo(function ContrastCell({ lc, fgHex, bgHex, isSelected, onSelect }) {
  const rounded = Math.round(lc);

  return (
    <td
      className={`relative px-1 py-0.5 text-center cursor-pointer hover:bg-surface-3/50 transition-colors ${
        isSelected ? 'ring-2 ring-accent ring-inset' : ''
      }`}
      onClick={() => onSelect?.({ lc, fgHex, bgHex })}
    >
      <span className={`text-base font-mono font-medium ${getLcColorClass(rounded)}`}>
        {rounded}
      </span>
    </td>
  );
});
