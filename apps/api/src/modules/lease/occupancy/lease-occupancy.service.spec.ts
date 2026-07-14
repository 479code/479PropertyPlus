import { AvailabilityService } from '../../inventory/availability/availability.service';
import { type CountsService } from '../../inventory/counts/counts.service';
import { type UnitEventsRepository } from '../../inventory/unit/unit-events.repository';

import { LeaseOccupancyService } from './lease-occupancy.service';

function build(
  unitOverrides: Partial<{
    availability: string;
    deletedAt: Date | null;
    isActive: boolean;
    isReserved: boolean;
    isBlocked: boolean;
  }> = {},
) {
  const unit = {
    id: 'unit1',
    propertyId: 'prop1',
    buildingId: 'bld1',
    availability: 'AVAILABLE',
    deletedAt: null,
    isActive: true,
    isReserved: false,
    isBlocked: false,
    ...unitOverrides,
  };
  const db = {
    unit: {
      findUnique: jest.fn().mockResolvedValue(unit),
      update: jest.fn().mockResolvedValue(unit),
    },
  } as unknown as Parameters<LeaseOccupancyService['syncUnitOccupancy']>[0];

  const unitEvents = {
    recordOccupancy: jest.fn().mockResolvedValue({}),
  } as unknown as UnitEventsRepository;
  const counts = {
    syncForUnit: jest.fn().mockResolvedValue(undefined),
  } as unknown as CountsService;
  const service = new LeaseOccupancyService(new AvailabilityService(), unitEvents, counts);
  return { service, db, unitEvents, counts };
}

describe('LeaseOccupancyService.syncUnitOccupancy', () => {
  it('marks a unit OCCUPIED when hasActiveLease is true, and records the transition', async () => {
    const { service, db, unitEvents, counts } = build({ availability: 'AVAILABLE' });
    await service.syncUnitOccupancy(db, 'unit1', true, 'user1', 'lease activated');

    expect(db.unit.update).toHaveBeenCalledWith({
      where: { id: 'unit1' },
      data: { availability: 'OCCUPIED' },
    });
    expect(unitEvents.recordOccupancy).toHaveBeenCalledWith(
      db,
      'unit1',
      'AVAILABLE',
      'OCCUPIED',
      'user1',
      'lease activated',
    );
    expect(counts.syncForUnit).toHaveBeenCalledWith(db, 'prop1', 'bld1');
  });

  it('reverts a unit to AVAILABLE when hasActiveLease becomes false (no reservation/block/maintenance)', async () => {
    const { service, db } = build({ availability: 'OCCUPIED' });
    await service.syncUnitOccupancy(db, 'unit1', false, 'user1', 'lease terminated');
    expect(db.unit.update).toHaveBeenCalledWith({
      where: { id: 'unit1' },
      data: { availability: 'AVAILABLE' },
    });
  });

  it('does nothing when the computed availability is unchanged (no spurious writes)', async () => {
    const { service, db, unitEvents, counts } = build({ availability: 'BLOCKED', isBlocked: true });
    // hasActiveLease=false but unit is blocked, so it stays BLOCKED either way
    await service.syncUnitOccupancy(db, 'unit1', false);
    expect(db.unit.update).not.toHaveBeenCalled();
    expect(unitEvents.recordOccupancy).not.toHaveBeenCalled();
    expect(counts.syncForUnit).not.toHaveBeenCalled();
  });

  it('respects precedence: an archived unit stays ARCHIVED even with an active lease override', async () => {
    const { service, db } = build({ availability: 'ARCHIVED', deletedAt: new Date() });
    await service.syncUnitOccupancy(db, 'unit1', true);
    expect(db.unit.update).not.toHaveBeenCalled();
  });

  it('silently no-ops when the unit no longer exists', async () => {
    const { service, db } = build();
    (db.unit.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(service.syncUnitOccupancy(db, 'ghost', true)).resolves.toBeUndefined();
    expect(db.unit.update).not.toHaveBeenCalled();
  });
});
