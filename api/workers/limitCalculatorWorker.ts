import { consumeQueue } from "../queues/rabbitmq";
import { limitCalculatorService } from "../service/limitCalculatorService";
import { channel } from "../queues/rabbitmq"; 

const limitCalculatorHandler = async (msg: any) => {
    try {
        const content = JSON.parse(msg.content.toString());
        const proposalId = content.proposalId;

        if (!proposalId) throw new Error("Missing proposalId");

        await limitCalculatorService(proposalId);
        
        channel.ack(msg); 
    } catch (error) {
        console.error("limitCalculatorWorker error:", error);
        channel.nack(msg, false, true);
    }
};

export const limitCalculatorWorker = async () => {
    const queue = process.env.LIMIT_CALCULATOR_QUEUE; 
    if (!queue) throw new Error("LIMIT_CALCULATOR_QUEUE is not defined");

    await consumeQueue(queue, limitCalculatorHandler);
};