import { cn } from '@479property/ui';
import {
  Briefcase,
  Building,
  Building2,
  Calendar,
  ChevronDown,
  DoorOpen,
  FileText,
  Home,
  IdCard,
  Layers,
  LayoutDashboard,
  RefreshCw,
  Settings,
  ShieldX,
  Tags,
  UserCheck,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
  end?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const TOP_LEVEL: NavItem = { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true };

const GROUPS: NavGroup[] = [
  {
    label: 'Property',
    items: [
      { to: '/properties', label: 'Properties', icon: Home },
      { to: '/buildings', label: 'Buildings', icon: Building2 },
      { to: '/units', label: 'Units', icon: DoorOpen },
      { to: '/inventory-config', label: 'Inventory Setup', icon: Tags },
    ],
  },
  {
    label: 'People & CRM',
    items: [
      { to: '/people', label: 'People', icon: Users },
      { to: '/tenants', label: 'Tenants', icon: IdCard },
      { to: '/owners', label: 'Owners', icon: Home },
      { to: '/agents', label: 'Agents', icon: UserCheck },
      { to: '/companies', label: 'Companies', icon: Building },
      { to: '/crm-dashboard', label: 'CRM Dashboard', icon: Briefcase },
      { to: '/crm-config', label: 'CRM Setup', icon: Tags },
    ],
  },
  {
    label: 'Leases',
    items: [
      { to: '/leases', label: 'Leases', icon: FileText },
      { to: '/leases/approvals', label: 'Lease Approvals', icon: FileText },
      { to: '/leases/renewals', label: 'Lease Renewals', icon: RefreshCw },
      { to: '/leases/expiring', label: 'Expiring Leases', icon: Calendar },
      { to: '/leases/terminated', label: 'Terminations', icon: ShieldX },
      { to: '/lease-dashboard', label: 'Lease Dashboard', icon: LayoutDashboard },
      { to: '/occupancy-dashboard', label: 'Occupancy Dashboard', icon: DoorOpen },
      { to: '/lease-config', label: 'Lease Setup', icon: Tags },
    ],
  },
];

const BOTTOM: NavItem = { to: '/settings', label: 'Settings', icon: Settings };

function isGroupActive(group: NavGroup, pathname: string): boolean {
  return group.items.some((item) =>
    item.end ? pathname === item.to : pathname.startsWith(item.to),
  );
}

function NavLinkItem({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        )
      }
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {item.label}
    </NavLink>
  );
}

export function Sidebar() {
  const { pathname } = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(GROUPS.map((g) => [g.label, isGroupActive(g, pathname)])),
  );

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      for (const group of GROUPS) {
        if (isGroupActive(group, pathname)) next[group.label] = true;
      }
      return next;
    });
  }, [pathname]);

  function toggleGroup(label: string) {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-background md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Layers className="h-4 w-4" />
        </div>
        <span className="text-base font-semibold tracking-tight">479Property+</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <NavLinkItem item={TOP_LEVEL} />

        {GROUPS.map((group) => {
          const open = openGroups[group.label];
          const active = isGroupActive(group, pathname);
          return (
            <div key={group.label} className="pt-2">
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                className={cn(
                  'flex w-full items-center justify-between rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors',
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {group.label}
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 transition-transform',
                    open ? 'rotate-0' : '-rotate-90',
                  )}
                />
              </button>
              {open ? (
                <div className="mt-1 space-y-1">
                  {group.items.map((item) => (
                    <NavLinkItem key={item.to} item={item} />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}

        <div className="pt-2">
          <NavLinkItem item={BOTTOM} />
        </div>
      </nav>
    </aside>
  );
}
