import { PropertyRepository } from './property.repository';

describe('PropertyRepository.buildWhere', () => {
  const repo = new PropertyRepository({} as never);

  it('always scopes to the organization and excludes archived by default', () => {
    const where = repo.buildWhere({ organizationId: 'org1' }) as Record<string, unknown>;
    expect(where.organizationId).toBe('org1');
    expect(where.deletedAt).toBeNull();
  });

  it('includes archived when requested', () => {
    const where = repo.buildWhere({ organizationId: 'org1', includeArchived: true }) as Record<
      string,
      unknown
    >;
    expect(where.deletedAt).toBeUndefined();
  });

  it('builds case-insensitive text filters and range filters', () => {
    const where = repo.buildWhere({
      organizationId: 'o',
      name: 'villa',
      marketValueMin: 100,
      marketValueMax: 500,
    }) as Record<string, unknown>;
    expect(where.name).toEqual({ contains: 'villa', mode: 'insensitive' });
    expect(where.marketValue).toEqual({ gte: 100, lte: 500 });
  });

  it('AND-composes feature filters and OR-composes tags', () => {
    const where = repo.buildWhere({
      organizationId: 'o',
      featureIds: ['f1', 'f2'],
      tagIds: ['t1', 't2'],
    }) as Record<string, unknown>;
    expect(where.AND).toEqual([
      { features: { some: { featureId: 'f1' } } },
      { features: { some: { featureId: 'f2' } } },
      { tags: { some: { tagId: { in: ['t1', 't2'] } } } },
    ]);
  });
});
