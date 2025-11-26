import { bindQueueToExchange } from "../queues/rabbitmq"

export const cardIssuerWorker = async() =>{
    
    const exchangeName = process.env.APPROVED_EXCHANGE
    const cardIssuerQueue = process.env.CARD_ISSUER_QUEUEU
    
    if(!exchangeName || !cardIssuerQueue) throw new Error("Card queue or Exchange name not defined")
    await bindQueueToExchange(exchangeName, cardIssuerQueue)
}