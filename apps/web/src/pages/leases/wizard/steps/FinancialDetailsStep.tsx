import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@479property/ui';

import { paymentFrequencyHooks } from '../../../../features/lease/use-lease-config';

import { type StepProps } from './SelectPropertyStep';

export function FinancialDetailsStep({ draft, setDraft }: StepProps) {
  const paymentFrequencies = paymentFrequencyHooks.useList();

  const numberField = (key: keyof typeof draft, label: string, id: string) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        min={0}
        step="0.01"
        value={(draft[key] as number | undefined) ?? ''}
        onChange={(e) => setDraft({ [key]: e.target.value ? Number(e.target.value) : undefined })}
      />
    </div>
  );

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold">Financial details</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Rent, deposit, charges, and payment schedule.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {numberField('monthlyRent', 'Monthly rent', 'monthlyRent')}
        {numberField('annualRent', 'Annual rent', 'annualRent')}
        {numberField('securityDeposit', 'Security deposit', 'securityDeposit')}
        {numberField('serviceCharge', 'Service charge', 'serviceCharge')}
        {numberField('utilityCharge', 'Utility charge', 'utilityCharge')}
        {numberField('parkingCharge', 'Parking charge', 'parkingCharge')}
        {numberField('discount', 'Discount', 'discount')}
        {numberField('taxAmount', 'Tax amount', 'taxAmount')}
        {numberField('totalRecurringAmount', 'Total recurring amount', 'totalRecurringAmount')}

        <div className="space-y-2">
          <Label htmlFor="paymentFrequencyId">Payment frequency</Label>
          <Select
            value={draft.paymentFrequencyId}
            onValueChange={(v) => setDraft({ paymentFrequencyId: v })}
          >
            <SelectTrigger id="paymentFrequencyId">
              <SelectValue placeholder="Select a frequency" />
            </SelectTrigger>
            <SelectContent>
              {paymentFrequencies.data?.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="billingCycle">Billing cycle</Label>
          <Input
            id="billingCycle"
            value={draft.billingCycle ?? ''}
            onChange={(e) => setDraft({ billingCycle: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
