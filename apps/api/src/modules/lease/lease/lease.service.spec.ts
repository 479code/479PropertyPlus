import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

import { LeaseService } from './lease.service';

const DRAFT = {
  id: 'draft',
  key: 'DRAFT',
  blocksUnitAvailability: false,
  countsAsOccupancy: false,
};
const PENDING = {
  id: 'pending',
  key: 'PENDING_APPROVAL',
  blocksUnitAvailability: true,
  countsAsOccupancy: false,
};
const AWAITING = {
  id: 'awaiting',
  key: 'AWAITING_SIGNATURE',
  blocksUnitAvailability: true,
  countsAsOccupancy: false,
};
const ACTIVE = {
  id: 'active',
  key: 'ACTIVE',
  blocksUnitAvailability: true,
  countsAsOccupancy: true,
};
const TERMINATED = {
  id: 'terminated',
  key: 'TERMINATED',
  blocksUnitAvailability: false,
  countsAsOccupancy: false,
};
const ALL_STATUSES = [DRAFT, PENDING, AWAITING, ACTIVE, TERMINATED];

function buildLease(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'lease1',
    organizationId: 'org1',
    leaseNumber: 'LSE-000001',
    unitId: 'unit1',
    propertyId: 'prop1',
    buildingId: null,
    leaseStatusId: AWAITING.id,
    leaseStartDate: new Date('2026-01-01'),
    leaseEndDate: new Date('2026-12-31'),
    signedDate: null,
    ...overrides,
  };
}

function build(overrides: { overlapping?: unknown[]; lease?: Record<string, unknown> } = {}) {
  const lease = buildLease(overrides.lease);
  const repository = {
    findById: jest.fn().mockResolvedValue(lease),
    findBySlug: jest.fn().mockResolvedValue(null),
    findOverlappingBlockingLeases: jest.fn().mockResolvedValue(overrides.overlapping ?? []),
    update: jest.fn().mockResolvedValue(lease),
    create: jest.fn().mockResolvedValue(lease),
    buildWhere: jest.fn(),
    search: jest.fn(),
  } as unknown as import('./lease.repository').LeaseRepository;

  const configRepository = {
    listLeaseStatuses: jest.fn().mockResolvedValue(ALL_STATUSES),
    findLeaseStatusByKey: jest
      .fn()
      .mockImplementation((_o: string, key: string) =>
        Promise.resolve(ALL_STATUSES.find((s) => s.key === key) ?? null),
      ),
    findLeaseStatusById: jest
      .fn()
      .mockImplementation((_o: string, id: string) =>
        Promise.resolve(ALL_STATUSES.find((s) => s.id === id) ?? null),
      ),
    findLeaseTypeById: jest.fn().mockResolvedValue({ id: 'lt1' }),
    findPaymentFrequencyById: jest.fn().mockResolvedValue({ id: 'pf1' }),
  } as unknown as import('../config/lease-config.repository').LeaseConfigRepository;

  const stateMachine = {
    assertCanTransition: jest.fn().mockResolvedValue(undefined),
  } as unknown as import('../state-machine/lease-state-machine.service').LeaseStateMachineService;

  const occupancy = {
    syncUnitOccupancy: jest.fn().mockResolvedValue(undefined),
  } as unknown as import('../occupancy/lease-occupancy.service').LeaseOccupancyService;

  const timeline = {
    record: jest.fn().mockResolvedValue(undefined),
  } as unknown as import('../lease-timeline/lease-timeline.repository').LeaseTimelineRepository;

  const properties = {
    findById: jest.fn().mockResolvedValue({ id: 'prop1' }),
  } as unknown as import('../../property/property.repository').PropertyRepository;
  const buildings = {
    findById: jest.fn().mockResolvedValue({ id: 'bld1', propertyId: 'prop1' }),
  } as unknown as import('../../inventory/building/building.repository').BuildingRepository;
  const units = {
    findById: jest
      .fn()
      .mockResolvedValue({ id: 'unit1', propertyId: 'prop1', buildingId: null, deletedAt: null }),
  } as unknown as import('../../inventory/unit/unit.repository').UnitRepository;
  const people = {
    findById: jest.fn().mockResolvedValue({ id: 'person1' }),
  } as unknown as import('../../crm/person/person.repository').PersonRepository;

  const numbering = {
    next: jest.fn().mockResolvedValue({ formatted: 'LSE-000001', value: 1 }),
  } as unknown as import('../../config/numbering/number-generator.service').NumberGeneratorService;
  const audit = {
    record: jest.fn().mockResolvedValue(undefined),
  } as unknown as import('../../audit/audit.service').AuditService;
  const events = { emit: jest.fn() } as unknown as import('@nestjs/event-emitter').EventEmitter2;

  const prisma = {
    $transaction: jest.fn((fn: (tx: unknown) => unknown) =>
      fn({ leaseTenant: { create: jest.fn() }, leaseGuarantor: { create: jest.fn() } }),
    ),
  } as unknown as import('../../../prisma/prisma.service').PrismaService;

  const service = new LeaseService(
    prisma,
    repository,
    configRepository,
    stateMachine,
    occupancy,
    timeline,
    properties,
    buildings,
    units,
    people,
    numbering,
    audit,
    events,
  );

  return { service, repository, configRepository, occupancy, units, buildings };
}

