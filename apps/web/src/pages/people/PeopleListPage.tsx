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
import { Plus, Search, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DataTable } from '../../components/data-table/DataTable';
import { PaginationBar } from '../../components/data-table/PaginationBar';
import { type Crumb } from '../../components/layout/Breadcrumbs';
import { PageHeader } from '../../components/layout/PageHeader';
import { type Person } from '../../features/crm/types';
import { personTypeHooks } from '../../features/crm/use-crm-config';
import { usePeople } from '../../features/crm/use-people';

const columnHelper = createColumnHelper<Person>();

export interface PeopleListPageProps {
  title: string;
  description: string;
  breadcrumbs: Crumb[];
  /** When set, this role name pre-filters the list and hides the role filter dropdown. */
  lockedRoleName?: string;
}

export function PeopleListPage({
  title,
  description,
  breadcrumbs,
  lockedRoleName,
}: PeopleListPageProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [personTypeId, setPersonTypeId] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  const personTypes = personTypeHooks.useList();
  const lockedRole = lockedRoleName
    ? personTypes.data?.find((t) => t.name === lockedRoleName)
    : undefined;
  const effectiveRoleId = lockedRoleName ? lockedRole?.id : personTypeId;

  const { data, isLoading } = usePeople({
    q: search || undefined,
    personTypeId: effectiveRoleId,
    page,
    pageSize: 20,
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor('personCode', { header: 'Code' }),
      columnHelper.accessor('fullName', { header: 'Name' }),
      columnHelper.accessor((row) => row.roles.map((r) => r.personType.name).join(', '), {
        id: 'roles',
        header: 'Roles',
        cell: (info) =>
          info.getValue() ? (
            <div className="flex flex-wrap gap-1">
              {info.row.original.roles.map((r) => (
                <Badge key={r.id} variant="secondary">
                  {r.personType.name}
                </Badge>
              ))}
            </div>
          ) : (
            '—'
          ),
      }),
      columnHelper.accessor('email', { header: 'Email', cell: (info) => info.getValue() ?? '—' }),
      columnHelper.accessor('phone', { header: 'Phone', cell: (info) => info.getValue() ?? '—' }),
      columnHelper.accessor('isActive', {
        header: 'Status',
        cell: (info) => (
          <Badge variant={info.getValue() ? 'success' : 'secondary'}>
            {info.getValue() ? 'Active' : 'Inactive'}
          </Badge>
        ),
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
          <Button onClick={() => navigate('/people/new')}>
            <Plus className="mr-1.5 h-4 w-4" />
            New person
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by code, name, email, or phone…"
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        {lockedRoleName ? null : (
          <Select
            value={personTypeId ?? 'ALL'}
            onValueChange={(v) => {
              setPersonTypeId(v === 'ALL' ? undefined : v);
              setPage(1);
            }}
          >
            <SelectTrigger className="sm:w-56">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All roles</SelectItem>
              {personTypes.data?.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <DataTable
        table={table}
        isLoading={isLoading}
        columnCount={columns.length}
        emptyIcon={Users}
        emptyTitle="No people found"
        emptyDescription="Try adjusting your search or filters."
        onRowClick={(row) => navigate(`/people/${row.id}`)}
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
