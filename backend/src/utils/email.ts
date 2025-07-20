import nodemailer, { Transporter } from "nodemailer";
import env from "./env";

/**
 * 
 * TODO This could be greatly improved but will do for now
 * 
 * @param to The email address to send the email to
 * @param subject  The subject of the email
 * @param content  The content of the email
 */
export default function sendEmail(
  to: string,
  subject: string,
  content: string
) {
  const transporter: Transporter = nodemailer.createTransport({
    host: env.EMAIL_SERVICE,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_SECURE,
    auth: {
      user: env.EMAIL_ADDRESS,
      pass: env.EMAIL_PASSWORD,
    },
  });

  const options = {
    from: env.EMAIL_ADDRESS,
    to,
    subject,
    text: content,
  };

  transporter.sendMail(options, (error, info) => {
    if (error) console.error(`[-] Nodemailer error: ${error}`);
    else console.log(`Nodemailer info: ${JSON.stringify(info, null, 2)}`);
  });
}
