import { Request, Response } from "express";
import { createProposalService } from "../service/proposalService.ts";
import { proposalSchema } from "../validators/proposalSchema.ts";

export const createProposalController = async (req: Request, res: Response): Promise<void> => {
  try {
    
    const data = proposalSchema.parse(req.body);

    const proposal = await createProposalService(data);

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