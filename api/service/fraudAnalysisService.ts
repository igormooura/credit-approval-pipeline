import { publishToQueue } from "../queues/rabbitmq.js";
import prisma from "./database.service.js";

export const fraudAnalysisService = async (proposalId: string) => {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
  });

  if (!proposal) throw new Error(`Proposal ${proposalId} not found`);

  const hasValidName = proposal.fullName.trim().split(" ").length >= 2;
  const isBlacklisted = proposal.CPF === "00000000000";
  const isSuspiciousFinancial = proposal.income > 50000 && (proposal.creditScore || 0) < 400;

  const isSafe = hasValidName && !isBlacklisted && !isSuspiciousFinancial;

  const newStatus = isSafe ? "PENDING_LIMIT_CALCULATION" : "REJECTED";

  const updatedProposal = await prisma.proposal.update({
    where: { id: proposalId },
    data: {
      fraudCheckResult: isSafe,
      status: newStatus,
      updatedAt: new Date(),
    },
  });

  if (isSafe) {
    if (process.env.LIMIT_CALCULATION_QUEUE) {
      await publishToQueue(process.env.LIMIT_CALCULATION_QUEUE, { proposalId: updatedProposal.id });
    }
  }

  return updatedProposal;
};