/*
  Warnings:

  - You are about to drop the `ProcessStep` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProcessStep" DROP CONSTRAINT "ProcessStep_projectId_fkey";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "process" TEXT;

-- DropTable
DROP TABLE "ProcessStep";
