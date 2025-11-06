

import { PrismaClient } from "../../generated/prisma/index.js";
import { publishToQueue } from "../queues/rabbitmq.ts";

const prisma = new PrismaClient();

export const creditAnalysisService = async (proposalId: string) => {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
  });

  if (!proposal) throw new Error(`Proposal with ID ${proposalId} not found`);

  const score = Math.floor(Math.random() * (900 - 300 + 1)) + 300;
  const fraudCheckResult = Math.random() > 0.1;
  const status = score >= 600 && fraudCheckResult ? "APPROVED" : "REJECTED";
  const calculatedLimit = status === "APPROVED" ? score * 5 : 0;

  const updatedProposal = await prisma.proposal.update({
    where: { id: proposalId },
    data: {
      creditScore: score,
      fraudCheckResult,
      calculatedLimit,
      status,
      updatedAt: new Date(),
    },
  });

  const resultsQueue = process.env.CREDIT_RESULTS_QUEUE;
  if (resultsQueue) {
    await publishToQueue(resultsQueue, updatedProposal);
  }

  return updatedProposal;
};
