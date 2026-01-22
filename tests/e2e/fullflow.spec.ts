import request from 'supertest';
import { waitForStatus } from '../utils/waitStatus';
import prisma from '../../api/service/database.service';

const API_URL = 'http://localhost:3000';
const TEST_EMAIL2 = process.env.TEST_EMAIL as string; //needed
const TEST_EMAIL = process.env.TEST_EMAIL2 as string;


describe('E2E - Full Pipeline', () => {

    beforeAll(async () => {
        await prisma.proposal.deleteMany({
            where: {
                OR: [
                    { email: TEST_EMAIL },
                    { email: TEST_EMAIL2 },
                    { email: { contains: '@e2e.test' } }
                ]
            }
        });
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('Scenario 1: happy path (APPROVED)', async () => {
        const response = await request(API_URL)
            .post('/proposals')
            .send({
                CPF: '12345678910',
                fullName: 'Approved Customer',
                income: 18000,
                email: TEST_EMAIL
            });

        expect([200, 202]).toContain(response.status);

        const proposal =
            response.body?.id
                ? await prisma.proposal.findUnique({ where: { id: response.body.id } })
                : await prisma.proposal.findFirst({
                      where: { email: TEST_EMAIL },
                      orderBy: { createdAt: 'desc' }
                  });

        expect(proposal).not.toBeNull();

        const finalProposal = await waitForStatus(proposal!.id, 'APPROVED');

        expect(finalProposal.status).toBe('APPROVED');
        expect(finalProposal.fraudCheckResult).toBe(true);
        expect(finalProposal.calculatedLimit).toBeGreaterThan(4000);
        expect(finalProposal.cardType).toBeDefined();
    });

    it('Scenario 2: fraud rejection (REJECTED)', async () => {
        const response = await request(API_URL)
            .post('/proposals')
            .send({
                CPF: '00000000000',
                fullName: 'Fraud Customer',
                email: TEST_EMAIL2,
                income: 6000
            });

        expect([200, 202]).toContain(response.status);

        const proposal = await prisma.proposal.findFirst({
            where: { email: TEST_EMAIL2 },
            orderBy: { createdAt: 'desc' }
        });

        expect(proposal).not.toBeNull();

        const finalProposal = await waitForStatus(proposal!.id, 'REJECTED');

        expect(finalProposal.status).toBe('REJECTED');
        expect(finalProposal.fraudCheckResult).toBe(false);
        expect(finalProposal.calculatedLimit).toBeNull();
    });

    it('Scenario 3: pipeline is really connected (status changes)', async () => {
        const response = await request(API_URL)
            .post('/proposals')
            .send({
                CPF: '98765432100',
                fullName: 'Pipeline Test',
                email: TEST_EMAIL,
                income: 9000
            });

        expect([200, 202]).toContain(response.status);

        const proposal = await prisma.proposal.findFirst({
            where: { email: TEST_EMAIL },
            orderBy: { createdAt: 'desc' }
        });

        expect(proposal).not.toBeNull();
        expect(['RECEIVED', 'PENDING']).toContain(proposal!.status);

        const after = await waitForStatus(proposal!.id, ['APPROVED', 'REJECTED']);

        expect(after.status).not.toBe('PENDING');
        expect(after.updatedAt).not.toEqual(proposal!.updatedAt);
    });

    it('Scenario 4: pipeline sends email to a real address', async () => {
        const response = await request(API_URL)
            .post('/proposals')
            .send({
                CPF: '55544433322',
                fullName: 'E2E Email Test',
                email: TEST_EMAIL,
                income: 12000
            });

        expect([200, 202]).toContain(response.status);

        const proposal = await prisma.proposal.findFirst({
            where: { email: TEST_EMAIL },
            orderBy: { createdAt: 'desc' }
        });

        expect(proposal).not.toBeNull();

        const finalProposal = await waitForStatus(
            proposal!.id,
            ['APPROVED', 'REJECTED']
        );

        expect(finalProposal.status).not.toBe('PENDING');
    });

    it("Scenario 5: fraud rejection due to single name", async() => { 
        const response = await request(API_URL)
            .post("/proposals")
            .send({
                CPF:'11122233344',
                fullName: 'Igor',
                email: TEST_EMAIL,
                income: 10000
            });

        expect([200, 201, 202]).toContain(response.status);

        const proposal = await prisma.proposal.findFirst({
            where: { email: TEST_EMAIL },
            orderBy: { createdAt: 'desc'}
        });

        expect(proposal).not.toBeNull();

        const final = await waitForStatus(proposal!.id, 'REJECTED');

        expect(final.status).toBe('REJECTED');

        expect(final.fraudCheckResult).toBe(false);

    })

});
