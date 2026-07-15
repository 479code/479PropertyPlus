import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  EmptyState,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@479property/ui';
import { Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { usePeople } from '../../features/crm/use-people';
import { type LeaseTenant, type LeaseTenantRole } from '../../features/lease/types';
import {
  useAddLeaseTenant,
  useLeaseTenants,
  useRemoveLeaseTenant,
} from '../../features/lease/use-lease-support';

const ROLE_OPTIONS: LeaseTenantRole[] = ['CO_TENANT', 'OCCUPANT', 'AUTHORIZED_REPRESENTATIVE'];

export function LeaseTenantsPanel({ leaseId }: { leaseId: string }) {
  const { data: tenants, isLoading } = useLeaseTenants(leaseId);
  const addTenant = useAddLeaseTenant(leaseId);
  const removeTenant = useRemoveLeaseTenant(leaseId);
  const people = usePeople({ pageSize: 100 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [personId, setPersonId] = useState('');
  const [role, setRole] = useState<LeaseTenantRole>('CO_TENANT');
  const [deleteTarget, setDeleteTarget] = useState<LeaseTenant | null>(null);

  async function submit() {
    if (!personId) return;
    try {
      await addTenant.mutateAsync({ personId, role });
      toast.success('Tenant added');
      setPersonId('');
      setDialogOpen(false);
    } catch {
      toast.error('Could not add tenant');
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Add tenant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add tenant</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={personId} onValueChange={setPersonId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a person" />
                </SelectTrigger>
                <SelectContent>
                  {people.data?.items.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={role} onValueChange={(v) => setRole(v as LeaseTenantRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={submit} disabled={addTenant.isPending || !personId}>
                  {addTenant.isPending ? 'Adding…' : 'Add'}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : !tenants || tenants.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No additional tenants"
          description="The primary tenant is shown on the Overview tab."
        />
      ) : (
        <div className="space-y-2">
          {tenants.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">{t.person.fullName}</p>
                <Badge variant="secondary" className="mt-1">
                  {t.role.replace(/_/g, ' ')}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteTarget(t)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove this tenant?"
        destructive
        loading={removeTenant.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await removeTenant.mutateAsync(deleteTarget.id);
            toast.success('Tenant removed');
            setDeleteTarget(null);
          } catch {
            toast.error('Could not remove tenant');
          }
        }}
      />
    </div>
  );
}
