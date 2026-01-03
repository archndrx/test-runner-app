import { Page, expect, test } from "@playwright/test";
import { TestStep } from "./types";

function fixLocator(locator: string): string {
  if (!locator) return locator;
  const isAttributePattern = /^[a-zA-Z-]+=['"].*['"]$/.test(locator);

  if (isAttributePattern && !locator.startsWith("[")) {
    console.log(`[SMART-LOCATOR] Auto-wrapping attribute: [${locator}]`);
    return `[${locator}]`;
  }

  return locator;
}

export async function executeStep(page: Page, step: TestStep) {
  await test.step(`${step.stepName} [${step.action}]`, async () => {
    const rawLocator = step.locator || "";
    const rawAltLocator = step.altLocator || undefined;

    const finalLocator = fixLocator(rawLocator);
    const finalAltLocator = rawAltLocator
      ? fixLocator(rawAltLocator)
      : undefined;

    console.log(`[EXEC] ${step.stepName}`);

    const performActionWithHealing = async (
      primaryLocator: string,
      backupLocator: string | undefined,
      actionCallback: (loc: string) => Promise<void>
    ) => {
      try {
        await actionCallback(primaryLocator);
      } catch (primaryError) {
        if (backupLocator) {
          console.warn(
            `[HEALING] Primary '${primaryLocator}' failed. Trying backup: '${backupLocator}'...`
          );
          try {
            await actionCallback(backupLocator);
            console.log(`[HEALING] ✅ SUCCESS! Script saved by self-healing.`);
          } catch (backupError) {
            throw new Error(
              `CRITICAL FAILURE: Both primary ('${primaryLocator}') and backup ('${backupLocator}') failed.`
            );
          }
        } else {
          throw primaryError;
        }
      }
    };

    switch (step.action) {
      case "goto":
        if (step.value) {
          let targetUrl = step.value;
          if (!targetUrl.startsWith("http")) targetUrl = "https://" + targetUrl;
          await page.goto(targetUrl);
        }
        break;

      case "fill":
        if (finalLocator && step.value) {
          await performActionWithHealing(
            finalLocator,
            finalAltLocator,
            async (loc) => {
              await page
                .locator(loc)
                .waitFor({ state: "visible", timeout: 2000 });
              await page.fill(loc, step.value!);
            }
          );
        }
        break;

      case "click":
        if (finalLocator) {
          await performActionWithHealing(
            finalLocator,
            finalAltLocator,
            async (loc) => {
              await page.locator(loc).click({ timeout: 2000 });
            }
          );
        }
        break;

      case "assertText":
        if (step.locator && step.value)
          await expect(page.locator(step.locator)).toHaveText(step.value);
        break;
      case "wait":
        if (step.value && !isNaN(Number(step.value)))
          await page.waitForTimeout(Number(step.value));
        break;
    }
  });
}
