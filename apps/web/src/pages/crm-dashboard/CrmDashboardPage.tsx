import { Skeleton, StatCard } from '@479property/ui';
import {
  AlertTriangle,
  Briefcase,
  Building,
  Home,
  UserCheck,
  UserPlus,
  Users,
  UserX,
} from 'lucide-react';

import { PageHeader } from '../../components/layout/PageHeader';
import { useCrmDashboard } from '../../features/crm/use-crm-support';

export function CrmDashboardPage() {
  const { data: summary, isLoading } = useCrmDashboard();

  return (
    <div>
      <PageHeader
        title="CRM Dashboard"
        description="An overview of tenants, owners, agents, and contacts."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'CRM Dashboard' }]}
      />

      {isLoading || !summary ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total tenants" value={summary.totalTenants} icon={Users} />
          <StatCard label="Corporate tenants" value={summary.corporateTenants} icon={Building} />
          <StatCard label="Individual tenants" value={summary.individualTenants} icon={UserCheck} />
          <StatCard label="Owners" value={summary.owners} icon={Home} />
          <StatCard label="Agents" value={summary.agents} icon={Briefcase} />
          <StatCard label="Inactive contacts" value={summary.inactiveContacts} icon={UserX} />
          <StatCard
            label="Recent registrations"
            value={summary.recentRegistrations}
            icon={UserPlus}
          />
          <StatCard
            label="Upcoming ID expiry"
            value={summary.upcomingIdExpiry}
            icon={AlertTriangle}
          />
        </div>
      )}
    </div>
  );
}
