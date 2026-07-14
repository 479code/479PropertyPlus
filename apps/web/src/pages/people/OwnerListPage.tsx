import { PeopleListPage } from './PeopleListPage';

export function OwnerListPage() {
  return (
    <PeopleListPage
      title="Owners"
      description="Everyone currently holding the Owner role."
      breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Owners' }]}
      lockedRoleName="Owner"
    />
  );
}
