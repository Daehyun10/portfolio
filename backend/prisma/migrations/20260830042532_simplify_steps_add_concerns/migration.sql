/*
  Warnings:

  - You are about to drop the column `body` on the `ProcessStep` table. All the data in the column will be lost.
  - You are about to drop the column `period` on the `ProcessStep` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProcessStep" DROP COLUMN "body",
DROP COLUMN "period";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "concerns" TEXT;
