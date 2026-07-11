/*
  Warnings:

  - Added the required column `clientName` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_leadId_fkey";

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "clientName" TEXT NOT NULL,
ALTER COLUMN "leadId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
