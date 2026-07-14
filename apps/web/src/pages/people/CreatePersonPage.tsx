import { type AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { PageHeader } from '../../components/layout/PageHeader';
import { useCreatePerson } from '../../features/crm/use-people';

import { PersonForm } from './PersonForm';

export function CreatePersonPage() {
  const navigate = useNavigate();
  const createPerson = useCreatePerson();

  return (
    <div>
      <PageHeader
        title="New person"
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'People', to: '/people' },
          { label: 'New' },
        ]}
      />
      <PersonForm
        submitLabel="Create person"
        isSubmitting={createPerson.isPending}
        onSubmit={async (input) => {
          try {
            const person = await createPerson.mutateAsync(input);
            toast.success('Person created');
            navigate(`/people/${person.id}`);
          } catch (error) {
            const status = (error as AxiosError)?.response?.status;
            toast.error(
              status === 409 ? 'That person code is already in use' : 'Could not create the person',
            );
          }
        }}
      />
    </div>
  );
}
