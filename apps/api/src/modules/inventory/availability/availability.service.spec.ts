import { UnitAvailability } from '@prisma/client';

import { AvailabilityService, type AvailabilitySignals } from './availability.service';

function signals(overrides: Partial<AvailabilitySignals> = {}): AvailabilitySignals {
  return {
    isArchived: false,
    isInactive: false,
    hasActiveLease: false,
    reserved: false,
    hasOpenMaintenance: false,
    blocked: false,
    ...overrides,
  };
}

describe('AvailabilityService', () => {
  const service = new AvailabilityService();

  it('resolves ARCHIVED with highest precedence, overriding every other signal', () => {
    expect(
      service.resolve(
        signals({
          isArchived: true,
          isInactive: true,
          hasActiveLease: true,
          reserved: true,
          hasOpenMaintenance: true,
          blocked: true,
        }),
      ),
    ).toBe(UnitAvailability.ARCHIVED);
  });

  it('resolves INACTIVE when not archived but inactive, overriding lower signals', () => {
    expect(
      service.resolve(
        signals({
          isInactive: true,
          hasActiveLease: true,
          reserved: true,
          hasOpenMaintenance: true,
          blocked: true,
        }),
      ),
    ).toBe(UnitAvailability.INACTIVE);
  });

  it('resolves OCCUPIED when there is an active lease, overriding reserved/maintenance/blocked', () => {
    expect(
      service.resolve(
        signals({ hasActiveLease: true, reserved: true, hasOpenMaintenance: true, blocked: true }),
      ),
    ).toBe(UnitAvailability.OCCUPIED);
  });

  it('resolves RESERVED when reserved, overriding maintenance/blocked', () => {
    expect(
      service.resolve(signals({ reserved: true, hasOpenMaintenance: true, blocked: true })),
    ).toBe(UnitAvailability.RESERVED);
  });

  it('resolves UNDER_MAINTENANCE when open maintenance exists, overriding blocked', () => {
    expect(service.resolve(signals({ hasOpenMaintenance: true, blocked: true }))).toBe(
      UnitAvailability.UNDER_MAINTENANCE,
    );
  });

  it('resolves BLOCKED when blocked and nothing higher-precedence applies', () => {
    expect(service.resolve(signals({ blocked: true }))).toBe(UnitAvailability.BLOCKED);
  });

  it('resolves AVAILABLE when no signals are set', () => {
    expect(service.resolve(signals())).toBe(UnitAvailability.AVAILABLE);
  });

  describe('signalsFor', () => {
    it('derives isArchived from deletedAt and isInactive from isActive', () => {
      const s = service.signalsFor({
        deletedAt: new Date(),
        isActive: false,
        isReserved: true,
        isBlocked: true,
      });
      expect(s).toEqual({
        isArchived: true,
        isInactive: true,
        hasActiveLease: false,
        reserved: true,
        hasOpenMaintenance: false,
        blocked: true,
      });
    });

    it('applies future-module overrides for hasActiveLease and hasOpenMaintenance', () => {
      const s = service.signalsFor(
        { deletedAt: null, isActive: true, isReserved: false, isBlocked: false },
        { hasActiveLease: true, hasOpenMaintenance: true },
      );
      expect(s.hasActiveLease).toBe(true);
      expect(s.hasOpenMaintenance).toBe(true);
    });
  });

  describe('computeFor', () => {
    it('composes signalsFor + resolve for a live (non-archived, active) unit', () => {
      expect(
        service.computeFor({
          deletedAt: null,
          isActive: true,
          isReserved: false,
          isBlocked: false,
        }),
      ).toBe(UnitAvailability.AVAILABLE);
    });
  });

  describe('isOccupied', () => {
    it('is true only for OCCUPIED', () => {
      expect(AvailabilityService.isOccupied(UnitAvailability.OCCUPIED)).toBe(true);
      expect(AvailabilityService.isOccupied(UnitAvailability.AVAILABLE)).toBe(false);
      expect(AvailabilityService.isOccupied(UnitAvailability.RESERVED)).toBe(false);
    });
  });
});
