"use client";

import { useState } from "react";
import { Plus, Trash2, Play, Save } from "lucide-react";

// Data types according to our Engine
type ActionType = "goto" | "click" | "fill" | "assertText" | "wait";

interface TestStep {
  id: number;
  stepName: string;
  action: ActionType;
  locator: string;
  altLocator?: string;
  value: string;
}

export default function Home() {
  const [testTitle, setTestTitle] = useState("New Test Scenario");
  const [steps, setSteps] = useState<TestStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testLogs, setTestLogs] = useState<string>("");
  const [isHeadless, setIsHeadless] = useState(false);

  const stripAnsi = (text: string) => {
    return text.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, "");
  };

  const handleSave = async () => {
    try {
      const payload = {
        title: testTitle,
        steps: steps,
      };

      const response = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        alert("✅ Successfully Saved! Check tests/data folder");
      } else {
        alert("❌ Failed: " + result.error);
      }
    } catch (error) {
      alert("❌ Connection Error");
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setTestLogs("Initializing...\n1. Saving latest changes...\n");

    try {
      // 1. AUTO-SAVE
      const savePayload = {
        title: testTitle,
        steps: steps,
      };

      const saveResponse = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(savePayload),
      });

      const saveResult = await saveResponse.json();
      if (!saveResult.success) {
        throw new Error("Auto-save failed: " + saveResult.error);
      }

      setTestLogs(
        (prev) => prev + "2. Changes saved. Starting Playwright...\n"
      );

      // 2. EXECUTE
      const runResponse = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: testTitle,
          isHeadless: isHeadless,
        }),
      });

      const runResult = await runResponse.json();

      if (runResult.success) {
        setTestLogs(
          (prev) => prev + "\n--- TEST EXECUTION LOGS ---\n" + runResult.logs
        );
      } else {
        setTestLogs((prev) => prev + `\nExecution Error: ${runResult.error}`);
      }
    } catch (error: any) {
      setTestLogs(
        (prev) => prev + `\nCritical Error: ${error.message || "Unknown error"}`
      );
    } finally {
      setIsRunning(false);
    }
  };

  // Function to add a new step
  const addStep = () => {
    setSteps([
      ...steps,
      {
        id: Date.now(),
        stepName: "",
        action: "click",
        locator: "",
        altLocator: "",
        value: "",
      },
    ]);
  };

  // Function to delete step
  const removeStep = (id: number) => {
    setSteps(steps.filter((step) => step.id !== id));
  };

  // Function to update step data
  const updateStep = (id: number, field: keyof TestStep, newValue: string) => {
    setSteps(
      steps.map((step) =>
        step.id === id ? { ...step, [field]: newValue } : step
      )
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-800">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              QA No-Code Generator
            </h1>
            <p className="text-slate-500">
              Create automation scripts without coding
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* HEADLESS TOGGLE */}
            <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition">
              <input
                type="checkbox"
                checked={isHeadless}
                onChange={(e) => setIsHeadless(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-600">
                Ghost Mode (Headless)
              </span>
            </label>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition font-medium shadow-sm"
            >
              <Save size={18} /> Save
            </button>

            <button
              onClick={handleRun}
              disabled={isRunning}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition font-medium shadow-md ${
                isRunning
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isRunning ? (
                <span>Running...</span>
              ) : (
                <>
                  <Play size={18} fill="currentColor" /> Run Test
                </>
              )}
            </button>
          </div>
        </div>

        {/* TITLE INPUT */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-slate-200">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Scenario Title
          </label>
          <input
            type="text"
            value={testTitle}
            onChange={(e) => setTestTitle(e.target.value)}
            className="w-full text-lg font-semibold border-b-2 border-slate-200 focus:border-blue-500 outline-none px-2 py-1"
          />
        </div>

        {/* STEPS LIST */}
        <div className="space-y-6 mb-8">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-2"
            >
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-700 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-slate-700 text-sm">
                    Step {index + 1}
                  </h3>
                </div>
                <button
                  onClick={() => removeStep(step.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  title="Remove Step"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* 1. Step Name & Action */}
                <div className="lg:col-span-3 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">
                      Step Name
                    </label>
                    <input
                      placeholder="e.g. Login Process"
                      className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                      value={step.stepName}
                      onChange={(e) =>
                        updateStep(step.id, "stepName", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">
                      Action
                    </label>
                    <select
                      className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                      value={step.action}
                      onChange={(e) =>
                        updateStep(
                          step.id,
                          "action",
                          e.target.value as ActionType
                        )
                      }
                    >
                      <option value="goto">Go To URL</option>
                      <option value="click">Click Element</option>
                      <option value="fill">Fill Input</option>
                      <option value="assertText">Assert Text</option>
                      <option value="wait">Wait</option>
                    </select>
                  </div>
                </div>

                {/* 2. LOCATOR AREA (Professional Style) */}
                <div className="lg:col-span-6 flex flex-col">
                  <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">
                    Target Locator
                  </label>

                  {/* MAIN LOCATOR */}
                  <div className="relative z-10">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span
                        className={`text-xs font-bold ${
                          step.action === "goto"
                            ? "text-slate-300"
                            : "text-blue-500"
                        }`}
                      >
                        A
                      </span>
                    </div>
                    <input
                      placeholder={
                        step.action === "goto"
                          ? "Not Required"
                          : "Primary Selector (e.g. #submit-btn)"
                      }
                      className={`w-full border rounded-lg py-2 pl-8 pr-3 text-sm font-mono transition shadow-sm
                        ${
                          step.action === "goto" || step.action === "wait"
                            ? "bg-slate-50 text-slate-400 border-slate-200"
                            : "border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        }`}
                      disabled={
                        step.action === "goto" || step.action === "wait"
                      }
                      value={step.locator}
                      onChange={(e) =>
                        updateStep(step.id, "locator", e.target.value)
                      }
                    />
                  </div>

                  {/* BACKUP LOCATOR (Branching Style) */}
                  {step.action !== "goto" && step.action !== "wait" && (
                    <div className="flex items-center mt-[-4px]">
                      <div className="w-6 h-10 border-l-2 border-b-2 border-slate-200 rounded-bl-xl ml-4 mr-2 translate-y-[-50%] z-0"></div>

                      <div className="relative flex-1 mt-2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-slate-400"
                          >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                          </svg>
                        </div>
                        <input
                          placeholder="Backup Selector (e.g text='Submit')"
                          className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-lg py-1.5 pl-9 pr-3 text-xs font-mono focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition placeholder:text-slate-400"
                          value={step.altLocator || ""}
                          onChange={(e) =>
                            updateStep(step.id, "altLocator", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Value Area */}
                <div className="lg:col-span-3">
                  <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">
                    Input Value
                  </label>
                  <textarea
                    rows={4}
                    placeholder={
                      step.action === "click"
                        ? "Not Required"
                        : "Value to type / URL"
                    }
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm disabled:bg-slate-50 disabled:text-slate-400 resize-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                    disabled={step.action === "click"}
                    value={step.value}
                    onChange={(e) =>
                      updateStep(step.id, "value", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          ))}

          {/* ADD BUTTON */}
          <button
            onClick={addStep}
            className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition flex items-center justify-center gap-2 font-medium"
          >
            <Plus size={20} /> Add Test Step
          </button>
        </div>

        {/* JSON PREVIEW */}
        <div className="bg-slate-900 text-slate-300 p-6 rounded-xl font-mono text-sm overflow-x-auto">
          <h3 className="text-slate-500 mb-2 uppercase text-xs tracking-wider">
            Live JSON Preview
          </h3>
          <pre>{JSON.stringify({ title: testTitle, steps }, null, 2)}</pre>
        </div>

        {/* EXECUTION LOGS AREA */}
        <div className="mt-8 bg-black text-green-400 p-6 rounded-xl font-mono text-sm overflow-x-auto border border-slate-700 shadow-2xl">
          <h3 className="text-slate-500 mb-2 uppercase text-xs tracking-wider flex justify-between">
            <span>Terminal Output</span>
            {isRunning && (
              <span className="text-yellow-400 animate-pulse">
                ● Executing...
              </span>
            )}
          </h3>
          <pre className="whitespace-pre-wrap font-mono text-sm">
            {stripAnsi(testLogs) || "Ready to run tests..."}
          </pre>
        </div>
      </div>
    </main>
  );
}
