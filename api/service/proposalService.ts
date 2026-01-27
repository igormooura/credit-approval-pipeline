import { publishToQueue } from "../queues/rabbitmq.ts";
import { ProposalInput } from "../validators/proposalSchema.ts";
import prisma from "./database.service.ts";

export const createProposalService = async ({ CPF, fullName, email ,income }: ProposalInput) => {
  
  const CREDIT_ANALYSIS_QUEUE = process.env.CREDIT_ANALYSIS_QUEUE;
  const CONFIRMATION_QUEUE = process.env.CONFIRMATION_QUEUE;
  
  if(!CREDIT_ANALYSIS_QUEUE) throw new Error("NO proposal's queue");
  if(!CONFIRMATION_QUEUE) throw new Error("No confirmation queue");

  const existing = await prisma.proposal.findUnique({ where: { CPF } });
  if (existing) {
    throw new Error("There's 1 person using this CPF");
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
    await publishToQueue(CONFIRMATION_QUEUE, { email: proposal.email, fullName: proposal.fullName });
  } catch (error) {
    console.error("Error publishing to queue. Performing rollback...", error);
    
    // if queue fails, delete from DB
    await prisma.proposal.delete({
        where: { id: proposal.id }
    });

    throw new Error("Service unavailable. Please try again later.");
  }

  return proposal;
};