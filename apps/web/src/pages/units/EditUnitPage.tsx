import { Skeleton } from '@479property/ui';
import { type AxiosError } from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { PageHeader } from '../../components/layout/PageHeader';
import { useUnit, useUpdateUnit } from '../../features/inventory/use-units';

import { UnitForm } from './UnitForm';

export function EditUnitPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: unit, isLoading } = useUnit(id);
  const updateUnit = useUpdateUnit(id as string);

  return (
    <div>
      <PageHeader
        title="Edit unit"
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Units', to: '/units' },
          { label: unit?.name ?? '…', to: `/units/${id}` },
          { label: 'Edit' },
        ]}
      />
      {isLoading || !unit ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <UnitForm
          submitLabel="Save changes"
          isSubmitting={updateUnit.isPending}
          lockProperty
          defaultValues={{
            propertyId: unit.propertyId,
            buildingId: unit.buildingId ?? undefined,
            floorId: unit.floorId ?? undefined,
            name: unit.name,
            description: unit.description ?? '',
            unitCode: unit.unitCode,
            unitTypeId: unit.unitTypeId,
            statusId: unit.statusId,
            isReserved: unit.isReserved,
            isBlocked: unit.isBlocked,
            isRentable: unit.isRentable,
            bedrooms: unit.bedrooms ?? '',
            bathrooms: unit.bathrooms ?? '',
            kitchens: unit.kitchens ?? '',
            parkingSpaces: unit.parkingSpaces ?? '',
            size: unit.size ?? '',
            sizeUnit: unit.sizeUnit ?? '',
            monthlyRent: unit.monthlyRent ?? '',
            annualRent: unit.annualRent ?? '',
            securityDeposit: unit.securityDeposit ?? '',
            serviceCharge: unit.serviceCharge ?? '',
            expectedAnnualRevenue: unit.expectedAnnualRevenue ?? '',
            marketValue: unit.marketValue ?? '',
            ownerType: unit.ownerType ?? undefined,
            featureIds: unit.features.map((f) => f.featureId),
          }}
          onSubmit={async (input) => {
            try {
              await updateUnit.mutateAsync(input);
              toast.success('Unit updated');
              navigate(`/units/${id}`);
            } catch (error) {
              const status = (error as AxiosError)?.response?.status;
              toast.error(
                status === 409
                  ? 'That unit code or slug is already in use'
                  : 'Could not save changes',
              );
            }
          }}
        />
      )}
    </div>
  );
}
