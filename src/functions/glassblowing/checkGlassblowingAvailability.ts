import "dotenv/config";

import { app, InvocationContext, Timer } from "@azure/functions";
import { sendEmail } from "../../email/sendEmail";
import {
  fetchScheduleDetails,
  glassblowingBookingUrl,
} from "../../helpers/glassblowingHelper";

const isDev = process.env.NODE_ENV === "development";

export async function checkGlassblowingAvailability(
  timer: Timer,
  context: InvocationContext
): Promise<void> {
  context.log("Timer trigger function executed at: ", new Date().toISOString());

  const data = await fetchScheduleDetails();

  context.log("Hej: ", data);

  const dataExist =
    Object.keys(data?.nextAvailableDay ?? {}).length !== 0 ||
    data?.day.length !== 0 ||
    data?.week.length !== 0 ||
    data?.month.length !== 0 ||
    data?.quarter.length !== 0;

  if (!dataExist) {
    context.log("No slots available :(");
    return;
  }

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
}

const schedule = isDev ? "*/10 * * * * *" : "0 */10 * * * *"; // 10 seconds in dev, 10 mins in prod

app.timer("checkGlassblowingAvailability", {
  schedule,
  handler: checkGlassblowingAvailability,
});
