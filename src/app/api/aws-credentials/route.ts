import { NextResponse } from 'next/server';

export async function GET() {
  // These should be in your .env.local file
  return NextResponse.json({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
  });
}