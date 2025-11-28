import { connectWithRabbitMQ, bindQueueToExchange, consumeQueue } from "../queues/rabbitmq";

const handleCardIssue = async (msg: any) => {
    const { customerName, cardType } = msg;

    if (cardType === 'PLATINUM') {
        console.log(`${customerName} platinum card sent to production`);
    } else {
        console.log(`Generating PLASTIC card for ${customerName}`);
    }
};

export const cardIssuerWorker = async () => {
    try {
        await connectWithRabbitMQ();

        const exchangeName = process.env.APPROVED_EXCHANGE;
        const cardIssuerQueue = process.env.CARD_ISSUER_QUEUE;

        if(!exchangeName || !cardIssuerQueue) throw new Error("Card queue or Exchange name not defined");

        await bindQueueToExchange(cardIssuerQueue, exchangeName);

        await consumeQueue(cardIssuerQueue, handleCardIssue);

    } catch (error) {
        console.error(error);
    }
};

