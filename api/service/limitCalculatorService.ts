import { publishToExchange } from "../queues/rabbitmq.js";
import prisma from "./database.service.js";

export enum CardTier {
  PLATINUM = "PLATINUM",
  GOLD = "GOLD",
  STANDARD = "STANDARD",
}

export const limitCalculatorService = async (proposalId: string) => {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
  });

  if (!proposal || !proposal.creditScore || !proposal.fraudCheckResult) {
    throw new Error(`Proposal ${proposalId} incomplete or not found`);
  }

  let cardType = CardTier.STANDARD;
  let limitMultiplier = 0.3;

  if (proposal.creditScore > 900 && proposal.income >= 10000) {
    cardType = CardTier.PLATINUM;
    limitMultiplier = 1.5;
  } else if (proposal.creditScore > 700) {
    cardType = CardTier.GOLD;
    limitMultiplier = 0.8;
  }

  const calculatedLimit = proposal.income * limitMultiplier;

  const updatedProposal = await prisma.proposal.update({
    where: { id: proposalId },
    data: {
      status: "APPROVED",
      calculatedLimit: calculatedLimit,
    },
  });

  const exchangeName = process.env.APPROVED_EXCHANGE || 'proposal_approved_fanout';

  await publishToExchange(exchangeName, {
    proposalId: updatedProposal.id,
    customerName: updatedProposal.fullName,
    cardType: cardType,
    limit: calculatedLimit,
  });

  return updatedProposal;
};