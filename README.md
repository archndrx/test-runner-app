# QA Hybrid Framework (Next.js + Playwright)

## Description

This project is a modern **Keyword-Driven Testing Framework** that combines a **Next.js User Interface** with a **Playwright Automation Engine**. It allows **Manual Testers** to generate, manage, and execute automation scripts via a **web browser without writing code**, while providing robust validation and reporting for **SDETs**.

---

## Key Features

1. **No-Code Interface**
   Web-based form to create test steps (Click, Fill, Navigate).

2. **Hybrid Architecture**
   Monorepo combining React Frontend and Playwright Backend.

3. **Strict Validation**
   Zod schemas ensure all test data is valid before execution.

4. **Professional Reporting**
   Integrated Allure Report for visual test results.

5. **Hot-Reloading**
   Changes in UI are immediately reflected in the test engine.

---

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, Lucide Icons
- **Automation:** Playwright, TypeScript
- **Validation:** Zod
- **Utilities:** Node.js File System

---

## Prerequisites

- Node.js (Version 18 or higher)
- Java (Optional, required only for Allure Report generation)

---

## Installation Guide

1. Clone the repository or download the source code.
2. Open terminal in the project root folder.
3. Run the following command to install dependencies:

```bash
npm install
```

4. Install Playwright browsers:

```bash
npx playwright install
```

---

## How to Use (For Manual Testers)

1. Start the Web Interface:

```bash
npm run dev
```

2. Open your browser at:
   `http://localhost:3000`

3. Use the form to add test steps (e.g., Go to URL, Click Button).

4. Check the generated JSON preview.

---

## How to Use (For SDET / CLI)

1. Run automation tests in headless mode:

```bash
npm run test
```

2. Run automation tests with browser visible:

```bash
npx playwright test --headed
```

3. Generate and view test report:

```bash
npm run report
```

---

## Project Structure

- `src/app`
  Next.js Frontend logic (UI)

- `src/engine`
  Automation Logic (Action Mappers, Schemas, Types)

- `tests/data`
  Storage for JSON test case files

- `tests/main.spec.ts`
  The main runner script that reads JSON and triggers Playwright

---

## Troubleshooting

- **Issue:** "Allure command not found"
  **Solution:** Ensure you run `npm run report` instead of just `allure`.

- **Issue:** "Validation Error"
  **Solution:** Check if your JSON file has missing required fields (e.g., Click action without a Locator).
