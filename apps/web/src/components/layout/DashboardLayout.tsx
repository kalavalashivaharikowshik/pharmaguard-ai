import { type ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: Props) {
  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">

      <Sidebar
        open={sidebarOpen}
      />

      <div className="flex flex-1 flex-col overflow-hidden">

        <Header
          sidebarOpen={sidebarOpen}
          toggleSidebar={() =>
            setSidebarOpen(!sidebarOpen)
          }
        />

        <main
          className="
            flex-1
            overflow-y-auto
            bg-slate-100
            p-8
          "
        >
          <div className="mx-auto max-w-7xl">

            {children}

          </div>
        </main>

      </div>

    </div>
  );
}