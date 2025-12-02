import express from 'express'
import { createServer } from 'node:http'
import { configDotenv } from 'dotenv';
import { connectWithRabbitMQ } from './queues/rabbitmq.ts';
import router from './router/proposalRoutes.ts';
import { creditAnalysisWorker } from './workers/creditAnalysisWorker.ts';
import { fraudAnalysisWorker } from './workers/fraudAnalysisWorker.ts';
import { limitCalculatorWorker } from './workers/limitCalculatorWorker.ts';
import { cardIssuerWorker } from './workers/cardIssuerWorker.ts';
import { marketingWorker } from './workers/marketingWorker.ts';

configDotenv()

const app = express()
const server = createServer(app)



app.use(express.json());
app.use(router)

async function startApp(){
  try{

    await connectWithRabbitMQ();

     await creditAnalysisWorker();
     await fraudAnalysisWorker();
     await limitCalculatorWorker();
    
     await cardIssuerWorker();
     await marketingWorker();

    server.listen(3000, () =>{
      console.log("Running on 3000")
    })
  } catch (error){
    console.error("Failed to start the server ", error)
    process.exit(1)
  }
}

startApp()
