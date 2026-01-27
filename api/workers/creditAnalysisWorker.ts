import { consumeQueue } from "../queues/rabbitmq.ts";
import { creditAnalysisService } from "../service/creditAnalysisService.ts";

const creditAnalysisHandler = async (msg: any) => {
  try {
    const proposal_content = JSON.parse(msg.content.toString());
    const proposalId = proposal_content.proposalId;

    if (!proposalId) throw new Error("Proposal ID missing in message");

    await creditAnalysisService(proposalId);
    
  } catch (error: any) {
    console.error(`error processing credit analysis: ${error.message}`);
  }
};

export const creditAnalysisWorker = async () => {
  try {
    const CREDIT_ANALYSIS_QUEUE = process.env.CREDIT_ANALYSIS_QUEUE;
    if (!CREDIT_ANALYSIS_QUEUE) throw new Error("No queue defined");

    await consumeQueue(CREDIT_ANALYSIS_QUEUE, creditAnalysisHandler);
  } catch (error: any) {
    console.error("fatal error initializing creditAnalysisWorker:", error.message);
  }
};