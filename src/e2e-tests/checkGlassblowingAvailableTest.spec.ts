import { expect, test } from "@playwright/test";
import {
  glassblowingBookingFrame,
  navigateToGlassblowingAvailability,
} from "../helpers/glassblowingHelper";

test("availability flow for glassblowing booking", async ({ page }) => {
  await navigateToGlassblowingAvailability(page);
  await expect(
    glassblowingBookingFrame(page)
      .getByRole("heading", { name: "Choose time slot" })
      .first()
  ).toBeVisible();
});
