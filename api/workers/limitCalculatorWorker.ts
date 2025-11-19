import { consumeQueue } from "../queues/rabbitmq";

export const limitCalculatorWorker = async () => {
    const queue = process.env.FRAUD_QUEUE;
    if (!queue) throw new Error("FRAUD_QUEUE is not defined");

    await consumeQueue(queue, async (msg) => {
        try {
            const content = JSON.parse(msg.content.toString());
            const proposalId = content.proposalId;

            if (!proposalId) throw new Error("Missing proposalId");

            //await limitCalculatorService(proposalId);

            
        } catch (error) {
            console.error("limitCalculatorWorker error:", error);
        
        }
    });
};
