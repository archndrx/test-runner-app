import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(request: Request) {
  try {
    // 1. Receive data from Frontend
    const data = await request.json();
    
    // 2. Determine storage location (tests/data folder)
    const dataDir = path.join(process.cwd(), 'tests', 'data');
    
    // Ensure folder exists, create if it doesn't exist yet
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // 3. Determine file name (sanitize for safety)
    // Convert "Login Scenario" to "login-scenario.json"
    const safeFilename = data.title.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.json';
    const filePath = path.join(dataDir, safeFilename);

    // 4. Write JSON file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true, message: `Saved to ${safeFilename}` });
    
  } catch (error) {
    console.error('Save Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save file' }, { status: 500 });
  }
}