import sendEmail from "../utils/email";
import env from "../utils/env";

/**
 * sendVerificationEmail
 *
 * @param to The email address to send the verification email
 * @param verificationCode The verification code
 */
export function sendVerificationEmail(to: string, verificationCode: string) {
  const subject = "Verify your email address";
  const verificationUrl = `${env.EXPRESS_HOST}:${env.EXPRESS_PORT}/account/verify?verificationCode=${verificationCode}`;
  // TODO => This needs to be replaced with a HTML template
  const content = `
  <h1>Verify your account</h1>

  <p>Please click the following link to verify your account</p>
  <a href="${verificationUrl}">Verify Account</a>

  <p>If you can't click the link above, please copy and paste the following link into your browser</p>
  <p>${verificationUrl}</p>
  `;

  sendEmail(to, subject, content);
}

/**
 * sendPasswordResetEmail
 *
 * @param to The email address to send the verification email
 * @param verificationCode The verification code
 */
export function sendPasswordResetEmail(to: string, verificationCode: string) {}
