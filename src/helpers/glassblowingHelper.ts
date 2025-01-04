import { Page } from "playwright";

export const glassblowingBookingUrl =
  "https://app.10to8.com/book/cjbrzsjlhgpeyvshim/#";

export async function fetchScheduleDetails(): Promise<
  | {
      nextAvailableDay: Record<string, unknown>;
      day: unknown[];
      week: unknown[];
      month: unknown[];
      quarter: unknown[];
    }
  | undefined
> {
  const today = new Date();

  const formatDate = (date: Date) => date.toISOString().split("T")[0];
  const addDaysToToday = (days: number) => {
    const result = new Date(today);
    result.setDate(today.getDate() + days);
    return result;
  };

  const queries = {
    day: {
      date: formatDate(today),
    },
    week: {
      start_date: formatDate(today),
      end_date: formatDate(addDaysToToday(7)),
    },
    month: {
      start_date: formatDate(today),
      end_date: formatDate(addDaysToToday(30)),
    },
    quarter: {
      start_date: formatDate(today),
      end_date: formatDate(addDaysToToday(90)),
    },
  };

  const urls = {
    nextAvailableDay: buildUrl("next"),
    day: buildUrl("day", queries.day),
    week: buildUrl("week", queries.week),
    month: buildUrl("week", queries.month),
    quarter: buildUrl("week", queries.quarter),
  };

  const [nextAvailableDay, day, week, month, quarter] = await Promise.all(
    Object.values(urls).map((url) => fetch(url).then((res) => res.json()))
  );

  return { nextAvailableDay, day, week, month, quarter };
}

function buildUrl(path: string, params?: Record<string, string>): string {
  const scheduleUrl = "https://app.10to8.com/api/janus/v1/slots/";
  const sharedQueryParams = {
    appointment_type:
      "https://app.10to8.com/api/janus/v1/service-detail/1555658/",
    location: "https://app.10to8.com/api/janus/v1/location/744281/",
    timezone: "Europe/Stockholm",
  };

  const url = new URL(`${scheduleUrl}${path}`);
  url.search = new URLSearchParams({
    ...sharedQueryParams,
    ...params,
  }).toString();

  return url.toString();
}

export async function navigateToGlassblowingAvailability(
  page: Page,
  numberOfPeople: number = 2
) {
  await page.goto(glassblowingBookingUrl);

  await glassblowingBookingFrame(page)
    .getByRole("button")
    .getByText("Book")
    .nth(numberOfPeople - 1)
    .dispatchEvent("click");

  await glassblowingBookingFrame(page)
    .getByRole("heading", { name: "Choose Time Slot" })
    .waitFor({ state: "visible" });

  await glassblowingBookingFrame(page)
    .getByRole("paragraph")
    .getByText("Loading...")
    .first()
    .waitFor({ state: "hidden" });
}

export function glassblowingBookingFrame(page: Page) {
  return page.locator('iframe[title="Booking widget"]').contentFrame();
}
