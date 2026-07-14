import {
  Badge,
  Button,
  Card,
  CardContent,
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
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@479property/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { type UseMutationResult } from '@tanstack/react-query';
import { Pencil, Plus, Tag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { ConfirmDialog } from '../shared/ConfirmDialog';

interface BaseConfigEntity {
  id: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  color?: string | null;
  icon?: string | null;
  description?: string | null;
}

interface BaseConfigInput {
  name: string;
  displayOrder?: number;
  isActive?: boolean;
  color?: string;
  icon?: string;
  description?: string;
}

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(80),
  color: z.string().optional().or(z.literal('')),
  icon: z.string().max(60).optional().or(z.literal('')),
  displayOrder: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export interface ConfigManagerCardProps<
  TEntity extends BaseConfigEntity,
  TInput extends BaseConfigInput,
> {
  title: string;
  description: string;
  items: TEntity[] | undefined;
  isLoading: boolean;
  hasColor?: boolean;
  hasIcon?: boolean;
  createMutation: UseMutationResult<TEntity, unknown, TInput>;
  updateMutation: UseMutationResult<TEntity, unknown, { id: string; input: Partial<TInput> }>;
  removeMutation: UseMutationResult<void, unknown, string>;
}

export function ConfigManagerCard<
  TEntity extends BaseConfigEntity,
  TInput extends BaseConfigInput,
>({
  title,
  description,
  items,
  isLoading,
  hasColor,
  hasIcon,
  createMutation,
  updateMutation,
  removeMutation,
}: ConfigManagerCardProps<TEntity, TInput>) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TEntity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TEntity | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', color: '', icon: '', displayOrder: 0, isActive: true },
  });

  function openCreate() {
    setEditing(null);
    form.reset({ name: '', color: '', icon: '', displayOrder: items?.length ?? 0, isActive: true });
    setDialogOpen(true);
  }

  function openEdit(item: TEntity) {
    setEditing(item);
    form.reset({
      name: item.name,
      color: item.color ?? '',
      icon: item.icon ?? '',
      displayOrder: item.displayOrder,
      isActive: item.isActive,
    });
    setDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    const input = {
      name: values.name,
      displayOrder: values.displayOrder,
      isActive: values.isActive,
      ...(hasColor ? { color: values.color || undefined } : {}),
      ...(hasIcon ? { icon: values.icon || undefined } : {}),
    } as TInput;

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, input });
        toast.success(`${title.slice(0, -1)} updated`);
      } else {
        await createMutation.mutateAsync(input);
        toast.success(`${title.slice(0, -1)} created`);
      }
      setDialogOpen(false);
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await removeMutation.mutateAsync(deleteTarget.id);
      toast.success(`${title.slice(0, -1)} deleted`);
      setDeleteTarget(null);
    } catch {
      toast.error('Could not delete — it may still be in use.');
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openCreate}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editing ? `Edit ${title.slice(0, -1)}` : `New ${title.slice(0, -1)}`}
                </DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" {...form.register('name')} />
                  {form.formState.errors.name ? (
                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                  ) : null}
                </div>
                {hasColor ? (
                  <div className="space-y-2">
                    <Label htmlFor="color">Color (hex)</Label>
                    <Input id="color" placeholder="#2563eb" {...form.register('color')} />
                  </div>
                ) : null}
                {hasIcon ? (
                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon name</Label>
                    <Input id="icon" placeholder="home" {...form.register('icon')} />
                  </div>
                ) : null}
                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Display order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    min={0}
                    {...form.register('displayOrder')}
                  />
                </div>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Active
                  </Label>
                  <Switch
                    id="isActive"
                    checked={form.watch('isActive')}
                    onCheckedChange={(checked) => form.setValue('isActive', checked)}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving…' : editing ? 'Save changes' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !items || items.length === 0 ? (
          <EmptyState
            icon={Tag}
            title="Nothing here yet"
            description={`Add your first ${title.slice(0, -1).toLowerCase()}.`}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...items]
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {hasColor && item.color ? (
                          <span
                            className="h-3 w-3 shrink-0 rounded-full border"
                            style={{ backgroundColor: item.color }}
                          />
                        ) : null}
                        {item.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.isActive ? 'success' : 'secondary'}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(item)}
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(item)}
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
      </CardContent>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This can't be undone. Existing records that reference it will be unaffected, but it will no longer be selectable."
        destructive
        loading={removeMutation.isPending}
        onConfirm={confirmDelete}
      />
    </Card>
  );
}
