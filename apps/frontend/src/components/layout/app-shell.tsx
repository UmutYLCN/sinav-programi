import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { TopBar } from './topbar';

export function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

