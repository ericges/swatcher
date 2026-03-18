import { memo } from 'react';

/**
 * Icon-only button with hover state and optional tooltip.
 * @param {object} props
 * @param {React.ReactNode} props.children - Icon content (SVG or text)
 * @param {function} props.onClick
 * @param {string} [props.title] - Tooltip text
 * @param {string} [props.className] - Additional classes
 * @param {boolean} [props.active] - Active/pressed state
 * @param {"sm"|"md"} [props.size] - Button size
 */
export const IconButton = memo(function IconButton({
  children,
  onClick,
  title,
  className = '',
  active = false,
  size = 'md',
}) {
  const sizeClasses = size === 'sm' ? 'w-6 h-6' : 'w-7 h-7';

  return (
    <button
      onClick={onClick}
      title={title}
      className={`${sizeClasses} flex items-center justify-center rounded transition-colors ${
        active
          ? 'bg-accent/20 text-accent'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
      } ${className}`}
    >
      {children}
    </button>
  );
});
