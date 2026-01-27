import { publishToQueue } from "../queues/rabbitmq";
import { ProposalInput } from "../validators/proposalSchema";
import prisma from "./database.service";

export const createProposalService = async ({ CPF, fullName, email, income }: ProposalInput) => {
  const CREDIT_ANALYSIS_QUEUE = process.env.CREDIT_ANALYSIS_QUEUE;
  const CONFIRMATION_QUEUE = process.env.CONFIRMATION_QUEUE;

  if (!CREDIT_ANALYSIS_QUEUE || !CONFIRMATION_QUEUE) {
    throw new Error("creditanalysis and confirmation queues not defined");
  }

  const existing = await prisma.proposal.findUnique({ where: { CPF } });
  if (existing) {
    throw new Error("there's 1 person using this CPF");
  }

  const proposal = await prisma.proposal.create({
    data: {
      CPF,
      fullName,
      email,
      income,
      status: "RECEIVED",
    },
  });

  try {
    await publishToQueue(CREDIT_ANALYSIS_QUEUE, { proposalId: proposal.id });
  } catch (error) {
    console.error(error);
    await prisma.proposal.delete({
      where: { id: proposal.id },
    });
    throw new Error("service unavailable");
  }

  try {
    await publishToQueue(CONFIRMATION_QUEUE, { email: proposal.email, fullName: proposal.fullName });
  } catch (error) {
    console.error(error);
  }

  return proposal;
};