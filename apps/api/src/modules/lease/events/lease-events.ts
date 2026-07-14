/**
 * Internal application domain events for the lease lifecycle. Emitted via
 * EventEmitter2; future modules (Notifications, Invoicing, Reporting) can
 * subscribe with @OnEvent(LeaseEvents.Activated) etc. without LeaseService
 * knowing anything about them.
 */
export const LeaseEvents = {
  Created: 'lease.created',
  Approved: 'lease.approved',
  Rejected: 'lease.rejected',
  Signed: 'lease.signed',
  Activated: 'lease.activated',
  RenewalInitiated: 'lease.renewal_initiated',
  Renewed: 'lease.renewed',
  Extended: 'lease.extended',
  Expired: 'lease.expired',
  Terminated: 'lease.terminated',
  Archived: 'lease.archived',
} as const;

export interface LeaseEventPayload {
  organizationId: string;
  leaseId: string;
  leaseNumber: string;
  actorId?: string;
}
