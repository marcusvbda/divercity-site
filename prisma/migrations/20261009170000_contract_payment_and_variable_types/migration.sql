-- CreateEnum
CREATE TYPE "ContractPaymentStatus" AS ENUM ('unpaid', 'partial', 'paid');

-- AlterTable
ALTER TABLE "contract_templates" ADD COLUMN     "variableTypes" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "contracts" ADD COLUMN     "additionalInfo" TEXT,
ADD COLUMN     "clientFilledKeys" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "paymentStatus" "ContractPaymentStatus" NOT NULL DEFAULT 'unpaid',
ADD COLUMN     "value" DECIMAL(10,2);

