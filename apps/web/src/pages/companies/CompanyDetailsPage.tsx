import { Button, Skeleton } from '@479property/ui';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { PageHeader } from '../../components/layout/PageHeader';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { useCompany, useDeleteCompany, useUpdateCompany } from '../../features/crm/use-companies';

import { CompanyForm } from './CompanyForm';

export function CompanyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: company, isLoading } = useCompany(id);
  const updateCompany = useUpdateCompany(id as string);
  const deleteCompany = useDeleteCompany();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div>
      <PageHeader
        title={company?.companyName ?? 'Company'}
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Companies', to: '/companies' },
          { label: company?.companyName ?? '…' },
        ]}
        actions={
          <Button variant="outline" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="mr-1.5 h-4 w-4" />
            Delete
          </Button>
        }
      />

      {isLoading || !company ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <CompanyForm
          submitLabel="Save changes"
          isSubmitting={updateCompany.isPending}
          defaultValues={{
            companyName: company.companyName,
            registrationNumber: company.registrationNumber ?? '',
            taxNumber: company.taxNumber ?? '',
            email: company.email ?? '',
            phone: company.phone ?? '',
            website: company.website ?? '',
            address: company.address ?? '',
            contactPersonId: company.contactPersonId ?? undefined,
            notes: company.notes ?? '',
          }}
          onSubmit={async (input) => {
            try {
              await updateCompany.mutateAsync(input);
              toast.success('Company updated');
            } catch {
              toast.error('Could not save changes');
            }
          }}
        />
      )}

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete "${company?.companyName}"?`}
        description="This can't be undone."
        destructive
        loading={deleteCompany.isPending}
        onConfirm={async () => {
          if (!id) return;
          try {
            await deleteCompany.mutateAsync(id);
            toast.success('Company deleted');
            navigate('/companies');
          } catch {
            toast.error('Could not delete company');
          }
        }}
      />
    </div>
  );
}
