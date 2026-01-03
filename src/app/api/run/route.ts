import { NextResponse } from 'next/server';
import { exec } from 'child_process';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Receive the specific test title to run
    const body = await request.json();
    const testTitle = body.title || '';

    /**
     * COMMAND EXPLANATION:
     * - 'npx playwright test' : The base command.
     * - '--headed' : Shows the browser UI.
     * - '-g "Title"' : The "grep" flag. It tells Playwright to ONLY run tests 
     * that contain this specific title string.
     */
    const command = testTitle 
      ? `npx playwright test --headed -g "${testTitle}"`
      : `npx playwright test --headed`; // Fallback to run all if no title provided

    console.log(`Executing command: ${command}`);

    const output = await new Promise<string>((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          // Resolve with logs even on error, so user sees what happened
          resolve(stdout + '\n' + stderr);
          return;
        }
        resolve(stdout);
      });
    });

    return NextResponse.json({ success: true, logs: output });

  } catch (err) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to execute test runner.',
      details: String(err)
    }, { status: 500 });
  }
}