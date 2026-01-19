import prisma from '../../api/service/database.service';

export async function waitForStatus(
    proposalId: string,
    expectedStatus: string | string[],
    timeoutMs = 15000
) {
    const expected = Array.isArray(expectedStatus)
        ? expectedStatus
        : [expectedStatus];

    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
        const proposal = await prisma.proposal.findUnique({
            where: { id: proposalId }
        });

        if (proposal && expected.includes(proposal.status)) {
            return proposal;
        }

        await new Promise(resolve => setTimeout(resolve, 500));
    }

    throw new Error(
        `Timeout esperando status ${expected.join(' | ')} para proposta ${proposalId}`
    );
}
