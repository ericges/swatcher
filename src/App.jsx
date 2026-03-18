import { TopBar } from './components/layout/TopBar.jsx';
import { WorkspaceLayout } from './components/layout/WorkspaceLayout.jsx';

export default function App() {
  return (
    <div className="h-full flex flex-col bg-surface-0 text-text-primary">
      <TopBar />
      <WorkspaceLayout />
    </div>
  );
}
