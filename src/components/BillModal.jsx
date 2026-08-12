'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  FaTimes,
  FaPlus,
  FaTrash,
  FaSave,
  FaCalculator,
} from 'react-icons/fa'

// =====================================================
// BANK DETAILS
// =====================================================

const BANKS = [
  {
    id: 'canara',
    name: 'CANARA BANK',
    accountNumber: '52153070008808',
    branch: 'Kalamboli',
    ifsc: 'CNRB0015215',
  },
  {
    id: 'saraswat',
    name: 'SARASWAT BANK',
    accountNumber: '810000000009068',
    branch: 'YOUR SARASWAT BRANCH',
    ifsc: 'SRCB0000450',
  },
]

// =====================================================
// EMPTY ITEM
// =====================================================

const createEmptyItem = () => ({
  description: '',
  packSize: '',
  qty: 1,
  rate: 0,
  amount: 0,
})

// =====================================================
// DEFAULT FORM
// =====================================================

const createDefaultForm = () => ({
  number: '',
  date: new Date().toISOString().split('T')[0],

  customer: '',
  customerAddress: '',
  customerPhone: '',
  customerEmail: '',
  customerGst: '',

  items: [createEmptyItem()],

  subtotal: 0,
  gst: 0,
  sgst: 0,
  cgst: 0,
  total: 0,

  status: 'pending',

  bank: 'canara',
})

// =====================================================
// COMPONENT
// =====================================================

