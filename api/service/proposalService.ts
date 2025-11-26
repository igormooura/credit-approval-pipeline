import { PrismaClient } from "../../generated/prisma/index.js";
import { publishToQueue } from "../queues/rabbitmq.ts";
import { ProposalInput } from "../validators/proposalSchema.ts";
import prisma from "./database.service.ts";

export const createProposalService = async ({ CPF, fullName, income }: ProposalInput) => {
  
  const proposals_queue = process.env.PROPOSALS_QUEUE;
  
  if(!proposals_queue) throw new Error("NO proposal's queue")

  const existing = await prisma.proposal.findUnique({ where: { CPF } });
  if (existing) {
    throw new Error("there's 1 person using this CPF");
  }

  const proposal = await prisma.proposal.create({
    data: {
      CPF,
      fullName,
      income,
      status: "RECEIVED",
    },
  });

  await publishToQueue(proposals_queue, { proposalId: proposal.id });

  return proposal;
};
