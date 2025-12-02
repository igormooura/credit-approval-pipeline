import { consumeQueue } from "../queues/rabbitmq";
import { limitCalculatorService } from "../service/limitCalculatorService";


const limitCalculatorHandler = async (msg: any) => {
    try {
        const content = JSON.parse(msg.content.toString());
        const proposalId = content.proposalId;

        if (!proposalId) throw new Error("Missing proposalId");

        await limitCalculatorService(proposalId);
        
        msg.ack();
    } catch (error) {
        console.error("limitCalculatorWorker error:", error);

        msg.nack(false, false);
    }
};

export const limitCalculatorWorker = async () => {
    const queue = process.env.FRAUD_ANALYSIS_QUEUE;
    if (!queue) throw new Error("FRAUD_QUEUE is not defined");

    await consumeQueue(queue, limitCalculatorHandler);
};
