import { type ReactNode, useState } from 'react';

import Sidebar from './Sidebar';
import Header from './Header';

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = () => {
    if (window.matchMedia('(min-width: 1024px)').matches) setSidebarOpen((v) => !v);
    else setMobileOpen((v) => !v);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-surface)]">
      <Sidebar open={sidebarOpen} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header sidebarOpen={sidebarOpen} toggleSidebar={toggle} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
