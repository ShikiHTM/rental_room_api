/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `PasswordResetTokens` will be added. If there are existing duplicate values, this will fail.
  - Made the column `createdAt` on table `PasswordResetTokens` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PasswordResetTokens" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetTokens_token_key" ON "PasswordResetTokens"("token");
