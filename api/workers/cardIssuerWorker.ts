import { bindQueueToExchange, consumeQueue } from "../queues/rabbitmq";

const handleCardIssue = async (msg: any) => {
    try {
        const content = JSON.parse(msg.content.toString());
        const { fullName, cardType } = content;

        if (!fullName || !cardType) {
            console.warn("incomplete data for card issuance:", content);
            return; //  without error so the message is removed from the queue ack and doesn't crash
        }

        if (cardType === 'PLATINUM') {
            console.log(`${fullName} platinum card sent to production`);
        } else {
            console.log(`Generating PLASTIC card for ${fullName}`);
        }
    } catch (error) {
        console.error("Fatal error processing card:", error);
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
        console.error("Failed to initialize cardIssuerWorker:", error);
    }
};