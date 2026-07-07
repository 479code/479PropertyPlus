import { DEFAULT_ROLES, OWNER_ROLE_KEY } from './default-roles';
import { PERMISSION_CATALOG, PERMISSION_KEYS } from './permission-catalog';

describe('permission catalog', () => {
  it('uses fine-grained resource:action keys (never coarse :write)', () => {
    for (const perm of PERMISSION_CATALOG) {
      expect(perm.key).toMatch(/^[a-z_]+:[a-z_]+$/);
      expect(perm.action).not.toBe('write');
    }
  });

  it('has no duplicate keys', () => {
    expect(new Set(PERMISSION_KEYS).size).toBe(PERMISSION_KEYS.length);
  });

  it('covers the architect-specified fine-grained actions', () => {
    for (const key of [
      'property:archive',
      'property:restore',
      'property:export',
      'lease:renew',
      'lease:terminate',
      'payment:approve',
    ]) {
      expect(PERMISSION_KEYS).toContain(key);
    }
  });
});

describe('default roles', () => {
  it('includes an Owner with every permission', () => {
    const owner = DEFAULT_ROLES.find((r) => r.key === OWNER_ROLE_KEY);
    expect(owner?.permissions).toBe('*');
  });

  it('gives Admin everything except deleting the organization', () => {
    const admin = DEFAULT_ROLES.find((r) => r.key === 'admin');
    expect(admin?.permissions).not.toContain('organization:delete');
    expect(admin?.permissions).toContain('organization:update');
  });

  it('restricts Viewer to read/export only', () => {
    const viewer = DEFAULT_ROLES.find((r) => r.key === 'viewer');
    const perms = viewer?.permissions as string[];
    expect(perms.every((k) => k.endsWith(':read') || k.endsWith(':export'))).toBe(true);
  });
});
