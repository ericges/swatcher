import { memo } from 'react';

/**
 * Reusable tab bar component.
 * @param {object} props
 * @param {Array<{id: string, label: string}>} props.tabs
 * @param {string} props.activeId
 * @param {function} props.onSelect - (tabId: string) => void
 */
export const TabBar = memo(function TabBar({ tabs, activeId, onSelect }) {
  return (
    <div className="flex items-center gap-0.5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelect(tab.id)}
          className={`px-3 py-1.5 text-base font-medium rounded transition-colors ${
            activeId === tab.id
              ? 'bg-surface-2 text-text-primary'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-2/50'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
});
