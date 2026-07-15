import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from '@479property/ui';

import { leaseTypeHooks } from '../../../../features/lease/use-lease-config';

import { type StepProps } from './SelectPropertyStep';

export function LeaseDetailsStep({ draft, setDraft }: StepProps) {
  const leaseTypes = leaseTypeHooks.useList();

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold">Lease details</h2>
      <p className="mb-4 text-sm text-muted-foreground">Dates, type, and general terms.</p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="leaseTypeId">Lease type</Label>
          <Select value={draft.leaseTypeId} onValueChange={(v) => setDraft({ leaseTypeId: v })}>
            <SelectTrigger id="leaseTypeId">
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              {leaseTypes.data?.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="leaseReference">Lease reference (optional)</Label>
          <Input
            id="leaseReference"
            value={draft.leaseReference ?? ''}
            onChange={(e) => setDraft({ leaseReference: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="leaseStartDate">Start date</Label>
          <Input
            id="leaseStartDate"
            type="date"
            value={draft.leaseStartDate}
            onChange={(e) => setDraft({ leaseStartDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="leaseEndDate">End date</Label>
          <Input
            id="leaseEndDate"
            type="date"
            value={draft.leaseEndDate}
            onChange={(e) => setDraft({ leaseEndDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="moveInDate">Move-in date</Label>
          <Input
            id="moveInDate"
            type="date"
            value={draft.moveInDate ?? ''}
            onChange={(e) => setDraft({ moveInDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="moveOutDate">Move-out date</Label>
          <Input
            id="moveOutDate"
            type="date"
            value={draft.moveOutDate ?? ''}
            onChange={(e) => setDraft({ moveOutDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="leaseDurationMonths">Duration (months)</Label>
          <Input
            id="leaseDurationMonths"
            type="number"
            min={0}
            value={draft.leaseDurationMonths ?? ''}
            onChange={(e) =>
              setDraft({ leaseDurationMonths: e.target.value ? Number(e.target.value) : undefined })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="renewalNoticeDays">Renewal notice (days)</Label>
          <Input
            id="renewalNoticeDays"
            type="number"
            min={0}
            value={draft.renewalNoticeDays ?? ''}
            onChange={(e) =>
              setDraft({ renewalNoticeDays: e.target.value ? Number(e.target.value) : undefined })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gracePeriodDays">Grace period (days)</Label>
          <Input
            id="gracePeriodDays"
            type="number"
            min={0}
            value={draft.gracePeriodDays ?? ''}
            onChange={(e) =>
              setDraft({ gracePeriodDays: e.target.value ? Number(e.target.value) : undefined })
            }
          />
        </div>
        <div className="flex items-center justify-between rounded-md border p-3">
          <Label htmlFor="autoRenew" className="cursor-pointer">
            Auto-renew
          </Label>
          <Switch
            id="autoRenew"
            checked={draft.autoRenew}
            onCheckedChange={(v) => setDraft({ autoRenew: v })}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            rows={3}
            value={draft.notes ?? ''}
            onChange={(e) => setDraft({ notes: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
