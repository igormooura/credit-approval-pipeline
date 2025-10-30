import { Router } from "express";
import { createProposal } from "../controller/proposalController";


const router = Router();

router.post("/proposals", createProposal);

export default router;
