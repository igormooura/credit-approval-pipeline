import { consumeQueue } from "../queues/rabbitmq";
import { fraudAnalysisService } from "../service/fraudAnalysisService";

const fraudAnalysisHandler = async (msg: any) => {
    try {
        const content = JSON.parse(msg.content.toString());
        const proposalId = content.proposalId;

        if (!proposalId) throw new Error("There's no proposal id");

        await fraudAnalysisService(proposalId);
        await new Promise(resolve => setTimeout(resolve, 500));

        msg.ack();
    } catch (error) {
        console.error("fraudAnalysisWorker error:", error);

        msg.nack(false, false);
    }
};


export const fraudAnalysisWorker = async () => {
    try {
        const creditAnalysisQueue = process.env.CREDIT_ANALYSIS_QUEUE;

        if (!creditAnalysisQueue) {
            console.log("CREDIT_ANALYSIS_QUEUE not set");
            return;
        }

        await consumeQueue(creditAnalysisQueue, fraudAnalysisHandler);
    } catch (error) {
        console.error("fraudAnalysisWorker fatal error:", error);
    }
};
