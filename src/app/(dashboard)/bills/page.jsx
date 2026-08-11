'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaPrint,
  FaEnvelope,
  FaFileInvoice,
  FaSyncAlt,
  FaArrowRight,
} from 'react-icons/fa'

import BillModal from '@/components/BillModal'

export default function BillsPage() {
  const [bills, setBills] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  const [showModal, setShowModal] =
    useState(false)

  const [editingBill, setEditingBill] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [refreshing, setRefreshing] =
    useState(false)

  const [error, setError] = useState('')

  // ==========================================
  // FETCH BILLS
  // ==========================================
  useEffect(() => {
    fetchBills()
  }, [])

  const fetchBills = async () => {
    try {
      setRefreshing(true)
      setError('')

      const response = await fetch('/api/bills')

      if (!response.ok) {
        throw new Error(
          'Failed to fetch bills'
        )
      }

      const data = await response.json()

      const billsData = Array.isArray(data)
        ? data
        : data?.bills || []

      setBills(billsData)
    } catch (error) {
      console.error(
        'Error fetching bills:',
        error
      )

      setError(
        'Unable to load bills. Please try again.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // ==========================================
  // SAVE BILL
  // ==========================================
  const handleSave = async (formData) => {
    try {
      setError('')

      const billId =
        editingBill?._id ||
        editingBill?.id

      const url = billId
        ? `/api/bills/${billId}`
        : '/api/bills'

      const method = billId
        ? 'PUT'
        : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => null)

        throw new Error(
          data?.message ||
            'Failed to save bill'
        )
      }

      await fetchBills()

      setShowModal(false)
      setEditingBill(null)
    } catch (error) {
      console.error(
        'Error saving bill:',
        error
      )

      setError(
        error.message ||
          'Unable to save bill.'
      )
    }
  }

  // ==========================================
  // DELETE BILL
  // ==========================================
  const handleDelete = async (bill) => {
    const billId =
      bill?._id || bill?.id

    if (!billId) {
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete bill ${
        bill.number || ''
      }?`
    )

    if (!confirmed) {
      return
    }

    try {
      setError('')

      const response = await fetch(
        `/api/bills/${billId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error(
          'Failed to delete bill'
        )
      }

      await fetchBills()
    } catch (error) {
      console.error(
        'Error deleting bill:',
        error
      )

      setError(
        'Unable to delete the bill.'
      )
    }
  }

  // ==========================================
  // PRINT
  // ==========================================
  const handlePrint = (bill) => {
    // For now, use browser print.
    // You can later create a dedicated
    // invoice PDF/print page.
    window.print()
  }

  // ==========================================
  // SEARCH
  // ==========================================
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
        bill.customerGst
          ?.toLowerCase()
          .includes(search) ||
        bill.status
          ?.toLowerCase()
          .includes(search)
      )
    })

  // ==========================================
  // STATS
  // ==========================================
  const totalAmount = bills.reduce(
    (sum, bill) =>
      sum + Number(bill.total || 0),
    0
  )

  const pendingBills = bills.filter(
    (bill) =>
      String(
        bill.status || ''
      ).toLowerCase() === 'pending'
  ).length

  const paidBills = bills.filter(
    (bill) =>
      String(
        bill.status || ''
      ).toLowerCase() === 'paid'
  ).length

  // ==========================================
  // FORMAT CURRENCY
  // ==========================================
  const formatCurrency = (amount) => {
    return `₹${Number(
      amount || 0
    ).toLocaleString('en-IN')}`
  }

  // ==========================================
  // FORMAT DATE
  // ==========================================
  const formatDate = (date) => {
    if (!date) {
      return '-'
    }

    const parsedDate =
      new Date(date)

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date
    }

    return parsedDate.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    )
  }

  // ==========================================
  // OPEN CREATE MODAL
  // ==========================================
  const handleCreate = () => {
    setEditingBill(null)
    setShowModal(true)
  }

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================
  const handleEdit = (bill) => {
    setEditingBill(bill)
    setShowModal(true)
  }

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1500px] space-y-6">

        <div className="animate-pulse">
          <div className="h-4 w-16 rounded bg-slate-200" />

          <div className="mt-2 h-8 w-32 rounded bg-slate-200" />

          <div className="mt-2 h-4 w-72 rounded bg-slate-200" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl bg-slate-200"
              />
            )
          )}

        </div>

        <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />

      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">

      {/* ======================================
          PAGE HEADER
      ======================================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>

          <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
            Billing
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Bills
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create, manage and track your customer bills.
          </p>

        </div>

        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={fetchBills}
            disabled={refreshing}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              text-sm
              font-semibold
              text-slate-600
              shadow-sm
              transition
              hover:border-blue-200
              hover:bg-blue-50
              hover:text-blue-500
              disabled:opacity-60
            "
          >
            <FaSyncAlt
              className={
                refreshing
                  ? 'animate-spin'
                  : ''
              }
            />

            <span className="hidden sm:inline">
              {refreshing
                ? 'Refreshing...'
                : 'Refresh'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleCreate}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-blue-500
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-md
              shadow-blue-100
              transition
              hover:bg-blue-600
            "
          >
            <FaPlus />

            <span>
              New Bill
            </span>
          </button>

        </div>

      </div>

      {/* ======================================
          ERROR
      ======================================= */}
      {error && (
        <div className="
          flex
          items-center
          justify-between
          rounded-xl
          border
          border-red-100
          bg-red-50
          px-4
          py-3
        ">

          <p className="text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchBills}
            className="text-sm font-semibold text-red-600 hover:text-red-700"
          >
            Try again
          </button>

        </div>
      )}

      {/* ======================================
          SUMMARY CARDS
      ======================================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Total Bills */}
        <div className="
          rounded-2xl
          border
          border-slate-100
          bg-white
          p-5
          shadow-sm
        ">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Total Bills
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-800">
                {bills.length}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                All generated bills
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
              <FaFileInvoice />
            </div>

          </div>

        </div>

        {/* Total Amount */}
        <div className="
          rounded-2xl
          border
          border-slate-100
          bg-white
          p-5
          shadow-sm
        ">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Total Amount
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-800">
                {formatCurrency(
                  totalAmount
                )}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Total bill value
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
              ₹
            </div>

          </div>

        </div>

        {/* Paid */}
        <div className="
          rounded-2xl
          border
          border-slate-100
          bg-white
          p-5
          shadow-sm
        ">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Paid Bills
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-800">
                {paidBills}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Successfully paid
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-500">
              ✓
            </div>

          </div>

        </div>

        {/* Pending */}
        <div className="
          rounded-2xl
          border
          border-slate-100
          bg-white
          p-5
          shadow-sm
        ">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Pending Bills
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-800">
                {pendingBills}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Awaiting payment
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              !
            </div>

          </div>

        </div>

      </div>

      {/* ======================================
          BILLS TABLE
      ======================================= */}
      <div className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-100
        bg-white
        shadow-sm
      ">

        {/* Table Header */}
        <div className="
          flex
          flex-col
          gap-4
          border-b
          border-slate-100
          p-5
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:px-6
        ">

          <div>

            <h2 className="text-base font-bold text-slate-800">
              All Bills
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Manage your invoices and payment status
            </p>

          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">

            <FaSearch className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-xs
              text-slate-400
            " />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              placeholder="Search bills..."
              className="
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                py-2.5
                pl-9
                pr-4
                text-sm
                text-slate-700
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-blue-400
                focus:bg-white
                focus:ring-4
                focus:ring-blue-50
              "
            />

          </div>

        </div>

        {/* ====================================
            EMPTY STATE
        ===================================== */}
        {filteredBills.length === 0 ? (

          <div className="flex flex-col items-center justify-center px-5 py-14 text-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
              <FaFileInvoice className="text-2xl text-blue-400" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-700">
              {searchTerm
                ? 'No bills found'
                : 'No bills yet'}
            </h3>

            <p className="mt-1 max-w-md text-xs leading-5 text-slate-400">
              {searchTerm
                ? 'Try searching with a different bill number or customer name.'
                : 'Create your first bill to start managing your billing records.'}
            </p>

            {!searchTerm && (
              <button
                type="button"
                onClick={handleCreate}
                className="
                  mt-5
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-blue-500
                  px-4
                  py-2.5
                  text-xs
                  font-semibold
                  text-white
                  shadow-md
                  shadow-blue-100
                  transition
                  hover:bg-blue-600
                "
              >
                <FaPlus />
                Create First Bill
              </button>
            )}

          </div>

        ) : (

          /* ====================================
             TABLE
          ===================================== */
          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead>

                <tr className="border-b border-slate-100 bg-slate-50/70">

                  <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Bill No.
                  </th>

                  <th className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Customer
                  </th>

                  <th className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Date
                  </th>

                  <th className="px-4 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Amount
                  </th>

                  <th className="px-4 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </th>

                  <th className="px-6 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredBills.map(
                  (bill) => {

                    const billId =
                      bill._id ||
                      bill.id

                    const status =
                      String(
                        bill.status ||
                          'pending'
                      ).toLowerCase()

                    const isPaid =
                      status === 'paid'

                    return (
                      <tr
                        key={billId}
                        className="
                          border-b
                          border-slate-50
                          transition
                          last:border-0
                          hover:bg-blue-50/30
                        "
                      >

                        {/* Bill Number */}
                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                              <FaFileInvoice className="text-sm" />
                            </div>

                            <span className="text-sm font-bold text-slate-700">
                              {bill.number ||
                                '-'}
                            </span>

                          </div>

                        </td>

                        {/* Customer */}
                        <td className="px-4 py-4">

                          <p className="text-sm font-medium text-slate-700">
                            {bill.customer ||
                              '-'}
                          </p>

                          {bill.customerGst && (
                            <p className="mt-0.5 text-[10px] uppercase text-slate-400">
                              GST: {bill.customerGst}
                            </p>
                          )}

                        </td>

                        {/* Date */}
                        <td className="px-4 py-4">

                          <span className="text-sm text-slate-500">
                            {formatDate(
                              bill.date ||
                                bill.createdAt
                            )}
                          </span>

                        </td>

                        {/* Amount */}
                        <td className="px-4 py-4 text-right">

                          <span className="text-sm font-bold text-slate-700">
                            {formatCurrency(
                              bill.total
                            )}
                          </span>

                        </td>

                        {/* Status */}
                        <td className="px-4 py-4 text-center">

                          <span
                            className={`
                              inline-flex
                              rounded-full
                              px-3
                              py-1
                              text-[10px]
                              font-bold
                              ${
                                isPaid
                                  ? 'bg-green-50 text-green-600'
                                  : 'bg-orange-50 text-orange-600'
                              }
                            `}
                          >
                            {isPaid
                              ? 'Paid'
                              : 'Pending'}
                          </span>

                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">

                          <div className="flex items-center justify-center gap-1">

                            {/* Print */}
                            <button
                              type="button"
                              onClick={() =>
                                handlePrint(
                                  bill
                                )
                              }
                              title="Print"
                              className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-lg
                                text-slate-400
                                transition
                                hover:bg-blue-50
                                hover:text-blue-500
                              "
                            >
                              <FaPrint className="text-xs" />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  bill
                                )
                              }
                              title="Edit"
                              className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-lg
                                text-slate-400
                                transition
                                hover:bg-green-50
                                hover:text-green-500
                              "
                            >
                              <FaEdit className="text-xs" />
                            </button>

                            {/* Email */}
                            <button
                              type="button"
                              title="Send Email"
                              className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-lg
                                text-slate-400
                                transition
                                hover:bg-sky-50
                                hover:text-sky-500
                              "
                            >
                              <FaEnvelope className="text-xs" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  bill
                                )
                              }
                              title="Delete"
                              className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-lg
                                text-slate-400
                                transition
                                hover:bg-red-50
                                hover:text-red-500
                              "
                            >
                              <FaTrash className="text-xs" />
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

        {/* ====================================
            MOBILE / FOOTER
        ===================================== */}
        {filteredBills.length > 0 && (
          <div className="
            flex
            items-center
            justify-between
            border-t
            border-slate-100
            px-5
            py-4
            sm:px-6
          ">

            <p className="text-xs text-slate-400">
              Showing{' '}
              <span className="font-semibold text-slate-600">
                {filteredBills.length}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-slate-600">
                {bills.length}
              </span>{' '}
              bills
            </p>

            <Link
              href="/dashboard"
              className="
                hidden
                items-center
                gap-2
                text-xs
                font-semibold
                text-blue-500
                hover:text-blue-600
                sm:flex
              "
            >
              Dashboard
              <FaArrowRight className="text-[9px]" />
            </Link>

          </div>
        )}

      </div>

      {/* ======================================
          BILL MODAL
      ======================================= */}
      <BillModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingBill(null)
        }}
        onSave={handleSave}
        editingBill={editingBill}
      />

    </div>
  )
}