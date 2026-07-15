import { LeasesListPage } from './LeasesListPage';

export function TerminatedLeasesPage() {
  return (
    <LeasesListPage
      title="Lease Terminations"
      description="Leases that have been terminated."
      breadcrumbs={[
        { label: 'Dashboard', to: '/' },
        { label: 'Leases', to: '/leases' },
        { label: 'Terminations' },
      ]}
      lockedStatusKey="TERMINATED"
      hideCreate
    />
  );
}
