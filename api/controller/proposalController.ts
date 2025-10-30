import { Request, Response } from "express";
import { createProposalService } from "../service/prosalService.js";
import { proposalSchema } from "../validators/proposalSchema.js";
import { publishToQueue } from "../queues/rabbitmq.js";

export const createProposal = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = proposalSchema.parse(req.body)

    const proposal = await createProposalService(data)

    await publishToQueue("proposals.received", {proposalId : proposal.id})

    res.status(202).json({
      message: "Proposal created successfully",
      proposal: proposal.id,
    });
  } catch (error: any) {

     if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
      return;
    }

    res.status(500).json({
      error: error.message || "An error occurred while creating the proposal",
    });
  }
};
