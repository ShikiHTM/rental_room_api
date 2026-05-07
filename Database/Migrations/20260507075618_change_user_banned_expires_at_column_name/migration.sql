/*
  Warnings:

  - You are about to drop the column `bannedExpiresAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "bannedExpiresAt",
ADD COLUMN     "banExpiresAt" TIMESTAMP(3);
