import {
  Badge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@479property/ui';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { DoorOpen, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DataTable } from '../../components/data-table/DataTable';
import { PaginationBar } from '../../components/data-table/PaginationBar';
import { PageHeader } from '../../components/layout/PageHeader';
import { type Unit, type UnitAvailability } from '../../features/inventory/types';
import { useUnits } from '../../features/inventory/use-units';

const columnHelper = createColumnHelper<Unit>();

const AVAILABILITY_OPTIONS: UnitAvailability[] = [
  'AVAILABLE',
  'OCCUPIED',
  'RESERVED',
  'UNDER_MAINTENANCE',
  'BLOCKED',
  'INACTIVE',
  'ARCHIVED',
];

function availabilityVariant(
  a: UnitAvailability,
): 'success' | 'secondary' | 'warning' | 'destructive' {
  if (a === 'AVAILABLE') return 'success';
  if (a === 'OCCUPIED') return 'secondary';
  if (a === 'RESERVED' || a === 'UNDER_MAINTENANCE') return 'warning';
  return 'destructive';
}

export function UnitsListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [availability, setAvailability] = useState<UnitAvailability | undefined>(undefined);
  const navigate = useNavigate();

  const { data, isLoading } = useUnits({
    q: search || undefined,
    availability,
    page,
    pageSize: 20,
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor('unitCode', { header: 'Code' }),
      columnHelper.accessor('name', { header: 'Name' }),
      columnHelper.accessor((row) => row.building?.name, { id: 'building', header: 'Building' }),
      columnHelper.accessor((row) => row.unitType.name, { id: 'type', header: 'Type' }),
      columnHelper.accessor('availability', {
        header: 'Availability',
        cell: (info) => (
          <Badge variant={availabilityVariant(info.getValue())}>{info.getValue()}</Badge>
        ),
      }),
      columnHelper.accessor('monthlyRent', {
        header: 'Monthly rent',
        cell: (info) => (info.getValue() != null ? `₦${info.getValue()!.toLocaleString()}` : '—'),
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
        title="Units"
        description="Search and manage every unit across your properties."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Units' }]}
        actions={
          <Button onClick={() => navigate('/units/new')}>
            <Plus className="mr-1.5 h-4 w-4" />
            New unit
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by code, name, or description…"
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={availability ?? 'ALL'}
          onValueChange={(v) => {
            setAvailability(v === 'ALL' ? undefined : (v as UnitAvailability));
            setPage(1);
          }}
        >
          <SelectTrigger className="sm:w-56">
            <SelectValue placeholder="All availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All availability</SelectItem>
            {AVAILABILITY_OPTIONS.map((a) => (
              <SelectItem key={a} value={a}>
                {a.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        table={table}
        isLoading={isLoading}
        columnCount={columns.length}
        emptyIcon={DoorOpen}
        emptyTitle="No units found"
        emptyDescription="Try adjusting your search or filters."
        onRowClick={(row) => navigate(`/units/${row.id}`)}
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
