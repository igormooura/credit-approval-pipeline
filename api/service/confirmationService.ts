import { sendEmail } from "./email/emailService";

interface ConfirmationData {
  email: string;
  fullName: string;
}

export const confirmationService = async ({ email, fullName }: ConfirmationData) => {

  if (!email || !fullName) throw new Error("Incomplete data");
  

  const subject = "We received your application!";
  const html = `
    <h3>Hello, ${fullName}!</h3>
    <p>We have received your credit card application.</p>
    <p>Our artificial intelligence is already analyzing your profile.</p>
    <p>You will receive another email shortly with the result.</p>
  `;

  await sendEmail({ to: email, subject, html });

};