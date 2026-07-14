import { type Paginated } from '@479property/types';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { type Lease } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { NumberGeneratorService } from '../../config/numbering/number-generator.service';
import { PersonRepository } from '../../crm/person/person.repository';
import { BuildingRepository } from '../../inventory/building/building.repository';
import { UnitRepository } from '../../inventory/unit/unit.repository';
import { PropertyRepository } from '../../property/property.repository';
import { slugify } from '../../property/slug.util';
import { LeaseConfigRepository } from '../config/lease-config.repository';
import { LeaseEvents } from '../events/lease-events';
import { LeaseTimelineRepository } from '../lease-timeline/lease-timeline.repository';
import { LeaseOccupancyService } from '../occupancy/lease-occupancy.service';
import { LeaseStateMachineService } from '../state-machine/lease-state-machine.service';

import {
  type CreateLeaseDto,
  type SearchLeaseDto,
  type TerminateLeaseDto,
  type UpdateLeaseDto,
} from './dto/lease.dto';
import { type LeaseCreateData, LeaseRepository } from './lease.repository';

/** Statuses editable while a lease is still being drafted/revised. */
const EDITABLE_STATUS_KEYS = ['DRAFT', 'REJECTED'];

@Injectable()
export class LeaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: LeaseRepository,
    private readonly configRepository: LeaseConfigRepository,
    private readonly stateMachine: LeaseStateMachineService,
    private readonly occupancy: LeaseOccupancyService,
    private readonly timeline: LeaseTimelineRepository,
    private readonly properties: PropertyRepository,
    private readonly buildings: BuildingRepository,
    private readonly units: UnitRepository,
    private readonly people: PersonRepository,
    private readonly numbering: NumberGeneratorService,
    private readonly audit: AuditService,
    private readonly events: EventEmitter2,
  ) {}

  async get(organizationId: string, id: string, includeArchived = false): Promise<Lease> {
    const lease = await this.repository.findById(organizationId, id, includeArchived);
    if (!lease) throw new NotFoundException(`Lease ${id} not found`);
    return lease;
  }

  async search(organizationId: string, dto: SearchLeaseDto): Promise<Paginated<Lease>> {
    let activeAndRenewalStatusIds: string[] | undefined;
    if (dto.expiringInDays !== undefined) {
      const statuses = await this.configRepository.listLeaseStatuses(organizationId);
      activeAndRenewalStatusIds = statuses.filter((s) => s.countsAsOccupancy).map((s) => s.id);
    }
    const where = this.repository.buildWhere({
      organizationId,
      leaseNumber: dto.leaseNumber,
      tenantName: dto.tenantName,
      propertyId: dto.propertyId,
      buildingId: dto.buildingId,
      unitId: dto.unitId,
      leaseStatusId: dto.leaseStatusId,
      leaseTypeId: dto.leaseTypeId,
      paymentFrequencyId: dto.paymentFrequencyId,
      startDateFrom: dto.startDateFrom,
      startDateTo: dto.startDateTo,
      endDateFrom: dto.endDateFrom,
      endDateTo: dto.endDateTo,
      expiringInDays: dto.expiringInDays,
      activeAndRenewalStatusIds,
      global: dto.q,
      includeArchived: dto.includeArchived,
    });
    const skip = (dto.page - 1) * dto.pageSize;
    const [items, total] = await this.repository.search(
      where,
      { [dto.sortBy]: dto.sortOrder },
      skip,
      dto.pageSize,
    );
    return {
      items,
      total,
      page: dto.page,
      pageSize: dto.pageSize,
      pageCount: Math.max(Math.ceil(total / dto.pageSize), 1),
    };
  }

  private async statusByKey(organizationId: string, key: string) {
    const status = await this.configRepository.findLeaseStatusByKey(organizationId, key);
    if (!status)
      throw new BadRequestException(
        `Lease status "${key}" is not configured for this organization`,
      );
    return status;
  }

  private async blockingStatusIds(organizationId: string): Promise<string[]> {
    const statuses = await this.configRepository.listLeaseStatuses(organizationId);
    return statuses.filter((s) => s.blocksUnitAvailability).map((s) => s.id);
  }

  /** Business rule: unit/building/property chain must match, unit must not be archived. */
  private async validateUnitChain(
    organizationId: string,
    propertyId: string,
    buildingId: string | undefined,
    unitId: string,
  ): Promise<void> {
    const property = await this.properties.findById(organizationId, propertyId);
    if (!property) throw new NotFoundException(`Property ${propertyId} not found`);

    if (buildingId) {
      const building = await this.buildings.findById(organizationId, buildingId);
      if (!building) throw new NotFoundException(`Building ${buildingId} not found`);
      if (building.propertyId !== propertyId) {
        throw new BadRequestException(
          'The selected building does not belong to the selected property',
        );
      }
    }

    const unit = await this.units.findById(organizationId, unitId, true);
    if (!unit) throw new NotFoundException(`Unit ${unitId} not found`);
    if (unit.deletedAt) throw new BadRequestException('Archived units cannot receive new leases');
    if (unit.propertyId !== propertyId)
      throw new BadRequestException('The selected unit does not belong to the selected property');
    if (buildingId && unit.buildingId !== buildingId)
      throw new BadRequestException('The selected unit does not belong to the selected building');
  }

  private async validateOverlap(
    organizationId: string,
    unitId: string,
    startDate: Date,
    endDate: Date,
    excludeLeaseId: string,
  ): Promise<void> {
    const blockingIds = await this.blockingStatusIds(organizationId);
    const overlapping = await this.repository.findOverlappingBlockingLeases(
      unitId,
      startDate,
      endDate,
      blockingIds,
      excludeLeaseId,
    );
    if (overlapping.length > 0) {
      throw new ConflictException(
        `This unit already has ${overlapping.length} lease(s) with overlapping dates in a status that reserves the unit`,
      );
    }
  }

  async create(organizationId: string, dto: CreateLeaseDto, actorId?: string): Promise<Lease> {
    const startDate = new Date(dto.leaseStartDate);
    const endDate = new Date(dto.leaseEndDate);
    if (endDate <= startDate)
      throw new BadRequestException('leaseEndDate must be after leaseStartDate');
    if (dto.moveInDate && new Date(dto.moveInDate) < startDate) {
      throw new BadRequestException('moveInDate cannot precede leaseStartDate');
    }

    await this.validateUnitChain(organizationId, dto.propertyId, dto.buildingId, dto.unitId);

    if (!(await this.people.findById(organizationId, dto.primaryTenantId, true))) {
      throw new NotFoundException(`Person ${dto.primaryTenantId} not found`);
    }
    const leaseType = await this.configRepository.findLeaseTypeById(
      organizationId,
      dto.leaseTypeId,
    );
    if (!leaseType) throw new NotFoundException(`Lease type ${dto.leaseTypeId} not found`);
    if (
      dto.paymentFrequencyId &&
      !(await this.configRepository.findPaymentFrequencyById(
        organizationId,
        dto.paymentFrequencyId,
      ))
    ) {
      throw new NotFoundException(`Payment frequency ${dto.paymentFrequencyId} not found`);
    }
    for (const t of dto.additionalTenants ?? []) {
      if (!(await this.people.findById(organizationId, t.personId, true)))
        throw new NotFoundException(`Person ${t.personId} not found`);
    }
    for (const g of dto.guarantors ?? []) {
      if (!(await this.people.findById(organizationId, g.personId, true)))
        throw new NotFoundException(`Person ${g.personId} not found`);
    }

    const draftStatus = await this.statusByKey(organizationId, 'DRAFT');

    const base = `${dto.leaseReference ?? ''} ${dto.unitId}`.trim();
    const slugBase = slugify(base) || 'lease';
    let slug = slugBase;
    for (
      let attempt = 0;
      attempt < 5 && (await this.repository.findBySlug(organizationId, slug));
      attempt += 1
    ) {
      slug = `${slugBase}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const leaseNumber = (await this.numbering.next(organizationId, 'LEASE', actorId)).formatted;

    const lease = await this.prisma.$transaction(async (tx) => {
      const data: LeaseCreateData = {
        organizationId,
        leaseNumber,
        leaseReference: dto.leaseReference,
        slug,
        propertyId: dto.propertyId,
        buildingId: dto.buildingId ?? null,
        unitId: dto.unitId,
        primaryTenantId: dto.primaryTenantId,
        leaseTypeId: dto.leaseTypeId,
        leaseStatusId: draftStatus.id,
        leaseStartDate: startDate,
        leaseEndDate: endDate,
        moveInDate: dto.moveInDate ? new Date(dto.moveInDate) : null,
        moveOutDate: dto.moveOutDate ? new Date(dto.moveOutDate) : null,
        leaseDurationMonths: dto.leaseDurationMonths,
        renewalNoticeDays: dto.renewalNoticeDays,
        gracePeriodDays: dto.gracePeriodDays,
        securityDeposit: dto.securityDeposit,
        monthlyRent: dto.monthlyRent,
        annualRent: dto.annualRent,
        serviceCharge: dto.serviceCharge,
        utilityCharge: dto.utilityCharge,
        parkingCharge: dto.parkingCharge,
        discount: dto.discount,
        taxAmount: dto.taxAmount,
        totalRecurringAmount: dto.totalRecurringAmount,
        paymentFrequencyId: dto.paymentFrequencyId,
        billingCycle: dto.billingCycle,
        nextInvoiceDate: dto.nextInvoiceDate ? new Date(dto.nextInvoiceDate) : undefined,
        autoRenew: dto.autoRenew,
        notes: dto.notes,
        createdBy: actorId,
        updatedBy: actorId,
      };
      const created = await this.repository.create(data, tx);

      await tx.leaseTenant.create({
        data: { leaseId: created.id, personId: dto.primaryTenantId, role: 'PRIMARY' },
      });
      for (const t of dto.additionalTenants ?? []) {
        await tx.leaseTenant.create({
          data: {
            leaseId: created.id,
            personId: t.personId,
            role: (t.role as never) ?? 'CO_TENANT',
            ownershipPercentage: t.ownershipPercentage,
          },
        });
      }
      for (const g of dto.guarantors ?? []) {
        await tx.leaseGuarantor.create({
          data: {
            leaseId: created.id,
            personId: g.personId,
            guaranteeType: g.guaranteeType,
            guaranteeAmount: g.guaranteeAmount,
            relationshipToTenant: g.relationshipToTenant,
          },
        });
      }

      await this.timeline.record(tx, created.id, 'CREATED', actorId);
      return created;
    });

    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'CREATE',
      entityType: 'Lease',
      entityId: lease.id,
    });
    this.events.emit(LeaseEvents.Created, {
      organizationId,
      leaseId: lease.id,
      leaseNumber: lease.leaseNumber,
      actorId,
    });
    return this.get(organizationId, lease.id);
  }

  async update(
    organizationId: string,
    id: string,
    dto: UpdateLeaseDto,
    actorId?: string,
  ): Promise<Lease> {
    const lease = await this.get(organizationId, id);
    const status = await this.configRepository.findLeaseStatusById(
      organizationId,
      lease.leaseStatusId,
    );
    if (!status || !EDITABLE_STATUS_KEYS.includes(status.key)) {
      throw new BadRequestException(
        'Only Draft or Rejected leases can be edited directly. Use the appropriate transition instead.',
      );
    }
    if (dto.leaseStartDate || dto.leaseEndDate) {
      const start = dto.leaseStartDate ? new Date(dto.leaseStartDate) : lease.leaseStartDate;
      const end = dto.leaseEndDate ? new Date(dto.leaseEndDate) : lease.leaseEndDate;
      if (end <= start) throw new BadRequestException('leaseEndDate must be after leaseStartDate');
    }

    const patch: Record<string, unknown> = { ...dto, updatedBy: actorId };
    delete patch.additionalTenants;
    delete patch.guarantors;
    if (dto.leaseStartDate) patch.leaseStartDate = new Date(dto.leaseStartDate);
    if (dto.leaseEndDate) patch.leaseEndDate = new Date(dto.leaseEndDate);
    if (dto.moveInDate) patch.moveInDate = new Date(dto.moveInDate);
    if (dto.moveOutDate) patch.moveOutDate = new Date(dto.moveOutDate);
    if (dto.nextInvoiceDate) patch.nextInvoiceDate = new Date(dto.nextInvoiceDate);

    await this.repository.update(id, patch);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'Lease',
      entityId: id,
    });
    return this.get(organizationId, id);
  }

  // ── Transitions ──

  async submit(organizationId: string, id: string, actorId?: string): Promise<Lease> {
    const lease = await this.get(organizationId, id);
    const target = await this.statusByKey(organizationId, 'PENDING_APPROVAL');
    await this.stateMachine.assertCanTransition(organizationId, lease.leaseStatusId, target.id);
    await this.validateOverlap(
      organizationId,
      lease.unitId,
      lease.leaseStartDate,
      lease.leaseEndDate,
      lease.id,
    );

    await this.prisma.$transaction(async (tx) => {
      await this.repository.update(id, { leaseStatusId: target.id, updatedBy: actorId }, tx);
      await this.timeline.record(tx, id, 'SUBMITTED', actorId);
    });
    return this.get(organizationId, id);
  }

  async approve(organizationId: string, id: string, actorId?: string): Promise<Lease> {
    const lease = await this.get(organizationId, id);
    const target = await this.statusByKey(organizationId, 'AWAITING_SIGNATURE');
    await this.stateMachine.assertCanTransition(organizationId, lease.leaseStatusId, target.id);
    await this.validateOverlap(
      organizationId,
      lease.unitId,
      lease.leaseStartDate,
      lease.leaseEndDate,
      lease.id,
    );

    await this.prisma.$transaction(async (tx) => {
      await this.repository.update(id, { leaseStatusId: target.id, updatedBy: actorId }, tx);
      await this.timeline.record(tx, id, 'APPROVED', actorId);
    });
    this.events.emit(LeaseEvents.Approved, {
      organizationId,
      leaseId: id,
      leaseNumber: lease.leaseNumber,
      actorId,
    });
    return this.get(organizationId, id);
  }

  async reject(
    organizationId: string,
    id: string,
    reason: string | undefined,
    actorId?: string,
  ): Promise<Lease> {
    const lease = await this.get(organizationId, id);
    const target = await this.statusByKey(organizationId, 'REJECTED');
    await this.stateMachine.assertCanTransition(organizationId, lease.leaseStatusId, target.id);

    await this.prisma.$transaction(async (tx) => {
      await this.repository.update(id, { leaseStatusId: target.id, updatedBy: actorId }, tx);
      await this.timeline.record(tx, id, 'REJECTED', actorId, reason);
    });
    this.events.emit(LeaseEvents.Rejected, {
      organizationId,
      leaseId: id,
      leaseNumber: lease.leaseNumber,
      actorId,
    });
    return this.get(organizationId, id);
  }

  /** Awaiting Signature -> Active. Final source of truth for the overlap check, plus the occupancy engine. */
  async activate(organizationId: string, id: string, actorId?: string): Promise<Lease> {
    const lease = await this.get(organizationId, id);
    const target = await this.statusByKey(organizationId, 'ACTIVE');
    await this.stateMachine.assertCanTransition(organizationId, lease.leaseStatusId, target.id);

    await this.prisma.$transaction(async (tx) => {
      const blockingIds = await this.blockingStatusIds(organizationId);
      const overlapping = await this.repository.findOverlappingBlockingLeases(
        lease.unitId,
        lease.leaseStartDate,
        lease.leaseEndDate,
        blockingIds,
        lease.id,
        tx,
      );
      if (overlapping.length > 0) {
        throw new ConflictException(
          'Another lease with overlapping dates already reserves this unit',
        );
      }

      await this.repository.update(
        id,
        {
          leaseStatusId: target.id,
          signedDate: lease.signedDate ?? new Date(),
          updatedBy: actorId,
        },
        tx,
      );
      await this.timeline.record(tx, id, 'SIGNED', actorId);
      await this.timeline.record(tx, id, 'ACTIVATED', actorId);
      await this.occupancy.syncUnitOccupancy(
        tx,
        lease.unitId,
        true,
        actorId,
        `Lease ${lease.leaseNumber} activated`,
      );
    });

    this.events.emit(LeaseEvents.Signed, {
      organizationId,
      leaseId: id,
      leaseNumber: lease.leaseNumber,
      actorId,
    });
    this.events.emit(LeaseEvents.Activated, {
      organizationId,
      leaseId: id,
      leaseNumber: lease.leaseNumber,
      actorId,
    });
    return this.get(organizationId, id);
  }

  async initiateRenewal(organizationId: string, id: string, actorId?: string): Promise<Lease> {
    const lease = await this.get(organizationId, id);
    const target = await this.statusByKey(organizationId, 'RENEWAL_PENDING');
    await this.stateMachine.assertCanTransition(organizationId, lease.leaseStatusId, target.id);

    await this.prisma.$transaction(async (tx) => {
      await this.repository.update(id, { leaseStatusId: target.id, updatedBy: actorId }, tx);
      await this.timeline.record(tx, id, 'RENEWAL_INITIATED', actorId);
    });
    this.events.emit(LeaseEvents.RenewalInitiated, {
      organizationId,
      leaseId: id,
      leaseNumber: lease.leaseNumber,
      actorId,
    });
    return this.get(organizationId, id);
  }

  /** Renewal Pending -> Active, extending the lease's end date (in place; no new Lease row). */
  async completeRenewal(
    organizationId: string,
    id: string,
    newEndDate: string,
    actorId?: string,
  ): Promise<Lease> {
    const lease = await this.get(organizationId, id);
    const target = await this.statusByKey(organizationId, 'ACTIVE');
    await this.stateMachine.assertCanTransition(organizationId, lease.leaseStatusId, target.id);

    const end = new Date(newEndDate);
    if (end <= lease.leaseStartDate)
      throw new BadRequestException('The new end date must be after the lease start date');

    await this.prisma.$transaction(async (tx) => {
      const blockingIds = await this.blockingStatusIds(organizationId);
      const overlapping = await this.repository.findOverlappingBlockingLeases(
        lease.unitId,
        lease.leaseStartDate,
        end,
        blockingIds,
        lease.id,
        tx,
      );
      if (overlapping.length > 0)
        throw new ConflictException(
          'Extending to this date would overlap another reserving lease on this unit',
        );

      await this.repository.update(
        id,
        { leaseStatusId: target.id, leaseEndDate: end, updatedBy: actorId },
        tx,
      );
      await this.timeline.record(tx, id, 'RENEWED', actorId);
    });
    this.events.emit(LeaseEvents.Renewed, {
      organizationId,
      leaseId: id,
      leaseNumber: lease.leaseNumber,
      actorId,
    });
    return this.get(organizationId, id);
  }

  /** Renewal Pending -> Active, renewal rejected: the lease simply continues on its existing terms. */
  async rejectRenewal(organizationId: string, id: string, actorId?: string): Promise<Lease> {
    const lease = await this.get(organizationId, id);
    const target = await this.statusByKey(organizationId, 'ACTIVE');
    await this.stateMachine.assertCanTransition(organizationId, lease.leaseStatusId, target.id);

    await this.prisma.$transaction(async (tx) => {
      await this.repository.update(id, { leaseStatusId: target.id, updatedBy: actorId }, tx);
      await this.timeline.record(
        tx,
        id,
        'ACTIVATED',
        actorId,
        'Renewal rejected; lease continues on existing terms',
      );
    });
    return this.get(organizationId, id);
  }

  async terminate(
    organizationId: string,
    id: string,
    dto: TerminateLeaseDto,
    actorId?: string,
  ): Promise<Lease> {
    const lease = await this.get(organizationId, id);
    const target = await this.statusByKey(organizationId, 'TERMINATED');
    await this.stateMachine.assertCanTransition(organizationId, lease.leaseStatusId, target.id);

    await this.prisma.$transaction(async (tx) => {
      await this.repository.update(
        id,
        {
          leaseStatusId: target.id,
          terminationDate: new Date(dto.terminationDate),
          terminationReason: dto.terminationReason,
          updatedBy: actorId,
        },
        tx,
      );
      await this.timeline.record(tx, id, 'TERMINATED', actorId, dto.terminationReason);
      await this.occupancy.syncUnitOccupancy(
        tx,
        lease.unitId,
        false,
        actorId,
        `Lease ${lease.leaseNumber} terminated`,
      );
    });
    this.events.emit(LeaseEvents.Terminated, {
      organizationId,
      leaseId: id,
      leaseNumber: lease.leaseNumber,
      actorId,
    });
    return this.get(organizationId, id);
  }

  async archive(organizationId: string, id: string, actorId?: string): Promise<Lease> {
    const lease = await this.get(organizationId, id);
    const target = await this.statusByKey(organizationId, 'ARCHIVED');
    await this.stateMachine.assertCanTransition(organizationId, lease.leaseStatusId, target.id);

    await this.prisma.$transaction(async (tx) => {
      await this.repository.update(
        id,
        { leaseStatusId: target.id, deletedAt: new Date(), updatedBy: actorId },
        tx,
      );
      await this.timeline.record(tx, id, 'ARCHIVED', actorId);
    });
    this.events.emit(LeaseEvents.Archived, {
      organizationId,
      leaseId: id,
      leaseNumber: lease.leaseNumber,
      actorId,
    });
    return this.get(organizationId, id, true);
  }

  async restore(organizationId: string, id: string, actorId?: string): Promise<Lease> {
    await this.get(organizationId, id, true);
    await this.repository.update(id, { deletedAt: null, updatedBy: actorId });
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'RESTORE',
      entityType: 'Lease',
      entityId: id,
    });
    return this.get(organizationId, id);
  }

  /** Called by the scheduled job: Active/Renewal Pending leases past their end date automatically become Expired. */
  async expireDueLeases(): Promise<number> {
    const orgs = await this.configRepository.listOrganizationIds();
    let expiredCount = 0;
    for (const org of orgs) {
      const statuses = await this.configRepository.listLeaseStatuses(org.id);
      const occupancyStatusIds = statuses.filter((s) => s.countsAsOccupancy).map((s) => s.id);
      const expiredStatus = statuses.find((s) => s.key === 'EXPIRED');
      if (!expiredStatus || occupancyStatusIds.length === 0) continue;

      const due = await this.repository.findLeasesPastEndDate(occupancyStatusIds, new Date());
      for (const lease of due) {
        await this.prisma.$transaction(async (tx) => {
          await this.repository.update(lease.id, { leaseStatusId: expiredStatus.id }, tx);
          await this.timeline.record(tx, lease.id, 'EXPIRED');
          await this.occupancy.syncUnitOccupancy(
            tx,
            lease.unitId,
            false,
            undefined,
            `Lease ${lease.leaseNumber} expired`,
          );
        });
        this.events.emit(LeaseEvents.Expired, {
          organizationId: org.id,
          leaseId: lease.id,
          leaseNumber: lease.leaseNumber,
        });
        expiredCount += 1;
      }
    }
    return expiredCount;
  }
}
