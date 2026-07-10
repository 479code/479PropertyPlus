import { PERMISSION_KEYS } from './permission-catalog';

export interface DefaultRoleDef {
  key: string;
  name: string;
  description: string;
  /** Explicit permission keys, or '*' for every permission in the catalog. */
  permissions: string[] | '*';
}

export const OWNER_ROLE_KEY = 'owner';

const readOnly = PERMISSION_KEYS.filter((k) => k.endsWith(':read') || k.endsWith(':export'));

const managerPermissions = PERMISSION_KEYS.filter((k) => {
  const [resource, action] = k.split(':');
  if (['property', 'tenant', 'lease'].includes(resource)) return true;
  if (resource.startsWith('property_')) return true;
  if (['building', 'floor', 'unit'].includes(resource)) return true;
  if (resource.startsWith('building_') || resource.startsWith('unit_')) return true;
  if (resource === 'geography') return action === 'read';
  if (resource === 'payment') return ['create', 'read', 'update'].includes(action);
  if (resource === 'report') return true;
  if (resource === 'notification') return action === 'send';
  if (resource === 'configuration') return action === 'read';
  if (resource === 'audit') return action === 'read';
  if (resource === 'membership') return action === 'read';
  return false;
});

/**
 * System roles seeded into every organization at creation. `isSystem` roles are
 * protected from deletion; organizations may add their own roles on top.
 */
export const DEFAULT_ROLES: DefaultRoleDef[] = [
  {
    key: OWNER_ROLE_KEY,
    name: 'Owner',
    description: 'Full, unrestricted control of the organization',
    permissions: '*',
  },
  {
    key: 'admin',
    name: 'Administrator',
    description: 'Manage the organization and its members, except deleting the organization',
    permissions: PERMISSION_KEYS.filter((k) => k !== 'organization:delete'),
  },
  {
    key: 'manager',
    name: 'Manager',
    description: 'Day-to-day operational access to properties, tenants, leases and payments',
    permissions: managerPermissions,
  },
  {
    key: 'viewer',
    name: 'Viewer',
    description: 'Read-only access across the organization',
    permissions: readOnly,
  },
];
