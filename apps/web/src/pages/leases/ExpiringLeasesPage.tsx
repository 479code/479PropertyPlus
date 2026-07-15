import { LeasesListPage } from './LeasesListPage';

export function ExpiringLeasesPage() {
  return (
    <LeasesListPage
      title="Expiring Leases"
      description="Active or renewal-pending leases ending within the next 30 days."
      breadcrumbs={[
        { label: 'Dashboard', to: '/' },
        { label: 'Leases', to: '/leases' },
        { label: 'Expiring' },
      ]}
      expiringInDays={30}
      hideCreate
    />
  );
}
