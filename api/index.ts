import express from 'express'
import { createServer } from 'node:http'
import { configDotenv } from 'dotenv';
import { connectWithRabbitMQ } from './queues/rabbitmq.ts';
import router from './router/proposalRoutes.ts';



configDotenv()

const app = express()
const server = createServer(app)



app.use(express.json());
app.use(router)

async function startApp(){
  try{

    await connectWithRabbitMQ();


    server.listen(3000, () =>{
      console.log("Running on 3000")
    })
  } catch (error){
    console.error("Failed to start the server ", error)
    process.exit(1)
  }
}

startApp()
