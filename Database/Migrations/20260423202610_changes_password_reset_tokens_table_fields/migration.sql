/*
  Warnings:

  - The primary key for the `PasswordResetTokens` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `email` on the `PasswordResetTokens` table. All the data in the column will be lost.
  - Added the required column `id` to the `PasswordResetTokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `PasswordResetTokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PasswordResetTokens" DROP CONSTRAINT "PasswordResetTokens_pkey",
DROP COLUMN "email",
ADD COLUMN     "expiredAt" TIMESTAMP(3),
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ADD CONSTRAINT "PasswordResetTokens_pkey" PRIMARY KEY ("id");
