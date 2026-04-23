-- CreateTable
CREATE TABLE "PasswordResetTokens" (
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3),

    CONSTRAINT "PasswordResetTokens_pkey" PRIMARY KEY ("email")
);
