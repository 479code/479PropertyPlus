import { Skeleton } from '@479property/ui';
import { type AxiosError } from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { PageHeader } from '../../components/layout/PageHeader';
import { usePerson, useUpdatePerson } from '../../features/crm/use-people';

import { PersonForm } from './PersonForm';

export function EditPersonPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: person, isLoading } = usePerson(id);
  const updatePerson = useUpdatePerson(id as string);

  return (
    <div>
      <PageHeader
        title="Edit person"
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'People', to: '/people' },
          { label: person?.fullName ?? '…', to: `/people/${id}` },
          { label: 'Edit' },
        ]}
      />
      {isLoading || !person ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <PersonForm
          submitLabel="Save changes"
          isSubmitting={updatePerson.isPending}
          defaultValues={{
            firstName: person.firstName,
            middleName: person.middleName ?? '',
            lastName: person.lastName,
            gender: person.gender ?? '',
            dateOfBirth: person.dateOfBirth ? person.dateOfBirth.slice(0, 10) : '',
            maritalStatus: person.maritalStatus ?? '',
            nationality: person.nationality ?? '',
            occupation: person.occupation ?? '',
            email: person.email ?? '',
            phone: person.phone ?? '',
            alternatePhone: person.alternatePhone ?? '',
            address: person.address ?? '',
            city: person.city ?? '',
            state: person.state ?? '',
            country: person.country ?? '',
            postalCode: person.postalCode ?? '',
            identificationType: person.identificationType ?? '',
            identificationNumber: person.identificationNumber ?? '',
            identificationExpiry: person.identificationExpiry
              ? person.identificationExpiry.slice(0, 10)
              : '',
            taxIdentificationNumber: person.taxIdentificationNumber ?? '',
            notes: person.notes ?? '',
            roleIds: person.roles.map((r) => r.personTypeId),
          }}
          onSubmit={async (input) => {
            try {
              await updatePerson.mutateAsync(input);
              toast.success('Person updated');
              navigate(`/people/${id}`);
            } catch (error) {
              const status = (error as AxiosError)?.response?.status;
              toast.error(
                status === 409 ? 'That person code is already in use' : 'Could not save changes',
              );
            }
          }}
        />
      )}
    </div>
  );
}
