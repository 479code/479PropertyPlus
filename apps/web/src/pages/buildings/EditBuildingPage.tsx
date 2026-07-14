import { Skeleton } from '@479property/ui';
import { type AxiosError } from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { PageHeader } from '../../components/layout/PageHeader';
import { useBuilding, useUpdateBuilding } from '../../features/inventory/use-buildings';

import { BuildingForm } from './BuildingForm';

export function EditBuildingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: building, isLoading } = useBuilding(id);
  const updateBuilding = useUpdateBuilding(id as string);

  return (
    <div>
      <PageHeader
        title="Edit building"
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Buildings', to: '/buildings' },
          { label: building?.name ?? '…', to: `/buildings/${id}` },
          { label: 'Edit' },
        ]}
      />
      {isLoading || !building ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <BuildingForm
          submitLabel="Save changes"
          isSubmitting={updateBuilding.isPending}
          lockProperty
          defaultValues={{
            propertyId: building.propertyId,
            name: building.name,
            description: building.description ?? '',
            buildingCode: building.buildingCode,
            numberOfFloors: building.numberOfFloors ?? '',
            yearBuilt: building.yearBuilt ?? '',
            statusId: building.statusId ?? undefined,
          }}
          onSubmit={async (input) => {
            try {
              await updateBuilding.mutateAsync(input);
              toast.success('Building updated');
              navigate(`/buildings/${id}`);
            } catch (error) {
              const status = (error as AxiosError)?.response?.status;
              toast.error(
                status === 409 ? 'That building code is already in use' : 'Could not save changes',
              );
            }
          }}
        />
      )}
    </div>
  );
}
