import { createTransport } from "nodemailer";

export async function sendEmail(subject: string, body: string) {
  const transporter = createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER_FROM,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER_FROM,
    to: process.env.EMAIL_USER_TO,
    subject,
    text: body,
  };

  await transporter.sendMail(mailOptions);
}
