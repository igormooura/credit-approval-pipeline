import { consumeQueue } from "../queues/rabbitmq"
import { fraudAnalysisService } from "../service/fraudAnalysisService";

export const fraudAnalysisWorker = async () =>{
    try {
        const credit_analysis_queue = process.env.CREDIT_ANALYSIS_QUEUE

        if(credit_analysis_queue){
            await consumeQueue(credit_analysis_queue, async(msg)=>{
                const credit_content = JSON.parse(msg.content.toString());
                const proposalId = credit_content.proposalId;

                if (!proposalId) throw new Error("There's no proposal id")

                await fraudAnalysisService(proposalId)

                await new Promise(resolve => setTimeout(resolve, 500))
            })  
        } else { 
            console.log("credit_analysis_queue not set")
        }
    } catch (error: any) { 
        console.log(error)
    }
}