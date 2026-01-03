import { test } from '@playwright/test';
import { executeStep } from '../src/engine/actionHelper';
import { TestCaseSchema } from '../src/engine/schema';
import * as fs from 'fs';
import * as path from 'path';

const dataDir = path.join(__dirname, 'data');
const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));

files.forEach(file => {
  test(`[${file}] Exec`, async ({ page }) => {
    const raw = fs.readFileSync(path.join(dataDir, file), 'utf-8');
    const json = JSON.parse(raw);
    const result = TestCaseSchema.safeParse(json);
    
    if (!result.success) throw new Error(`Invalid JSON: ${result.error.issues.map(e => e.message).join(' | ')}`);
    
    for (const step of result.data.steps) {
      await executeStep(page, step);
    }
  });
});