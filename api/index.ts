import express from 'express'
import { createServer } from 'node:http'

const app = express()
const server = createServer(app)

app.use(express.json());

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
