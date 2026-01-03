import { z } from 'zod';
import { TestStepSchema, TestCaseSchema } from './schema';

export type TestStep = z.infer<typeof TestStepSchema>;
export type TestCase = z.infer<typeof TestCaseSchema>;