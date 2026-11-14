import {
  Link,
  useLocation,
} from 'react-router-dom';

import {
  LayoutDashboard,
  Package,
  Boxes,
  ArrowLeftRight,
  ShieldAlert,
  ShieldCheck,
  Link2,
  Bell,
  Users,
  ClipboardList,
  Settings,
} from 'lucide-react';

import {
  role,
} from '../../auth/roles';

interface SidebarProps {
  open: boolean;
}

type SidebarItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
};

export default function Sidebar({
  open,
}: SidebarProps) {

  const location =
    useLocation();

  const userRole =
    role();

  let items: SidebarItem[] = [];

  if (
    userRole === 'SUPER_ADMIN'
  ) {

    items = [
      {
        label: 'Dashboard',
        path: '/',
        icon: <LayoutDashboard size={20} />,
      },
      {
        label: 'Batches',
        path: '/batches',
        icon: <Package size={20} />,
      },
      {
        label: 'Inventory',
        path: '/inventory',
        icon: <Boxes size={20} />,
      },
      {
        label: 'Transfers',
        path: '/transfers',
        icon: <ArrowLeftRight size={20} />,
      },
      {
        label: 'Recalls',
        path: '/recalls',
        icon: <ShieldAlert size={20} />,
      },
      {
        label: 'Revocation',
        path: '/revocation',
        icon: <ShieldCheck size={20} />,
      },
      {
        label: 'Compliance',
        path: '/compliance',
        icon: <ClipboardList size={20} />,
      },
      {
        label: 'Blockchain',
        path: '/blockchain',
        icon: <Link2 size={20} />,
      },
      {
        label: 'Notifications',
        path: '/notifications',
        icon: <Bell size={20} />,
      },
      {
        label: 'Users',
        path: '/users',
        icon: <Users size={20} />,
      },
      {
        label: 'Registration Requests',
        path: '/registration',
        icon: <ClipboardList size={20} />,
      },
      {
        label: 'Settings',
        path: '/settings',
        icon: <Settings size={20} />,
      },
    ];

  } else if (
    userRole === 'REGULATOR'
  ) {

    items = [
      {
        label: 'Dashboard',
        path: '/',
        icon: <LayoutDashboard size={20} />,
      },
      {
        label: 'Batches',
        path: '/batches',
        icon: <Package size={20} />,
      },
      {
        label: 'Inventory',
        path: '/inventory',
        icon: <Boxes size={20} />,
      },
      {
        label: 'Recalls',
        path: '/recalls',
        icon: <ShieldAlert size={20} />,
      },
      {
        label: 'Revocation',
        path: '/revocation',
        icon: <ShieldCheck size={20} />,
      },
      {
        label: 'Compliance',
        path: '/compliance',
        icon: <ClipboardList size={20} />,
      },
      {
        label: 'Blockchain',
        path: '/blockchain',
        icon: <Link2 size={20} />,
      },
      {
        label: 'Notifications',
        path: '/notifications',
        icon: <Bell size={20} />,
      },
      {
        label: 'Settings',
        path: '/settings',
        icon: <Settings size={20} />,
      },
    ];

  } else if (
    userRole === 'MANUFACTURER'
  ) {

    items = [
      {
        label: 'Dashboard',
        path: '/',
        icon: <LayoutDashboard size={20} />,
      },
      {
        label: 'Batches',
        path: '/batches',
        icon: <Package size={20} />,
      },
      {
        label: 'Inventory',
        path: '/inventory',
        icon: <Boxes size={20} />,
      },
      {
        label: 'Transfers',
        path: '/transfers',
        icon: <ArrowLeftRight size={20} />,
      },
      {
        label: 'Recalls',
        path: '/recalls',
        icon: <ShieldAlert size={20} />,
      },
      {
        label: 'Blockchain',
        path: '/blockchain',
        icon: <Link2 size={20} />,
      },
      {
        label: 'Notifications',
        path: '/notifications',
        icon: <Bell size={20} />,
      },
      {
        label: 'Settings',
        path: '/settings',
        icon: <Settings size={20} />,
      },
    ];

  } else if (
    userRole === 'DISTRIBUTOR'
  ) {

    items = [
      {
        label: 'Dashboard',
        path: '/',
        icon: <LayoutDashboard size={20} />,
      },
      {
        label: 'Inventory',
        path: '/inventory',
        icon: <Boxes size={20} />,
      },
      {
        label: 'Batches',
        path: '/batches',
        icon: <Package size={20} />,
      },
      {
        label: 'Transfers',
        path: '/transfers',
        icon: <ArrowLeftRight size={20} />,
      },
      {
        label: 'Recalls',
        path: '/recalls',
        icon: <ShieldAlert size={20} />,
      },
      {
        label: 'Notifications',
        path: '/notifications',
        icon: <Bell size={20} />,
      },
      {
        label: 'Settings',
        path: '/settings',
        icon: <Settings size={20} />,
      },
    ];

  } else if (
    userRole === 'PHARMACY'
  ) {

    items = [
      {
        label: 'Dashboard',
        path: '/',
        icon: <LayoutDashboard size={20} />,
      },
      {
        label: 'Batches',
        path: '/batches',
        icon: <Package size={20} />,
      },
      {
        label: 'Inventory',
        path: '/inventory',
        icon: <Boxes size={20} />,
      },
      {
        label: 'Recalls',
        path: '/recalls',
        icon: <ShieldAlert size={20} />,
      },
      {
        label: 'Blockchain',
        path: '/blockchain',
        icon: <Link2 size={20} />,
      },
      {
        label: 'Notifications',
        path: '/notifications',
        icon: <Bell size={20} />,
      },
      {
        label: 'Settings',
        path: '/settings',
        icon: <Settings size={20} />,
      },
    ];

  }

  return (
    <aside
      className={`
        bg-[#0F172A]
        text-white
        transition-all
        duration-300
        flex
        flex-col
        border-r
        border-slate-800
        ${open ? 'w-72' : 'w-20'}
      `}
    >

      <div className="h-20 flex items-center justify-center border-b border-slate-800">

        {open ? (

          <div>

            <h1 className="text-xl font-bold">
              PharmaGuard AI
            </h1>

            <p className="text-xs text-slate-400 mt-1">
              Pharmaceutical Safety
            </p>

          </div>

        ) : (

          <ShieldCheck
            size={30}
            className="text-teal-400"
          />

        )}

      </div>

      <nav className="flex-1 px-3 py-6 space-y-2">

        {items.map((item) => {

          const active =
            location.pathname ===
            item.path;

          return (

            <Link
              key={item.path}
              to={item.path}
              title={!open ? item.label : ''}
              className={`
                flex
                items-center
                gap-4
                rounded-xl
                px-4
                py-3
                transition-all
                duration-200
                ${
                  active
                    ? 'bg-teal-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }
              `}
            >

              {item.icon}

              {open && (

                <span className="font-medium">
                  {item.label}
                </span>

              )}

            </Link>

          );

        })}

      </nav>

      <div className="border-t border-slate-800 p-4">

        {open && (

          <div className="text-center text-xs text-slate-500">

            PharmaGuard AI

            <br />

            Version 1.0.0

          </div>

        )}

      </div>

    </aside>
  );

}