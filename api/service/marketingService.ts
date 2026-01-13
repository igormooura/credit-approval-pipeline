import prisma from "./database.service";
import { sendEmail } from "./email/emailService";

export const sendApprovedEmail = async (data: {
  email: string;
  customerName: string;
  cardType: string;
  limit: number;
}) => {
  const { email, customerName, cardType, limit } = data;

  if (!email || !customerName) return;

  let subject = "Welcome to the Bank!";
  let html = `
    <p>Hello <strong>${customerName}</strong>,</p>
    <p>Your credit card has been approved with a limit of <strong>$${limit}</strong>.</p>
  `;

  if (cardType === "PLATINUM") {
    subject = "Congratulations!";
    html = `
      <p>Hello VIP <strong>${customerName}</strong>!</p>
      <p>Your <strong>Platinum metal card</strong> is being prepared.</p>
      <p>You also earned <strong>10,000 miles</strong>.</p>
    `;
  }

  await sendEmail({
    to: email,
    subject,
    html,
  });
};

export const sendRejectedEmail = async (proposalId: string) => {
  if (!proposalId) return;

  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
  });

  if (!proposal || !proposal.email) return;

  const subject = "Update on your credit card request";
  const html = `
    <p>Hello <strong>${proposal.fullName}</strong>,</p>
    <p>Thank you for your interest in our bank.</p>
    <p>After reviewing your request, we were unable to approve it at this time.</p>
    <p>You may apply again in the future.</p>
  `;

  await sendEmail({
    to: proposal.email,
    subject,
    html,
  });
};
