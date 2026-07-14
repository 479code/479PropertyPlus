import { type AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { PageHeader } from '../../components/layout/PageHeader';
import { useCreateBuilding } from '../../features/inventory/use-buildings';

import { BuildingForm } from './BuildingForm';

export function CreateBuildingPage() {
  const navigate = useNavigate();
  const createBuilding = useCreateBuilding();

  return (
    <div>
      <PageHeader
        title="New building"
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Buildings', to: '/buildings' },
          { label: 'New' },
        ]}
      />
      <BuildingForm
        submitLabel="Create building"
        isSubmitting={createBuilding.isPending}
        onSubmit={async (input) => {
          try {
            const building = await createBuilding.mutateAsync(input);
            toast.success('Building created');
            navigate(`/buildings/${building.id}`);
          } catch (error) {
            const status = (error as AxiosError)?.response?.status;
            toast.error(
              status === 409
                ? 'That building code is already in use'
                : 'Could not create the building',
            );
          }
        }}
      />
    </div>
  );
}
