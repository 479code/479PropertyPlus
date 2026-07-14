import { type AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { PageHeader } from '../../components/layout/PageHeader';
import { useCreateUnit } from '../../features/inventory/use-units';

import { UnitForm } from './UnitForm';

export function CreateUnitPage() {
  const navigate = useNavigate();
  const createUnit = useCreateUnit();

  return (
    <div>
      <PageHeader
        title="New unit"
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Units', to: '/units' },
          { label: 'New' },
        ]}
      />
      <UnitForm
        submitLabel="Create unit"
        isSubmitting={createUnit.isPending}
        onSubmit={async (input) => {
          try {
            const unit = await createUnit.mutateAsync(input);
            toast.success('Unit created');
            navigate(`/units/${unit.id}`);
          } catch (error) {
            const status = (error as AxiosError)?.response?.status;
            toast.error(
              status === 409
                ? 'That unit code or slug is already in use'
                : 'Could not create the unit',
            );
          }
        }}
      />
    </div>
  );
}
