import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  EmptyState,
  Input,
  Label,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from '@479property/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { Layers, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { type Floor } from '../../features/inventory/types';
import {
  useCreateFloor,
  useDeleteFloor,
  useFloors,
  useUpdateFloor,
} from '../../features/inventory/use-buildings';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  floorNumber: z.coerce.number().int().optional().or(z.literal('')),
  description: z.string().max(500).optional().or(z.literal('')),
  sortOrder: z.coerce.number().int().min(0).optional().or(z.literal('')),
});
type FormValues = z.infer<typeof schema>;

export function FloorsPanel({ buildingId }: { buildingId: string }) {
  const { data: floors, isLoading } = useFloors(buildingId);
  const deleteFloor = useDeleteFloor(buildingId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Floor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Floor | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', floorNumber: '', description: '', sortOrder: 0 },
  });

  function openCreate() {
    setEditing(null);
    form.reset({ name: '', floorNumber: '', description: '', sortOrder: floors?.length ?? 0 });
    setDialogOpen(true);
  }

  function openEdit(floor: Floor) {
    setEditing(floor);
    form.reset({
      name: floor.name,
      floorNumber: floor.floorNumber ?? '',
      description: floor.description ?? '',
      sortOrder: floor.sortOrder,
    });
    setDialogOpen(true);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Floors</h3>
          <p className="text-sm text-muted-foreground">
            Optional — some buildings don&apos;t have distinct floors.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add floor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit floor' : 'New floor'}</DialogTitle>
            </DialogHeader>
            <FloorFormFields
              form={form}
              editing={editing}
              buildingId={buildingId}
              onDone={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : !floors || floors.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No floors added"
          description="Add floors like Ground Floor, Mezzanine, or Penthouse."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Floor #</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...floors]
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((floor) => (
                <TableRow key={floor.id}>
                  <TableCell className="font-medium">{floor.name}</TableCell>
                  <TableCell>{floor.floorNumber ?? '—'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(floor)}
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(floor)}
                      aria-label="Delete"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="Units on this floor will be unassigned from it, not deleted."
        destructive
        loading={deleteFloor.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await deleteFloor.mutateAsync(deleteTarget.id);
            toast.success('Floor deleted');
            setDeleteTarget(null);
          } catch {
            toast.error('Could not delete floor');
          }
        }}
      />
    </div>
  );
}

function FloorFormFields({
  form,
  editing,
  buildingId,
  onDone,
}: {
  form: ReturnType<typeof useForm<FormValues>>;
  editing: Floor | null;
  buildingId: string;
  onDone: () => void;
}) {
  const createFloor = useCreateFloor(buildingId);
  const updateFloor = useUpdateFloor(buildingId, editing?.id ?? '');

  async function submit(values: FormValues) {
    const input = {
      name: values.name,
      floorNumber: values.floorNumber === '' ? undefined : Number(values.floorNumber),
      description: values.description || undefined,
      sortOrder: values.sortOrder === '' ? undefined : Number(values.sortOrder),
    };
    try {
      if (editing) {
        await updateFloor.mutateAsync(input);
        toast.success('Floor updated');
      } else {
        await createFloor.mutateAsync(input);
        toast.success('Floor created');
      }
      onDone();
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  }

  const isSaving = createFloor.isPending || updateFloor.isPending;

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(submit)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="floor-name">Name</Label>
        <Input id="floor-name" placeholder="Ground Floor" {...form.register('name')} />
        {form.formState.errors.name ? (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="floor-number">Floor number</Label>
        <Input id="floor-number" type="number" {...form.register('floorNumber')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="floor-description">Description</Label>
        <Textarea id="floor-description" rows={3} {...form.register('description')} />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving…' : editing ? 'Save changes' : 'Create'}
        </Button>
      </DialogFooter>
    </form>
  );
}
