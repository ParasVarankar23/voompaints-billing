import nodemailer from 'nodemailer'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function getSmtpConfig() {
  const host = (process.env.SMTP_HOST || '').trim()
  const port = Number(process.env.SMTP_PORT || 587)
  const secureValue = (process.env.SMTP_SECURE || 'false')
    .trim()
    .toLowerCase()
  const user = (process.env.SMTP_USER || '').trim()
  const pass = process.env.SMTP_PASS || ''

  const missing = []

  if (!host) missing.push('SMTP_HOST')
  if (!process.env.SMTP_PORT) missing.push('SMTP_PORT')
  if (!user) missing.push('SMTP_USER')
  if (!pass) missing.push('SMTP_PASS')

  if (missing.length) {
    return {
      error: {
        code: 'SMTP_CONFIG_MISSING',
        message: `Email configuration is incomplete. Set ${missing.join(' and ')}.`,
        missing,
        status: 500,
      },
    }
  }

  if (!EMAIL_REGEX.test(user)) {
    return {
      error: {
        code: 'SMTP_CONFIG_INVALID',
        message: 'SMTP_USER must be a valid email address.',
        status: 500,
      },
    }
  }

  if (!Number.isInteger(port) || ![465, 587].includes(port)) {
    return {
      error: {
        code: 'SMTP_CONFIG_INVALID',
        message: 'Use SMTP_PORT 587 or 465.',
        status: 500,
      },
    }
  }

  if (!['true', 'false'].includes(secureValue)) {
    return {
      error: {
        code: 'SMTP_CONFIG_INVALID',
        message: 'SMTP_SECURE must be true or false.',
        status: 500,
      },
    }
  }

  const secure = secureValue === 'true'

  if ((port === 465 && !secure) || (port === 587 && secure)) {
    return {
      error: {
        code: 'SMTP_CONFIG_INVALID',
        message:
          'For Gmail, use SMTP_PORT=587 with SMTP_SECURE=false, or port 465 with SMTP_SECURE=true.',
        status: 500,
      },
    }
  }

  if (host.toLowerCase() === 'smtp.gmail.com' && user && !pass.trim()) {
    return {
      error: {
        code: 'SMTP_CONFIG_INVALID',
        message: 'SMTP_PASS must contain your Gmail App Password.',
        status: 500,
      },
    }
  }

  return {
    config: {
      host,
      port,
      secure,
      user,
      pass,
    },
  }
}

export function createSmtpTransporter(config) {
  const options = {
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
    tls: {
      rejectUnauthorized: true,
      servername: config.host,
    },
  }

  // Port 587 uses STARTTLS; port 465 uses implicit TLS.
  if (config.port === 587) {
    options.requireTLS = true
  }

  return nodemailer.createTransport(options)
}

export function getSafeEmailFailure(error) {
  const code = String(error?.code || '').toUpperCase()
  const responseCode = Number(error?.responseCode || 0)
  const message = String(error?.message || '').toLowerCase()

  if (
    code === 'EAUTH' ||
    responseCode === 535 ||
    message.includes('username and password not accepted')
  ) {
    return {
      code: 'SMTP_AUTH_FAILED',
      message:
        'Gmail rejected the credentials. Generate a new Gmail App Password and update SMTP_PASS.',
      status: 502,
    }
  }

  if (code === 'ENOTFOUND' || code === 'EAI_AGAIN') {
    return {
      code: 'SMTP_DNS_FAILED',
      message:
        'Could not resolve the SMTP host. Check SMTP_HOST and your network connection.',
      status: 502,
    }
  }

  if (code === 'ECONNREFUSED') {
    return {
      code: 'SMTP_CONNECTION_REFUSED',
      message:
        'The SMTP server refused the connection. Check the host and port.',
      status: 502,
    }
  }

  if (code === 'ETIMEDOUT' || code === 'ESOCKETTIMEDOUT') {
    return {
      code: 'SMTP_TIMEOUT',
      message:
        'The SMTP connection timed out. Check your network or firewall.',
      status: 504,
    }
  }

  if (
    code === 'ESOCKET' ||
    code === 'ETLS' ||
    message.includes('tls') ||
    message.includes('certificate') ||
    message.includes('ssl')
  ) {
    return {
      code: 'SMTP_TLS_FAILED',
      message:
        'The SMTP socket or TLS handshake failed. Check the terminal diagnostic and verify the system clock, TLS certificate chain, SMTP port, and network security software.',
      status: 502,
    }
  }

  if (code === 'ECONNRESET' || code === 'EPIPE') {
    return {
      code: 'SMTP_CONNECTION_INTERRUPTED',
      message: 'The SMTP connection was interrupted. Please try again.',
      status: 502,
    }
  }

  if (responseCode >= 500) {
    return {
      code: 'SMTP_SERVER_REJECTED',
      message:
        'The SMTP server rejected the request. Check the recipient and email configuration.',
      status: 502,
    }
  }

  return {
    code: 'SMTP_SEND_FAILED',
    message: 'The email could not be sent. Check the server terminal for diagnostics.',
    status: 502,
  }
}