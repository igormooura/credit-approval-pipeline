import amqp from "amqplib";

export let channel: amqp.Channel;


export const connectWithRabbitMQ = async (): Promise<amqp.Channel> => {
  try {
    const RABBITMQ_URL = `${process.env.RABBITMQ_URL}`;

    if(!RABBITMQ_URL) throw new Error ("No connection with rabbitmq")

    const connection = await amqp.connect(RABBITMQ_URL);

    channel = await connection.createChannel();

    console.log("Connected w/ RabbitMQ");

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

export const consumeQueue = async (queue: string, callback: (msg: amqp.ConsumeMessage) => void) => {
  if (!channel) throw new Error("RabbitMQ channel not initialized");
  await channel.assertQueue(queue, { durable: true });
  channel.consume(queue, (msg) => {
    if (msg) {
      callback(msg);
    }
  });
};

export const publishToExchange = async(exchange: string, msg: object) =>{ // exchange = distribuition to queues
  if(!channel) throw new Error("RabbitMQ not initilized");

  await channel.assertExchange(exchange, "fanout", {durable: true});

  channel.publish(exchange, "", Buffer.from(JSON.stringify(msg)))

  console.log("enviado pro pub/sub")
}

export const bindQueueToExchange = async (queue: string, exchange: string) => {
  if (!channel) throw new Error("RabbitMQ not initialized");

  // Queue exists
  await channel.assertQueue(queue, { durable: true });
  
  // Exchange exists
  await channel.assertExchange(exchange, 'fanout', { durable: true });

  await channel.bindQueue(queue, exchange, '');
  
};