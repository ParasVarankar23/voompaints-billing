import fs from 'fs'
import path from 'path'

const dataPath = path.join(
  process.cwd(),
  'src',
  'data',
  'email-logs.json'
)

export function readEmailLogs() {
  if (!fs.existsSync(dataPath)) {
    return []
  }

  const logs = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
  if (!Array.isArray(logs)) {
    throw new Error('Email logs data must be a JSON array')
  }

  return logs
}

export function appendEmailLog(entry) {
  const logs = readEmailLogs()
  const id = logs.reduce(
    (max, log) => Math.max(max, Number(log.id) || 0),
    0
  ) + 1

  const log = {
    id,
    ...entry,
    createdAt: new Date().toISOString(),
  }

  fs.writeFileSync(dataPath, JSON.stringify([...logs, log], null, 2), 'utf8')
  return log
}
