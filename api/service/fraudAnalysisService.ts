import { PrismaClient } from "../../generated/prisma/index.js";
import { publishToQueue } from "../queues/rabbitmq.js";

const prisma = new PrismaClient();

export const fraudAnalysisService = async (proposalId: string) => {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
  });

  if (!proposal) throw new Error(`Proposal ${proposalId} not found`);

  const isSafe = Math.random() > 0.1; 

  const updatedProposal = await prisma.proposal.update({
    where: { id: proposalId },
    data: {
      fraudCheckResult: isSafe,
      status: "PENDING_LIMIT_CALCULATION",
      updatedAt: new Date(),
    },
  });

  const fraud_queue = process.env.FRAUD_QUEUE;
  
  if (fraud_queue) {
    await publishToQueue(fraud_queue, { proposalId: updatedProposal.id });
  }

  return updatedProposal;
};