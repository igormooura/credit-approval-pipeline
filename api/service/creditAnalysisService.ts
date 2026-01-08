import { publishToQueue } from "../queues/rabbitmq.ts";
import prisma from "./database.service.ts";


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

  const FRAUD_ANALYSIS_QUEUE = process.env.FRAUD_ANALYSIS_QUEUE;
  if (FRAUD_ANALYSIS_QUEUE) {
    await publishToQueue(FRAUD_ANALYSIS_QUEUE, { proposalId: updatedProposal.id });
  }

  return updatedProposal;
};