export default function BillModal({
  isOpen,
  onClose,
  onSave,
  editingBill,
}) {
  const [formData, setFormData] = useState(
    createDefaultForm()
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // ===================================================
  // LOAD CREATE / EDIT DATA
  // ===================================================

  useEffect(() => {
    if (!isOpen) return

    setError('')

    if (editingBill) {
      const items =
        Array.isArray(editingBill.items) &&
          editingBill.items.length > 0
          ? editingBill.items.map((item) => {
            const qty = Number(item.qty || 0)
            const rate = Number(item.rate || 0)

            return {
              description: item.description || '',
              packSize: item.packSize || '',
              qty,
              rate,
              amount:
                Number(item.amount) ||
                qty * rate,
            }
          })
          : [createEmptyItem()]

      setFormData({
        number: editingBill.number || '',

        date:
          editingBill.date ||
          new Date().toISOString().split('T')[0],

        customer: editingBill.customer || '',

        customerAddress:
          editingBill.customerAddress || '',

        customerPhone:
          editingBill.customerPhone || '',

        customerEmail:
          editingBill.customerEmail || '',

        customerGst:
          editingBill.customerGst || '',

        items,

        subtotal: Number(editingBill.subtotal || 0),

        gst: Number(editingBill.gst || 0),

        sgst: Number(editingBill.sgst || 0),

        cgst: Number(editingBill.cgst || 0),

        total: Number(editingBill.total || 0),

        status:
          editingBill.status || 'pending',

        bank:
          editingBill.bank || 'canara',
      })
    } else {
      setFormData(createDefaultForm())
    }
  }, [isOpen, editingBill])

  // ===================================================
  // CALCULATE TOTALS
  // ===================================================

  const calculated = useMemo(() => {
    const items = Array.isArray(formData.items)
      ? formData.items
      : []

    const subtotal = items.reduce(
      (sum, item) => {
        const qty = Number(item.qty || 0)
        const rate = Number(item.rate || 0)

        return sum + qty * rate
      },
      0
    )

    const sgst = subtotal * 0.09
    const cgst = subtotal * 0.09
    const gst = sgst + cgst
    const total = subtotal + gst

    return {
      subtotal,
      gst,
      sgst,
      cgst,
      total,
    }
  }, [formData.items])

  // ===================================================
  // UPDATE FIELD
  // ===================================================

  const updateField = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  // ===================================================
  // UPDATE ITEM
  // ===================================================

  const updateItem = (
    index,
    field,
    value
  ) => {
    setFormData((previous) => {
      const items = [...previous.items]

      const updatedItem = {
        ...items[index],
        [field]: value,
      }

      if (
        field === 'qty' ||
        field === 'rate'
      ) {
        const qty =
          Number(
            field === 'qty'
              ? value
              : updatedItem.qty
          ) || 0

        const rate =
          Number(
            field === 'rate'
              ? value
              : updatedItem.rate
          ) || 0

        updatedItem.amount = qty * rate
      }

      items[index] = updatedItem

      return {
        ...previous,
        items,
      }
    })
  }

  // ===================================================
  // ADD ITEM
  // ===================================================

  const addItem = () => {
    setFormData((previous) => ({
      ...previous,
      items: [
        ...previous.items,
        createEmptyItem(),
      ],
    }))
  }

  // ===================================================
  // REMOVE ITEM
  // ===================================================

  const removeItem = (index) => {
    setFormData((previous) => {
      if (previous.items.length === 1) {
        return previous
      }

      return {
        ...previous,
        items: previous.items.filter(
          (_, itemIndex) =>
            itemIndex !== index
        ),
      }
    })
  }

  // ===================================================
  // FORMAT MONEY
  // ===================================================

  const formatMoney = (value) => {
    return `₹${Number(value || 0).toLocaleString(
      'en-IN',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`
  }

  // ===================================================
  // SAVE
  // ===================================================

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')

    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    if (!formData.number.trim()) {
      setError('Please enter bill number.')
      return
    }

    if (!formData.customer.trim()) {
      setError('Please enter customer name.')
      return
    }

    if (!formData.customerEmail.trim()) {
      setError(
        'Please enter customer email address.'
      )
      return
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (
      !emailRegex.test(
        formData.customerEmail.trim()
      )
    ) {
      setError(
        'Please enter a valid customer email address.'
      )
      return
    }

    const validItems =
      formData.items.filter(
        (item) =>
          item.description.trim() &&
          Number(item.qty) > 0
      )

    if (validItems.length === 0) {
      setError(
        'Please add at least one product.'
      )
      return
    }

    // -----------------------------------------------
    // PREPARE ITEMS
    // -----------------------------------------------

    const items = formData.items.map(
      (item) => {
        const qty = Number(item.qty || 0)
        const rate = Number(item.rate || 0)

        return {
          description:
            item.description.trim(),

          packSize:
            item.packSize?.trim() || '',

          qty,

          rate,

          amount: qty * rate,
        }
      }
    )

    // -----------------------------------------------
    // FINAL DATA
    // -----------------------------------------------

    const finalData = {
      ...formData,

      number: formData.number.trim(),

      customer:
        formData.customer.trim(),

      customerAddress:
        formData.customerAddress.trim(),

      customerPhone:
        formData.customerPhone.trim(),

      customerEmail:
        formData.customerEmail.trim(),

      customerGst:
        formData.customerGst
          .trim()
          .toUpperCase(),

      items,

      subtotal: Number(
        calculated.subtotal.toFixed(2)
      ),

      gst: Number(
        calculated.gst.toFixed(2)
      ),

      sgst: Number(
        calculated.sgst.toFixed(2)
      ),

      cgst: Number(
        calculated.cgst.toFixed(2)
      ),

      total: Number(
        calculated.total.toFixed(2)
      ),

      status:
        formData.status || 'pending',

      bank:
        formData.bank || 'canara',

      type: 'bill',
    }

    try {
      setSaving(true)

      await onSave(finalData)
    } catch (error) {
      console.error(
        'Bill save error:',
        error
      )

      setError(
        error.message ||
        'Failed to save bill.'
      )
    } finally {
      setSaving(false)
    }
  }

  // ===================================================
  // CLOSE
  // ===================================================

  const handleClose = () => {
    if (saving) return

    setError('')
    onClose()
  }

  // ===================================================
  // NOT OPEN
  // ===================================================

  if (!isOpen) {
    return null
  }

  // ===================================================
  // UI
  // ===================================================

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-slate-900/50
        p-3
        backdrop-blur-sm
        sm:p-5
      "
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          handleClose()
        }
      }}
    >

      <div
        className="
          flex
          max-h-[95vh]
          w-full
          max-w-5xl
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
        "
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-100
            bg-white
            px-5
            py-4
            sm:px-6
          "
        >

          <div>

            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-blue-500
              "
            >
              Voom Paints
            </p>

            <h2
              className="
                mt-1
                text-xl
                font-bold
                text-slate-800
              "
            >
              {editingBill
                ? 'Edit Bill'
                : 'Create New Bill'}
            </h2>

          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              text-slate-400
              transition
              hover:bg-red-50
              hover:text-red-500
              disabled:opacity-50
            "
          >
            <FaTimes />
          </button>

        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="
            flex
            min-h-0
            flex-1
            flex-col
          "
        >

          {/* =================================================
              CONTENT
          ================================================= */}

          <div
            className="
              flex-1
              overflow-y-auto
              p-5
              sm:p-6
            "
          >

            {/* ERROR */}

            {error && (
              <div
                className="
                  mb-5
                  rounded-xl
                  border
                  border-red-100
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  text-red-600
                "
              >
                {error}
              </div>
            )}

            {/* =================================================
                BILL DETAILS
            ================================================= */}

            <section>

              <div className="mb-4">

                <h3
                  className="
                    text-sm
                    font-bold
                    text-slate-800
                  "
                >
                  Bill Details
                </h3>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-400
                  "
                >
                  Enter basic invoice information
                </p>

              </div>

              <div
                className="
                  grid
                  grid-cols-1
                  gap-4
                  sm:grid-cols-2
                "
              >

                {/* BILL NUMBER */}

                <div>

                  <label
                    className="
                      mb-1.5
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    Bill Number
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    value={formData.number}
                    onChange={(event) =>
                      updateField(
                        'number',
                        event.target.value
                      )
                    }
                    placeholder="INV-001"
                    required
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      px-4
                      py-3
                      text-sm
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-50
                    "
                  />

                </div>

                {/* DATE */}

                <div>

                  <label
                    className="
                      mb-1.5
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    Date
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    type="date"
                    value={formData.date}
                    onChange={(event) =>
                      updateField(
                        'date',
                        event.target.value
                      )
                    }
                    required
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      px-4
                      py-3
                      text-sm
                      outline-none
                      transition
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-50
                    "
                  />

                </div>

              </div>

            </section>

            {/* =================================================
                CUSTOMER DETAILS
            ================================================= */}

            <section className="mt-7">

              <div className="mb-4">

                <h3
                  className="
                    text-sm
                    font-bold
                    text-slate-800
                  "
                >
                  Customer Details
                </h3>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-400
                  "
                >
                  These details will appear on the invoice
                </p>

              </div>

              <div
                className="
                  grid
                  grid-cols-1
                  gap-4
                  md:grid-cols-2
                "
              >

                {/* CUSTOMER NAME */}

                <div>

                  <label
                    className="
                      mb-1.5
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    Customer Name
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    value={formData.customer}
                    onChange={(event) =>
                      updateField(
                        'customer',
                        event.target.value
                      )
                    }
                    placeholder="Enter customer name"
                    required
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      px-4
                      py-3
                      text-sm
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-50
                    "
                  />

                </div>

                {/* PHONE */}

                <div>

                  <label
                    className="
                      mb-1.5
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    Customer Phone
                  </label>

                  <input
                    type="tel"
                    value={
                      formData.customerPhone
                    }
                    onChange={(event) =>
                      updateField(
                        'customerPhone',
                        event.target.value
                      )
                    }
                    placeholder="+91 XXXXX XXXXX"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      px-4
                      py-3
                      text-sm
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-50
                    "
                  />

                </div>

                {/* EMAIL */}

                <div>

                  <label
                    className="
                      mb-1.5
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    Customer Email
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    type="email"
                    value={
                      formData.customerEmail
                    }
                    onChange={(event) =>
                      updateField(
                        'customerEmail',
                        event.target.value
                      )
                    }
                    placeholder="customer@example.com"
                    required
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      px-4
                      py-3
                      text-sm
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-50
                    "
                  />

                  <p
                    className="
                      mt-1.5
                      text-xs
                      text-slate-400
                    "
                  >
                    This email will be used for sending the invoice.
                  </p>

                </div>

                {/* GSTIN */}

                <div>

                  <label
                    className="
                      mb-1.5
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    Customer GSTIN
                  </label>

                  <input
                    type="text"
                    value={
                      formData.customerGst
                    }
                    onChange={(event) =>
                      updateField(
                        'customerGst',
                        event.target.value.toUpperCase()
                      )
                    }
                    placeholder="Enter GSTIN"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      px-4
                      py-3
                      text-sm
                      uppercase
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-50
                    "
                  />

                </div>

                {/* ADDRESS */}

                <div className="md:col-span-2">

                  <label
                    className="
                      mb-1.5
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    Customer Address
                  </label>

                  <textarea
                    value={
                      formData.customerAddress
                    }
                    onChange={(event) =>
                      updateField(
                        'customerAddress',
                        event.target.value
                      )
                    }
                    placeholder="Enter complete customer address"
                    rows={3}
                    className="
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-slate-200
                      px-4
                      py-3
                      text-sm
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-50
                    "
                  />

                </div>

              </div>

            </section>

            {/* =================================================
                BANK DETAILS
            ================================================= */}

            <section className="mt-7">

              <div className="mb-4">

                <h3
                  className="
                    text-sm
                    font-bold
                    text-slate-800
                  "
                >
                  Bank Details
                </h3>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-400
                  "
                >
                  Select which bank details should appear on the invoice
                </p>

              </div>

              <div
                className="
                  grid
                  grid-cols-1
                  gap-3
                  sm:grid-cols-2
                "
              >

                {BANKS.map((bank) => (
                  <button
                    key={bank.id}
                    type="button"
                    onClick={() =>
                      updateField(
                        'bank',
                        bank.id
                      )
                    }
                    className={`
                      rounded-xl
                      border
                      p-4
                      text-left
                      transition
                      ${formData.bank ===
                        bank.id
                        ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-50'
                        : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50'
                      }
                    `}
                  >

                    <div className="flex items-center justify-between">

                      <div>

                        <p
                          className="
                            text-sm
                            font-bold
                            text-slate-800
                          "
                        >
                          {bank.name}
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            text-slate-500
                          "
                        >
                          A/c No.{' '}
                          {bank.accountNumber}
                        </p>

                      </div>

                      <div
                        className={`
                          flex
                          h-5
                          w-5
                          items-center
                          justify-center
                          rounded-full
                          border
                          ${formData.bank ===
                            bank.id
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-slate-300'
                          }
                        `}
                      >

                        {formData.bank ===
                          bank.id && (
                            <div className="h-2 w-2 rounded-full bg-white" />
                          )}

                      </div>

                    </div>

                    <div
                      className="
                        mt-3
                        text-xs
                        leading-5
                        text-slate-500
                      "
                    >
                      Branch: {bank.branch}
                      <br />
                      IFSC: {bank.ifsc}
                    </div>

                  </button>
                ))}

              </div>

            </section>

            {/* =================================================
                PRODUCTS
            ================================================= */}

            <section className="mt-7">

              <div
                className="
                  mb-4
                  flex
                  flex-col
                  gap-3
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >

                <div>

                  <h3
                    className="
                      text-sm
                      font-bold
                      text-slate-800
                    "
                  >
                    Products / Services
                  </h3>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-400
                    "
                  >
                    Add all products included in this bill
                  </p>

                </div>

                <button
                  type="button"
                  onClick={addItem}
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-blue-50
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-blue-600
                    transition
                    hover:bg-blue-100
                  "
                >
                  <FaPlus />
                  Add Product
                </button>

              </div>

              {/* DESKTOP TABLE */}

              <div
                className="
                  hidden
                  overflow-x-auto
                  rounded-xl
                  border
                  border-slate-200
                  md:block
                "
              >

                <table className="w-full min-w-[800px]">

                  <thead>

                    <tr className="bg-slate-50">

                      <th className="w-10 px-3 py-3 text-center text-xs font-bold text-slate-500">
                        #
                      </th>

                      <th className="px-3 py-3 text-left text-xs font-bold text-slate-500">
                        Product
                      </th>

                      <th className="w-32 px-3 py-3 text-left text-xs font-bold text-slate-500">
                        Pack Size
                      </th>

                      <th className="w-24 px-3 py-3 text-left text-xs font-bold text-slate-500">
                        Qty
                      </th>

                      <th className="w-32 px-3 py-3 text-left text-xs font-bold text-slate-500">
                        Rate
                      </th>

                      <th className="w-32 px-3 py-3 text-right text-xs font-bold text-slate-500">
                        Amount
                      </th>

                      <th className="w-12 px-2 py-3" />

                    </tr>

                  </thead>

                  <tbody>

                    {formData.items.map(
                      (item, index) => (
                        <tr
                          key={index}
                          className="border-t border-slate-100"
                        >

                          <td className="px-3 py-3 text-center text-xs font-semibold text-slate-400">
                            {index + 1}
                          </td>

                          <td className="px-3 py-3">

                            <input
                              type="text"
                              value={
                                item.description
                              }
                              onChange={(event) =>
                                updateItem(
                                  index,
                                  'description',
                                  event.target.value
                                )
                              }
                              placeholder="Product name"
                              className="
                                w-full
                                rounded-lg
                                border
                                border-slate-200
                                px-3
                                py-2
                                text-sm
                                outline-none
                                focus:border-blue-500
                                focus:ring-2
                                focus:ring-blue-50
                              "
                            />

                          </td>

                          <td className="px-3 py-3">

                            <input
                              type="text"
                              value={
                                item.packSize
                              }
                              onChange={(event) =>
                                updateItem(
                                  index,
                                  'packSize',
                                  event.target.value
                                )
                              }
                              placeholder="1 L"
                              className="
                                w-full
                                rounded-lg
                                border
                                border-slate-200
                                px-3
                                py-2
                                text-sm
                                outline-none
                                focus:border-blue-500
                                focus:ring-2
                                focus:ring-blue-50
                              "
                            />

                          </td>

                          <td className="px-3 py-3">

                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.qty}
                              onChange={(event) =>
                                updateItem(
                                  index,
                                  'qty',
                                  event.target.value
                                )
                              }
                              className="
                                w-full
                                rounded-lg
                                border
                                border-slate-200
                                px-3
                                py-2
                                text-sm
                                outline-none
                                focus:border-blue-500
                                focus:ring-2
                                focus:ring-blue-50
                              "
                            />

                          </td>

                          <td className="px-3 py-3">

                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.rate}
                              onChange={(event) =>
                                updateItem(
                                  index,
                                  'rate',
                                  event.target.value
                                )
                              }
                              className="
                                w-full
                                rounded-lg
                                border
                                border-slate-200
                                px-3
                                py-2
                                text-sm
                                outline-none
                                focus:border-blue-500
                                focus:ring-2
                                focus:ring-blue-50
                              "
                            />

                          </td>

                          <td className="
                            px-3
                            py-3
                            text-right
                            text-sm
                            font-semibold
                            text-slate-700
                          ">
                            {formatMoney(
                              item.amount
                            )}
                          </td>

                          <td className="px-2 py-3">

                            <button
                              type="button"
                              onClick={() =>
                                removeItem(index)
                              }
                              disabled={
                                formData.items
                                  .length === 1
                              }
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
                                disabled:cursor-not-allowed
                                disabled:opacity-30
                              "
                            >
                              <FaTrash className="text-xs" />
                            </button>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

              {/* MOBILE ITEMS */}

              <div className="space-y-3 md:hidden">

                {formData.items.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        p-4
                      "
                    >

                      <div className="
                        mb-3
                        flex
                        items-center
                        justify-between
                      ">

                        <span
                          className="
                            text-xs
                            font-bold
                            uppercase
                            tracking-wider
                            text-slate-400
                          "
                        >
                          Product {index + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(index)
                          }
                          disabled={
                            formData.items
                              .length === 1
                          }
                          className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-lg
                            text-red-400
                            hover:bg-red-50
                            disabled:opacity-30
                          "
                        >
                          <FaTrash />
                        </button>

                      </div>

                      {/* PRODUCT */}

                      <div>

                        <label
                          className="
                            mb-1
                            block
                            text-xs
                            font-semibold
                            text-slate-500
                          "
                        >
                          Product
                        </label>

                        <input
                          type="text"
                          value={
                            item.description
                          }
                          onChange={(event) =>
                            updateItem(
                              index,
                              'description',
                              event.target.value
                            )
                          }
                          placeholder="Product name"
                          className="
                            w-full
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            px-3
                            py-2.5
                            text-sm
                            outline-none
                            focus:border-blue-500
                          "
                        />

                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3">

                        {/* PACK SIZE */}

                        <div>

                          <label
                            className="
                              mb-1
                              block
                              text-xs
                              font-semibold
                              text-slate-500
                            "
                          >
                            Pack Size
                          </label>

                          <input
                            type="text"
                            value={
                              item.packSize
                            }
                            onChange={(event) =>
                              updateItem(
                                index,
                                'packSize',
                                event.target.value
                              )
                            }
                            placeholder="1 L"
                            className="
                              w-full
                              rounded-lg
                              border
                              border-slate-200
                              bg-white
                              px-3
                              py-2.5
                              text-sm
                              outline-none
                              focus:border-blue-500
                            "
                          />

                        </div>

                        {/* QTY */}

                        <div>

                          <label
                            className="
                              mb-1
                              block
                              text-xs
                              font-semibold
                              text-slate-500
                            "
                          >
                            Quantity
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.qty}
                            onChange={(event) =>
                              updateItem(
                                index,
                                'qty',
                                event.target.value
                              )
                            }
                            className="
                              w-full
                              rounded-lg
                              border
                              border-slate-200
                              bg-white
                              px-3
                              py-2.5
                              text-sm
                              outline-none
                              focus:border-blue-500
                            "
                          />

                        </div>

                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3">

                        {/* RATE */}

                        <div>

                          <label
                            className="
                              mb-1
                              block
                              text-xs
                              font-semibold
                              text-slate-500
                            "
                          >
                            Rate
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.rate}
                            onChange={(event) =>
                              updateItem(
                                index,
                                'rate',
                                event.target.value
                              )
                            }
                            className="
                              w-full
                              rounded-lg
                              border
                              border-slate-200
                              bg-white
                              px-3
                              py-2.5
                              text-sm
                              outline-none
                              focus:border-blue-500
                            "
                          />

                        </div>

                        {/* AMOUNT */}

                        <div>

                          <label
                            className="
                              mb-1
                              block
                              text-xs
                              font-semibold
                              text-slate-500
                            "
                          >
                            Amount
                          </label>

                          <div
                            className="
                              rounded-lg
                              border
                              border-slate-200
                              bg-white
                              px-3
                              py-2.5
                              text-sm
                              font-bold
                              text-slate-700
                            "
                          >
                            {formatMoney(
                              item.amount
                            )}
                          </div>

                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>

            </section>

            {/* =================================================
                BILL SUMMARY
            ================================================= */}

            <section className="mt-7">

              <div
                className="
                  rounded-2xl
                  border
                  border-blue-100
                  bg-blue-50/50
                  p-5
                "
              >

                <div className="mb-4 flex items-center gap-2">

                  <div
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-lg
                      bg-blue-600
                      text-white
                    "
                  >
                    <FaCalculator className="text-sm" />
                  </div>

                  <div>

                    <h3
                      className="
                        text-sm
                        font-bold
                        text-slate-800
                      "
                    >
                      Bill Summary
                    </h3>

                    <p
                      className="
                        text-xs
                        text-slate-400
                      "
                    >
                      GST calculated at 18%
                    </p>

                  </div>

                </div>

                <div className="ml-auto max-w-md space-y-2">

                  {/* SUBTOTAL */}

                  <div className="flex justify-between text-sm">

                    <span className="text-slate-500">
                      Subtotal
                    </span>

                    <span className="font-semibold text-slate-700">
                      {formatMoney(
                        calculated.subtotal
                      )}
                    </span>

                  </div>

                  {/* SGST */}

                  <div className="flex justify-between text-sm">

                    <span className="text-slate-500">
                      SGST (9%)
                    </span>

                    <span className="font-semibold text-slate-700">
                      {formatMoney(
                        calculated.sgst
                      )}
                    </span>

                  </div>

                  {/* CGST */}

                  <div className="flex justify-between text-sm">

                    <span className="text-slate-500">
                      CGST (9%)
                    </span>

                    <span className="font-semibold text-slate-700">
                      {formatMoney(
                        calculated.cgst
                      )}
                    </span>

                  </div>

                  {/* TOTAL */}

                  <div
                    className="
                      mt-3
                      flex
                      justify-between
                      rounded-xl
                      bg-white
                      px-4
                      py-3
                    "
                  >

                    <span
                      className="
                        font-bold
                        text-blue-700
                      "
                    >
                      Grand Total
                    </span>

                    <span
                      className="
                        font-bold
                        text-blue-700
                      "
                    >
                      {formatMoney(
                        calculated.total
                      )}
                    </span>

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                STATUS
            ================================================= */}

            <section className="mt-7">

              <label
                className="
                  mb-1.5
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >
                Payment Status
              </label>

              <select
                value={formData.status}
                onChange={(event) =>
                  updateField(
                    'status',
                    event.target.value
                  )
                }
                className="
                  w-full
                  max-w-sm
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-3
                  text-sm
                  outline-none
                  focus:border-blue-500
                  focus:ring-4
                  focus:ring-blue-50
                "
              >

                <option value="pending">
                  Pending
                </option>

                <option value="paid">
                  Paid
                </option>

                <option value="cancelled">
                  Cancelled
                </option>

              </select>

            </section>

          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div
            className="
              flex
              flex-col-reverse
              gap-3
              border-t
              border-slate-100
              bg-white
              px-5
              py-4
              sm:flex-row
              sm:items-center
              sm:justify-end
              sm:px-6
            "
          >

            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="
                w-full
                rounded-xl
                border
                border-slate-200
                px-5
                py-3
                text-sm
                font-semibold
                text-slate-600
                transition
                hover:bg-slate-50
                disabled:opacity-50
                sm:w-auto
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
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
                disabled:cursor-not-allowed
                disabled:opacity-60
                sm:w-auto
              "
            >

              {saving ? (
                <>
                  <span
                    className="
                      h-4
                      w-4
                      animate-spin
                      rounded-full
                      border-2
                      border-white/40
                      border-t-white
                    "
                  />

                  Saving...
                </>
              ) : (
                <>
                  <FaSave />

                  {editingBill
                    ? 'Update Bill'
                    : 'Save Bill'}
                </>
              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  )
}