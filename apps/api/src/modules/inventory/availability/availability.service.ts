import { Injectable } from '@nestjs/common';
import { type Unit, UnitAvailability } from '@prisma/client';

/**
 * Signals that determine a unit's availability. Lease and Maintenance modules
 * do not exist yet; their signals default to false and become real inputs later.
 * This service is the single source of truth — availability is computed, never
 * manually stored as the primary value.
 */
export interface AvailabilitySignals {
  isArchived: boolean;
  isInactive: boolean;
  hasActiveLease: boolean;
  reserved: boolean;
  hasOpenMaintenance: boolean;
  blocked: boolean;
}

export type AvailabilityUnitLike = Pick<
  Unit,
  'deletedAt' | 'isActive' | 'isReserved' | 'isBlocked'
>;

/** Overrides supplied by future modules (e.g. LeaseService.hasActiveLease). */
export type AvailabilityOverrides = Partial<
  Pick<AvailabilitySignals, 'hasActiveLease' | 'hasOpenMaintenance'>
>;

@Injectable()
export class AvailabilityService {
  /**
   * Resolution order (highest precedence first):
   * Archived → Inactive → Active Lease (Occupied) → Reserved → Under Maintenance → Blocked → Available
   */
  resolve(signals: AvailabilitySignals): UnitAvailability {
    if (signals.isArchived) return UnitAvailability.ARCHIVED;
    if (signals.isInactive) return UnitAvailability.INACTIVE;
    if (signals.hasActiveLease) return UnitAvailability.OCCUPIED;
    if (signals.reserved) return UnitAvailability.RESERVED;
    if (signals.hasOpenMaintenance) return UnitAvailability.UNDER_MAINTENANCE;
    if (signals.blocked) return UnitAvailability.BLOCKED;
    return UnitAvailability.AVAILABLE;
  }

  /** Build the signal set from a unit's own persisted flags plus future-module overrides. */
  signalsFor(
    unit: AvailabilityUnitLike,
    overrides: AvailabilityOverrides = {},
  ): AvailabilitySignals {
    return {
      isArchived: unit.deletedAt !== null,
      isInactive: !unit.isActive,
      hasActiveLease: overrides.hasActiveLease ?? false,
      reserved: unit.isReserved,
      hasOpenMaintenance: overrides.hasOpenMaintenance ?? false,
      blocked: unit.isBlocked,
    };
  }

  /** Convenience: compute availability directly for a unit. */
  computeFor(unit: AvailabilityUnitLike, overrides: AvailabilityOverrides = {}): UnitAvailability {
    return this.resolve(this.signalsFor(unit, overrides));
  }

  /** A unit counts toward "occupied" for dashboard rollups when it has an active lease. */
  static isOccupied(availability: UnitAvailability): boolean {
    return availability === UnitAvailability.OCCUPIED;
  }
}
