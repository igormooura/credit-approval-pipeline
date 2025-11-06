

import { PrismaClient } from "../../generated/prisma/index.js";
import { publishToQueue } from "../queues/rabbitmq.ts";

const prisma = new PrismaClient();

export const creditAnalysisService = async (proposalId: string) => {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
  });

  if (!proposal) throw new Error(`Proposal with ID ${proposalId} not found`);

  const score = Math.floor(Math.random() * (900 - 300 + 1)) + 300;
  
  const nextStatus = "PENDING_IDENTITY_CHECK"

  const updatedProposal = await prisma.proposal.update({
    where: { id: proposalId },
    data: {
      creditScore: score,
      status: nextStatus,
      updatedAt: new Date(),
    },
  });

  const credit_analysis_queue = process.env.CREDIT_ANALYSIS_QUEUE;
  if (credit_analysis_queue) {
    await publishToQueue(credit_analysis_queue, updatedProposal);
  }

  return updatedProposal;
};
