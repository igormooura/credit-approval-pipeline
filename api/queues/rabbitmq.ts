import amqp from "amqplib";

let channel: amqp.Channel;


export const connectWithRabbitMQ = async (): Promise<amqp.Channel> => {
  try {
    const RABBITMQ_URL = process.env.RABBITMQ_URL || "";

    const connection = await amqp.connect(RABBITMQ_URL);

    channel = await connection.createChannel();

    console.log("Connectew w/ RabbitMQ");

    return channel;
  } catch (error) {
    console.error("Error connecting to rabbitmq:", error);
    throw error;
  }
};



export const publishToQueue = async (queue: string, message: object) => {
  if (!channel) throw new Error ("There's no rabbitmq ")
  await channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
};