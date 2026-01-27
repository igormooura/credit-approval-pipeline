import { publishToQueue } from "../queues/rabbitmq.ts"; 
import { ProposalInput } from "../validators/proposalSchema.ts"; 
import prisma from "./database.service.ts"; 

export const createProposalService = async ({ CPF, fullName, email, income }: ProposalInput) => {
  
  const CREDIT_ANALYSIS_QUEUE = process.env.CREDIT_ANALYSIS_QUEUE;
  const CONFIRMATION_QUEUE = process.env.CONFIRMATION_QUEUE;
  
  if(!CREDIT_ANALYSIS_QUEUE || !CONFIRMATION_QUEUE) {
    throw new Error("Queues not defined in environment variables");
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
    console.error("Failed to enqueue Credit Analysis", error);
    
    await prisma.proposal.delete({
        where: { id: proposal.id }
    });

    throw new Error("Service unavailable. Please try again later.");
  }

  try {
    await publishToQueue(CONFIRMATION_QUEUE, { email: proposal.email, fullName: proposal.fullName });
  } catch (error) {
    console.error("Warning: Failed to enqueue Confirmation Email, but proposal continues:", error);
  }

  return proposal;
};