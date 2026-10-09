DELETE FROM "ticket_orders";

-- CreateEnum
CREATE TYPE "TicketPassKind" AS ENUM ('child', 'group_companion');

-- CreateEnum
CREATE TYPE "TicketPassStatus" AS ENUM ('not_used', 'checked_in', 'checked_out');

-- AlterEnum
BEGIN;
CREATE TYPE "TicketOrderStatus_new" AS ENUM ('pending_payment', 'paid', 'payment_failed', 'cancelled');
ALTER TABLE "ticket_orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ticket_orders" ALTER COLUMN "status" TYPE "TicketOrderStatus_new" USING ("status"::text::"TicketOrderStatus_new");
ALTER TYPE "TicketOrderStatus" RENAME TO "TicketOrderStatus_old";
ALTER TYPE "TicketOrderStatus_new" RENAME TO "TicketOrderStatus";
DROP TYPE "TicketOrderStatus_old";
ALTER TABLE "ticket_orders" ALTER COLUMN "status" SET DEFAULT 'pending_payment';
COMMIT;

-- DropForeignKey
ALTER TABLE "ticket_orders" DROP CONSTRAINT "ticket_orders_checkedInById_fkey";

-- DropForeignKey
ALTER TABLE "ticket_orders" DROP CONSTRAINT "ticket_orders_checkedOutById_fkey";

-- AlterTable
ALTER TABLE "ticket_orders" DROP COLUMN "checkedInAt",
DROP COLUMN "checkedInById",
DROP COLUMN "checkedOutAt",
DROP COLUMN "checkedOutById",
DROP COLUMN "contractedDurationMinutes",
DROP COLUMN "overtimeMinutes";

-- CreateTable
CREATE TABLE "ticket_passes" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "kind" "TicketPassKind" NOT NULL,
    "status" "TicketPassStatus" NOT NULL DEFAULT 'not_used',
    "childId" TEXT,
    "companionId" TEXT,
    "contractedDurationMinutes" INTEGER NOT NULL,
    "checkedInAt" TIMESTAMP(3),
    "checkedInById" TEXT,
    "checkedOutAt" TIMESTAMP(3),
    "checkedOutById" TEXT,
    "overtimeMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_passes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ticket_passes_shortCode_key" ON "ticket_passes"("shortCode");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_passes_childId_key" ON "ticket_passes"("childId");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_passes_companionId_key" ON "ticket_passes"("companionId");

-- CreateIndex
CREATE INDEX "ticket_passes_orderId_idx" ON "ticket_passes"("orderId");

-- AddForeignKey
ALTER TABLE "ticket_passes" ADD CONSTRAINT "ticket_passes_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ticket_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_passes" ADD CONSTRAINT "ticket_passes_childId_fkey" FOREIGN KEY ("childId") REFERENCES "ticket_children"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_passes" ADD CONSTRAINT "ticket_passes_companionId_fkey" FOREIGN KEY ("companionId") REFERENCES "ticket_companions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_passes" ADD CONSTRAINT "ticket_passes_checkedInById_fkey" FOREIGN KEY ("checkedInById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_passes" ADD CONSTRAINT "ticket_passes_checkedOutById_fkey" FOREIGN KEY ("checkedOutById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

