import {
  bindQueueToExchange,
  consumeQueue,
} from "../queues/rabbitmq";
import { sendApprovedEmail, sendRejectedEmail } from "../service/marketingService";

export const marketingApprovedHandler = async (msg: any) => {
  try {
    const data = JSON.parse(msg.content.toString());
    await sendApprovedEmail(data);
  } catch (error) {
    console.error("Marketing Approved Handler Error:", error);
  }
};

export const rejectMarketingHandler = async (msg: any) => {
  try {
    const { proposalId } = JSON.parse(msg.content.toString());
    await sendRejectedEmail(proposalId);
  } catch (error) {
    console.error("Marketing Reject Handler Error:", error);
  }
};

export const marketingWorker = async () => {
  try {
    const approvedExchange = process.env.APPROVED_EXCHANGE;
    const marketingQueue = process.env.MARKETING_QUEUE;
    const notSafeQueue = process.env.NOT_SAFE_QUEUE;

    if (!approvedExchange || !marketingQueue || !notSafeQueue) {
      throw new Error("Marketing queues or exchange not defined");
    }

    await bindQueueToExchange(marketingQueue, approvedExchange);
    await consumeQueue(marketingQueue, marketingApprovedHandler);

    await consumeQueue(notSafeQueue, rejectMarketingHandler);

  } catch (error) {
    console.error("Marketing Worker Error:", error);
  }
};
