import "dotenv/config";

import { app, InvocationContext, Timer } from "@azure/functions";
import { chromium } from "playwright";
import { sendEmail } from "../email/sendEmail";
import {
  glassblowingBookingFrame,
  glassblowingBookingUrl,
  navigateToGlassblowingAvailability,
} from "../helpers/glassblowingHelper";

export async function checkGlassblowingAvailability(
  timer: Timer,
  context: InvocationContext
): Promise<void> {
  context.log("Timer trigger function executed at: ", new Date().toISOString());

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await navigateToGlassblowingAvailability(page);

    const slotsNotAvailable = await glassblowingBookingFrame(page)
      .getByRole("listitem")
      .getByText("No available slots")
      .count();

    if (slotsNotAvailable < 7) {
      context.log("Slots are available");

      try {
        await sendEmail(
          "Slots Available for Glassblowing",
          `There are now slots available for glassblowing. Check the booking page: ${glassblowingBookingUrl}!`
        );
        context.log("Email sent successfully.");
      } catch (error) {
        context.error("Failed to send email: ", error);
      }
    } else {
      context.log("No slots available :(");
    }
  } catch (error) {
    context.log("Error occurred when checking availability: ", error);
  } finally {
    await browser.close();
  }
}

const isDev = process.env.NODE_ENV === "development";
const schedule = isDev ? "*/10 * * * * *" : "0 */10 * * * *"; // 10 seconds in dev, 10 mins in prod

app.timer("checkGlassblowingAvailability", {
  schedule,
  handler: checkGlassblowingAvailability,
});
