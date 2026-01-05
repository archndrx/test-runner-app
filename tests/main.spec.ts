import { test } from "@playwright/test";
import { executeStep } from "../src/engine/actionHelper";
import { TestCaseSchema } from "../src/engine/schema";
import * as fs from "fs";
import * as path from "path";

const dataDir = path.join(__dirname, "data");

if (fs.existsSync(dataDir)) {
  const files = fs
    .readdirSync(dataDir)
    .filter((file) => file.endsWith(".json"));

  files.forEach((file) => {
    const filePath = path.join(dataDir, file);

    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const json = JSON.parse(raw);

      const result = TestCaseSchema.safeParse(json);

      if (result.success) {
        test(json.title, async ({ page }) => {
          console.log(`[START] Executing scenario: ${json.title}`);

          for (const step of result.data.steps) {
            await executeStep(page, step);
          }
        });
      } else {
        console.warn(`[SKIP] Invalid JSON structure in ${file}:`, result.error);
      }
    } catch (err) {
      console.warn(`[SKIP] Failed to read ${file}:`, err);
    }
  });
} else {
  console.warn("[WARN] Data directory not found. Create a test first via UI.");
}
