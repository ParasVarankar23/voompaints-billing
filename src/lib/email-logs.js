import fs from 'node:fs'
import path from 'node:path'

const LOG_DIRECTORY = path.join(process.cwd(), 'data')
const LOG_FILE = path.join(LOG_DIRECTORY, 'email-logs.json')
const MAX_LOG_ENTRIES = 2000

function ensureLogFile() {
  if (!fs.existsSync(LOG_DIRECTORY)) {
    fs.mkdirSync(LOG_DIRECTORY, { recursive: true })
  }

  if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, '[]', 'utf8')
  }
}

export function readEmailLogs() {
  ensureLogFile()

  try {
    const raw = fs.readFileSync(LOG_FILE, 'utf8')
    const logs = JSON.parse(raw)

    return Array.isArray(logs) ? logs : []
  } catch (error) {
    console.error('Unable to read email audit logs:', error?.message)

    return []
  }
}

export function appendEmailLog(entry = {}) {
  ensureLogFile()

  const existingLogs = readEmailLogs()

  const safeEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    recipient: String(entry.recipient || ''),
    sender: String(entry.sender || ''),
    documentType: String(entry.documentType || 'unknown'),
    documentNumber: String(entry.documentNumber || ''),
    status: entry.status === 'sent' ? 'sent' : 'failed',
    message: String(entry.message || ''),
  }

  existingLogs.push(safeEntry)

  const trimmedLogs = existingLogs.slice(-MAX_LOG_ENTRIES)

  const temporaryFile = `${LOG_FILE}.tmp`

  fs.writeFileSync(
    temporaryFile,
    JSON.stringify(trimmedLogs, null, 2),
    'utf8'
  )

  fs.renameSync(temporaryFile, LOG_FILE)

  return safeEntry
}