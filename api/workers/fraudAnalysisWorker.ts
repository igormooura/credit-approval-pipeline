import { channel, consumeQueue } from "../queues/rabbitmq";
import { fraudAnalysisService } from "../service/fraudAnalysisService";

const fraudAnalysisHandler = async (msg: any) => {
    try {
        const content = JSON.parse(msg.content.toString());
        const proposalId = content.id;

        if (!proposalId) throw new Error("There's no proposal id");

        await fraudAnalysisService(proposalId);
        await new Promise(resolve => setTimeout(resolve, 500));

        channel.ack(msg);
    } catch (error) {
        console.error("fraudAnalysisWorker error:", error);

        channel.nack(msg, false, false);
    }
};


export const fraudAnalysisWorker = async () => {
    try {
        const FRAUD_ANALYSIS_QUEUE = process.env.FRAUD_ANALYSIS_QUEUE;

        if (!FRAUD_ANALYSIS_QUEUE) {
            console.log("CREDIT_ANALYSIS_QUEUE not set");
            return;
        }

        await consumeQueue(FRAUD_ANALYSIS_QUEUE, fraudAnalysisHandler);
    } catch (error) {
        console.error("fraudAnalysisWorker fatal error:", error);
    }
};
