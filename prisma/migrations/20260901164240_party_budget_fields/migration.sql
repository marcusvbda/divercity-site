-- CreateEnum
CREATE TYPE "PartyPaymentOption" AS ENUM ('salon_only', 'salon_and_passports');

-- CreateEnum
CREATE TYPE "PartyPaymentStatus" AS ENUM ('pending', 'paid', 'failed');

-- AlterTable
ALTER TABLE "contract_templates" ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "parties" ADD COLUMN     "adultsCount" INTEGER,
ADD COLUMN     "childrenCount" INTEGER,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "passportPackagePrice" DECIMAL(10,2),
ADD COLUMN     "paymentOption" "PartyPaymentOption",
ADD COLUMN     "paymentStatus" "PartyPaymentStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN     "salonPrice" DECIMAL(10,2),
ADD COLUMN     "stripeCheckoutSessionId" TEXT,
ADD COLUMN     "stripePaymentIntentId" TEXT,
ADD COLUMN     "termsAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "totalParticipants" INTEGER,
ADD COLUMN     "totalPrice" DECIMAL(10,2);

-- CreateIndex
CREATE UNIQUE INDEX "parties_stripeCheckoutSessionId_key" ON "parties"("stripeCheckoutSessionId");
