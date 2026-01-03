import { Page, expect, test } from '@playwright/test';
import { TestStep } from './types';

export async function executeStep(page: Page, step: TestStep) {
  await test.step(`${step.stepName} [${step.action}]`, async () => {
    console.log(`[EXEC] ${step.stepName}`);
    switch (step.action) {
      case 'goto': if(step.value) await page.goto(step.value); break;
      case 'fill': 
        if(step.locator && step.value) {
          await page.locator(step.locator).waitFor({state: 'visible'});
          await page.fill(step.locator, step.value);
        }
        break;
      case 'click': 
        if(step.locator) await page.click(step.locator); 
        break;
      case 'assertText':
        if(step.locator && step.value) await expect(page.locator(step.locator)).toHaveText(step.value);
        break;
      case 'wait':
        if(step.value && !isNaN(Number(step.value))) await page.waitForTimeout(Number(step.value));
        else if(step.locator) await page.locator(step.locator).waitFor({state:'visible'});
        break;
    }
  });
}