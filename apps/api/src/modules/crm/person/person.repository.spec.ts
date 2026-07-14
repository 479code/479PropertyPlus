import { PersonRepository } from './person.repository';

function repo(): PersonRepository {
  return new PersonRepository({} as never);
}

describe('PersonRepository.buildWhere', () => {
  it('scopes to the organization and excludes archived people by default', () => {
    const where = repo().buildWhere({ organizationId: 'org1' });
    expect(where.organizationId).toBe('org1');
    expect(where.deletedAt).toBeNull();
  });

  it('includes archived people when includeArchived is true', () => {
    const where = repo().buildWhere({ organizationId: 'org1', includeArchived: true });
    expect(where.deletedAt).toBeUndefined();
  });

  it('applies case-insensitive contains filters for code/name/phone/email/identificationNumber', () => {
    const where = repo().buildWhere({
      organizationId: 'org1',
      code: 'PER-1',
      name: 'Ada',
      phone: '0800',
      email: 'ada@',
      identificationNumber: 'A123',
    });
    expect(where.personCode).toEqual({ contains: 'PER-1', mode: 'insensitive' });
    expect(where.fullName).toEqual({ contains: 'Ada', mode: 'insensitive' });
    expect(where.phone).toEqual({ contains: '0800', mode: 'insensitive' });
    expect(where.email).toEqual({ contains: 'ada@', mode: 'insensitive' });
    expect(where.identificationNumber).toEqual({ contains: 'A123', mode: 'insensitive' });
  });

  it('filters by companyId via the tenantProfile relation', () => {
    const where = repo().buildWhere({ organizationId: 'org1', companyId: 'co1' });
    expect(where.tenantProfile).toEqual({ companyId: 'co1' });
  });

  it('filters by held role via the roles relation', () => {
    const where = repo().buildWhere({ organizationId: 'org1', personTypeId: 'pt1' });
    expect(where.roles).toEqual({ some: { personTypeId: 'pt1' } });
  });

  it('ANDs one tag-assignment clause per requested tagId', () => {
    const where = repo().buildWhere({ organizationId: 'org1', tagIds: ['t1', 't2'] });
    expect(where.AND).toEqual([
      { tagAssignments: { some: { tagId: 't1' } } },
      { tagAssignments: { some: { tagId: 't2' } } },
    ]);
  });

  it('adds a global OR search across code/name/email/phone', () => {
    const where = repo().buildWhere({ organizationId: 'org1', global: 'ada' });
    expect(where.AND).toEqual([
      {
        OR: [
          { personCode: { contains: 'ada', mode: 'insensitive' } },
          { fullName: { contains: 'ada', mode: 'insensitive' } },
          { email: { contains: 'ada', mode: 'insensitive' } },
          { phone: { contains: 'ada', mode: 'insensitive' } },
        ],
      },
    ]);
  });

  it('combines tagIds and global search into a single AND array', () => {
    const where = repo().buildWhere({ organizationId: 'org1', tagIds: ['t1'], global: 'ada' });
    expect(where.AND).toHaveLength(2);
  });

  it('omits AND entirely when there are no tags or global search term', () => {
    const where = repo().buildWhere({ organizationId: 'org1' });
    expect(where.AND).toBeUndefined();
  });
});
