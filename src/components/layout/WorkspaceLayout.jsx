import { useMemo } from 'react';
import { useAppState } from '../../hooks/useAppState.js';
import { Sidebar } from './Sidebar.jsx';
import { PaletteDetail } from '../palette/PaletteDetail.jsx';
import { ComparisonView } from '../comparison/ComparisonView.jsx';
import { ContrastPanel } from '../contrast/ContrastPanel.jsx';
import { ExportPanel } from '../export/ExportPanel.jsx';
import { computeAllPalettes } from '../../color/paletteCompute.js';

export function WorkspaceLayout() {
  const { state } = useAppState();
  const activeSystem = state.systems.find((s) => s.id === state.activeSystemId);

  const computedPalettes = useMemo(() => {
    if (!activeSystem) return [];
    return computeAllPalettes(activeSystem);
  }, [activeSystem]);

  if (!activeSystem) return null;

  return (
    <div className="flex flex-1 overflow-hidden relative">
      <Sidebar />

      {/* Main workspace */}
      <div className="flex-1 overflow-y-auto p-6">
        {state.ui.viewMode === 'detail' ? (
          <PaletteDetail computedPalettes={computedPalettes} />
        ) : (
          <ComparisonView computedPalettes={computedPalettes} />
        )}
      </div>

      {/* Right panel: Contrast Matrix */}
      {state.ui.contrastPanelOpen && (
        <ContrastPanel computedPalettes={computedPalettes} />
      )}

      {/* Export overlay */}
      {state.ui.exportPanelOpen && (
        <ExportPanel
          system={activeSystem}
          computedPalettes={computedPalettes}
        />
      )}
    </div>
  );
}
