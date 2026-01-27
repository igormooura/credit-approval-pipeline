import { Router } from "express";
import { createProposalController, getProposalById } from "../controller/proposalController.ts"

const router = Router();

router.post("/proposals", createProposalController);
router.get("/proposals/:id", getProposalById);

export default router;
