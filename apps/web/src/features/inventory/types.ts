export type UnitAvailability =
  'ARCHIVED' | 'INACTIVE' | 'OCCUPIED' | 'RESERVED' | 'UNDER_MAINTENANCE' | 'BLOCKED' | 'AVAILABLE';

export type UnitOwnerType = 'INDIVIDUAL' | 'COMPANY' | 'GOVERNMENT' | 'TRUST' | 'OTHER';

export type UnitDocumentType =
  'FLOOR_PLAN' | 'INSPECTION_REPORT' | 'WARRANTY' | 'CERTIFICATE' | 'MAINTENANCE_MANUAL' | 'OTHER';

export interface AuditFields {
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
}

export interface BuildingStatus extends AuditFields {
  id: string;
  organizationId: string;
  name: string;
  color: string | null;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface UnitType extends AuditFields {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface UnitStatus extends AuditFields {
  id: string;
  organizationId: string;
  name: string;
  color: string | null;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface UnitFeature extends AuditFields {
  id: string;
  organizationId: string;
  name: string;
  icon: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface Building extends AuditFields {
  id: string;
  organizationId: string;
  propertyId: string;
  buildingCode: string;
  name: string;
  description: string | null;
  numberOfFloors: number | null;
  yearBuilt: number | null;
  statusId: string | null;
  status: BuildingStatus | null;
  property: { id: string; name: string; propertyCode: string };
  latitude: number | null;
  longitude: number | null;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  isActive: boolean;
}

export interface Floor extends AuditFields {
  id: string;
  organizationId: string;
  buildingId: string;
  floorNumber: number | null;
  name: string;
  description: string | null;
  sortOrder: number;
}

export interface UnitFeatureAssignment {
  featureId: string;
  feature: UnitFeature;
}

export interface Unit extends AuditFields {
  id: string;
  organizationId: string;
  propertyId: string;
  buildingId: string | null;
  building: { id: string; name: string; buildingCode: string } | null;
  floorId: string | null;
  floor: { id: string; name: string } | null;
  unitCode: string;
  slug: string;
  name: string;
  description: string | null;
  unitTypeId: string;
  unitType: UnitType;
  statusId: string;
  status: UnitStatus;
  availability: UnitAvailability;
  isReserved: boolean;
  isBlocked: boolean;
  bedrooms: number | null;
  bathrooms: number | null;
  kitchens: number | null;
  parkingSpaces: number | null;
  size: number | null;
  sizeUnit: string | null;
  monthlyRent: number | null;
  annualRent: number | null;
  securityDeposit: number | null;
  serviceCharge: number | null;
  expectedAnnualRevenue: number | null;
  marketValue: number | null;
  ownerType: UnitOwnerType | null;
  ownerReferenceId: string | null;
  latitude: number | null;
  longitude: number | null;
  isRentable: boolean;
  isActive: boolean;
  features: UnitFeatureAssignment[];
}

export interface UnitTimelineEntry {
  id: string;
  unitId: string;
  eventType: string;
  description: string | null;
  metadata: unknown;
  performedBy: string | null;
  createdAt: string;
}

export interface UnitOccupancyHistoryEntry {
  id: string;
  unitId: string;
  previousAvailability: UnitAvailability | null;
  newAvailability: UnitAvailability;
  reason: string | null;
  changedBy: string | null;
  changedAt: string;
}

export interface UnitImage {
  id: string;
  unitId: string;
  url: string;
  caption: string | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UnitDocument {
  id: string;
  unitId: string;
  documentType: UnitDocumentType;
  name: string;
  url: string;
  description: string | null;
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BuildingSummary {
  building: {
    id: string;
    name: string;
    buildingCode: string;
    totalUnits: number;
    occupiedUnits: number;
    vacantUnits: number;
  };
  floors: Array<{ id: string; name: string; floorNumber: number | null }>;
  units: { total: number; byAvailability: Record<string, number> };
  occupancyRate: number;
  revenue: { expectedAnnual: number; current: number };
}

export interface PropertyInventorySummary {
  totalBuildings: number;
  totalFloors: number;
  totalUnits: number;
  availableUnits: number;
  occupiedUnits: number;
  reservedUnits: number;
  maintenanceUnits: number;
  vacantUnits: number;
  expectedRevenue: number;
  occupancyPercentage: number;
  vacancyPercentage: number;
}
