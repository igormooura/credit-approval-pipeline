import { publishToExchange, publishToQueue } from "../queues/rabbitmq";
import prisma from "./database.service";

const isValidCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/[^\d]+/g, "");
  if (cleanCPF.length !== 11 || !!cleanCPF.match(/(\d)\1{10}/)) return false;
  return true;
};

export const fraudAnalysisService = async (proposalId: string) => {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
  });

  if (!proposal) throw new Error(`Proposal ${proposalId} not found`);

  const reasons: string[] = [];

  const hasValidName = proposal.fullName.trim().split(" ").length >= 2;
  if (!hasValidName) reasons.push("Invalid name");

  const cpfValid = isValidCPF(proposal.CPF);
  if (!cpfValid) reasons.push("Invalid CPF");

  if (proposal.income <= 0) reasons.push("Invalid income");

  const isSuspiciousFinancial = proposal.income > 20000 && (proposal.creditScore || 0) < 400;
  if (isSuspiciousFinancial) reasons.push("Suspicious financial profile");

  const isSafe = reasons.length === 0;
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
    if (!rejectedExchange) throw new Error("REJECTED_EXCHANGE not set");

    console.log(`Fraud detected: ${reasons.join(", ")}`);
    await publishToExchange(rejectedExchange, { proposalId: updatedProposal.id });
  }

  return updatedProposal;
};