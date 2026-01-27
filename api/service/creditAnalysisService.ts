import { publishToQueue } from "../queues/rabbitmq";
import prisma from "./database.service";

const calculateScore = (income: number, cpf: string): number => {
  let baseScore = 300;
  if (income > 2000) baseScore = 500;
  if (income > 5000) baseScore = 700;
  if (income > 10000) baseScore = 900;

  const cpfBonus = parseInt(cpf.replace(/\D/g, "").slice(-3)) % 200;

  return Math.min(1200, Math.max(300, baseScore + cpfBonus));
};

export const creditAnalysisService = async (proposalId: string) => {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
  });

  if (!proposal) throw new Error(`Proposal ${proposalId} not found`);

  const score = calculateScore(proposal.income, proposal.CPF);
  const nextStatus = "PENDING_IDENTITY_CHECK";

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