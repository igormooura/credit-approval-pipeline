import { bindQueueToExchange, consumeQueue } from "../queues/rabbitmq";

const handleCardIssue = async (msg: any) => {
    const { fullName, cardType } = msg;

    if (cardType === 'PLATINUM') {
        console.log(`${fullName} platinum card sent to production`);
    } else {
        console.log(`Generating PLASTIC card for ${fullName}`); // undefined!!!
    }
};

export const cardIssuerWorker = async () => {
    try {

        const exchangeName = process.env.APPROVED_EXCHANGE;
        const cardIssuerQueue = process.env.CARD_ISSUER_QUEUE;

        if(!exchangeName || !cardIssuerQueue) throw new Error("Card queue or Exchange name not defined");

        await bindQueueToExchange(cardIssuerQueue, exchangeName);

        await consumeQueue(cardIssuerQueue, handleCardIssue);

    } catch (error) {
        console.error(error);
    }
};

