import { consumeQueue } from "../queues/rabbitmq.ts";
import { creditAnalysisService } from "../service/creditAnalysisService.ts";


const creditAnalysisHandler = async(msg: any) =>{
    const proposal_content = JSON.parse(msg.content.toString())
    const proposalId = proposal_content.proposalId

    await creditAnalysisService(proposalId)
    
}

export const creditAnalysisWorker = async ( ) => { 
    try{ 

        const CREDIT_ANALYSIS_QUEUE = process.env.CREDIT_ANALYSIS_QUEUE
        if (!CREDIT_ANALYSIS_QUEUE) throw new Error ("No queue defined")

        await consumeQueue(CREDIT_ANALYSIS_QUEUE, creditAnalysisHandler) 

    } catch(error: any) { 
       console.error(error.message);
    }
}