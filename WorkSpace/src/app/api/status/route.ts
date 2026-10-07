import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const statusPath = path.join(process.cwd(), 'agent_status.json');
  const data = fs.readFileSync(statusPath, 'utf-8');
  return NextResponse.json(JSON.parse(data), {
    headers: { 'Cache-Control': 'no-store' },
  });
}