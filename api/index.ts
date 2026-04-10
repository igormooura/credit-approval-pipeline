import express from 'express'
import { createServer } from 'node:http'
import { configDotenv } from 'dotenv';
import router from './router/proposalRoutes.ts';
import cors from 'cors';

configDotenv()

const app = express()
const server = createServer(app)


app.use(cors());
app.use(express.json());
app.use(router)

async function startApp(){
  try{
    server.listen(3000, () =>{
      console.log("Running on 3000")
    })
  } catch (error){
    console.error("Failed to start the server ", error)
    process.exit(1)
  }
}

startApp()
