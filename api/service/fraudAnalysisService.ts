import { publishToExchange, publishToQueue } from "../queues/rabbitmq.ts";
import prisma from "./database.service.ts";

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
    const isSafeQueue = process.env.LIMIT_CALCULATOR_QUEUE;
    if (isSafeQueue) {
      await publishToQueue(isSafeQueue, { proposalId: updatedProposal.id });
    }
  } else { 
    const rejectedExchange = process.env.REJECTED_EXCHANGE;

    if(!rejectedExchange) throw new Error("REJECTED_EXCHANGE not set");

    await publishToExchange(rejectedExchange, { proposalId: updatedProposal.id })

  }

  return updatedProposal;
};