import { bindQueueToExchange, consumeQueue } from "../queues/rabbitmq"; //

const handleCardIssue = async (msg: any) => {

    const content = JSON.parse(msg.content.toString());

    const { customerName, cardType } = content;
    const fullName = customerName; 

    if (!fullName || !cardType) {
        throw new Error(`incomplete data for card issuance: ${JSON.stringify(content, null, 2)}`);
    }

    if (cardType === 'PLATINUM') {
        console.log(`${fullName} platinum card sent to production`);
    } else {
        console.log(`generating PLASTIC card for ${fullName}`);
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
        console.error("Error initializing Card Issuer Worker:", error);
    }
};