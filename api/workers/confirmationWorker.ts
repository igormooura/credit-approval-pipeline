import { channel, consumeQueue } from "../queues/rabbitmq";
import { confirmationService } from "../service/confirmationService";

const confirmationHandler = async (msg: any) => {
  try {
    const content = JSON.parse(msg.content.toString());
    
    await confirmationService({  email: content.email,  fullName: content.fullName });
    
  } catch (error: any) {
    console.error(error.message);
  }
};

export const confirmationWorker = async () => {
  try {
    const CONFIRMATION_QUEUE = process.env.CONFIRMATION_QUEUE;

    if (!CONFIRMATION_QUEUE) throw new Error("CONFIRMATION_QUEUE not set");

    await consumeQueue(CONFIRMATION_QUEUE, confirmationHandler);
  } catch (error) {
    console.log("Error in confirmationWorker: ", error);
  }
};
