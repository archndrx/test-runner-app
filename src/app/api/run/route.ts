import { NextResponse } from "next/server";
import { exec } from "child_process";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const testTitle = body.title || "";

    const isHeadless = body.isHeadless === true;

    const modeFlag = isHeadless ? "" : "--headed";

    const grepFlag = testTitle ? `-g "${testTitle}"` : "";
    const command = `npx playwright test ${modeFlag} ${grepFlag}`;

    console.log(`Executing: ${command}`);

    const output = await new Promise<string>((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          resolve(stdout + "\n" + stderr);
          return;
        }
        resolve(stdout);
      });
    });

    return NextResponse.json({ success: true, logs: output });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to execute test runner.",
        details: String(err),
      },
      { status: 500 }
    );
  }
}
