import { Page, expect, test } from "@playwright/test";
import { TestStep } from "./types";

function fixLocator(locator: string, actionType: string = 'click'): string {
  if (!locator) return locator;

  const simpleAttributeMatch = locator.match(/^([a-zA-Z-]+)=(.*)$/);
  const isReservedKeyword = simpleAttributeMatch && ['text', 'xpath', 'css', 'has-text'].includes(simpleAttributeMatch[1]);

  if (simpleAttributeMatch && !locator.startsWith('[') && !isReservedKeyword) {
    const key = simpleAttributeMatch[1];
    const value = simpleAttributeMatch[2];
    const hasQuotes = value.startsWith("'") || value.startsWith('"');
    const finalValue = hasQuotes ? value : `'${value}'`;
    console.log(`[SMART-LOCATOR] ⚡ Attribute Shorthand detected. Converting to [${key}=${finalValue}]`);
    return `[${key}=${finalValue}]`;
  }

  const isPlainText = /^[a-zA-Z0-9\s\-_:']+$/.test(locator);

  if (isPlainText) {
    console.log(`[SMART-LOCATOR] 🔮 Omni-Search activated for: '${locator}'`);
    
    const parts = [
      `button:has-text("${locator}")`,
      
      `a:has-text("${locator}")`,
      
      `input[type='submit'][value*='${locator}']`,
      `input[type='button'][value*='${locator}']`,
      
      `:text("${locator}")`, 
      `[placeholder*='${locator}']`,
      `[aria-label*='${locator}']`,
      `[title*='${locator}']`,
      `img[alt*='${locator}']`
    ];

    return parts.join(', ');
  }

  return locator;
}

export async function executeStep(page: Page, step: TestStep) {
  await test.step(`${step.stepName} [${step.action}]`, async () => {
    const rawLocator = step.locator || "";
    const rawAltLocator = step.altLocator || undefined;

    const finalLocator = fixLocator(rawLocator, step.action);
    const finalAltLocator = rawAltLocator
      ? fixLocator(rawAltLocator, step.action)
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
                .waitFor({ state: "visible", timeout: 5000 });
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
              await page.locator(loc).click({ timeout: 5000 });
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
