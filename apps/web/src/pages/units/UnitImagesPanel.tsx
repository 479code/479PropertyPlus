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
} from '@479property/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImageIcon, Plus, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { type UnitImage } from '../../features/inventory/types';
import {
  useAddUnitImage,
  useRemoveUnitImage,
  useUnitImages,
} from '../../features/inventory/use-unit-media';

const schema = z.object({
  url: z.string().url('Enter a valid URL'),
  caption: z.string().max(300).optional().or(z.literal('')),
  isPrimary: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export function UnitImagesPanel({ unitId }: { unitId: string }) {
  const { data: images, isLoading } = useUnitImages(unitId);
  const addImage = useAddUnitImage(unitId);
  const removeImage = useRemoveUnitImage(unitId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UnitImage | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { url: '', caption: '', isPrimary: false },
  });

  async function submit(values: FormValues) {
    try {
      await addImage.mutateAsync({
        url: values.url,
        caption: values.caption || undefined,
        isPrimary: values.isPrimary,
      });
      toast.success('Image added');
      form.reset({ url: '', caption: '', isPrimary: false });
      setDialogOpen(false);
    } catch {
      toast.error('Could not add image');
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Image metadata only — no file uploads yet.</p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Add image
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add image</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={form.handleSubmit(submit)} noValidate>
              <div className="space-y-2">
                <Label htmlFor="url">Image URL</Label>
                <Input
                  id="url"
                  placeholder="https://cdn.example.com/photo.jpg"
                  {...form.register('url')}
                />
                {form.formState.errors.url ? (
                  <p className="text-sm text-destructive">{form.formState.errors.url.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="caption">Caption</Label>
                <Input id="caption" {...form.register('caption')} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addImage.isPending}>
                  {addImage.isPending ? 'Adding…' : 'Add'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? null : !images || images.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No images yet"
          description="Add an image URL to get started."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <div key={image.id} className="group relative overflow-hidden rounded-lg border">
              <img src={image.url} alt={image.caption ?? ''} className="h-40 w-full object-cover" />
              {image.isPrimary ? (
                <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-xs font-medium">
                  <Star className="h-3 w-3 fill-current" />
                  Primary
                </span>
              ) : null}
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 bg-background/90 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => setDeleteTarget(image)}
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              {image.caption ? (
                <p className="p-2 text-xs text-muted-foreground">{image.caption}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove this image?"
        destructive
        loading={removeImage.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await removeImage.mutateAsync(deleteTarget.id);
            toast.success('Image removed');
            setDeleteTarget(null);
          } catch {
            toast.error('Could not remove image');
          }
        }}
      />
    </div>
  );
}
