import { useState, useMemo, useEffect } from 'react';
import { useAppState } from '../../hooks/useAppState.js';
import { TOGGLE_EXPORT_PANEL } from '../../state/actions.js';
import { EXPORT_FORMATS, toKebab } from '../../export/exportFormats.js';
import { TabBar } from '../common/TabBar.jsx';
import { ExportTab } from './ExportTab.jsx';

/**
 * Slide-in overlay with format tabs for exporting color system.
 */
export function ExportPanel({ system, computedPalettes }) {
  const { dispatch } = useAppState();
  const [activeFormat, setActiveFormat] = useState(EXPORT_FORMATS[0].id);

  // Custom prefix overrides per palette (paletteId → string)
  const [prefixOverrides, setPrefixOverrides] = useState({});

  // Initialize prefix overrides from palette names when palettes change
  useEffect(() => {
    const defaults = {};
    for (const cp of computedPalettes) {
      defaults[cp.id] = toKebab(cp.prefix);
    }
    setPrefixOverrides((prev) => {
      const next = { ...defaults };
      // Preserve user edits for palettes that still exist
      for (const id of Object.keys(prev)) {
        if (next[id] !== undefined) {
          next[id] = prev[id];
        }
      }
      return next;
    });
  }, [computedPalettes.map((cp) => cp.id + cp.prefix).join(',')]);

  const tabs = EXPORT_FORMATS.map((f) => ({ id: f.id, label: f.label }));

  const currentFormat = EXPORT_FORMATS.find((f) => f.id === activeFormat);

  const code = useMemo(() => {
    if (!currentFormat) return '';
    return currentFormat.fn(system, computedPalettes, { prefixOverrides });
  }, [currentFormat, system, computedPalettes, prefixOverrides]);

  return (
    <div className="absolute inset-0 z-40 flex">
      {/* Backdrop */}
      <div
        className="flex-1 bg-black/40"
        onClick={() => dispatch({ type: TOGGLE_EXPORT_PANEL })}
      />

      {/* Panel */}
      <div className="w-[520px] bg-surface-1 border-l border-border flex flex-col">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <span className="text-base font-semibold text-text-primary">Export</span>
          <button
            onClick={() => dispatch({ type: TOGGLE_EXPORT_PANEL })}
            className="text-text-secondary hover:text-text-primary transition-colors text-lg"
          >
            &times;
          </button>
        </div>

        <div className="px-4 py-2 border-b border-border">
          <TabBar tabs={tabs} activeId={activeFormat} onSelect={setActiveFormat} />
        </div>

        {/* Custom prefix fields */}
        <div className="px-4 py-3 border-b border-border space-y-2">
          <span className="text-base uppercase tracking-wider text-text-tertiary font-medium block">
            Variable Prefix
          </span>
          <div className="flex flex-wrap gap-3">
            {computedPalettes.map((cp) => (
              <div key={cp.id} className="flex items-center gap-2">
                <span className="text-base text-text-tertiary">{cp.name}:</span>
                <input
                  type="text"
                  value={prefixOverrides[cp.id] ?? toKebab(cp.prefix)}
                  onChange={(e) =>
                    setPrefixOverrides((prev) => ({
                      ...prev,
                      [cp.id]: e.target.value,
                    }))
                  }
                  className="w-32 bg-surface-2 border border-border rounded px-2 py-1 text-base font-mono text-text-primary focus:border-accent focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <ExportTab code={code} />
        </div>
      </div>
    </div>
  );
}
