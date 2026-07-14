import { LeaseRepository } from './lease.repository';

function repo(): LeaseRepository {
  return new LeaseRepository({} as never);
}

describe('LeaseRepository.buildWhere', () => {
  it('scopes to the organization and excludes archived leases by default', () => {
    const where = repo().buildWhere({ organizationId: 'org1' }) as Record<string, unknown>;
    expect(where.organizationId).toBe('org1');
    expect(where.deletedAt).toBeNull();
  });

  it('includes archived leases when includeArchived is true', () => {
    const where = repo().buildWhere({ organizationId: 'org1', includeArchived: true }) as Record<
      string,
      unknown
    >;
    expect(where.deletedAt).toBeUndefined();
  });

  it('applies direct-equality filters for property/building/unit/status/type/paymentFrequency', () => {
    const where = repo().buildWhere({
      organizationId: 'org1',
      propertyId: 'p1',
      buildingId: 'b1',
      unitId: 'u1',
      leaseStatusId: 'ls1',
      leaseTypeId: 'lt1',
      paymentFrequencyId: 'pf1',
    }) as Record<string, unknown>;
    expect(where.propertyId).toBe('p1');
    expect(where.buildingId).toBe('b1');
    expect(where.unitId).toBe('u1');
    expect(where.leaseStatusId).toBe('ls1');
    expect(where.leaseTypeId).toBe('lt1');
    expect(where.paymentFrequencyId).toBe('pf1');
  });

  it('filters tenantName via a nested primaryTenant.fullName contains clause', () => {
    const where = repo().buildWhere({ organizationId: 'org1', tenantName: 'Ada' }) as Record<
      string,
      unknown
    >;
    expect(where.primaryTenant).toEqual({ fullName: { contains: 'Ada', mode: 'insensitive' } });
  });

  it('builds a leaseStartDate range from startDateFrom/startDateTo', () => {
    const where = repo().buildWhere({
      organizationId: 'org1',
      startDateFrom: '2026-01-01',
      startDateTo: '2026-06-01',
    }) as Record<string, unknown>;
    expect(where.leaseStartDate).toEqual({
      gte: new Date('2026-01-01'),
      lte: new Date('2026-06-01'),
    });
  });

  it('expiringInDays derives an end-date window and restricts to the given status ids', () => {
    const before = Date.now();
    const where = repo().buildWhere({
      organizationId: 'org1',
      expiringInDays: 30,
      activeAndRenewalStatusIds: ['active-id', 'renewal-id'],
    }) as Record<string, unknown>;
    const range = where.leaseEndDate as { gte: Date; lte: Date };
    expect(range.gte.getTime()).toBeGreaterThanOrEqual(before);
    expect(range.lte.getTime()).toBeGreaterThan(range.gte.getTime());
    expect(where.leaseStatusId).toEqual({ in: ['active-id', 'renewal-id'] });
  });

  it('adds a global OR search across leaseNumber/leaseReference/tenant name', () => {
    const where = repo().buildWhere({ organizationId: 'org1', global: 'smith' }) as Record<
      string,
      unknown
    >;
    expect(where.AND).toEqual([
      {
        OR: [
          { leaseNumber: { contains: 'smith', mode: 'insensitive' } },
          { leaseReference: { contains: 'smith', mode: 'insensitive' } },
          { primaryTenant: { fullName: { contains: 'smith', mode: 'insensitive' } } },
        ],
      },
    ]);
  });

  it('omits AND entirely when there is no global search term', () => {
    const where = repo().buildWhere({ organizationId: 'org1' }) as Record<string, unknown>;
    expect(where.AND).toBeUndefined();
  });
});
