import { channel, consumeQueue } from "../queues/rabbitmq";
import { fraudAnalysisService } from "../service/fraudAnalysisService";

const fraudAnalysisHandler = async (msg: any) => {
    try {
        const content = JSON.parse(msg.content.toString());
        const proposalId = content.proposalId;

        if (!proposalId) throw new Error("There's no proposal id");

        await fraudAnalysisService(proposalId);

    } catch (error) {
        console.error("fraudAnalysisWorker error:", error);
    }
};

export const fraudAnalysisWorker = async () => {
    try {
        const FRAUD_ANALYSIS_QUEUE = process.env.FRAUD_ANALYSIS_QUEUE;

        if (!FRAUD_ANALYSIS_QUEUE) {
            console.log("FRAUD_ANALYSIS_QUEUE not set");
            return;
        }

        await consumeQueue(FRAUD_ANALYSIS_QUEUE, fraudAnalysisHandler);
    } catch (error) {
        console.error("fraudAnalysisWorker fatal error:", error);
    }
};