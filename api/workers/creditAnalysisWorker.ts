import { consumeQueue } from "../queues/rabbitmq.ts";
import { creditAnalysisService } from "../service/creditAnalysisService.ts";


export const creditAnalysisWorker = async ( ) => { 
    try{ 

        const proposals_queue = process.env.PROPOSALS_QUEUE
        if (!proposals_queue) throw new Error ("No queue defined")

        await consumeQueue(proposals_queue, async(msg) => {
            const content = JSON.parse(msg.content.toString())
            const proposalId = content.proposalId;

            const result = await creditAnalysisService(proposalId);
            console.log(result)
        
        })


    } catch(error: any) { 
       console.error(error.message);
    }
}