-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "CPF" TEXT NOT NULL,
    "income" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creditScore" INTEGER,
    "fraudCheckResult" BOOLEAN,
    "calculatedLimit" DOUBLE PRECISION,
    "fullName" TEXT NOT NULL,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Proposal_CPF_key" ON "Proposal"("CPF");
