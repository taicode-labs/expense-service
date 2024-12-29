/*
  Warnings:

  - Added the required column `metadata` to the `BillingUsage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BillingUsage" ADD COLUMN     "metadata" JSONB NOT NULL;
