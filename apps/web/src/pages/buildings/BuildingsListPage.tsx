import { Badge, Button } from '@479property/ui';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Building2, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DataTable } from '../../components/data-table/DataTable';
import { PaginationBar } from '../../components/data-table/PaginationBar';
import { PageHeader } from '../../components/layout/PageHeader';
import { type Building } from '../../features/inventory/types';
import { useBuildings } from '../../features/inventory/use-buildings';

const columnHelper = createColumnHelper<Building>();

export function BuildingsListPage() {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { data, isLoading } = useBuildings({ page, pageSize: 20 });

  const columns = useMemo(
    () => [
      columnHelper.accessor('buildingCode', { header: 'Code' }),
      columnHelper.accessor('name', { header: 'Name' }),
      columnHelper.accessor((row) => row.property.name, {
        id: 'property',
        header: 'Property',
      }),
      columnHelper.accessor((row) => row.status?.name, {
        id: 'status',
        header: 'Status',
        cell: (info) =>
          info.getValue() ? (
            <Badge variant="secondary">{info.getValue()}</Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      }),
      columnHelper.accessor('totalUnits', { header: 'Units' }),
      columnHelper.accessor('occupiedUnits', { header: 'Occupied' }),
      columnHelper.accessor('vacantUnits', { header: 'Vacant' }),
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
        title="Buildings"
        description="All buildings across your properties."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Buildings' }]}
        actions={
          <Button onClick={() => navigate('/buildings/new')}>
            <Plus className="mr-1.5 h-4 w-4" />
            New building
          </Button>
        }
      />

      <DataTable
        table={table}
        isLoading={isLoading}
        columnCount={columns.length}
        emptyIcon={Building2}
        emptyTitle="No buildings yet"
        emptyDescription="Create your first building to start tracking floors and units."
        onRowClick={(row) => navigate(`/buildings/${row.id}`)}
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
