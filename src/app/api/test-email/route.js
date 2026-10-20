import { NextResponse } from 'next/server'
import { appendEmailLog } from '@/lib/email-logs'
import {
  createSmtpTransporter,
  getSafeEmailFailure,
  getSmtpConfig,
} from '@/lib/smtp'

const TEST_RECIPIENT = 'parasvarankar01@gmail.com'
const COOLDOWN_MS = 60_000
let lastAttemptAt = 0
let attemptInProgress = false

function recordTestLog(entry) {
  try {
    appendEmailLog({
      recipient: TEST_RECIPIENT,
      documentType: 'test',
      documentNumber: '',
      ...entry,
    })
  } catch {
    console.error('Unable to persist test-email audit log.')
  }
}

export async function POST() {
  const now = Date.now()

  if (attemptInProgress || now - lastAttemptAt < COOLDOWN_MS) {
    return NextResponse.json(
      {
        success: false,
        code: 'TEST_EMAIL_RATE_LIMITED',
        message: 'A test email was attempted recently. Wait one minute before trying again.',
      },
      { status: 429 }
    )
  }

  const smtp = getSmtpConfig()
  if (smtp.error) {
    lastAttemptAt = now
    recordTestLog({
      sender: '',
      status: 'failed',
      message: smtp.error.message,
    })

    return NextResponse.json(
      {
        success: false,
        code: smtp.error.code,
        message: smtp.error.message,
        ...(smtp.error.missing ? { missing: smtp.error.missing } : {}),
      },
      { status: smtp.error.status }
    )
  }

  attemptInProgress = true
  lastAttemptAt = now

  try {
    const transporter = createSmtpTransporter(smtp.config)
    await transporter.verify()
    await transporter.sendMail({
      from: `"VOOM PAINTS" <${smtp.config.user}>`,
      to: TEST_RECIPIENT,
      subject: 'Voom Paints email test',
      text: 'Hello world',
      html: '<p>Hello world</p>',
    })

    recordTestLog({
      sender: smtp.config.user,
      status: 'sent',
      message: 'Test email sent successfully.',
    })

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully.',
    })
  } catch (error) {
    const failure = getSafeEmailFailure(error)

    console.error('Test email delivery failed:', {
      code: failure.code,
      smtpCode: error?.code || 'unknown',
      causeCode: error?.cause?.code || null,
      responseCode: error?.responseCode || null,
    })

    recordTestLog({
      sender: smtp.config.user,
      status: 'failed',
      message: failure.message,
    })

    return NextResponse.json(
      {
        success: false,
        code: failure.code,
        message: failure.message,
      },
      { status: failure.status }
    )
  } finally {
    attemptInProgress = false
  }
}
