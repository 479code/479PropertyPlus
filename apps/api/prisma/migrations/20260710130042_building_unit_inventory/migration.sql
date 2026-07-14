-- CreateEnum
CREATE TYPE "UnitDocumentType" AS ENUM ('FLOOR_PLAN', 'INSPECTION_REPORT', 'WARRANTY', 'CERTIFICATE', 'MAINTENANCE_MANUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "UnitAvailability" AS ENUM ('ARCHIVED', 'INACTIVE', 'OCCUPIED', 'RESERVED', 'UNDER_MAINTENANCE', 'BLOCKED', 'AVAILABLE');

-- CreateEnum
CREATE TYPE "UnitTimelineEvent" AS ENUM ('CREATED', 'UPDATED', 'RESERVED', 'MAINTENANCE_STARTED', 'MAINTENANCE_COMPLETED', 'LEASE_STARTED', 'LEASE_ENDED', 'ARCHIVED', 'RESTORED', 'AVAILABILITY_CHANGED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NumberedEntity" ADD VALUE 'BUILDING';
ALTER TYPE "NumberedEntity" ADD VALUE 'FLOOR';
ALTER TYPE "NumberedEntity" ADD VALUE 'UNIT';

-- CreateTable
CREATE TABLE "building_statuses" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "building_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_types" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "unit_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_statuses" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "unit_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_features" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "unit_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buildings" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "buildingCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "numberOfFloors" INTEGER,
    "yearBuilt" INTEGER,
    "statusId" UUID,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "totalUnits" INTEGER NOT NULL DEFAULT 0,
    "occupiedUnits" INTEGER NOT NULL DEFAULT 0,
    "vacantUnits" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "floors" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "buildingId" UUID NOT NULL,
    "floorNumber" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "floors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "buildingId" UUID,
    "floorId" UUID,
    "unitCode" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unitTypeId" UUID NOT NULL,
    "statusId" UUID NOT NULL,
    "availability" "UnitAvailability" NOT NULL DEFAULT 'AVAILABLE',
    "isReserved" BOOLEAN NOT NULL DEFAULT false,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "kitchens" INTEGER,
    "parkingSpaces" INTEGER,
    "size" DECIMAL(12,2),
    "sizeUnit" TEXT,
    "monthlyRent" DECIMAL(18,2),
    "annualRent" DECIMAL(18,2),
    "securityDeposit" DECIMAL(18,2),
    "serviceCharge" DECIMAL(18,2),
    "expectedAnnualRevenue" DECIMAL(18,2),
    "marketValue" DECIMAL(18,2),
    "ownerType" "PropertyOwnerType",
    "ownerReferenceId" UUID,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "isRentable" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_feature_assignments" (
    "id" UUID NOT NULL,
    "unitId" UUID NOT NULL,
    "featureId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unit_feature_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_images" (
    "id" UUID NOT NULL,
    "unitId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_documents" (
    "id" UUID NOT NULL,
    "unitId" UUID NOT NULL,
    "documentType" "UnitDocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "uploadedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_timeline" (
    "id" UUID NOT NULL,
    "unitId" UUID NOT NULL,
    "eventType" "UnitTimelineEvent" NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "performedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unit_timeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_occupancy_history" (
    "id" UUID NOT NULL,
    "unitId" UUID NOT NULL,
    "previousAvailability" "UnitAvailability",
    "newAvailability" "UnitAvailability" NOT NULL,
    "reason" TEXT,
    "changedBy" UUID,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unit_occupancy_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "building_statuses_organizationId_idx" ON "building_statuses"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "building_statuses_organizationId_name_key" ON "building_statuses"("organizationId", "name");

-- CreateIndex
CREATE INDEX "unit_types_organizationId_idx" ON "unit_types"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "unit_types_organizationId_name_key" ON "unit_types"("organizationId", "name");

-- CreateIndex
CREATE INDEX "unit_statuses_organizationId_idx" ON "unit_statuses"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "unit_statuses_organizationId_name_key" ON "unit_statuses"("organizationId", "name");

-- CreateIndex
CREATE INDEX "unit_features_organizationId_idx" ON "unit_features"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "unit_features_organizationId_name_key" ON "unit_features"("organizationId", "name");

-- CreateIndex
CREATE INDEX "buildings_organizationId_idx" ON "buildings"("organizationId");

-- CreateIndex
CREATE INDEX "buildings_propertyId_idx" ON "buildings"("propertyId");

-- CreateIndex
CREATE INDEX "buildings_statusId_idx" ON "buildings"("statusId");

-- CreateIndex
CREATE INDEX "buildings_deletedAt_idx" ON "buildings"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "buildings_organizationId_buildingCode_key" ON "buildings"("organizationId", "buildingCode");

-- CreateIndex
CREATE INDEX "floors_organizationId_idx" ON "floors"("organizationId");

-- CreateIndex
CREATE INDEX "floors_buildingId_idx" ON "floors"("buildingId");

-- CreateIndex
CREATE INDEX "units_organizationId_idx" ON "units"("organizationId");

-- CreateIndex
CREATE INDEX "units_propertyId_idx" ON "units"("propertyId");

-- CreateIndex
CREATE INDEX "units_buildingId_idx" ON "units"("buildingId");

-- CreateIndex
CREATE INDEX "units_floorId_idx" ON "units"("floorId");

-- CreateIndex
CREATE INDEX "units_unitTypeId_idx" ON "units"("unitTypeId");

-- CreateIndex
CREATE INDEX "units_statusId_idx" ON "units"("statusId");

-- CreateIndex
CREATE INDEX "units_availability_idx" ON "units"("availability");

-- CreateIndex
CREATE INDEX "units_deletedAt_idx" ON "units"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "units_organizationId_unitCode_key" ON "units"("organizationId", "unitCode");

-- CreateIndex
CREATE UNIQUE INDEX "units_organizationId_slug_key" ON "units"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "unit_feature_assignments_featureId_idx" ON "unit_feature_assignments"("featureId");

-- CreateIndex
CREATE UNIQUE INDEX "unit_feature_assignments_unitId_featureId_key" ON "unit_feature_assignments"("unitId", "featureId");

-- CreateIndex
CREATE INDEX "unit_images_unitId_idx" ON "unit_images"("unitId");

-- CreateIndex
CREATE INDEX "unit_documents_unitId_idx" ON "unit_documents"("unitId");

-- CreateIndex
CREATE INDEX "unit_documents_documentType_idx" ON "unit_documents"("documentType");

-- CreateIndex
CREATE INDEX "unit_timeline_unitId_idx" ON "unit_timeline"("unitId");

-- CreateIndex
CREATE INDEX "unit_timeline_eventType_idx" ON "unit_timeline"("eventType");

-- CreateIndex
CREATE INDEX "unit_occupancy_history_unitId_idx" ON "unit_occupancy_history"("unitId");

-- AddForeignKey
ALTER TABLE "building_statuses" ADD CONSTRAINT "building_statuses_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_types" ADD CONSTRAINT "unit_types_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_statuses" ADD CONSTRAINT "unit_statuses_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_features" ADD CONSTRAINT "unit_features_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "building_statuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "floors" ADD CONSTRAINT "floors_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "floors" ADD CONSTRAINT "floors_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "floors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_unitTypeId_fkey" FOREIGN KEY ("unitTypeId") REFERENCES "unit_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "unit_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_feature_assignments" ADD CONSTRAINT "unit_feature_assignments_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_feature_assignments" ADD CONSTRAINT "unit_feature_assignments_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "unit_features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_images" ADD CONSTRAINT "unit_images_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_documents" ADD CONSTRAINT "unit_documents_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_timeline" ADD CONSTRAINT "unit_timeline_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_occupancy_history" ADD CONSTRAINT "unit_occupancy_history_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
