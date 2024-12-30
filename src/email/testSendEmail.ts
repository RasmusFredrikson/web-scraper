import "dotenv/config";
import { sendEmail } from "./sendEmail";

(async () => {
  try {
    await sendEmail("Test Subject", "This is a test email body.");
    console.log("Email sent successfully.");
  } catch (error) {
    console.error("Failed to send email:", error);
  }
})();
