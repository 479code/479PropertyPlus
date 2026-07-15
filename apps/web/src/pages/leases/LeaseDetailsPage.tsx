import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@479property/ui';
import {
  ArchiveRestore,
  CheckCircle,
  Pencil,
  RefreshCw,
  Send,
  ShieldX,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { PageHeader } from '../../components/layout/PageHeader';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import {
  useActivateLease,
  useApproveLease,
  useArchiveLease,
  useCompleteRenewal,
  useInitiateRenewal,
  useLease,
  useRejectLease,
  useRejectRenewal,
  useSubmitLease,
  useTerminateLease,
} from '../../features/lease/use-leases';

import { LeaseDocumentsPanel } from './LeaseDocumentsPanel';
import { LeaseGuarantorsPanel } from './LeaseGuarantorsPanel';
import { LeaseNotesPanel } from './LeaseNotesPanel';
import { LeaseTenantsPanel } from './LeaseTenantsPanel';
import { LeaseTimelinePanel } from './LeaseTimelinePanel';

function money(v: number | null): string {
  return v != null ? `₦${v.toLocaleString()}` : '—';
}
function Detail({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value ?? '—'}</p>
    </div>
  );
}

export function LeaseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: lease, isLoading } = useLease(id);

  const submitLease = useSubmitLease();
  const approveLease = useApproveLease();
  const rejectLease = useRejectLease();
  const activateLease = useActivateLease();
  const initiateRenewal = useInitiateRenewal();
  const completeRenewal = useCompleteRenewal();
  const rejectRenewal = useRejectRenewal();
  const terminateLease = useTerminateLease();
  const archiveLease = useArchiveLease();

  const [confirmReject, setConfirmReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [confirmTerminate, setConfirmTerminate] = useState(false);
  const [terminationDate, setTerminationDate] = useState('');
  const [terminationReason, setTerminationReason] = useState('');
  const [confirmRenew, setConfirmRenew] = useState(false);
  const [newEndDate, setNewEndDate] = useState('');

  if (isLoading || !lease) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const key = lease.leaseStatus.key;

  return (
    <div>
      <PageHeader
        title={lease.leaseNumber}
        description={`${lease.unit.name} · ${lease.primaryTenant.fullName}`}
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Leases', to: '/leases' },
          { label: lease.leaseNumber },
        ]}
        actions={
          <>
            {key === 'DRAFT' || key === 'REJECTED' ? (
              <Button variant="outline" onClick={() => navigate(`/leases/${id}/edit`)}>
                <Pencil className="mr-1.5 h-4 w-4" />
                Edit
              </Button>
            ) : null}

            {key === 'DRAFT' || key === 'REJECTED' ? (
              <Button
                onClick={async () => {
                  try {
                    await submitLease.mutateAsync([lease.id] as [string]);
                    toast.success('Submitted for approval');
                  } catch {
                    toast.error('Could not submit — check for date conflicts on this unit');
                  }
                }}
              >
                <Send className="mr-1.5 h-4 w-4" />
                Submit
              </Button>
            ) : null}

            {key === 'PENDING_APPROVAL' ? (
              <>
                <Button
                  onClick={async () => {
                    try {
                      await approveLease.mutateAsync([lease.id] as [string]);
                      toast.success('Approved — awaiting signature');
                    } catch {
                      toast.error('Could not approve — check for date conflicts on this unit');
                    }
                  }}
                >
                  <CheckCircle className="mr-1.5 h-4 w-4" />
                  Approve
                </Button>
                <Button variant="outline" onClick={() => setConfirmReject(true)}>
                  <XCircle className="mr-1.5 h-4 w-4" />
                  Reject
                </Button>
              </>
            ) : null}

            {key === 'AWAITING_SIGNATURE' ? (
              <>
                <Button
                  onClick={async () => {
                    try {
                      await activateLease.mutateAsync([lease.id] as [string]);
                      toast.success('Lease activated — unit is now occupied');
                    } catch {
                      toast.error(
                        'Could not activate — another lease may already reserve this unit',
                      );
                    }
                  }}
                >
                  <CheckCircle className="mr-1.5 h-4 w-4" />
                  Activate (sign)
                </Button>
                <Button variant="outline" onClick={() => setConfirmReject(true)}>
                  <XCircle className="mr-1.5 h-4 w-4" />
                  Reject
                </Button>
              </>
            ) : null}

            {key === 'ACTIVE' ? (
              <>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await initiateRenewal.mutateAsync([lease.id] as [string]);
                      toast.success('Renewal initiated');
                    } catch {
                      toast.error('Could not initiate renewal');
                    }
                  }}
                >
                  <RefreshCw className="mr-1.5 h-4 w-4" />
                  Initiate renewal
                </Button>
                <Button
                  variant="outline"
                  className="text-destructive"
                  onClick={() => setConfirmTerminate(true)}
                >
                  <ShieldX className="mr-1.5 h-4 w-4" />
                  Terminate
                </Button>
              </>
            ) : null}

            {key === 'RENEWAL_PENDING' ? (
              <>
                <Button onClick={() => setConfirmRenew(true)}>
                  <CheckCircle className="mr-1.5 h-4 w-4" />
                  Complete renewal
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await rejectRenewal.mutateAsync([lease.id] as [string]);
                      toast.success('Renewal rejected — lease continues on existing terms');
                    } catch {
                      toast.error('Could not reject renewal');
                    }
                  }}
                >
                  Reject renewal
                </Button>
                <Button
                  variant="outline"
                  className="text-destructive"
                  onClick={() => setConfirmTerminate(true)}
                >
                  <ShieldX className="mr-1.5 h-4 w-4" />
                  Terminate
                </Button>
              </>
            ) : null}

            {key === 'EXPIRED' || key === 'TERMINATED' ? (
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await archiveLease.mutateAsync([lease.id] as [string]);
                    toast.success('Lease archived');
                  } catch {
                    toast.error('Could not archive lease');
                  }
                }}
              >
                <ArchiveRestore className="mr-1.5 h-4 w-4" />
                Archive
              </Button>
            ) : null}
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge
          style={
            lease.leaseStatus.color
              ? { backgroundColor: lease.leaseStatus.color, color: 'white' }
              : undefined
          }
          variant="secondary"
        >
          {lease.leaseStatus.name}
        </Badge>
        <Badge variant="outline">{lease.leaseType.name}</Badge>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="guarantors">Guarantors</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardContent className="grid grid-cols-2 gap-4 p-6 text-sm">
                <Detail label="Property" value={lease.property.name} />
                <Detail label="Building" value={lease.building?.name} />
                <Detail label="Unit" value={lease.unit.name} />
                <Detail label="Primary tenant" value={lease.primaryTenant.fullName} />
                <Detail
                  label="Start date"
                  value={new Date(lease.leaseStartDate).toLocaleDateString()}
                />
                <Detail
                  label="End date"
                  value={new Date(lease.leaseEndDate).toLocaleDateString()}
                />
                <Detail
                  label="Move-in"
                  value={lease.moveInDate ? new Date(lease.moveInDate).toLocaleDateString() : null}
                />
                <Detail
                  label="Move-out"
                  value={
                    lease.moveOutDate ? new Date(lease.moveOutDate).toLocaleDateString() : null
                  }
                />
                <Detail
                  label="Signed"
                  value={lease.signedDate ? new Date(lease.signedDate).toLocaleDateString() : null}
                />
                <Detail label="Auto-renew" value={lease.autoRenew ? 'Yes' : 'No'} />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="grid grid-cols-2 gap-4 p-6 text-sm">
                <Detail label="Monthly rent" value={money(lease.monthlyRent)} />
                <Detail label="Annual rent" value={money(lease.annualRent)} />
                <Detail label="Security deposit" value={money(lease.securityDeposit)} />
                <Detail label="Service charge" value={money(lease.serviceCharge)} />
                <Detail label="Utility charge" value={money(lease.utilityCharge)} />
                <Detail label="Parking charge" value={money(lease.parkingCharge)} />
                <Detail label="Payment frequency" value={lease.paymentFrequency?.name} />
                <Detail label="Billing cycle" value={lease.billingCycle} />
              </CardContent>
            </Card>
            {lease.notes ? (
              <Card className="lg:col-span-2">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">{lease.notes}</p>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="tenants">
          <Card>
            <CardContent className="p-6">
              <LeaseTenantsPanel leaseId={lease.id} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="guarantors">
          <Card>
            <CardContent className="p-6">
              <LeaseGuarantorsPanel leaseId={lease.id} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="documents">
          <Card>
            <CardContent className="p-6">
              <LeaseDocumentsPanel leaseId={lease.id} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="timeline">
          <Card>
            <CardContent className="p-6">
              <LeaseTimelinePanel leaseId={lease.id} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notes">
          <Card>
            <CardContent className="p-6">
              <LeaseNotesPanel leaseId={lease.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirmReject}
        onOpenChange={setConfirmReject}
        title="Reject this lease?"
        description={
          <div className="space-y-2 pt-2">
            <Label htmlFor="rejectReason">Reason (optional)</Label>
            <Textarea
              id="rejectReason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
        }
        destructive
        loading={rejectLease.isPending}
        onConfirm={async () => {
          try {
            await rejectLease.mutateAsync([lease.id, rejectReason || undefined] as [
              string,
              string | undefined,
            ]);
            toast.success('Lease rejected');
            setConfirmReject(false);
            setRejectReason('');
          } catch {
            toast.error('Could not reject lease');
          }
        }}
      />

      <ConfirmDialog
        open={confirmTerminate}
        onOpenChange={setConfirmTerminate}
        title="Terminate this lease?"
        description={
          <div className="space-y-3 pt-2 text-left">
            <div className="space-y-2">
              <Label htmlFor="terminationDate">Termination date</Label>
              <Input
                id="terminationDate"
                type="date"
                value={terminationDate}
                onChange={(e) => setTerminationDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="terminationReason">Reason</Label>
              <Textarea
                id="terminationReason"
                value={terminationReason}
                onChange={(e) => setTerminationReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        }
        destructive
        loading={terminateLease.isPending}
        confirmLabel="Terminate"
        onConfirm={async () => {
          if (!terminationDate || !terminationReason) {
            toast.error('Termination date and reason are required');
            return;
          }
          try {
            await terminateLease.mutateAsync([lease.id, terminationDate, terminationReason] as [
              string,
              string,
              string,
            ]);
            toast.success('Lease terminated — unit released');
            setConfirmTerminate(false);
          } catch {
            toast.error('Could not terminate lease');
          }
        }}
      />

      <ConfirmDialog
        open={confirmRenew}
        onOpenChange={setConfirmRenew}
        title="Complete renewal"
        description={
          <div className="space-y-2 pt-2 text-left">
            <Label htmlFor="newEndDate">New end date</Label>
            <Input
              id="newEndDate"
              type="date"
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
            />
          </div>
        }
        loading={completeRenewal.isPending}
        confirmLabel="Complete renewal"
        onConfirm={async () => {
          if (!newEndDate) {
            toast.error('Select a new end date');
            return;
          }
          try {
            await completeRenewal.mutateAsync([lease.id, newEndDate] as [string, string]);
            toast.success('Lease renewed');
            setConfirmRenew(false);
          } catch {
            toast.error('Could not complete renewal — check for date conflicts');
          }
        }}
      />
    </div>
  );
}
