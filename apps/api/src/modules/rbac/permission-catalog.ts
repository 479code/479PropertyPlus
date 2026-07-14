export interface PermissionDef {
  key: string;
  resource: string;
  action: string;
  description: string;
}

const p = (resource: string, action: string, description: string): PermissionDef => ({
  key: `${resource}:${action}`,
  resource,
  action,
  description,
});

/**
 * The complete, fine-grained (resource:action) permission catalog for the
 * platform. Permissions are global, app-defined constants; organizations grant
 * them to roles. New modules extend this list — never coarsen it.
 */
export const PERMISSION_CATALOG: PermissionDef[] = [
  p('organization', 'create', 'Create organizations'),
  p('organization', 'read', 'View organization details'),
  p('organization', 'update', 'Update organization details'),
  p('organization', 'delete', 'Delete an organization'),

  p('membership', 'read', 'View organization members'),
  p('membership', 'update', 'Update member status and roles'),
  p('membership', 'remove', 'Remove a member from the organization'),

  p('role', 'create', 'Create roles'),
  p('role', 'read', 'View roles'),
  p('role', 'update', 'Update roles'),
  p('role', 'delete', 'Delete roles'),

  p('permission', 'read', 'View the permission catalog'),

  p('invitation', 'create', 'Invite users to the organization'),
  p('invitation', 'read', 'View pending invitations'),
  p('invitation', 'resend', 'Resend an invitation'),
  p('invitation', 'cancel', 'Cancel an invitation'),

  p('configuration', 'read', 'View organization configuration'),
  p('configuration', 'create', 'Create configuration entries'),
  p('configuration', 'update', 'Update organization configuration'),
  p('configuration', 'delete', 'Delete configuration entries'),

  p('property', 'create', 'Create properties'),
  p('property', 'read', 'View properties'),
  p('property', 'update', 'Update properties'),
  p('property', 'delete', 'Delete properties'),
  p('property', 'archive', 'Archive properties'),
  p('property', 'restore', 'Restore archived properties'),
  p('property', 'export', 'Export property data'),

  p('property_image', 'create', 'Add property images'),
  p('property_image', 'update', 'Update property images'),
  p('property_image', 'delete', 'Remove property images'),
  p('property_document', 'create', 'Add property documents'),
  p('property_document', 'update', 'Update property documents'),
  p('property_document', 'delete', 'Remove property documents'),
  p('property_type', 'manage', 'Manage property types'),
  p('property_status', 'manage', 'Manage property statuses'),
  p('property_feature', 'manage', 'Manage property features'),
  p('property_tag', 'manage', 'Manage property tags'),

  p('geography', 'read', 'View geographic reference data'),
  p('geography', 'manage', 'Manage geographic reference data'),

  p('building', 'create', 'Create buildings'),
  p('building', 'read', 'View buildings'),
  p('building', 'update', 'Update buildings'),
  p('building', 'archive', 'Archive buildings'),
  p('building', 'restore', 'Restore archived buildings'),
  p('building', 'export', 'Export building data'),
  p('building_status', 'manage', 'Manage building statuses'),

  p('floor', 'create', 'Create floors'),
  p('floor', 'update', 'Update floors'),
  p('floor', 'delete', 'Delete floors'),

  p('unit', 'create', 'Create units'),
  p('unit', 'read', 'View units'),
  p('unit', 'update', 'Update units'),
  p('unit', 'archive', 'Archive units'),
  p('unit', 'restore', 'Restore archived units'),
  p('unit', 'export', 'Export unit data'),
  p('unit_image', 'create', 'Add unit images'),
  p('unit_image', 'update', 'Update unit images'),
  p('unit_image', 'delete', 'Remove unit images'),
  p('unit_document', 'create', 'Add unit documents'),
  p('unit_document', 'update', 'Update unit documents'),
  p('unit_document', 'delete', 'Remove unit documents'),
  p('unit_type', 'manage', 'Manage unit types'),
  p('unit_status', 'manage', 'Manage unit statuses'),
  p('unit_feature', 'manage', 'Manage unit features'),

  p('person', 'create', 'Create people'),
  p('person', 'read', 'View people'),
  p('person', 'update', 'Update people'),
  p('person', 'archive', 'Archive people'),
  p('person', 'restore', 'Restore archived people'),
  p('person', 'export', 'Export person data'),
  p('person_type', 'manage', 'Manage person role types'),
  p('person_tag', 'manage', 'Manage person tags'),
  p('person_document', 'create', 'Add person documents'),
  p('person_document', 'update', 'Update person documents'),
  p('person_document', 'delete', 'Remove person documents'),
  p('contact_history', 'create', 'Log a contact history entry'),
  p('contact_history', 'read', 'View contact history'),
  p('contact_history', 'delete', 'Delete a contact history entry'),
  p('emergency_contact', 'create', 'Add an emergency contact'),
  p('emergency_contact', 'update', 'Update an emergency contact'),
  p('emergency_contact', 'delete', 'Remove an emergency contact'),
  p('company', 'create', 'Create companies'),
  p('company', 'read', 'View companies'),
  p('company', 'update', 'Update companies'),
  p('company', 'delete', 'Delete companies'),
  p('owner', 'create', 'Create owner profiles'),
  p('owner', 'read', 'View owner profiles'),
  p('owner', 'update', 'Update owner profiles'),
  p('owner', 'delete', 'Delete owner profiles'),
  p('agent', 'create', 'Create agent profiles'),
  p('agent', 'read', 'View agent profiles'),
  p('agent', 'update', 'Update agent profiles'),
  p('agent', 'delete', 'Delete agent profiles'),

  p('tenant', 'create', 'Create tenants'),
  p('tenant', 'read', 'View tenants'),
  p('tenant', 'update', 'Update tenants'),
  p('tenant', 'delete', 'Delete tenants'),

  p('lease', 'create', 'Create leases'),
  p('lease', 'read', 'View leases'),
  p('lease', 'update', 'Update leases'),
  p('lease', 'approve', 'Approve/reject leases'),
  p('lease', 'activate', 'Activate (sign) leases'),
  p('lease', 'renew', 'Renew leases'),
  p('lease', 'terminate', 'Terminate leases'),
  p('lease', 'archive', 'Archive leases'),
  p('lease', 'restore', 'Restore archived leases'),
  p('lease', 'export', 'Export lease data'),
  p('lease_document', 'create', 'Add lease documents'),
  p('lease_document', 'update', 'Update lease documents'),
  p('lease_note', 'create', 'Add lease notes'),
  p('lease_timeline', 'view', 'View lease timeline'),

  p('payment', 'create', 'Record payments'),
  p('payment', 'read', 'View payments'),
  p('payment', 'update', 'Update payments'),
  p('payment', 'approve', 'Approve payments'),

  p('report', 'read', 'View reports'),
  p('report', 'export', 'Export reports'),

  p('notification', 'send', 'Send notifications'),

  p('audit', 'read', 'View the audit log'),
];

export const PERMISSION_KEYS: string[] = PERMISSION_CATALOG.map((entry) => entry.key);
