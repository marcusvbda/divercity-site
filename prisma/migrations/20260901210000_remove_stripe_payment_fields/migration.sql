-- DropIndex
DROP INDEX "parties_stripeCheckoutSessionId_key";

-- AlterTable
ALTER TABLE "parties" DROP COLUMN "paidAt",
DROP COLUMN "passportPackagesCount",
DROP COLUMN "paymentStatus",
DROP COLUMN "stripeCheckoutSessionId",
DROP COLUMN "stripePaymentIntentId";

-- DropEnum
DROP TYPE "PartyPaymentStatus";
