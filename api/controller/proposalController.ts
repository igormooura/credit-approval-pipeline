import { Request, Response } from "express";
import { createProposalService } from "../service/proposalService.ts";
import { proposalSchema } from "../validators/proposalSchema.ts";
import prisma from "../service/database.service.ts"; // Importe o Prisma

export const createProposalController = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = proposalSchema.parse(req.body);
    const proposal = await createProposalService(data);

    res.status(202).json({
      message: "Proposal created successfully",
      id: proposal.id, // O frontend precisa desse ID
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

export const getProposalById = async (req: Request, res: Response): Promise<void> => {
  try {
    
    const { id } = req.params as { id: string };

    const proposal = await prisma.proposal.findUnique({
      where: { id }
    });

    if (!proposal) {
      res.status(404).json({ message: 'Proposal not found' });
      return;
    }

    res.json({
      id: proposal.id,
      status: proposal.status,
      creditScore: proposal.creditScore,
      cardType: proposal.cardType,
      calculatedLimit: proposal.calculatedLimit
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};