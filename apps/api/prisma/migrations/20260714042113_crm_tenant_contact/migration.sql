-- CreateEnum
CREATE TYPE "PersonDocumentType" AS ENUM ('PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENCE', 'UTILITY_BILL', 'EMPLOYMENT_LETTER', 'COMPANY_REGISTRATION', 'TAX_CERTIFICATE', 'OTHER');

-- CreateEnum
CREATE TYPE "ContactHistoryType" AS ENUM ('CALL', 'EMAIL', 'MEETING', 'NOTE', 'SMS', 'WHATSAPP');

-- AlterEnum
ALTER TYPE "NumberedEntity" ADD VALUE 'PERSON';

-- CreateTable
CREATE TABLE "person_types" (
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

    CONSTRAINT "person_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_tags" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "person_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "people" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "personCode" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "gender" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "maritalStatus" TEXT,
    "nationality" TEXT,
    "occupation" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "alternatePhone" TEXT,
    "profilePhoto" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "identificationType" TEXT,
    "identificationNumber" TEXT,
    "identificationExpiry" TIMESTAMP(3),
    "taxIdentificationNumber" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "people_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_roles" (
    "id" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "personTypeId" UUID NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "person_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "companyName" TEXT NOT NULL,
    "registrationNumber" TEXT,
    "taxNumber" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "address" TEXT,
    "contactPersonId" UUID,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_profiles" (
    "id" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "companyId" UUID,
    "employmentStatus" TEXT,
    "employer" TEXT,
    "monthlyIncome" DECIMAL(18,2),
    "preferredPaymentMethod" TEXT,
    "preferredCommunication" TEXT,
    "riskRating" TEXT,
    "creditScore" INTEGER,
    "status" TEXT,
    "defaultGuarantorPersonId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "tenant_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_profiles" (
    "id" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "agencyName" TEXT,
    "commissionRate" DECIMAL(5,2),
    "licenceNumber" TEXT,
    "territory" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "agent_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owner_profiles" (
    "id" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "ownershipType" TEXT,
    "bankDetails" JSONB,
    "payoutPreference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "owner_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_contacts" (
    "id" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "contactPersonId" UUID NOT NULL,
    "relationship" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_documents" (
    "id" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "documentType" "PersonDocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "uploadedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "person_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_tag_assignments" (
    "id" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "tagId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "person_tag_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_history_entries" (
    "id" UUID NOT NULL,
    "personId" UUID NOT NULL,
    "type" "ContactHistoryType" NOT NULL,
    "subject" TEXT,
    "notes" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "performedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_history_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "person_types_organizationId_idx" ON "person_types"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "person_types_organizationId_name_key" ON "person_types"("organizationId", "name");

-- CreateIndex
CREATE INDEX "person_tags_organizationId_idx" ON "person_tags"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "person_tags_organizationId_name_key" ON "person_tags"("organizationId", "name");

-- CreateIndex
CREATE INDEX "people_organizationId_idx" ON "people"("organizationId");

-- CreateIndex
CREATE INDEX "people_deletedAt_idx" ON "people"("deletedAt");

-- CreateIndex
CREATE INDEX "people_email_idx" ON "people"("email");

-- CreateIndex
CREATE INDEX "people_phone_idx" ON "people"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "people_organizationId_personCode_key" ON "people"("organizationId", "personCode");

-- CreateIndex
CREATE UNIQUE INDEX "people_organizationId_slug_key" ON "people"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "person_roles_personId_idx" ON "person_roles"("personId");

-- CreateIndex
CREATE INDEX "person_roles_personTypeId_idx" ON "person_roles"("personTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "person_roles_personId_personTypeId_key" ON "person_roles"("personId", "personTypeId");

-- CreateIndex
CREATE INDEX "companies_organizationId_idx" ON "companies"("organizationId");

-- CreateIndex
CREATE INDEX "companies_deletedAt_idx" ON "companies"("deletedAt");

-- CreateIndex
CREATE INDEX "companies_contactPersonId_idx" ON "companies"("contactPersonId");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_profiles_personId_key" ON "tenant_profiles"("personId");

-- CreateIndex
CREATE INDEX "tenant_profiles_companyId_idx" ON "tenant_profiles"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "agent_profiles_personId_key" ON "agent_profiles"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "owner_profiles_personId_key" ON "owner_profiles"("personId");

-- CreateIndex
CREATE INDEX "emergency_contacts_personId_idx" ON "emergency_contacts"("personId");

-- CreateIndex
CREATE INDEX "emergency_contacts_contactPersonId_idx" ON "emergency_contacts"("contactPersonId");

-- CreateIndex
CREATE UNIQUE INDEX "emergency_contacts_personId_contactPersonId_key" ON "emergency_contacts"("personId", "contactPersonId");

-- CreateIndex
CREATE INDEX "person_documents_personId_idx" ON "person_documents"("personId");

-- CreateIndex
CREATE INDEX "person_documents_documentType_idx" ON "person_documents"("documentType");

-- CreateIndex
CREATE INDEX "person_tag_assignments_tagId_idx" ON "person_tag_assignments"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "person_tag_assignments_personId_tagId_key" ON "person_tag_assignments"("personId", "tagId");

-- CreateIndex
CREATE INDEX "contact_history_entries_personId_idx" ON "contact_history_entries"("personId");

-- CreateIndex
CREATE INDEX "contact_history_entries_type_idx" ON "contact_history_entries"("type");

-- CreateIndex
CREATE INDEX "contact_history_entries_occurredAt_idx" ON "contact_history_entries"("occurredAt");

-- AddForeignKey
ALTER TABLE "person_types" ADD CONSTRAINT "person_types_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_tags" ADD CONSTRAINT "person_tags_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "people" ADD CONSTRAINT "people_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_roles" ADD CONSTRAINT "person_roles_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_roles" ADD CONSTRAINT "person_roles_personTypeId_fkey" FOREIGN KEY ("personTypeId") REFERENCES "person_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_contactPersonId_fkey" FOREIGN KEY ("contactPersonId") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_profiles" ADD CONSTRAINT "tenant_profiles_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_profiles" ADD CONSTRAINT "tenant_profiles_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_profiles" ADD CONSTRAINT "agent_profiles_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owner_profiles" ADD CONSTRAINT "owner_profiles_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_contactPersonId_fkey" FOREIGN KEY ("contactPersonId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_documents" ADD CONSTRAINT "person_documents_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_tag_assignments" ADD CONSTRAINT "person_tag_assignments_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_tag_assignments" ADD CONSTRAINT "person_tag_assignments_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "person_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_history_entries" ADD CONSTRAINT "contact_history_entries_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;
