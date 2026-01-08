import { publishToExchange } from "../queues/rabbitmq.ts";
import prisma from "./database.service.ts";

export enum CardTier {
  PLATINUM = "PLATINUM",
  GOLD = "GOLD",
  STANDARD = "STANDARD",
}

export const limitCalculatorService = async (proposalId: string) => {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
  });

  if (!proposal || proposal.creditScore === null || proposal.fraudCheckResult === null) {
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

  if(!process.env.APPROVED_EXCHANGE) throw new Error("No approved Exchange")
  
  await publishToExchange(process.env.APPROVED_EXCHANGE, {
    proposalId: updatedProposal.id,
    customerName: updatedProposal.fullName,
    email: updatedProposal.email,
    cardType: cardType,
    limit: calculatedLimit,
  });

  return updatedProposal;
};