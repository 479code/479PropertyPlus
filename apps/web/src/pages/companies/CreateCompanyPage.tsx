import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { PageHeader } from '../../components/layout/PageHeader';
import { useCreateCompany } from '../../features/crm/use-companies';

import { CompanyForm } from './CompanyForm';

export function CreateCompanyPage() {
  const navigate = useNavigate();
  const createCompany = useCreateCompany();

  return (
    <div>
      <PageHeader
        title="New company"
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Companies', to: '/companies' },
          { label: 'New' },
        ]}
      />
      <CompanyForm
        submitLabel="Create company"
        isSubmitting={createCompany.isPending}
        onSubmit={async (input) => {
          try {
            const company = await createCompany.mutateAsync(input);
            toast.success('Company created');
            navigate(`/companies/${company.id}`);
          } catch {
            toast.error('Could not create the company');
          }
        }}
      />
    </div>
  );
}
