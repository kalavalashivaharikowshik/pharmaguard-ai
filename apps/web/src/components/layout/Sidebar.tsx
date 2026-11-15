import { Link, useLocation } from 'react-router-dom';
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
  Sparkles,
  Bot,
  Factory,
  Trash2,
  Map as MapIcon,
  BarChart3,
  FileWarning,
  X,
} from 'lucide-react';

import { hasRole, role, ROLE_LABEL } from '../../auth/roles';

interface SidebarProps {
  open: boolean;
  mobileOpen: boolean;
  onClose(): void;
}

type SidebarItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
  section?: string;
};

const ALL = ['SUPER_ADMIN', 'REGULATOR', 'MANUFACTURER', 'DISTRIBUTOR', 'PHARMACY'];
const OVERSIGHT = ['SUPER_ADMIN', 'REGULATOR'];

/** Menu follows the PharmaGuard RBAC table. HOSPITAL inherits PHARMACY rows. */
const ITEMS: SidebarItem[] = [
  { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, roles: ALL, section: 'Overview' },
  { label: 'AI Insights', path: '/ai-insights', icon: <Sparkles size={20} />, roles: ALL },
  { label: 'AI Assistant', path: '/assistant', icon: <Bot size={20} />, roles: ALL },
  { label: 'Analytics', path: '/analytics', icon: <BarChart3 size={20} />, roles: OVERSIGHT },

  { label: 'Batches', path: '/batches', icon: <Package size={20} />, roles: ['SUPER_ADMIN', 'REGULATOR', 'MANUFACTURER'], section: 'Supply chain' },
  { label: 'Inventory', path: '/inventory', icon: <Boxes size={20} />, roles: ALL },
  { label: 'Transfers', path: '/transfers', icon: <ArrowLeftRight size={20} />, roles: ALL },
  { label: 'Manufacturers', path: '/manufacturers', icon: <Factory size={20} />, roles: OVERSIGHT },
  { label: 'Stock Map', path: '/map', icon: <MapIcon size={20} />, roles: ['SUPER_ADMIN', 'REGULATOR', 'MANUFACTURER'] },

  { label: 'Recalls', path: '/recalls', icon: <ShieldAlert size={20} />, roles: ALL, section: 'Safety' },
  { label: 'Revocation', path: '/revocation', icon: <ShieldCheck size={20} />, roles: ALL },
  { label: 'Disposal & Returns', path: '/disposals', icon: <Trash2 size={20} />, roles: ALL },
  { label: 'Blockchain', path: '/blockchain', icon: <Link2 size={20} />, roles: ALL },
  { label: 'Compliance', path: '/compliance', icon: <ClipboardList size={20} />, roles: OVERSIGHT },
  { label: 'Violations', path: '/violations', icon: <FileWarning size={20} />, roles: OVERSIGHT },

  { label: 'Notifications', path: '/notifications', icon: <Bell size={20} />, roles: ALL, section: 'Account' },
  { label: 'Users', path: '/users', icon: <Users size={20} />, roles: ['SUPER_ADMIN'] },
  { label: 'Registration Requests', path: '/registration', icon: <ClipboardList size={20} />, roles: OVERSIGHT },
  { label: 'Settings', path: '/settings', icon: <Settings size={20} />, roles: ALL },
];

export default function Sidebar({ open, mobileOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const items = ITEMS.filter((i) => hasRole(i.roles));
  const expanded = open || mobileOpen;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} aria-hidden="true" />}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col text-white transition-all duration-300
          bg-[#0A2540] border-r border-[#12345a]
          lg:static lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          ${expanded ? 'w-72' : 'w-20'}
        `}
        aria-label="Main navigation"
      >
        <div className="h-20 flex items-center justify-between gap-3 px-5 border-b border-[#12345a]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-[#2E8B57] flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            {expanded && (
              <div className="min-w-0">
                <h1 className="text-lg font-bold leading-tight">PharmaGuard AI</h1>
                <p className="text-xs text-[#9fb6cf]">{ROLE_LABEL[role() ?? ''] ?? 'Pharmaceutical Safety'}</p>
              </div>
            )}
          </div>
          <button onClick={onClose} className="lg:hidden rounded-lg p-1.5 text-[#9fb6cf] hover:bg-[#12345a]" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {items.map((item) => {
            const active = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
            return (
              <div key={item.path}>
                {item.section && expanded && (
                  <p className="px-4 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#6f8db0]">{item.section}</p>
                )}
                <Link
                  to={item.path}
                  onClick={onClose}
                  title={!expanded ? item.label : ''}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-4 rounded-xl px-4 py-2.5 transition-colors duration-150 ${
                    active ? 'bg-[#0F4C81] text-white shadow-sm' : 'text-[#c5d4e4] hover:bg-[#12345a] hover:text-white'
                  }`}
                >
                  {item.icon}
                  {expanded && <span className="font-medium text-[15px]">{item.label}</span>}
                </Link>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-[#12345a] p-4">
          {expanded && <div className="text-center text-xs text-[#6f8db0]">PharmaGuard AI · v1.0.0</div>}
        </div>
      </aside>
    </>
  );
}
