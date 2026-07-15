import { LeasesListPage } from './LeasesListPage';

export function LeaseRenewalsPage() {
  return (
    <LeasesListPage
      title="Lease Renewals"
      description="Leases currently pending renewal."
      breadcrumbs={[
        { label: 'Dashboard', to: '/' },
        { label: 'Leases', to: '/leases' },
        { label: 'Renewals' },
      ]}
      lockedStatusKey="RENEWAL_PENDING"
      hideCreate
    />
  );
}