describe('LeaseService — unit chain validation', () => {
  it('rejects creating a lease against an archived unit', async () => {
    const { service, units } = build();
    (units.findById as jest.Mock).mockResolvedValue({
      id: 'unit1',
      propertyId: 'prop1',
      buildingId: null,
      deletedAt: new Date(),
    });

    await expect(
      service.create('org1', {
        propertyId: 'prop1',
        unitId: 'unit1',
        primaryTenantId: 'person1',
        leaseTypeId: 'lt1',
        leaseStartDate: '2026-01-01',
        leaseEndDate: '2026-12-31',
      } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects when the unit does not belong to the selected property', async () => {
    const { service, units } = build();
    (units.findById as jest.Mock).mockResolvedValue({
      id: 'unit1',
      propertyId: 'OTHER_PROP',
      buildingId: null,
      deletedAt: null,
    });

    await expect(
      service.create('org1', {
        propertyId: 'prop1',
        unitId: 'unit1',
        primaryTenantId: 'person1',
        leaseTypeId: 'lt1',
        leaseStartDate: '2026-01-01',
        leaseEndDate: '2026-12-31',
      } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects when leaseEndDate is not after leaseStartDate', async () => {
    const { service } = build();
    await expect(
      service.create('org1', {
        propertyId: 'prop1',
        unitId: 'unit1',
        primaryTenantId: 'person1',
        leaseTypeId: 'lt1',
        leaseStartDate: '2026-12-31',
        leaseEndDate: '2026-01-01',
      } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('LeaseService — overlap/conflict validation', () => {
  it('submit() rejects when a blocking lease already overlaps the requested dates', async () => {
    const { service } = build({ overlapping: [{ id: 'other-lease' }] });
    await expect(service.submit('org1', 'lease1', 'user1')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('submit() succeeds when there is no overlap', async () => {
    const { service, repository } = build({ overlapping: [] });
    await service.submit('org1', 'lease1', 'user1');
    expect(repository.update).toHaveBeenCalled();
  });

  it('activate() re-checks for overlap as the final source of truth, even if earlier checks passed', async () => {
    const { service } = build({ overlapping: [{ id: 'other-lease' }] });
    await expect(service.activate('org1', 'lease1', 'user1')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});

describe('LeaseService — occupancy engine integration', () => {
  it('activate() marks the unit occupied via the occupancy engine', async () => {
    const { service, occupancy } = build({ overlapping: [] });
    await service.activate('org1', 'lease1', 'user1');
    expect(occupancy.syncUnitOccupancy).toHaveBeenCalledWith(
      expect.anything(),
      'unit1',
      true,
      'user1',
      expect.any(String),
    );
  });

  it('terminate() releases the unit via the occupancy engine', async () => {
    const { service, occupancy } = build({ lease: { leaseStatusId: ACTIVE.id } });
    await service.terminate(
      'org1',
      'lease1',
      { terminationDate: '2026-06-01', terminationReason: 'Tenant moved out' },
      'user1',
    );
    expect(occupancy.syncUnitOccupancy).toHaveBeenCalledWith(
      expect.anything(),
      'unit1',
      false,
      'user1',
      expect.any(String),
    );
  });
});

describe('LeaseService — get()', () => {
  it('throws NotFoundException for a lease that does not exist', async () => {
    const { service, repository } = build();
    (repository.findById as jest.Mock).mockResolvedValue(null);
    await expect(service.get('org1', 'ghost')).rejects.toBeInstanceOf(NotFoundException);
  });
});
