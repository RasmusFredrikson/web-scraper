import { Page } from "playwright";

export const glassblowingBookingUrl =
  "https://app.10to8.com/book/cjbrzsjlhgpeyvshim/#";

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
