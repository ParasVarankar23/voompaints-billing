'use client'

import { useEffect, useState } from 'react'
import {
  FaEdit,
  FaEnvelope,
  FaPlus,
  FaPrint,
  FaSearch,
  FaTimes,
  FaTrash,
  FaFileInvoice,
  FaCheck,
  FaBan,
  FaUndo,
} from 'react-icons/fa'

import BillModal from '@/components/BillModal'
//import InvoicePrint from '@/components/InvoicePrint'

export default function BillsPage() {
  // =====================================================
  // STATE
  // =====================================================

  const [bills, setBills] = useState([])

  const [searchTerm, setSearchTerm] =
    useState('')

  const [showModal, setShowModal] =
    useState(false)

  const [editingBill, setEditingBill] =
    useState(null)

  const [selectedBill, setSelectedBill] =
    useState(null)

  const [showInvoice, setShowInvoice] =
    useState(false)

  const [loading, setLoading] =
    useState(true)

  const [sendingEmail, setSendingEmail] =
    useState(null)

  const [message, setMessage] =
    useState({
      type: '',
      text: '',
    })

  // =====================================================
  // FETCH BILLS
  // =====================================================

  useEffect(() => {
    fetchBills()
  }, [])

  const fetchBills = async () => {
    try {
      setLoading(true)

      const response = await fetch(
        '/api/bills',
        {
          cache: 'no-store',
        }
      )

      if (!response.ok) {
        throw new Error(
          'Failed to fetch bills'
        )
      }

      const data =
        await response.json()

      setBills(
        Array.isArray(data)
          ? data
          : []
      )
    } catch (error) {
      console.error(
        'Error fetching bills:',
        error
      )

      showMessage(
        'error',
        'Unable to load bills.'
      )
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // MESSAGE
  // =====================================================

  const showMessage = (
    type,
    text
  ) => {
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

  // =====================================================
  // OPEN CREATE MODAL
  // =====================================================

  const handleNewBill = () => {
    setEditingBill(null)
    setShowModal(true)
  }

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  const handleEdit = (bill) => {
    setEditingBill(bill)
    setShowModal(true)
  }

  // =====================================================
  // SAVE BILL
  // =====================================================

  const handleSave = async (
    formData
  ) => {
    try {
      const isEditing =
        Boolean(editingBill)

      const url = isEditing
        ? `/api/bills/${editingBill.id}`
        : '/api/bills'

      const method = isEditing
        ? 'PUT'
        : 'POST'

      const response = await fetch(
        url,
        {
          method,
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify(
            formData
          ),
        }
      )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
          data?.message ||
          'Failed to save bill'
        )
      }

      await fetchBills()

      setShowModal(false)
      setEditingBill(null)

      showMessage(
        'success',
        isEditing
          ? 'Bill updated successfully.'
          : 'Bill created successfully.'
      )
    } catch (error) {
      console.error(
        'Error saving bill:',
        error
      )

      throw error
    }
  }

  // =====================================================
  // DELETE BILL
  // =====================================================

  const handleDelete = async (
    id
  ) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this bill?'
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(
        `/api/bills/${id}`,
        {
          method: 'DELETE',
        }
      )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
          'Failed to delete bill'
        )
      }

      await fetchBills()

      showMessage(
        'success',
        'Bill deleted successfully.'
      )
    } catch (error) {
      console.error(
        'Error deleting bill:',
        error
      )

      showMessage(
        'error',
        'Failed to delete bill.'
      )
    }
  }

  // =====================================================
  // OPEN PRINT PREVIEW
  // =====================================================

  const handlePrint = (bill) => {
    generatePdfAndDownload(bill)
  }

  // =====================================================
  // CLOSE PRINT PREVIEW
  // =====================================================

  const closeInvoice = () => {
    setShowInvoice(false)
    setSelectedBill(null)
  }

  // =====================================================
  // SEND EMAIL
  // =====================================================

  const handleSendEmail = async (
    bill
  ) => {
    if (!bill?.customerEmail) {
      showMessage(
        'error',
        'Customer email is not available for this bill.'
      )
      return
    }

    const confirmed =
      window.confirm(
        `Send invoice ${bill.number || ''} to ${bill.customerEmail}?`
      )

    if (!confirmed) {
      return
    }

    try {
      setSendingEmail(bill.id)

      const response = await fetch(
        '/api/send-email',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            to: bill.customerEmail,
            bill,
            type: 'bill',
          }),
        }
      )

      const data =
        await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message ||
          'Failed to send email'
        )
      }

      showMessage(
        'success',
        `Invoice sent to ${bill.customerEmail}`
      )
      console.log(
        `Invoice email sent to ${bill.customerEmail}. Use Download (PDF) to get a clean copy without browser print headers.`
      )
    } catch (error) {
      console.error(
        'Email error:',
        error
      )

      showMessage(
        'error',
        error.message ||
        'Failed to send email.'
      )
    } finally {
      setSendingEmail(null)
    }
  }

  // Download PDF by requesting generated HTML and using html2pdf (loaded from CDN or local import)
  const generatePdfAndDownload = async (bill) => {
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: bill.customerEmail || '',
          bill: bill,
          type: 'bill',
          returnHtml: true,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.html) {
        throw new Error(data?.message || 'Failed to generate document HTML')
      }

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
          console.warn('html2pdf dynamic import failed:', err)
        }

        if (!loaded) {
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

      const container = document.createElement('div')
      container.style.position = 'fixed'
      container.style.left = '0'
      container.style.top = '0'
      container.style.width = '794px'
      container.style.visibility = 'hidden'
      container.style.zIndex = '99999'
      container.innerHTML = data.html
      document.body.appendChild(container)

      const root = container.querySelector('.container') || container

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

      await window.html2pdf()
        .set({
          margin: 10,
          filename: `${bill.number || 'invoice'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, allowTaint: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(root)
        .save()

      document.body.removeChild(container)
    } catch (err) {
      const message = err && err.message ? err.message : String(err)
      console.error('PDF generation error:', err, { message })
      showMessage('error', message || 'Failed to download PDF')
    }
  }

  // =====================================================
  // FILTER
  // =====================================================

  const filteredBills =
    bills.filter((bill) => {
      const search =
        searchTerm
          .toLowerCase()
          .trim()

      if (!search) {
        return true
      }

      return (
        bill.number
          ?.toLowerCase()
          .includes(search) ||
        bill.customer
          ?.toLowerCase()
          .includes(search) ||
        bill.customerEmail
          ?.toLowerCase()
          .includes(search) ||
        bill.customerPhone
          ?.toLowerCase()
          .includes(search)
      )
    })

  // =====================================================
  // MONEY FORMAT
  // =====================================================

  const formatMoney = (
    amount
  ) => {
    return `₹${Number(
      amount || 0
    ).toLocaleString(
      'en-IN',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`
  }

  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusClass = (
    status
  ) => {
    switch (
    String(
      status || 'pending'
    ).toLowerCase()
    ) {
      case 'paid':
        return 'bg-green-50 text-green-700 border-green-100'

      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-100'

      default:
        return 'bg-orange-50 text-orange-700 border-orange-100'
    }
  }

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const updateBillStatus = async (bill, newStatus) => {
    if (!bill) return

    const confirmed = window.confirm(
      `Set status of ${bill.number || ''} to ${newStatus}?`
    )

    if (!confirmed) return

    try {
      const response = await fetch(`/api/bills/${bill.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to update status')
      }

      await fetchBills()

      showMessage('success', `Status updated to ${newStatus}`)
    } catch (err) {
      console.error('Status update error:', err)
      showMessage('error', err.message || 'Failed to update status')
    }
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-full">

      {/* =================================================
          TOAST MESSAGE
      ================================================= */}

      {message.text && (
        <div
          className={`
            fixed
            right-4
            top-20
            z-[200]
            max-w-sm
            rounded-xl
            border
            px-4
            py-3
            text-sm
            font-medium
            shadow-lg
            ${message.type ===
              'success'
              ? 'border-green-100 bg-green-50 text-green-700'
              : 'border-red-100 bg-red-50 text-red-700'
            }
          `}
        >
          {message.text}
        </div>
      )}

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div
        className="
          mb-6
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >

        <div>

          <div className="flex items-center gap-2">

            <h1 className="text-2xl font-bold text-slate-800">
              Bills
            </h1>

            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
              {bills.length}
            </span>

          </div>

          <p className="mt-1 text-sm text-slate-500">
            Create, manage and send your invoices
          </p>

        </div>

        <button
          type="button"
          onClick={handleNewBill}
          className="
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-blue-600
            px-5
            py-3
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition
            hover:bg-blue-700
            hover:shadow-md
            sm:w-auto
          "
        >
          <FaPlus />
          New Bill
        </button>

      </div>

      {/* =================================================
          MAIN CARD
      ================================================= */}

      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >

        {/* =================================================
            SEARCH
        ================================================= */}

        <div
          className="
            border-b
            border-slate-100
            p-4
            sm:p-5
          "
        >

          <div className="relative max-w-xl">

            <FaSearch
              className="
                absolute
                left-3.5
                top-1/2
                -translate-y-1/2
                text-sm
                text-slate-400
              "
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search by bill number, customer, email..."
              className="
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                py-3
                pl-10
                pr-4
                text-sm
                text-slate-700
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-blue-500
                focus:bg-white
                focus:ring-4
                focus:ring-blue-50
              "
            />

          </div>

        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">

            <div className="text-center">

              <div
                className="
                  mx-auto
                  h-9
                  w-9
                  animate-spin
                  rounded-full
                  border-4
                  border-blue-100
                  border-t-blue-600
                "
              />

              <p className="mt-3 text-sm text-slate-500">
                Loading bills...
              </p>

            </div>

          </div>
        ) : (
          <>
            {/* =================================================
                DESKTOP TABLE
            ================================================= */}

            <div className="hidden overflow-x-auto md:block">

              <table className="w-full">

                <thead>

                  <tr className="border-b border-slate-100 bg-slate-50/70">

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Bill No.
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

                  {filteredBills.map(
                    (bill) => (
                      <tr
                        key={bill.id}
                        className="
                          border-b
                          border-slate-100
                          transition
                          last:border-0
                          hover:bg-blue-50/30
                        "
                      >

                        {/* BILL */}

                        <td className="px-5 py-4">

                          <span className="font-semibold text-slate-800">
                            {bill.number ||
                              '-'}
                          </span>

                        </td>

                        {/* CUSTOMER */}

                        <td className="px-5 py-4">

                          <div>

                            <p className="font-medium text-slate-700">
                              {bill.customer ||
                                '-'}
                            </p>

                            {bill.customerEmail && (
                              <p className="mt-0.5 max-w-[220px] truncate text-xs text-slate-400">
                                {bill.customerEmail}
                              </p>
                            )}

                          </div>

                        </td>

                        {/* DATE */}

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {bill.date || '-'}
                        </td>

                        {/* AMOUNT */}

                        <td className="px-5 py-4 text-right">

                          <span className="font-semibold text-slate-800">
                            {formatMoney(
                              bill.total
                            )}
                          </span>

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4 text-center">

                          <span
                            className={`
                              inline-flex
                              rounded-full
                              border
                              px-3
                              py-1
                              text-xs
                              font-semibold
                              capitalize
                              ${getStatusClass(
                              bill.status
                            )}
                            `}
                          >
                            {bill.status ||
                              'pending'}
                          </span>

                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-4">

                          <div className="flex items-center justify-center gap-1">

                            {/* PRINT */}

                            <button
                              type="button"
                              onClick={() =>
                                handlePrint(
                                  bill
                                )
                              }
                              title="Print Invoice"
                              className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-lg
                                text-slate-400
                                transition
                                hover:bg-blue-50
                                hover:text-blue-600
                              "
                            >
                              <FaPrint />
                            </button>

                            {/* EDIT */}

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  bill
                                )
                              }
                              title="Edit Bill"
                              className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-lg
                                text-slate-400
                                transition
                                hover:bg-green-50
                                hover:text-green-600
                              "
                            >
                              <FaEdit />
                            </button>

                            {/* EMAIL */}

                            <button
                              type="button"
                              onClick={() =>
                                handleSendEmail(
                                  bill
                                )
                              }
                              disabled={
                                sendingEmail ===
                                bill.id
                              }
                              title={
                                bill.customerEmail
                                  ? 'Send Email'
                                  : 'Customer email not available'
                              }
                              className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-lg
                                text-slate-400
                                transition
                                hover:bg-purple-50
                                hover:text-purple-600
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                              "
                            >

                              {sendingEmail ===
                                bill.id ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-purple-200 border-t-purple-600" />
                              ) : (
                                <FaEnvelope />
                              )}

                            </button>

                            {/* DELETE */}

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  bill.id
                                )
                              }
                              title="Delete Bill"
                              className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-lg
                                text-slate-400
                                transition
                                hover:bg-red-50
                                hover:text-red-600
                              "
                            >
                              <FaTrash />
                            </button>

                            {/* MARK PAID */}
                            <button
                              type="button"
                              onClick={() => updateBillStatus(bill, 'paid')}
                              title="Mark Paid"
                              className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-lg
                                text-slate-400
                                transition
                                hover:bg-green-50
                                hover:text-green-600
                              "
                            >
                              <FaCheck />
                            </button>

                            {/* MARK PENDING */}
                            <button
                              type="button"
                              onClick={() => updateBillStatus(bill, 'pending')}
                              title="Mark Pending"
                              className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-lg
                                text-slate-400
                                transition
                                hover:bg-orange-50
                                hover:text-orange-600
                              "
                            >
                              <FaUndo />
                            </button>

                            {/* CANCEL */}
                            <button
                              type="button"
                              onClick={() => updateBillStatus(bill, 'cancelled')}
                              title="Cancel Bill"
                              className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-lg
                                text-slate-400
                                transition
                                hover:bg-red-50
                                hover:text-red-600
                              "
                            >
                              <FaBan />
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

            {/* =================================================
                MOBILE CARDS
            ================================================= */}

            <div className="space-y-3 p-4 md:hidden">

              {filteredBills.map(
                (bill) => (
                  <div
                    key={bill.id}
                    className="
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      p-4
                      shadow-sm
                    "
                  >

                    {/* TOP */}

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                          Bill
                        </p>

                        <h3 className="mt-1 font-bold text-slate-800">
                          {bill.number ||
                            '-'}
                        </h3>

                      </div>

                      <span
                        className={`
                          rounded-full
                          border
                          px-2.5
                          py-1
                          text-[10px]
                          font-semibold
                          capitalize
                          ${getStatusClass(
                          bill.status
                        )}
                        `}
                      >
                        {bill.status ||
                          'pending'}
                      </span>

                    </div>

                    {/* CUSTOMER */}

                    <div className="mt-4">

                      <p className="text-sm font-semibold text-slate-700">
                        {bill.customer ||
                          '-'}
                      </p>

                      {bill.customerEmail && (
                        <p className="mt-1 break-all text-xs text-slate-400">
                          {bill.customerEmail}
                        </p>
                      )}

                    </div>

                    {/* INFO */}

                    <div className="mt-4 grid grid-cols-2 gap-3">

                      <div className="rounded-lg bg-slate-50 p-3">

                        <p className="text-[10px] font-semibold uppercase text-slate-400">
                          Date
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-700">
                          {bill.date ||
                            '-'}
                        </p>

                      </div>

                      <div className="rounded-lg bg-slate-50 p-3">

                        <p className="text-[10px] font-semibold uppercase text-slate-400">
                          Amount
                        </p>

                        <p className="mt-1 text-sm font-bold text-blue-600">
                          {formatMoney(
                            bill.total
                          )}
                        </p>

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="mt-4 grid grid-cols-4 gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          handlePrint(
                            bill
                          )
                        }
                        className="
                          flex
                          h-10
                          items-center
                          justify-center
                          rounded-lg
                          bg-blue-50
                          text-blue-600
                          transition
                          hover:bg-blue-100
                        "
                        title="Print"
                      >
                        <FaPrint />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(
                            bill
                          )
                        }
                        className="
                          flex
                          h-10
                          items-center
                          justify-center
                          rounded-lg
                          bg-green-50
                          text-green-600
                          transition
                          hover:bg-green-100
                        "
                        title="Edit"
                      >
                        <FaEdit />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleSendEmail(
                            bill
                          )
                        }
                        disabled={
                          sendingEmail ===
                          bill.id
                        }
                        className="
                          flex
                          h-10
                          items-center
                          justify-center
                          rounded-lg
                          bg-purple-50
                          text-purple-600
                          transition
                          hover:bg-purple-100
                          disabled:opacity-40
                        "
                        title="Email"
                      >

                        {sendingEmail ===
                          bill.id ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-purple-200 border-t-purple-600" />
                        ) : (
                          <FaEnvelope />
                        )}

                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            bill.id
                          )
                        }
                        className="
                          flex
                          h-10
                          items-center
                          justify-center
                          rounded-lg
                          bg-red-50
                          text-red-600
                          transition
                          hover:bg-red-100
                        "
                        title="Delete"
                      >
                        <FaTrash />
                      </button>

                      <button
                        type="button"
                        onClick={() => updateBillStatus(bill, 'paid')}
                        className="flex h-10 items-center justify-center rounded-lg bg-green-50 text-green-600 transition hover:bg-green-100"
                        title="Mark Paid"
                      >
                        <FaCheck />
                      </button>

                      <button
                        type="button"
                        onClick={() => updateBillStatus(bill, 'pending')}
                        className="flex h-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600 transition hover:bg-orange-100"
                        title="Mark Pending"
                      >
                        <FaUndo />
                      </button>

                      <button
                        type="button"
                        onClick={() => updateBillStatus(bill, 'cancelled')}
                        className="flex h-10 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100"
                        title="Cancel"
                      >
                        <FaBan />
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>

            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {filteredBills.length === 0 && (
              <div className="px-5 py-16 text-center">

                <div
                  className="
                    mx-auto
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-blue-50
                    text-blue-500
                  "
                >
                  <FaFileInvoice className="text-xl" />
                </div>

                <h3 className="mt-4 font-semibold text-slate-700">
                  {searchTerm
                    ? 'No bills found'
                    : 'No bills yet'}
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  {searchTerm
                    ? 'Try changing your search.'
                    : 'Create your first bill to get started.'}
                </p>

                {!searchTerm && (
                  <button
                    type="button"
                    onClick={
                      handleNewBill
                    }
                    className="
                      mt-5
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      bg-blue-600
                      px-4
                      py-2.5
                      text-sm
                      font-semibold
                      text-white
                      hover:bg-blue-700
                    "
                  >
                    <FaPlus />
                    Create Bill
                  </button>
                )}

              </div>
            )}

          </>
        )}

      </div>

      {/* =================================================
          BILL MODAL
      ================================================= */}

      <BillModal
        isOpen={showModal}
        onClose={() => {
          if (!sendingEmail) {
            setShowModal(false)
            setEditingBill(null)
          }
        }}
        onSave={handleSave}
        editingBill={editingBill}
      />

      {/* =================================================
          INVOICE PRINT MODAL
      ================================================= */}

      {showInvoice &&
        selectedBill && (
          <div
            className="
              fixed
              inset-0
              z-[150]
              overflow-y-auto
              bg-slate-900/60
              p-2
              backdrop-blur-sm
              sm:p-5
            "
          >

            {/* PRINT HEADER */}

            <div
              className="
                no-print
                sticky
                top-0
                z-10
                mx-auto
                mb-3
                flex
                max-w-[794px]
                items-center
                justify-between
                rounded-xl
                bg-white
                px-4
                py-3
                shadow-lg
              "
            >

              <div>

                <p className="text-sm font-bold text-slate-800">
                  Invoice Preview
                </p>

                <p className="text-xs text-slate-400">
                  {selectedBill.number}
                </p>

              </div>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={() =>
                    window.print()
                  }
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-lg
                    bg-blue-600
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    text-white
                    hover:bg-blue-700
                  "
                >
                  <FaPrint />
                  Print
                </button>

                <button
                  type="button"
                  onClick={
                    closeInvoice
                  }
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    bg-slate-100
                    text-slate-500
                    hover:bg-red-50
                    hover:text-red-500
                  "
                  title="Close"
                >
                  <FaTimes />
                </button>

              </div>

            </div>

            <InvoicePrint
              bill={selectedBill}
            />

          </div>
        )}

    </div>
  )
}