import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@479property/ui';
import { Plus, Trash2, Users } from 'lucide-react';

import { usePeople } from '../../../../features/crm/use-people';
import { type LeaseWizardDraft, type WizardTenant } from '../wizard-types';

import { type StepProps } from './SelectPropertyStep';

const ROLE_OPTIONS: WizardTenant['role'][] = ['CO_TENANT', 'OCCUPANT', 'AUTHORIZED_REPRESENTATIVE'];

export function SelectTenantsStep({ draft, setDraft }: StepProps) {
  const people = usePeople({ pageSize: 100 });

  function addTenant() {
    const next: WizardTenant = { personId: '', personName: '', role: 'CO_TENANT' };
    setDraft({
      additionalTenants: [...draft.additionalTenants, next],
    } as Partial<LeaseWizardDraft>);
  }
  function updateTenant(index: number, patch: Partial<WizardTenant>) {
    const list = [...draft.additionalTenants];
    list[index] = { ...list[index], ...patch };
    setDraft({ additionalTenants: list });
  }
  function removeTenant(index: number) {
    setDraft({ additionalTenants: draft.additionalTenants.filter((_, i) => i !== index) });
  }

  const availablePeople = people.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-lg font-semibold">Primary tenant</h2>
        <p className="mb-3 text-sm text-muted-foreground">Who is the main tenant on this lease?</p>
        <Select
          value={draft.primaryTenantId}
          onValueChange={(v) => {
            const person = availablePeople.find((p) => p.id === v);
            setDraft({ primaryTenantId: v, primaryTenantName: person?.fullName });
          }}
        >
          <SelectTrigger className="max-w-md">
            <SelectValue placeholder="Select the primary tenant" />
          </SelectTrigger>
          <SelectContent>
            {availablePeople.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.fullName} ({p.personCode})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">Additional tenants</h3>
            <p className="text-sm text-muted-foreground">
              Co-tenants, occupants, or authorized representatives.
            </p>
          </div>
          <Button type="button" size="sm" variant="outline" onClick={addTenant}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add tenant
          </Button>
        </div>

        {draft.additionalTenants.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            No additional tenants added.
          </p>
        ) : (
          <div className="space-y-3">
            {draft.additionalTenants.map((t, i) => (
              <div key={i} className="flex flex-wrap items-center gap-3 rounded-md border p-3">
                <Select
                  value={t.personId}
                  onValueChange={(v) => {
                    const person = availablePeople.find((p) => p.id === v);
                    updateTenant(i, { personId: v, personName: person?.fullName ?? '' });
                  }}
                >
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Select a person" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePeople
                      .filter((p) => p.id !== draft.primaryTenantId)
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.fullName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Select
                  value={t.role}
                  onValueChange={(v) => updateTenant(i, { role: v as WizardTenant['role'] })}
                >
                  <SelectTrigger className="w-48">
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
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => removeTenant(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
