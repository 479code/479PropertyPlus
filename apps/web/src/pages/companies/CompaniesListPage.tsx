import { Input, Button } from '@479property/ui';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Building, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DataTable } from '../../components/data-table/DataTable';
import { PaginationBar } from '../../components/data-table/PaginationBar';
import { PageHeader } from '../../components/layout/PageHeader';
import { type Company } from '../../features/crm/types';
import { useCompanies } from '../../features/crm/use-companies';

const columnHelper = createColumnHelper<Company>();

export function CompaniesListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { data, isLoading } = useCompanies({ name: search || undefined, page, pageSize: 20 });

  const columns = useMemo(
    () => [
      columnHelper.accessor('companyName', { header: 'Name' }),
      columnHelper.accessor('registrationNumber', {
        header: 'Registration #',
        cell: (i) => i.getValue() ?? '—',
      }),
      columnHelper.accessor('email', { header: 'Email', cell: (i) => i.getValue() ?? '—' }),
      columnHelper.accessor('phone', { header: 'Phone', cell: (i) => i.getValue() ?? '—' }),
      columnHelper.accessor((row) => row.contactPerson?.fullName, {
        id: 'contact',
        header: 'Primary contact',
        cell: (i) => i.getValue() ?? '—',
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <PageHeader
        title="Companies"
        description="Corporate tenants, owners, and other organizations."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Companies' }]}
        actions={
          <Button onClick={() => navigate('/companies/new')}>
            <Plus className="mr-1.5 h-4 w-4" />
            New company
          </Button>
        }
      />

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name…"
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <DataTable
        table={table}
        isLoading={isLoading}
        columnCount={columns.length}
        emptyIcon={Building}
        emptyTitle="No companies yet"
        emptyDescription="Create your first company record."
        onRowClick={(row) => navigate(`/companies/${row.id}`)}
      />

      {data ? (
        <PaginationBar
          page={data.page}
          pageCount={data.pageCount}
          total={data.total}
          pageSize={data.pageSize}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
}
