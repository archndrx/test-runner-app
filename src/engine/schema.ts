import { z } from "zod";

const ActionEnum = z.enum(["goto", "click", "fill", "assertText", "wait"]);

export const TestStepSchema = z
  .object({
    stepName: z.string(),
    action: ActionEnum,
    locator: z.string().optional(),
    altLocator: z.string().optional(),
    value: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.action === "click" && !data.locator) return false;
      if (data.action === "fill" && (!data.locator || !data.value))
        return false;
      if (data.action === "goto" && !data.value) return false;
      if (data.action === "wait" && !data.value && !data.locator) return false;
      return true;
    },
    { message: "Invalid step configuration" }
  );

export const TestCaseSchema = z.object({
  title: z.string(),
  steps: z.array(TestStepSchema),
});
