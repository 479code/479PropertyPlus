import { Badge, Button, Input } from '@479property/ui';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { FileText, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DataTable } from '../../components/data-table/DataTable';
import { PaginationBar } from '../../components/data-table/PaginationBar';
import { type Crumb } from '../../components/layout/Breadcrumbs';
import { PageHeader } from '../../components/layout/PageHeader';
import { type Lease, type LeaseStatusKey } from '../../features/lease/types';
import { useLeaseStatuses } from '../../features/lease/use-lease-config';
import { useLeases } from '../../features/lease/use-leases';

const columnHelper = createColumnHelper<Lease>();

function money(v: number | null): string {
  return v != null ? `₦${v.toLocaleString()}` : '—';
}

export interface LeasesListPageProps {
  title: string;
  description: string;
  breadcrumbs: Crumb[];
  /** When set, pre-filters to this status key and hides the create button. */
  lockedStatusKey?: LeaseStatusKey;
  /** When set, only shows leases with leaseEndDate within N days (used for the Expiring view). */
  expiringInDays?: number;
  hideCreate?: boolean;
}

export function LeasesListPage({
  title,
  description,
  breadcrumbs,
  lockedStatusKey,
  expiringInDays,
  hideCreate,
}: LeasesListPageProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const statuses = useLeaseStatuses();
  const lockedStatus = lockedStatusKey
    ? statuses.data?.find((s) => s.key === lockedStatusKey)
    : undefined;

  const { data, isLoading } = useLeases({
    q: search || undefined,
    leaseStatusId: lockedStatus?.id,
    expiringInDays,
    page,
    pageSize: 20,
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor('leaseNumber', { header: 'Lease #' }),
      columnHelper.accessor((row) => row.primaryTenant.fullName, {
        id: 'tenant',
        header: 'Tenant',
      }),
      columnHelper.accessor((row) => row.unit.name, { id: 'unit', header: 'Unit' }),
      columnHelper.accessor((row) => row.leaseStatus, {
        id: 'status',
        header: 'Status',
        cell: (info) => (
          <Badge
            style={
              info.getValue().color
                ? { backgroundColor: info.getValue().color as string, color: 'white' }
                : undefined
            }
            variant="secondary"
          >
            {info.getValue().name}
          </Badge>
        ),
      }),
      columnHelper.accessor('leaseStartDate', {
        header: 'Start',
        cell: (i: { getValue: () => string }) => new Date(i.getValue()).toLocaleDateString(),
      }),
      columnHelper.accessor('leaseEndDate', {
        header: 'End',
        cell: (i) => new Date(i.getValue()).toLocaleDateString(),
      }),
      columnHelper.accessor('monthlyRent', {
        header: 'Monthly rent',
        cell: (i) => money(i.getValue()),
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
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={
          hideCreate ? undefined : (
            <Button onClick={() => navigate('/leases/new')}>
              <Plus className="mr-1.5 h-4 w-4" />
              New lease
            </Button>
          )
        }
      />

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by lease number or tenant…"
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
        emptyIcon={FileText}
        emptyTitle="No leases found"
        emptyDescription="Try adjusting your search."
        onRowClick={(row) => navigate(`/leases/${row.id}`)}
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
