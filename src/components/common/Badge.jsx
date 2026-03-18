import { memo } from 'react';

const VARIANTS = {
  success: 'bg-success/15 text-success border-success/30',
  warning: 'bg-warning/15 text-warning border-warning/30',
  danger: 'bg-danger/15 text-danger border-danger/30',
  neutral: 'bg-surface-3 text-text-secondary border-border',
};

/**
 * Small status badge component.
 * @param {object} props
 * @param {"success"|"warning"|"danger"|"neutral"} props.variant
 * @param {React.ReactNode} props.children
 */
export const Badge = memo(function Badge({ variant = 'neutral', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-base font-medium border leading-tight ${VARIANTS[variant]}`}
    >
      {children}
    </span>
  );
});
