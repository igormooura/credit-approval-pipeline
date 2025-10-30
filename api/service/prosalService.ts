// src/services/createProposalService.ts
import { PrismaClient } from "../../generated/prisma";
import { ProposalInput } from "../validators/proposalSchema.js";

const prisma = new PrismaClient();

export const createProposalService = async ({ CPF, fullName, income }: ProposalInput) => {
  
  const existing = await prisma.proposal.findUnique({ where: { CPF } });
  if (existing) {
    throw new Error("there's 1 person using this CPF");
  }

  const proposal = await prisma.proposal.create({
    data: {
      CPF,
      fullName,
      income,
      status: "RECEIVED",
    },
  });

  return proposal;
};
