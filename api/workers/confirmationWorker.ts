import { consumeQueue } from "../queues/rabbitmq";
import { sendEmail } from "../service/email/emailService";

const confirmationHandler = async (msg: any) => {
  try {
    const content = JSON.parse(msg.content.toString());
    const { email, fullName } = content;
    if (content) {
      const subject = "We received your application!";
      const html = `
    <h3>Hello, ${fullName}!</h3>
    <p>We have received your credit card application.</p>
    <p>Our artificial intelligence is already analyzing your profile.</p>
    <p>You will receive another email shortly with the result.</p>`;

      await sendEmail({ to: email, subject, html });


    } else {
      console.log("No content at confirmationHandler");
    }
  } catch (error: any) {
    console.log("Error at confirmation Handler: ", error);
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
