# Test JSON Runner

An intelligent **Keyword-Driven Testing Framework** that allows **Manual Testers** to execute robust automation scripts using **simple JSON files**, without writing a single line of code.

---

## Key Features

- **Zero-Code Execution**
  Define tests in JSON, run with Playwright engine.

- **Dynamic Discovery**
  Automatically finds and executes all `.json` test cases in the `data` folder.

- **Strict Validation**
  Integrated with **Zod** to catch typo or invalid data schema before execution.

- **Rich Reporting**
  Integrated with **Allure Report** for visualization and debugging.

- **Smart Waits**
  Built-in mechanism to handle dynamic loading elements.

---

## Tech Stack

- **Core:** TypeScript & Node.js
- **Automation:** Playwright
- **Validation:** Zod
- **Reporting:** Allure

---

## How to Run

### 1. Install Dependencies

Ensure you have Node.js installed, then run:

```bash
npm install
```

---

### 2. Create Test Scenario

Create a new file in `tests/data/`, for example `tests/data/login.json`:

```json
{
  "title": "Login Scenario",
  "steps": [
    {
      "stepName": "Open Website",
      "action": "goto",
      "value": "https://www.saucedemo.com/"
    },
    {
      "stepName": "Fill Username",
      "action": "fill",
      "locator": "[data-test='username']",
      "value": "standard_user"
    },
    {
      "stepName": "Click Login",
      "action": "click",
      "locator": "[data-test='login-button']"
    }
  ]
}
```

---

### 3. Execute Test

Run all test cases found in the `data` folder:

```bash
npx playwright test
```

---

### 4. View Report

To generate and open the Allure dashboard:

```bash
npx allure serve allure-results
```

---

## Supported Actions

Currently, the engine supports the following actions in JSON:

- **goto**
  Navigate to a URL.

- **click**
  Click an element (requires locator).

- **fill**
  Type text into an input (requires locator & value).

- **assertText**
  Verify text content (requires locator & value).

- **wait**
  Pause execution (requires value in ms or locator to appear).
