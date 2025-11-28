import { consumeQueue } from "../queues/rabbitmq.ts";
import { creditAnalysisService } from "../service/creditAnalysisService.ts";


const creditAnalysisHandler = async(msg: any) =>{
    const proposal_content = JSON.parse(msg.content.toString())
    const proposalId = proposal_content.proposalId

    await creditAnalysisService(proposalId)
}

export const creditAnalysisWorker = async ( ) => { 
    try{ 

        const proposals_queue = process.env.PROPOSALS_QUEUE
        if (!proposals_queue) throw new Error ("No queue defined")

        await consumeQueue(proposals_queue, creditAnalysisHandler) //mudar depois pra credit_queue

    } catch(error: any) { 
       console.error(error.message);
    }
}