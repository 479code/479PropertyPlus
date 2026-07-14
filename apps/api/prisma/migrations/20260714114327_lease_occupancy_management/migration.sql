-- CreateEnum
CREATE TYPE "LeaseTenantRole" AS ENUM ('PRIMARY', 'CO_TENANT', 'OCCUPANT', 'AUTHORIZED_REPRESENTATIVE');

-- CreateEnum
CREATE TYPE "LeaseDocumentType" AS ENUM ('LEASE_AGREEMENT', 'SIGNED_CONTRACT', 'ADDENDUM', 'IDENTITY_DOCUMENT', 'INSPECTION_REPORT', 'HANDOVER_REPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "LeaseTimelineEvent" AS ENUM ('CREATED', 'SUBMITTED', 'APPROVED', 'REJECTED', 'SIGNED', 'ACTIVATED', 'RENEWAL_INITIATED', 'RENEWED', 'EXTENDED', 'EXPIRED', 'TERMINATED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "lease_types" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "lease_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_frequencies" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "payment_frequencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lease_statuses" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "blocksUnitAvailability" BOOLEAN NOT NULL DEFAULT false,
    "countsAsOccupancy" BOOLEAN NOT NULL DEFAULT false,
    "isSystem" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "lease_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lease_state_transitions" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "fromStatusId" UUID NOT NULL,
    "toStatusId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lease_state_transitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leases" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "leaseNumber" TEXT NOT NULL,
    "leaseReference" TEXT,
    "slug" TEXT NOT NULL,
    "propertyId" UUID NOT NULL,
    "buildingId" UUID,
    "unitId" UUID NOT NULL,
    "primaryTenantId" UUID NOT NULL,
    "leaseTypeId" UUID NOT NULL,
    "leaseStatusId" UUID NOT NULL,
    "leaseStartDate" TIMESTAMP(3) NOT NULL,
    "leaseEndDate" TIMESTAMP(3) NOT NULL,
    "moveInDate" TIMESTAMP(3),
    "moveOutDate" TIMESTAMP(3),
    "leaseDurationMonths" INTEGER,
    "renewalNoticeDays" INTEGER,
    "gracePeriodDays" INTEGER,
    "securityDeposit" DECIMAL(18,2),
    "monthlyRent" DECIMAL(18,2),
    "annualRent" DECIMAL(18,2),
    "serviceCharge" DECIMAL(18,2),
    "utilityCharge" DECIMAL(18,2),
    "parkingCharge" DECIMAL(18,2),
    "discount" DECIMAL(18,2),
    "taxAmount" DECIMAL(18,2),
    "totalRecurringAmount" DECIMAL(18,2),
    "paymentFrequencyId" UUID,
    "billingCycle" TEXT,
    "nextInvoiceDate" TIMESTAMP(3),
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "signedDate" TIMESTAMP(3),
    "terminationDate" TIMESTAMP(3),
    "terminationReason" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "leases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lease_tenants" (
    "id" UUID NOT NULL,
    "leaseId" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "role" "LeaseTenantRole" NOT NULL DEFAULT 'CO_TENANT',
    "ownershipPercentage" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lease_tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lease_guarantors" (
    "id" UUID NOT NULL,
    "leaseId" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "guaranteeType" TEXT,
    "guaranteeAmount" DECIMAL(18,2),
    "relationshipToTenant" TEXT,
    "status" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lease_guarantors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lease_documents" (
    "id" UUID NOT NULL,
    "leaseId" UUID NOT NULL,
    "documentType" "LeaseDocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "uploadedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lease_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lease_timeline_entries" (
    "id" UUID NOT NULL,
    "leaseId" UUID NOT NULL,
    "eventType" "LeaseTimelineEvent" NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "performedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lease_timeline_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lease_notes" (
    "id" UUID NOT NULL,
    "leaseId" UUID NOT NULL,
    "authorId" UUID,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lease_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lease_types_organizationId_idx" ON "lease_types"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "lease_types_organizationId_name_key" ON "lease_types"("organizationId", "name");

-- CreateIndex
CREATE INDEX "payment_frequencies_organizationId_idx" ON "payment_frequencies"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_frequencies_organizationId_name_key" ON "payment_frequencies"("organizationId", "name");

-- CreateIndex
CREATE INDEX "lease_statuses_organizationId_idx" ON "lease_statuses"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "lease_statuses_organizationId_key_key" ON "lease_statuses"("organizationId", "key");

-- CreateIndex
CREATE INDEX "lease_state_transitions_organizationId_idx" ON "lease_state_transitions"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "lease_state_transitions_organizationId_fromStatusId_toStatu_key" ON "lease_state_transitions"("organizationId", "fromStatusId", "toStatusId");

-- CreateIndex
CREATE INDEX "leases_organizationId_idx" ON "leases"("organizationId");

-- CreateIndex
CREATE INDEX "leases_unitId_idx" ON "leases"("unitId");

-- CreateIndex
CREATE INDEX "leases_leaseStatusId_idx" ON "leases"("leaseStatusId");

-- CreateIndex
CREATE INDEX "leases_primaryTenantId_idx" ON "leases"("primaryTenantId");

-- CreateIndex
CREATE INDEX "leases_leaseStartDate_idx" ON "leases"("leaseStartDate");

-- CreateIndex
CREATE INDEX "leases_leaseEndDate_idx" ON "leases"("leaseEndDate");

-- CreateIndex
CREATE INDEX "leases_deletedAt_idx" ON "leases"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "leases_organizationId_leaseNumber_key" ON "leases"("organizationId", "leaseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "leases_organizationId_slug_key" ON "leases"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "lease_tenants_personId_idx" ON "lease_tenants"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "lease_tenants_leaseId_personId_key" ON "lease_tenants"("leaseId", "personId");

-- CreateIndex
CREATE INDEX "lease_guarantors_personId_idx" ON "lease_guarantors"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "lease_guarantors_leaseId_personId_key" ON "lease_guarantors"("leaseId", "personId");

-- CreateIndex
CREATE INDEX "lease_documents_leaseId_idx" ON "lease_documents"("leaseId");

-- CreateIndex
CREATE INDEX "lease_timeline_entries_leaseId_idx" ON "lease_timeline_entries"("leaseId");

-- CreateIndex
CREATE INDEX "lease_notes_leaseId_idx" ON "lease_notes"("leaseId");

-- AddForeignKey
ALTER TABLE "lease_state_transitions" ADD CONSTRAINT "lease_state_transitions_fromStatusId_fkey" FOREIGN KEY ("fromStatusId") REFERENCES "lease_statuses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lease_state_transitions" ADD CONSTRAINT "lease_state_transitions_toStatusId_fkey" FOREIGN KEY ("toStatusId") REFERENCES "lease_statuses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_primaryTenantId_fkey" FOREIGN KEY ("primaryTenantId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_leaseTypeId_fkey" FOREIGN KEY ("leaseTypeId") REFERENCES "lease_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_leaseStatusId_fkey" FOREIGN KEY ("leaseStatusId") REFERENCES "lease_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_paymentFrequencyId_fkey" FOREIGN KEY ("paymentFrequencyId") REFERENCES "payment_frequencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lease_tenants" ADD CONSTRAINT "lease_tenants_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "leases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lease_tenants" ADD CONSTRAINT "lease_tenants_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lease_guarantors" ADD CONSTRAINT "lease_guarantors_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "leases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lease_guarantors" ADD CONSTRAINT "lease_guarantors_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lease_documents" ADD CONSTRAINT "lease_documents_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "leases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lease_timeline_entries" ADD CONSTRAINT "lease_timeline_entries_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "leases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lease_notes" ADD CONSTRAINT "lease_notes_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "leases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
