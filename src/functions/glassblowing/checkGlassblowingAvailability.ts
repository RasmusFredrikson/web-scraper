import "dotenv/config";

import { app, InvocationContext, Timer } from "@azure/functions";
import {
  shouldSendNewEmail,
  updateLastEmailTimestamp,
} from "../../email/lastEmailTimestamp";
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

  const dataExist =
    Object.keys(data?.nextAvailableDay ?? {}).length !== 0 ||
    data?.day.length !== 0 ||
    data?.week.length !== 0 ||
    data?.month.length !== 0 ||
    data?.quarter.length !== 0;

  if (!dataExist) {
    context.log("No slots available :(");
    await updateLastEmailTimestamp(0, context);
    return;
  }

  context.log("Slots are available");

  const EMAIL_DELAY_HOURS = 6;
  const shouldSendEmail = await shouldSendNewEmail(
    EMAIL_DELAY_HOURS * 60 * 60 * 1000,
    context
  );

  if (!shouldSendEmail) {
    context.log("Email was sent recently, skipping notification.");
    return;
  }

  try {
    await sendEmail(
      "Slots Available for Glassblowing",
      `There are now slots available for glassblowing. Check the booking page: ${glassblowingBookingUrl}!`
    );
    context.log("Email sent successfully.");
    await updateLastEmailTimestamp(Date.now(), context);
  } catch (error) {
    context.error("Failed to send email: ", error);
  }
}

const schedule = isDev ? "*/10 * * * * *" : "0 */10 * * * *"; // 10 seconds in dev, 10 mins in prod

app.timer("checkGlassblowingAvailability", {
  schedule,
  handler: checkGlassblowingAvailability,
});
