import { UnitRepository } from './unit.repository';

function repo(): UnitRepository {
  return new UnitRepository({} as never);
}

describe('UnitRepository.buildWhere', () => {
  it('scopes to the organization and excludes archived units by default', () => {
    const where = repo().buildWhere({ organizationId: 'org1' });
    expect(where.organizationId).toBe('org1');
    expect(where.deletedAt).toBeNull();
  });

  it('includes archived units when includeArchived is true', () => {
    const where = repo().buildWhere({ organizationId: 'org1', includeArchived: true });
    expect(where.deletedAt).toBeUndefined();
  });

  it('applies direct-equality filters for property/building/floor/type/status/availability', () => {
    const where = repo().buildWhere({
      organizationId: 'org1',
      propertyId: 'p1',
      buildingId: 'b1',
      floorId: 'f1',
      unitTypeId: 'ut1',
      statusId: 'us1',
      availability: 'AVAILABLE' as never,
    });
    expect(where.propertyId).toBe('p1');
    expect(where.buildingId).toBe('b1');
    expect(where.floorId).toBe('f1');
    expect(where.unitTypeId).toBe('ut1');
    expect(where.statusId).toBe('us1');
    expect(where.availability).toBe('AVAILABLE');
  });

  it('applies case-insensitive contains filters for code and name', () => {
    const where = repo().buildWhere({ organizationId: 'org1', code: 'UNIT-1', name: 'Penthouse' });
    expect(where.unitCode).toEqual({ contains: 'UNIT-1', mode: 'insensitive' });
    expect(where.name).toEqual({ contains: 'Penthouse', mode: 'insensitive' });
  });

  it('builds a monthlyRent range filter only from the bounds that are provided', () => {
    const minOnly = repo().buildWhere({ organizationId: 'org1', rentMin: 1000 });
    expect(minOnly.monthlyRent).toEqual({ gte: 1000 });

    const maxOnly = repo().buildWhere({ organizationId: 'org1', rentMax: 5000 });
    expect(maxOnly.monthlyRent).toEqual({ lte: 5000 });

    const both = repo().buildWhere({ organizationId: 'org1', rentMin: 1000, rentMax: 5000 });
    expect(both.monthlyRent).toEqual({ gte: 1000, lte: 5000 });

    const neither = repo().buildWhere({ organizationId: 'org1' });
    expect(neither.monthlyRent).toBeUndefined();
  });

  it('ANDs one "features some" clause per requested featureId', () => {
    const where = repo().buildWhere({ organizationId: 'org1', featureIds: ['f1', 'f2'] });
    expect(where.AND).toEqual([
      { features: { some: { featureId: 'f1' } } },
      { features: { some: { featureId: 'f2' } } },
    ]);
  });

  it('adds a global OR search across unitCode/name/description', () => {
    const where = repo().buildWhere({ organizationId: 'org1', global: 'balcony' });
    expect(where.AND).toEqual([
      {
        OR: [
          { unitCode: { contains: 'balcony', mode: 'insensitive' } },
          { name: { contains: 'balcony', mode: 'insensitive' } },
          { description: { contains: 'balcony', mode: 'insensitive' } },
        ],
      },
    ]);
  });

  it('combines featureIds and global search into a single AND array', () => {
    const where = repo().buildWhere({ organizationId: 'org1', featureIds: ['f1'], global: 'gym' });
    expect(where.AND).toHaveLength(2);
  });

  it('omits AND entirely when there are no features or global search term', () => {
    const where = repo().buildWhere({ organizationId: 'org1' });
    expect(where.AND).toBeUndefined();
  });
});
