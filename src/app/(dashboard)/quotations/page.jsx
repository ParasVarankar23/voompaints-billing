'use client'

import { useEffect, useState } from 'react'
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaPrint,
  FaEnvelope,
  FaTimes,
  FaFileAlt,
} from 'react-icons/fa'

import QuotationModal from '@/components/QuotationModal'

import QuotationPrint from '@/components/QuotationPrint'

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingQuotation, setEditingQuotation] = useState(null)
  const [selectedQuotation, setSelectedQuotation] = useState(null)
  const [showQuotation, setShowQuotation] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sendingEmail, setSendingEmail] = useState(null)

  const [message, setMessage] = useState({
    type: '',
    text: '',
  })

  useEffect(() => {
    fetchQuotations()
  }, [])

  const showMessage = (type, text) => {
    setMessage({
      type,
      text,
    })

    setTimeout(() => {
      setMessage({
        type: '',
        text: '',
      })
    }, 3000)
  }

  const fetchQuotations = async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/quotations', {
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch quotations')
      }

      const data = await response.json()

      setQuotations(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching quotations:', error)
      showMessage('error', 'Unable to load quotations.')
    } finally {
      setLoading(false)
    }
  }

  const handleNewQuotation = () => {
    setEditingQuotation(null)
    setShowModal(true)
  }

  const handleEdit = (quotation) => {
    setEditingQuotation(quotation)
    setShowModal(true)
  }

  const handleSave = async (formData) => {
    try {
      const isEditing = Boolean(editingQuotation)

      const url = isEditing
        ? `/api/quotations/${editingQuotation.id}`
        : '/api/quotations'

      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
          data?.message ||
          'Failed to save quotation'
        )
      }

      await fetchQuotations()

      setShowModal(false)
      setEditingQuotation(null)

      showMessage(
        'success',
        isEditing
          ? 'Quotation updated successfully.'
          : 'Quotation created successfully.'
      )
    } catch (error) {
      console.error('Error saving quotation:', error)
      showMessage('error', error.message)
    }
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this quotation?'
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(`/api/quotations/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error || 'Failed to delete quotation'
        )
      }

      await fetchQuotations()

      showMessage(
        'success',
        'Quotation deleted successfully.'
      )
    } catch (error) {
      console.error('Error deleting quotation:', error)
      showMessage('error', 'Failed to delete quotation.')
    }
  }

  const handlePrint = (quotation) => {
    // Generate HTML from server and convert to PDF client-side to
    // download directly (avoids browser print headers like URL/page numbers)
    generatePdfAndDownload(quotation)
  }

  const closeQuotation = () => {
    setShowQuotation(false)
    setSelectedQuotation(null)
  }

  const handleSendEmail = async (quotation) => {
    if (!quotation?.customerEmail) {
      showMessage(
        'error',
        'Customer email is not available for this quotation.'
      )
      return
    }

    const confirmed = window.confirm(
      `Send quotation ${quotation.number || ''} to ${quotation.customerEmail}?`
    )

    if (!confirmed) {
      return
    }

    try {
      setSendingEmail(quotation.id)

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: quotation.customerEmail,
          bill: quotation,
          type: 'quotation',
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message || 'Failed to send email'
        )
      }

      // Log server response and notify user
      console.log('send-email response:', data)
      showMessage(
        'success',
        `Quotation sent to ${quotation.customerEmail}`
      )
      // Fallback browser alert so user sees immediate confirmation
      try {
        window.alert(data?.message || `Quotation sent to ${quotation.customerEmail}`)
      } catch (e) {
        // ignore if alert unavailable
      }
      // Helpful client-side log for users/developers:
      console.log(
        `Quotation email sent to ${quotation.customerEmail}. Note: if you see print headers like page numbers, URL (localhost:3000), or app UI (scrollbars/Billing App) in exported PDFs, those are added by the browser's print dialog. Use the Download action (PDF) to get a clean file without browser headers.`
      )
    } catch (error) {
      console.error('Email error:', error)

      showMessage(
        'error',
        error.message || 'Failed to send email.'
      )
      try {
        window.alert(error.message || 'Failed to send email.')
      } catch (e) {
        // ignore if alert unavailable
      }
    } finally {
      setSendingEmail(null)
    }
  }

  // Download PDF by requesting generated HTML and using html2pdf (loaded from CDN)
  const generatePdfAndDownload = async (quotation) => {
    try {
      // Request generated HTML from send-email endpoint without sending mail
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: quotation.customerEmail || '',
          quotation: quotation,
          type: 'quotation',
          returnHtml: true,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.html) {
        throw new Error(data?.message || 'Failed to generate document HTML')
      }

      // Load html2pdf if not already available
      // Prefer a local dynamic import (more reliable, works offline if installed)
      if (typeof window.html2pdf === 'undefined') {
        let loaded = false

        try {
          const mod = await import('html2pdf.js')
          const lib = mod?.default || mod
          if (lib) {
            window.html2pdf = lib
            loaded = true
          }
        } catch (err) {
          // dynamic import failed (package not installed or bundler issue). We'll try CDN fallback.
          console.warn('html2pdf dynamic import failed:', err)
        }

        if (!loaded) {
          // CDN fallback
          await new Promise((resolve, reject) => {
            const s = document.createElement('script')
            s.src = 'https://unpkg.com/html2pdf.js@0.9.3/dist/html2pdf.bundle.min.js'
            s.async = true
            s.onload = () => resolve()
            s.onerror = () => reject(new Error(`Failed to load html2pdf script from ${s.src}`))
            document.head.appendChild(s)
          })

          if (typeof window.html2pdf === 'undefined') {
            throw new Error('html2pdf did not initialize after loading script')
          }
        }
      }

      // Create a container for the HTML and add it to DOM so html2canvas can render it.
      // Use visibility:hidden (not display:none) and position it in-viewport so rendering works.
      const container = document.createElement('div')
      container.style.position = 'fixed'
      container.style.left = '0'
      container.style.top = '0'
      container.style.width = '794px'
      container.style.visibility = 'hidden'
      container.style.zIndex = '99999'
      container.innerHTML = data.html
      document.body.appendChild(container)

      // Prefer rendering the actual document root if present
      const root = container.querySelector('.container') || container

      // Wait for images to load inside the root (html2canvas needs loaded resources)
      const imgs = Array.from(root.querySelectorAll('img'))
      if (imgs.length > 0) {
        await Promise.all(
          imgs.map(
            (img) =>
              new Promise((resolve) => {
                if (img.complete) return resolve()
                img.onload = img.onerror = () => resolve()
              })
          )
        )
      }

      // Use html2pdf to save PDF directly to user's machine
      await window.html2pdf()
        .set({
          margin: 10,
          filename: `${quotation.number || 'quotation'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, allowTaint: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(root)
        .save()

      // cleanup
      document.body.removeChild(container)
    } catch (err) {
      // err may be an Event when script load failed; normalize
      const message = err && err.message ? err.message : String(err)
      console.error('PDF generation error:', err, { message })
      showMessage('error', message || 'Failed to download PDF')
    }
  }

  const filteredQuotations = quotations.filter((quotation) => {
    const search = searchTerm.toLowerCase().trim()

    if (!search) {
      return true
    }

    return (
      quotation.number?.toLowerCase().includes(search) ||
      quotation.customer?.toLowerCase().includes(search) ||
      quotation.customerEmail?.toLowerCase().includes(search) ||
      quotation.customerPhone?.toLowerCase().includes(search)
    )
  })

  const formatMoney = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const getStatusClass = (status) => {
    switch (String(status || 'draft').toLowerCase()) {
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-100'

      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-100'

      case 'sent':
        return 'bg-blue-50 text-blue-700 border-blue-100'

      default:
        return 'bg-orange-50 text-orange-700 border-orange-100'
    }
  }

  return (
    <div className="min-h-full">

      {message.text && (
        <div
          className={`fixed right-4 top-20 z-[200] max-w-sm rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${message.type === 'success'
              ? 'border-green-100 bg-green-50 text-green-700'
              : 'border-red-100 bg-red-50 text-red-700'
            }`}
        >
          {message.text}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800">
              Quotations
            </h1>

            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
              {quotations.length}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Create, manage and send your quotations
          </p>
        </div>

        <button
          type="button"
          onClick={handleNewQuotation}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
        >
          <FaPlus />
          New Quotation
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 p-4 sm:p-5">

          <div className="relative max-w-xl">

            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search quotation number, customer, email..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />

          </div>

        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">

            <div className="text-center">

              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

              <p className="mt-3 text-sm text-slate-500">
                Loading quotations...
              </p>

            </div>

          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">

              <table className="w-full">

                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Quote No.
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Date
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Amount
                    </th>

                    <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredQuotations.map((quotation) => (
                    <tr
                      key={quotation.id}
                      className="border-b border-slate-100 transition last:border-0 hover:bg-blue-50/30"
                    >

                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-800">
                          {quotation.number || '-'}
                        </span>
                      </td>

                      <td className="px-5 py-4">

                        <p className="font-medium text-slate-700">
                          {quotation.customer || '-'}
                        </p>

                        {quotation.customerEmail && (
                          <p className="mt-0.5 max-w-[220px] truncate text-xs text-slate-400">
                            {quotation.customerEmail}
                          </p>
                        )}

                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {quotation.date || '-'}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span className="font-semibold text-slate-800">
                          {formatMoney(quotation.total)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center">

                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                            quotation.status
                          )}`}
                        >
                          {quotation.status || 'draft'}
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <div className="flex items-center justify-center gap-1">

                          <button
                            type="button"
                            onClick={() => handlePrint(quotation)}
                            title="Print Quotation"
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                          >
                            <FaPrint />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEdit(quotation)}
                            title="Edit Quotation"
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-green-50 hover:text-green-600"
                          >
                            <FaEdit />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSendEmail(quotation)}
                            disabled={sendingEmail === quotation.id}
                            title={
                              quotation.customerEmail
                                ? 'Send Email'
                                : 'Customer email not available'
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-purple-50 hover:text-purple-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {sendingEmail === quotation.id ? (
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-purple-200 border-t-purple-600" />
                            ) : (
                              <FaEnvelope />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(quotation.id)}
                            title="Delete Quotation"
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <FaTrash />
                          </button>

                        </div>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

            <div className="space-y-3 p-4 md:hidden">

              {filteredQuotations.map((quotation) => (
                <div
                  key={quotation.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                        Quotation
                      </p>

                      <h3 className="mt-1 font-bold text-slate-800">
                        {quotation.number || '-'}
                      </h3>

                    </div>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${getStatusClass(
                        quotation.status
                      )}`}
                    >
                      {quotation.status || 'draft'}
                    </span>

                  </div>

                  <div className="mt-4">

                    <p className="text-sm font-semibold text-slate-700">
                      {quotation.customer || '-'}
                    </p>

                    {quotation.customerEmail && (
                      <p className="mt-1 break-all text-xs text-slate-400">
                        {quotation.customerEmail}
                      </p>
                    )}

                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">

                    <div className="rounded-lg bg-slate-50 p-3">

                      <p className="text-[10px] font-semibold uppercase text-slate-400">
                        Date
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-700">
                        {quotation.date || '-'}
                      </p>

                    </div>

                    <div className="rounded-lg bg-slate-50 p-3">

                      <p className="text-[10px] font-semibold uppercase text-slate-400">
                        Amount
                      </p>

                      <p className="mt-1 text-sm font-bold text-blue-600">
                        {formatMoney(quotation.total)}
                      </p>

                    </div>

                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-2">

                    <button
                      type="button"
                      onClick={() => handlePrint(quotation)}
                      className="flex h-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                      title="Print"
                    >
                      <FaPrint />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEdit(quotation)}
                      className="flex h-10 items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendEmail(quotation)}
                      disabled={sendingEmail === quotation.id}
                      className="flex h-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 disabled:opacity-40"
                      title="Email"
                    >
                      {sendingEmail === quotation.id ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-purple-200 border-t-purple-600" />
                      ) : (
                        <FaEnvelope />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(quotation.id)}
                      className="flex h-10 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>

                  </div>

                </div>
              ))}

            </div>

            {filteredQuotations.length === 0 && (
              <div className="px-5 py-16 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                  <FaFileAlt className="text-xl" />
                </div>

                <h3 className="mt-4 font-semibold text-slate-700">
                  {searchTerm
                    ? 'No quotations found'
                    : 'No quotations yet'}
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  {searchTerm
                    ? 'Try changing your search.'
                    : 'Create your first quotation to get started.'}
                </p>

                {!searchTerm && (
                  <button
                    type="button"
                    onClick={handleNewQuotation}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <FaPlus />
                    Create Quotation
                  </button>
                )}

              </div>
            )}
          </>
        )}

      </div>

      {/* =================================================
          QUOTATION MODAL
      ================================================= */}

      <QuotationModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingQuotation(null)
        }}
        onSave={handleSave}
        editingQuotation={editingQuotation}
      />

      {/* =================================================
          PRINT PREVIEW
      ================================================= */}

      {showQuotation && selectedQuotation && (
        <div className="fixed inset-0 z-[150] overflow-y-auto bg-slate-900/60 p-2 backdrop-blur-sm sm:p-5">

          <div className="no-print sticky top-0 z-10 mx-auto mb-3 flex max-w-[794px] items-center justify-between rounded-xl bg-white px-4 py-3 shadow-lg">

            <div>
              <p className="text-sm font-bold text-slate-800">
                Quotation Preview
              </p>

              <p className="text-xs text-slate-400">
                {selectedQuotation.number || '-'}
              </p>
            </div>

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <FaPrint />
                Print
              </button>

              <button
                type="button"
                onClick={closeQuotation}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500"
                title="Close"
              >
                <FaTimes />
              </button>

            </div>

          </div>

          <QuotationPrint
            quotation={selectedQuotation}
          />

        </div>
      )}

    </div>
  )
}