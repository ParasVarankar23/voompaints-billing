'use client'

import { useEffect, useState } from 'react'
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaPrint,
  FaEnvelope,
  FaFileAlt,
  FaSyncAlt,
  FaArrowRight,
} from 'react-icons/fa'

import BillModal from '@/components/BillModal'

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editingQuotation, setEditingQuotation] =
    useState(null)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  // ==========================================
  // FETCH QUOTATIONS
  // ==========================================
  useEffect(() => {
    fetchQuotations()
  }, [])

  const fetchQuotations = async () => {
    try {
      setRefreshing(true)
      setError('')

      const response = await fetch(
        '/api/quotations'
      )

      if (!response.ok) {
        throw new Error(
          'Failed to fetch quotations'
        )
      }

      const data = await response.json()

      const quotationData = Array.isArray(data)
        ? data
        : data?.quotations || []

      setQuotations(quotationData)
    } catch (error) {
      console.error(
        'Error fetching quotations:',
        error
      )

      setError(
        'Unable to load quotations. Please try again.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // ==========================================
  // SAVE QUOTATION
  // ==========================================
  const handleSave = async (formData) => {
    try {
      setError('')

      const quotationId =
        editingQuotation?._id ||
        editingQuotation?.id

      const url = quotationId
        ? `/api/quotations/${quotationId}`
        : '/api/quotations'

      const method = quotationId
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
            'Failed to save quotation'
        )
      }

      await fetchQuotations()

      setShowModal(false)
      setEditingQuotation(null)
    } catch (error) {
      console.error(
        'Error saving quotation:',
        error
      )

      setError(
        error.message ||
          'Unable to save quotation.'
      )
    }
  }

  // ==========================================
  // DELETE QUOTATION
  // ==========================================
  const handleDelete = async (
    quotation
  ) => {
    const quotationId =
      quotation?._id ||
      quotation?.id

    if (!quotationId) {
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete quotation ${
        quotation.number || ''
      }?`
    )

    if (!confirmed) {
      return
    }

    try {
      setError('')

      const response = await fetch(
        `/api/quotations/${quotationId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error(
          'Failed to delete quotation'
        )
      }

      await fetchQuotations()
    } catch (error) {
      console.error(
        'Error deleting quotation:',
        error
      )

      setError(
        'Unable to delete the quotation.'
      )
    }
  }

  // ==========================================
  // PRINT
  // ==========================================
  const handlePrint = (quotation) => {
    window.print()
  }

  // ==========================================
  // EMAIL
  // ==========================================
  const handleEmail = async (
    quotation
  ) => {
    if (!quotation?.customerEmail) {
      alert(
        'Customer email is not available.'
      )
      return
    }

    try {
      const response = await fetch(
        '/api/send-email',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            to: quotation.customerEmail,
            quotation,
            type: 'quotation',
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          'Failed to send quotation'
        )
      }

      alert(
        'Quotation sent successfully!'
      )
    } catch (error) {
      console.error(
        'Email error:',
        error
      )

      alert(
        'Unable to send quotation email.'
      )
    }
  }

  // ==========================================
  // SEARCH
  // ==========================================
  const filteredQuotations =
    quotations.filter((quotation) => {
      const search =
        searchTerm
          .toLowerCase()
          .trim()

      if (!search) {
        return true
      }

      return (
        quotation.number
          ?.toLowerCase()
          .includes(search) ||
        quotation.customer
          ?.toLowerCase()
          .includes(search) ||
        quotation.customerGst
          ?.toLowerCase()
          .includes(search) ||
        quotation.status
          ?.toLowerCase()
          .includes(search)
      )
    })

  // ==========================================
  // STATISTICS
  // ==========================================
  const totalAmount =
    quotations.reduce(
      (sum, quotation) =>
        sum +
        Number(
          quotation.total || 0
        ),
      0
    )

  const approvedQuotations =
    quotations.filter(
      (quotation) =>
        String(
          quotation.status || ''
        ).toLowerCase() ===
        'approved'
    ).length

  const draftQuotations =
    quotations.filter(
      (quotation) =>
        String(
          quotation.status || 'draft'
        ).toLowerCase() ===
        'draft'
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
  // CREATE
  // ==========================================
  const handleCreate = () => {
    setEditingQuotation(null)
    setShowModal(true)
  }

  // ==========================================
  // EDIT
  // ==========================================
  const handleEdit = (
    quotation
  ) => {
    setEditingQuotation(quotation)
    setShowModal(true)
  }

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1500px] space-y-6">

        <div className="animate-pulse">

          <div className="h-4 w-24 rounded bg-slate-200" />

          <div className="mt-2 h-8 w-44 rounded bg-slate-200" />

          <div className="mt-2 h-4 w-80 rounded bg-slate-200" />

        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="
                  h-28
                  animate-pulse
                  rounded-2xl
                  bg-slate-200
                "
              />
            )
          )}

        </div>

        <div className="
          h-96
          animate-pulse
          rounded-2xl
          bg-slate-200
        " />

      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">

      {/* ======================================
          PAGE HEADER
      ======================================= */}
      <div className="
        flex
        flex-col
        gap-4
        sm:flex-row
        sm:items-end
        sm:justify-between
      ">

        <div>

          <p className="
            text-xs
            font-semibold
            uppercase
            tracking-wider
            text-blue-500
          ">
            Sales
          </p>

          <h1 className="
            mt-1
            text-2xl
            font-bold
            tracking-tight
            text-slate-800
            sm:text-3xl
          ">
            Quotations
          </h1>

          <p className="
            mt-1
            text-sm
            text-slate-500
          ">
            Create, manage and track your customer quotations.
          </p>

        </div>

        <div className="flex items-center gap-2">

          {/* Refresh */}
          <button
            type="button"
            onClick={fetchQuotations}
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

          {/* New Quotation */}
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
              New Quotation
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
            onClick={fetchQuotations}
            className="
              text-sm
              font-semibold
              text-red-600
              hover:text-red-700
            "
          >
            Try again
          </button>

        </div>
      )}

      {/* ======================================
          SUMMARY CARDS
      ======================================= */}
      <div className="
        grid
        grid-cols-1
        gap-4
        sm:grid-cols-2
        xl:grid-cols-4
      ">

        {/* Total Quotations */}
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

              <p className="
                text-sm
                font-medium
                text-slate-500
              ">
                Total Quotations
              </p>

              <p className="
                mt-2
                text-2xl
                font-bold
                text-slate-800
              ">
                {quotations.length}
              </p>

              <p className="
                mt-1
                text-xs
                text-slate-400
              ">
                All quotations
              </p>

            </div>

            <div className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-blue-50
              text-blue-500
            ">
              <FaFileAlt />
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

              <p className="
                text-sm
                font-medium
                text-slate-500
              ">
                Total Amount
              </p>

              <p className="
                mt-2
                text-2xl
                font-bold
                text-slate-800
              ">
                {formatCurrency(
                  totalAmount
                )}
              </p>

              <p className="
                mt-1
                text-xs
                text-slate-400
              ">
                Total quotation value
              </p>

            </div>

            <div className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-emerald-50
              text-emerald-500
              font-bold
            ">
              ₹
            </div>

          </div>

        </div>

        {/* Approved */}
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

              <p className="
                text-sm
                font-medium
                text-slate-500
              ">
                Approved
              </p>

              <p className="
                mt-2
                text-2xl
                font-bold
                text-slate-800
              ">
                {approvedQuotations}
              </p>

              <p className="
                mt-1
                text-xs
                text-slate-400
              ">
                Approved quotations
              </p>

            </div>

            <div className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-green-50
              text-green-500
              font-bold
            ">
              ✓
            </div>

          </div>

        </div>

        {/* Draft */}
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

              <p className="
                text-sm
                font-medium
                text-slate-500
              ">
                Draft
              </p>

              <p className="
                mt-2
                text-2xl
                font-bold
                text-slate-800
              ">
                {draftQuotations}
              </p>

              <p className="
                mt-1
                text-xs
                text-slate-400
              ">
                Unapproved quotations
              </p>

            </div>

            <div className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-orange-50
              text-orange-500
              font-bold
            ">
              !
            </div>

          </div>

        </div>

      </div>

      {/* ======================================
          QUOTATIONS TABLE
      ======================================= */}
      <div className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-100
        bg-white
        shadow-sm
      ">

        {/* Header */}
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

            <h2 className="
              text-base
              font-bold
              text-slate-800
            ">
              All Quotations
            </h2>

            <p className="
              mt-1
              text-xs
              text-slate-400
            ">
              Manage quotation details and status
            </p>

          </div>

          {/* Search */}
          <div className="
            relative
            w-full
            sm:w-72
          ">

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
              placeholder="Search quotations..."
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
        {filteredQuotations.length === 0 ? (

          <div className="
            flex
            flex-col
            items-center
            justify-center
            px-5
            py-14
            text-center
          ">

            <div className="
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-blue-50
            ">
              <FaFileAlt className="
                text-2xl
                text-blue-400
              " />
            </div>

            <h3 className="
              mt-4
              text-sm
              font-bold
              text-slate-700
            ">
              {searchTerm
                ? 'No quotations found'
                : 'No quotations yet'}
            </h3>

            <p className="
              mt-1
              max-w-md
              text-xs
              leading-5
              text-slate-400
            ">
              {searchTerm
                ? 'Try searching with a different quotation number or customer name.'
                : 'Create your first quotation to start managing your sales records.'}
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
                Create First Quotation
              </button>
            )}

          </div>

        ) : (

          /* ====================================
             TABLE
          ===================================== */
          <div className="overflow-x-auto">

            <table className="
              w-full
              min-w-[950px]
            ">

              <thead>

                <tr className="
                  border-b
                  border-slate-100
                  bg-slate-50/70
                ">

                  <th className="
                    px-6
                    py-3.5
                    text-left
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-400
                  ">
                    Quote No.
                  </th>

                  <th className="
                    px-4
                    py-3.5
                    text-left
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-400
                  ">
                    Customer
                  </th>

                  <th className="
                    px-4
                    py-3.5
                    text-left
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-400
                  ">
                    Date
                  </th>

                  <th className="
                    px-4
                    py-3.5
                    text-right
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-400
                  ">
                    Amount
                  </th>

                  <th className="
                    px-4
                    py-3.5
                    text-center
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-400
                  ">
                    Status
                  </th>

                  <th className="
                    px-6
                    py-3.5
                    text-center
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-400
                  ">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredQuotations.map(
                  (quotation) => {

                    const quotationId =
                      quotation._id ||
                      quotation.id

                    const status =
                      String(
                        quotation.status ||
                          'draft'
                      ).toLowerCase()

                    const isApproved =
                      status ===
                      'approved'

                    return (
                      <tr
                        key={
                          quotationId
                        }
                        className="
                          border-b
                          border-slate-50
                          transition
                          last:border-0
                          hover:bg-blue-50/30
                        "
                      >

                        {/* Quote Number */}
                        <td className="
                          px-6
                          py-4
                        ">

                          <div className="
                            flex
                            items-center
                            gap-3
                          ">

                            <div className="
                              flex
                              h-9
                              w-9
                              shrink-0
                              items-center
                              justify-center
                              rounded-lg
                              bg-blue-50
                              text-blue-500
                            ">
                              <FaFileAlt className="text-sm" />
                            </div>

                            <span className="
                              text-sm
                              font-bold
                              text-slate-700
                            ">
                              {quotation.number ||
                                '-'}
                            </span>

                          </div>

                        </td>

                        {/* Customer */}
                        <td className="
                          px-4
                          py-4
                        ">

                          <p className="
                            text-sm
                            font-medium
                            text-slate-700
                          ">
                            {quotation.customer ||
                              '-'}
                          </p>

                          {quotation.customerGst && (
                            <p className="
                              mt-0.5
                              text-[10px]
                              uppercase
                              text-slate-400
                            ">
                              GST:{' '}
                              {
                                quotation.customerGst
                              }
                            </p>
                          )}

                        </td>

                        {/* Date */}
                        <td className="
                          px-4
                          py-4
                        ">

                          <span className="
                            text-sm
                            text-slate-500
                          ">
                            {formatDate(
                              quotation.date ||
                                quotation.createdAt
                            )}
                          </span>

                        </td>

                        {/* Amount */}
                        <td className="
                          px-4
                          py-4
                          text-right
                        ">

                          <span className="
                            text-sm
                            font-bold
                            text-slate-700
                          ">
                            {formatCurrency(
                              quotation.total
                            )}
                          </span>

                        </td>

                        {/* Status */}
                        <td className="
                          px-4
                          py-4
                          text-center
                        ">

                          <span
                            className={`
                              inline-flex
                              rounded-full
                              px-3
                              py-1
                              text-[10px]
                              font-bold
                              capitalize
                              ${
                                isApproved
                                  ? 'bg-green-50 text-green-600'
                                  : 'bg-orange-50 text-orange-600'
                              }
                            `}
                          >
                            {status}
                          </span>

                        </td>

                        {/* Actions */}
                        <td className="
                          px-6
                          py-4
                        ">

                          <div className="
                            flex
                            items-center
                            justify-center
                            gap-1
                          ">

                            {/* Print */}
                            <button
                              type="button"
                              onClick={() =>
                                handlePrint(
                                  quotation
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
                                  quotation
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
                              onClick={() =>
                                handleEmail(
                                  quotation
                                )
                              }
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
                                  quotation
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
            FOOTER
        ===================================== */}
        {filteredQuotations.length > 0 && (
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

            <p className="
              text-xs
              text-slate-400
            ">
              Showing{' '}
              <span className="
                font-semibold
                text-slate-600
              ">
                {filteredQuotations.length}
              </span>{' '}
              of{' '}
              <span className="
                font-semibold
                text-slate-600
              ">
                {quotations.length}
              </span>{' '}
              quotations
            </p>

            <button
              type="button"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth',
                })
              }
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
              Back to top
              <FaArrowRight className="-rotate-90 text-[9px]" />
            </button>

          </div>
        )}

      </div>

      {/* ======================================
          QUOTATION MODAL
      ======================================= */}
      <BillModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingQuotation(null)
        }}
        onSave={handleSave}
        editingBill={editingQuotation}
      />

    </div>
  )
}