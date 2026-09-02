-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'operator');

-- CreateEnum
CREATE TYPE "TicketOrderStatus" AS ENUM ('pending_payment', 'paid', 'payment_failed', 'cancelled', 'checked_in', 'checked_out');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'operator',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passport_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "weekdayChildPrice" DECIMAL(10,2) NOT NULL,
    "weekendChildPrice" DECIMAL(10,2) NOT NULL,
    "weekdayCompanionPrice" DECIMAL(10,2) NOT NULL,
    "weekendCompanionPrice" DECIMAL(10,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "passport_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_orders" (
    "id" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "status" "TicketOrderStatus" NOT NULL DEFAULT 'pending_payment',
    "guardianName" TEXT NOT NULL,
    "guardianEmail" TEXT NOT NULL,
    "guardianPhone" TEXT NOT NULL,
    "guardianWhatsapp" TEXT NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "stripeCheckoutSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "paidAt" TIMESTAMP(3),
    "contractedDurationMinutes" INTEGER,
    "checkedInAt" TIMESTAMP(3),
    "checkedInById" TEXT,
    "checkedOutAt" TIMESTAMP(3),
    "checkedOutById" TEXT,
    "overtimeMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_children" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "passportTypeId" TEXT NOT NULL,
    "isPNE" BOOLEAN NOT NULL DEFAULT false,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "hasCompanion" BOOLEAN,
    "unaccompaniedTermsAcceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_children_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_companions" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "linkedChildId" TEXT,
    "passportTypeId" TEXT,
    "unitPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_companions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_orders_shortCode_key" ON "ticket_orders"("shortCode");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_orders_stripeCheckoutSessionId_key" ON "ticket_orders"("stripeCheckoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_companions_linkedChildId_key" ON "ticket_companions"("linkedChildId");

-- AddForeignKey
ALTER TABLE "ticket_orders" ADD CONSTRAINT "ticket_orders_checkedInById_fkey" FOREIGN KEY ("checkedInById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_orders" ADD CONSTRAINT "ticket_orders_checkedOutById_fkey" FOREIGN KEY ("checkedOutById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_children" ADD CONSTRAINT "ticket_children_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ticket_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_children" ADD CONSTRAINT "ticket_children_passportTypeId_fkey" FOREIGN KEY ("passportTypeId") REFERENCES "passport_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_companions" ADD CONSTRAINT "ticket_companions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ticket_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_companions" ADD CONSTRAINT "ticket_companions_linkedChildId_fkey" FOREIGN KEY ("linkedChildId") REFERENCES "ticket_children"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_companions" ADD CONSTRAINT "ticket_companions_passportTypeId_fkey" FOREIGN KEY ("passportTypeId") REFERENCES "passport_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

