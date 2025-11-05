import { Router } from "express";
import { createProposalController } from "../controller/proposalController.ts"

const router = Router();

router.post("/proposals", createProposalController);

export default router;
