import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "./sesClient.js";

interface EmailData{
    to: string,
    subject: string,
    html: string
}

export const sendEmail = async ({ to, subject, html }: EmailData) => {
  const params = {
    Source: process.env.MAIL_FROM,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: html,
          Charset: "UTF-8",
        },
      },
    },
  };

  return sesClient.send(new SendEmailCommand(params));
};
