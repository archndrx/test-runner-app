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
  value: string;
}

export default function Home() {
  const [testTitle, setTestTitle] = useState("New Test Scenario");
  const [steps, setSteps] = useState<TestStep[]>([]);

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

  // Fungsi tambah step baru
  const addStep = () => {
    setSteps([
      ...steps,
      { id: Date.now(), stepName: "", action: "click", locator: "", value: "" },
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
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Save size={18} /> Save JSON
            </button>
            <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
              <Play size={18} /> Run Test
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
        <div className="space-y-4 mb-8">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex gap-4 items-start animate-in fade-in slide-in-from-bottom-2"
            >
              <div className="bg-slate-100 w-8 h-8 flex items-center justify-center rounded-full font-bold text-slate-500 mt-1">
                {index + 1}
              </div>

              <div className="grid grid-cols-12 gap-3 flex-1">
                {/* Step Name */}
                <div className="col-span-3">
                  <input
                    placeholder="Step Name (e.g. Open Login)"
                    className="w-full border rounded p-2 text-sm"
                    value={step.stepName}
                    onChange={(e) =>
                      updateStep(step.id, "stepName", e.target.value)
                    }
                  />
                </div>

                {/* Action Dropdown */}
                <div className="col-span-2">
                  <select
                    className="w-full border rounded p-2 text-sm bg-white"
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
                    <option value="click">Click</option>
                    <option value="fill">Fill Input</option>
                    <option value="assertText">Assert Text</option>
                    <option value="wait">Wait</option>
                  </select>
                </div>

                {/* Locator */}
                <div className="col-span-3">
                  <input
                    placeholder={
                      step.action === "goto"
                        ? "Disabled"
                        : "Locator (e.g. #btn-login)"
                    }
                    className="w-full border rounded p-2 text-sm disabled:bg-slate-100 disabled:text-slate-400"
                    disabled={step.action === "goto" || step.action === "wait"}
                    value={step.locator}
                    onChange={(e) =>
                      updateStep(step.id, "locator", e.target.value)
                    }
                  />
                </div>

                {/* Value */}
                <div className="col-span-3">
                  <input
                    placeholder="Value (e.g. user123)"
                    className="w-full border rounded p-2 text-sm disabled:bg-slate-100 disabled:text-slate-400"
                    disabled={step.action === "click"}
                    value={step.value}
                    onChange={(e) =>
                      updateStep(step.id, "value", e.target.value)
                    }
                  />
                </div>

                {/* Delete Button */}
                <div className="col-span-1 flex justify-center">
                  <button
                    onClick={() => removeStep(step.id)}
                    className="text-red-400 hover:text-red-600 p-2"
                  >
                    <Trash2 size={18} />
                  </button>
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

        {/* JSON PREVIEW (DEBUGGING) */}
        <div className="bg-slate-900 text-slate-300 p-6 rounded-xl font-mono text-sm overflow-x-auto">
          <h3 className="text-slate-500 mb-2 uppercase text-xs tracking-wider">
            Live JSON Preview
          </h3>
          <pre>{JSON.stringify({ title: testTitle, steps }, null, 2)}</pre>
        </div>
      </div>
    </main>
  );
}
