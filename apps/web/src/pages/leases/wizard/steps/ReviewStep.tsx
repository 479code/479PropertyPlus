import { Badge, Card, CardContent } from '@479property/ui';

import { type StepProps } from './SelectPropertyStep';

function Row({ label, value }: { label: string; value: string | number | undefined | null }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex justify-between border-b py-2 text-sm last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export function ReviewStep({ draft }: StepProps) {
  return (
    <div className="space-y-4">
      <h2 className="mb-1 text-lg font-semibold">Review</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Check everything before creating the lease.
      </p>

      <Card>
        <CardContent className="p-4">
          <h3 className="mb-2 text-sm font-semibold">Location</h3>
          <Row label="Property" value={draft.propertyName} />
          <Row label="Building" value={draft.buildingName ?? 'None'} />
          <Row label="Unit" value={draft.unitName} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="mb-2 text-sm font-semibold">Tenants &amp; Guarantors</h3>
          <Row label="Primary tenant" value={draft.primaryTenantName} />
          {draft.additionalTenants.map((t, i) => (
            <Row
              key={i}
              label={`Tenant ${i + 2}`}
              value={`${t.personName} (${t.role.replace(/_/g, ' ')})`}
            />
          ))}
          {draft.guarantors.length === 0 ? (
            <p className="pt-2 text-sm text-muted-foreground">No guarantors</p>
          ) : (
            draft.guarantors.map((g, i) => (
              <Row key={i} label={`Guarantor ${i + 1}`} value={g.personName} />
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="mb-2 text-sm font-semibold">Lease details</h3>
          <Row label="Start date" value={draft.leaseStartDate} />
          <Row label="End date" value={draft.leaseEndDate} />
          <Row label="Move-in" value={draft.moveInDate} />
          <Row label="Move-out" value={draft.moveOutDate} />
          <Row label="Duration (months)" value={draft.leaseDurationMonths} />
          <Row label="Auto-renew" value={draft.autoRenew ? 'Yes' : 'No'} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="mb-2 text-sm font-semibold">Financials</h3>
          <Row label="Monthly rent" value={draft.monthlyRent} />
          <Row label="Annual rent" value={draft.annualRent} />
          <Row label="Security deposit" value={draft.securityDeposit} />
          <Row label="Service charge" value={draft.serviceCharge} />
        </CardContent>
      </Card>

      {draft.documents.length > 0 ? (
        <Card>
          <CardContent className="flex flex-wrap gap-2 p-4">
            {draft.documents.map((d, i) => (
              <Badge key={i} variant="outline">
                {d.name || d.documentType}
              </Badge>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
