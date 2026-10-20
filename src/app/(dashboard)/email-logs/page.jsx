'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { FaEnvelope, FaSearch, FaSyncAlt } from 'react-icons/fa'

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value || '-'
    : date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
}

export default function EmailLogsPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const loadLogs = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/email-logs', {
        cache: 'no-store',
      })
      const data = await response.json()

      if (!response.ok || !Array.isArray(data)) {
        throw new Error(data?.message || 'Unable to load email logs.')
      }

      setLogs(data)
    } catch (loadError) {
      console.error('Error loading email logs:', loadError)
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const filteredLogs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return logs.filter((log) => {
      const matchesStatus =
        statusFilter === 'all' || log.status === statusFilter
      const matchesSearch =
        !query ||
        [
          log.recipient,
          log.sender,
          log.documentType,
          log.documentNumber,
          log.message,
        ].some((value) => String(value || '').toLowerCase().includes(query))

      return matchesStatus && matchesSearch
    })
  }, [logs, searchTerm, statusFilter])

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <FaEnvelope className="text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Email Logs</h1>
            <p className="text-sm text-slate-500">
              Review sent invoices, quotations, and failed email attempts.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={loadLogs}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-60"
        >
          <FaSyncAlt className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <p className="text-sm font-semibold text-slate-600">
            {filteredLogs.length} {filteredLogs.length === 1 ? 'record' : 'records'}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative block sm:w-72">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search recipient, sender, bill..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
              />
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter email logs by status"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="all">All statuses</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading email logs...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-semibold text-slate-700">
              {logs.length ? 'No matching email logs.' : 'No email attempts logged yet.'}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Email send attempts for bills and quotations will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <article
                key={log.id}
                className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:p-5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${
                        log.status === 'sent'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {log.status || 'unknown'}
                    </span>
                    <span className="text-sm font-semibold capitalize text-slate-700">
                      {log.documentType || 'Email'}
                      {log.documentNumber ? ` · ${log.documentNumber}` : ''}
                    </span>
                  </div>
                  <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                    <div className="min-w-0">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Recipient
                      </dt>
                      <dd className="mt-0.5 break-all text-slate-700">
                        {log.recipient || 'Not provided'}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Sent by
                      </dt>
                      <dd className="mt-0.5 break-all text-slate-700">
                        {log.sender || 'Not available'}
                      </dd>
                    </div>
                  </dl>
                  {log.message && (
                    <p
                      className={`mt-3 break-words text-sm ${
                        log.status === 'failed' ? 'text-red-600' : 'text-slate-500'
                      }`}
                    >
                      {log.message}
                    </p>
                  )}
                </div>
                <time
                  dateTime={log.createdAt}
                  className="text-xs text-slate-400 sm:text-right"
                >
                  {formatDate(log.createdAt)}
                </time>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
