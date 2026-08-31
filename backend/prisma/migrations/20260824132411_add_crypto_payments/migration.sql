-- CreateEnum
CREATE TYPE "CryptoNetwork" AS ENUM ('BTC', 'ETH', 'SOL');

-- CreateEnum
CREATE TYPE "CryptoPaymentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED');

-- AlterEnum
ALTER TYPE "PropertyStatus" ADD VALUE 'SUSPENDED';

-- CreateTable
CREATE TABLE "CryptoAddress" (
    "id" TEXT NOT NULL,
    "network" "CryptoNetwork" NOT NULL,
    "address" TEXT NOT NULL,
    "label" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CryptoAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CryptoRotationCursor" (
    "network" "CryptoNetwork" NOT NULL,
    "lastIndex" INTEGER NOT NULL DEFAULT -1,

    CONSTRAINT "CryptoRotationCursor_pkey" PRIMARY KEY ("network")
);

-- CreateTable
CREATE TABLE "CryptoPayment" (
    "id" TEXT NOT NULL,
    "network" "CryptoNetwork" NOT NULL,
    "addressId" TEXT NOT NULL,
    "propertyId" TEXT,
    "dealId" TEXT,
    "userId" TEXT NOT NULL,
    "amountUsd" DOUBLE PRECISION,
    "txHash" TEXT,
    "proofImage" TEXT,
    "note" TEXT,
    "status" "CryptoPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CryptoPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CryptoGuideImage" (
    "id" TEXT NOT NULL,
    "network" "CryptoNetwork",
    "step" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CryptoGuideImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CryptoAddress_network_active_idx" ON "CryptoAddress"("network", "active");

-- CreateIndex
CREATE INDEX "CryptoPayment_status_idx" ON "CryptoPayment"("status");

-- CreateIndex
CREATE INDEX "CryptoPayment_userId_idx" ON "CryptoPayment"("userId");

-- CreateIndex
CREATE INDEX "CryptoGuideImage_network_step_idx" ON "CryptoGuideImage"("network", "step");

-- AddForeignKey
ALTER TABLE "CryptoPayment" ADD CONSTRAINT "CryptoPayment_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "CryptoAddress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CryptoPayment" ADD CONSTRAINT "CryptoPayment_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CryptoPayment" ADD CONSTRAINT "CryptoPayment_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CryptoPayment" ADD CONSTRAINT "CryptoPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CryptoPayment" ADD CONSTRAINT "CryptoPayment_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

