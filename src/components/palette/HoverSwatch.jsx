import { memo, useRef, useLayoutEffect } from 'react';

/**
 * Hover variant swatch — smaller, shows the hover color for a step.
 * Click to open a popover with color preview bar and labeled hex/CSS values.
 */
export const HoverSwatch = memo(function HoverSwatch({ swatch, isOpen = false, onSelect }) {
  const popoverRef = useRef(null);
  const wrapperRef = useRef(null);

  const modeLabel = swatch.cssString.startsWith('oklch') ? 'OKLCH' : 'HSL';

  // Reposition popover horizontally to stay within the containing card
  useLayoutEffect(() => {
    if (!isOpen || !popoverRef.current || !wrapperRef.current) return;

    const popover = popoverRef.current;
    const wrapper = wrapperRef.current;

    const container =
      wrapper.closest('.bg-surface-1') || document.documentElement;
    const containerRect = container.getBoundingClientRect();
    const pad = 8;

    popover.style.left = '50%';
    popover.style.transform = 'translateX(-50%)';

    const pr = popover.getBoundingClientRect();
    let offsetX = 0;
    if (pr.left < containerRect.left + pad) {
      offsetX = containerRect.left + pad - pr.left;
    } else if (pr.right > containerRect.right - pad) {
      offsetX = containerRect.right - pad - pr.right;
    }

    if (offsetX !== 0) {
      popover.style.transform = `translateX(calc(-50% + ${offsetX}px))`;
    }
  }, [isOpen]);

  return (
    <div ref={wrapperRef} className={`relative flex flex-col items-center ${isOpen ? 'z-20' : ''}`}>
      <div
        className={`w-20 h-10 rounded flex items-center justify-center transition-transform cursor-pointer ${
          isOpen ? 'ring-2 ring-accent scale-105 z-20' : 'hover:scale-105'
        }`}
        style={{ backgroundColor: swatch.cssString }}
        onClick={onSelect}
      >
        <span
          className="text-base font-mono font-medium"
          style={{ color: swatch.textColor }}
        >
          {swatch.name}
        </span>
      </div>

      {/* Popover with color preview bar + labeled values */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute top-[calc(100%+6px)] z-20 whitespace-nowrap"
        >
          {/* Color preview bar */}
          <div
            className="h-5 rounded-t-lg border border-b-0 border-border"
            style={{ backgroundColor: swatch.cssString }}
          />
          {/* Values card */}
          <div className="bg-surface-2 border border-border rounded-b-lg shadow-lg px-3 py-2.5">
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xs uppercase tracking-wider text-text-tertiary w-10 shrink-0">
                  HEX
                </span>
                <span className="text-sm font-mono text-text-primary select-all">
                  {swatch.hex}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs uppercase tracking-wider text-text-tertiary w-10 shrink-0">
                  {modeLabel}
                </span>
                <span className="text-sm font-mono text-text-primary select-all">
                  {swatch.cssString}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
