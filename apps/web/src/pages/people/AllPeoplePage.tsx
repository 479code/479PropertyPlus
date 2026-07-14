import { PeopleListPage } from './PeopleListPage';

export function AllPeoplePage() {
  return (
    <PeopleListPage
      title="People"
      description="Everyone known to your organization — tenants, owners, agents, and more."
      breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'People' }]}
    />
  );
}
