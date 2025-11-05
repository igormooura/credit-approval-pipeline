import type { Request, Response } from "express";
import { consumeQueue } from "../../queues/rabbitmq.ts";
import { creditAnalysisService } from "../../service/creditAnalysisService.ts";


export const creditAnalysisController = async ( req: Request, res: Response) => { 
    try{ 

        const proposals_queue = process.env.PROPOSALS_QUEUE
        if (!proposals_queue) throw new Error ("No queue defined")

        await consumeQueue(proposals_queue, async(msg) => {
            const content = JSON.parse(msg.content.toString())
            const proposalId = content.proposalId;

            const result = await creditAnalysisService(proposalId);
            console.log(result)
        
        })

        res.status(200).json("Credit analysis has been done")

    } catch(error: any) { 
        res.status(500).json({ error: error.message || "Error consuming queue" });
    }
}