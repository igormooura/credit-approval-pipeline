import { connectWithRabbitMQ, bindQueueToExchange, consumeQueue } from "../queues/rabbitmq";
import { sendEmail } from "../service/email/emailService";

export const marketingHandler = async (msg: any) => {
    try {
        const { email, customerName, cardType, limit } = msg;

        if (!email) return;

        let subject = "Welcome to the Bank!";
        let htmlContent = `<p>Hello <strong>${customerName}</strong>,</p><p>Your card has been approved with a limit of <strong>$${limit}</strong>.</p>`;

        if (cardType === 'PLATINUM') {
            subject = "Congratulations! You are Platinum.";
            htmlContent = `<p>Hello VIP <strong>${customerName}</strong>!</p><p>Your metal card is being prepared. You earned <strong>10,000 miles</strong>.</p>`;
        }

        await sendEmail({
            to: email,
            subject: subject,
            html: htmlContent
        });

    } catch (error) {
        console.error(error);
    }
}

export const marketingWorker = async () => {
    try {
        

        const exchangeName = process.env.APPROVED_EXCHANGE;
        const marketingQueue = process.env.MARKETING_QUEUE;

        if (!exchangeName || !marketingQueue) throw new Error("Marketing queue or Exchange name not defined");

        await bindQueueToExchange(marketingQueue, exchangeName);

        await consumeQueue(marketingQueue, marketingHandler);

    } catch (error) {
        console.error(error);
    }
}
