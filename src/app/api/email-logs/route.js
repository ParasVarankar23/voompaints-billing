import { NextResponse } from 'next/server'
import { readEmailLogs } from '@/lib/email-logs'

export async function GET() {
  try {
    const logs = readEmailLogs().sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime()
    )
    return NextResponse.json(logs)
  } catch (error) {
    console.error('GET /api/email-logs error:', error)
    return NextResponse.json(
      { success: false, message: 'Unable to load email logs.' },
      { status: 500 }
    )
  }
}
