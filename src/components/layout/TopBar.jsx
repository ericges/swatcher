import { useAppState } from '../../hooks/useAppState.js';
import { EditableLabel } from '../common/EditableLabel.jsx';
import { IconButton } from '../common/IconButton.jsx';
import {
  ADD_SYSTEM,
  REMOVE_SYSTEM,
  RENAME_SYSTEM,
  SET_ACTIVE_SYSTEM,
  SET_VIEW_MODE,
  TOGGLE_EXPORT_PANEL,
} from '../../state/actions.js';
import { exportProjectFile } from '../../export/projectIO.js';
import { importProjectFile } from '../../export/projectIO.js';
import { LOAD_PROJECT } from '../../state/actions.js';
import { useRef } from 'react';

export function TopBar() {
  const { state, dispatch } = useAppState();
  const fileInputRef = useRef(null);

  const activeSystem = state.systems.find((s) => s.id === state.activeSystemId);

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const system = await importProjectFile(file);
      dispatch({ type: LOAD_PROJECT, payload: system });
    } catch (err) {
      alert(`Import failed: ${err.message}`);
    }
    e.target.value = '';
  };

  return (
    <div className="h-12 flex items-center border-b border-border bg-surface-1 px-3 gap-2 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-3">
        <div className="w-5 h-5 rounded bg-accent flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="1" y="1" width="4" height="4" rx="1" fill="white" />
            <rect x="7" y="1" width="4" height="4" rx="1" fill="white" opacity="0.6" />
            <rect x="1" y="7" width="4" height="4" rx="1" fill="white" opacity="0.6" />
            <rect x="7" y="7" width="4" height="4" rx="1" fill="white" opacity="0.3" />
          </svg>
        </div>
        <span className="text-base font-semibold text-text-primary tracking-tight">Swatcher</span>
      </div>

      {/* System tabs */}
      <div className="flex items-center gap-0.5 flex-1 overflow-x-auto">
        {state.systems.map((sys) => (
          <div
            key={sys.id}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-base cursor-pointer transition-colors group ${
              sys.id === state.activeSystemId
                ? 'bg-surface-2 text-text-primary'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-2/50'
            }`}
            onClick={() => dispatch({ type: SET_ACTIVE_SYSTEM, payload: sys.id })}
          >
            <EditableLabel
              value={sys.name}
              onChange={(name) =>
                dispatch({ type: RENAME_SYSTEM, payload: { id: sys.id, name } })
              }
              className="text-base"
            />
            {state.systems.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: REMOVE_SYSTEM, payload: sys.id });
                }}
                className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-danger ml-1 transition-opacity"
                title="Close system"
              >
                &times;
              </button>
            )}
          </div>
        ))}
        <IconButton
          onClick={() => dispatch({ type: ADD_SYSTEM })}
          title="New color system"
          size="sm"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="6" y1="2" x2="6" y2="10" />
            <line x1="2" y1="6" x2="10" y2="6" />
          </svg>
        </IconButton>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 ml-auto">
        {/* View mode toggle */}
        <div className="flex items-center rounded border border-border overflow-hidden">
          <button
            onClick={() => dispatch({ type: SET_VIEW_MODE, payload: 'detail' })}
            className={`px-2 py-1 text-base font-medium transition-colors ${
              state.ui.viewMode === 'detail'
                ? 'bg-surface-2 text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Detail
          </button>
          <button
            onClick={() => dispatch({ type: SET_VIEW_MODE, payload: 'comparison' })}
            className={`px-2 py-1 text-base font-medium transition-colors ${
              state.ui.viewMode === 'comparison'
                ? 'bg-surface-2 text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Compare
          </button>
          <button
            onClick={() => dispatch({ type: SET_VIEW_MODE, payload: 'contrast' })}
            className={`px-2 py-1 text-base font-medium transition-colors ${
              state.ui.viewMode === 'contrast'
                ? 'bg-surface-2 text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Contrast
          </button>
        </div>

        {/* Export */}
        <IconButton
          onClick={() => dispatch({ type: TOGGLE_EXPORT_PANEL })}
          title="Export"
          active={state.ui.exportPanelOpen}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M4.5 2L1.5 7l3 5M9.5 2l3 5-3 5" />
          </svg>
        </IconButton>

        {/* Import */}
        <IconButton
          onClick={() => fileInputRef.current?.click()}
          title="Import project"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M7 9V2M4 5l3-3 3 3M2 11h10" />
          </svg>
        </IconButton>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.colorproject.json"
          onChange={handleImport}
          className="hidden"
        />

        {/* Save/download project */}
        {activeSystem && (
          <IconButton
            onClick={() => exportProjectFile(activeSystem)}
            title="Save project file"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M7 2v7M4 6l3 3 3-3M2 11h10" />
            </svg>
          </IconButton>
        )}
      </div>
    </div>
  );
}
