'use client'

import { useEffect, useState } from 'react'
import {
  FaTimes,
  FaPlus,
  FaTrash,
  FaPrint,
  FaEnvelope,
  FaUpload,
  FaFileInvoice,
} from 'react-icons/fa'

const emptyItem = {
  description: '',
  packSize: '',
  qty: 1,
  rate: 0,
  amount: 0,
}

const initialFormData = {
  number: '',
  date: new Date().toISOString().split('T')[0],
  customer: '',
  customerGst: '',
  items: [],
  total: 0,
  gst: 0,
  sgst: 0,
  cgst: 0,
  status: 'pending',
}

export default function BillModal({
  isOpen,
  onClose,
  onSave,
  editingBill,
}) {
  const [formData, setFormData] =
    useState(initialFormData)

  const [email, setEmail] = useState('')
  const [sendingEmail, setSendingEmail] =
    useState(false)
  const [uploading, setUploading] =
    useState(false)

  /*
   * Load editing bill
   */
  useEffect(() => {
    if (!isOpen) return

    if (editingBill) {
      setFormData({
        number: editingBill.number || '',
        date:
          editingBill.date ||
          new Date()
            .toISOString()
            .split('T')[0],
        customer:
          editingBill.customer || '',
        customerGst:
          editingBill.customerGst || '',
        items: editingBill.items || [],
        total: Number(editingBill.total || 0),
        gst: Number(editingBill.gst || 0),
        sgst: Number(editingBill.sgst || 0),
        cgst: Number(editingBill.cgst || 0),
        status:
          editingBill.status || 'pending',
      })
    } else {
      setFormData(initialFormData)
    }

    setEmail('')
  }, [isOpen, editingBill])

  /*
   * Calculate totals
   */
  const calculateTotals = (items) => {
    const subtotal = items.reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    )

    const sgst = subtotal * 0.09
    const cgst = subtotal * 0.09
    const gst = sgst + cgst
    const total = subtotal + gst

    return {
      total,
      gst,
      sgst,
      cgst,
    }
  }

  /*
   * Add item
   */
  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { ...emptyItem },
      ],
    }))
  }

  /*
   * Update item
   */
  const handleItemChange = (
    index,
    field,
    value
  ) => {
    setFormData((prev) => {
      const items = [...prev.items]

      const updatedItem = {
        ...items[index],
        [field]: value,
      }

      if (
        field === 'qty' ||
        field === 'rate'
      ) {
        updatedItem.amount =
          Number(updatedItem.qty || 0) *
          Number(updatedItem.rate || 0)
      }

      items[index] = updatedItem

      const totals =
        calculateTotals(items)

      return {
        ...prev,
        items,
        ...totals,
      }
    })
  }

  /*
   * Remove item
   */
  const handleRemoveItem = (index) => {
    setFormData((prev) => {
      const items = prev.items.filter(
        (_, i) => i !== index
      )

      const totals =
        calculateTotals(items)

      return {
        ...prev,
        items,
        ...totals,
      }
    })
  }

  /*
   * Submit
   */
  const handleSubmit = (e) => {
    e.preventDefault()

    onSave(formData)
  }

  /*
   * Print
   */
  const handlePrint = () => {
    window.print()
  }

  /*
   * Email
   */
  const handleSendEmail = async () => {
    if (!email.trim()) {
      alert('Please enter an email address')
      return
    }

    setSendingEmail(true)

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
            to: email,
            bill: formData,
            type: 'bill',
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          'Failed to send email'
        )
      }

      alert('Email sent successfully!')
      setEmail('')
    } catch (error) {
      console.error(
        'Email error:',
        error
      )

      alert(
        'Unable to send email. Please try again.'
      )
    } finally {
      setSendingEmail(false)
    }
  }

  /*
   * Upload
   */
  const handleUpload = async () => {
    setUploading(true)

    try {
      const response = await fetch(
        '/api/upload',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            bill: formData,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          'Upload failed'
        )
      }

      const data = await response.json()

      alert(
        `Uploaded successfully!`
      )

      console.log('Upload URL:', data.url)
    } catch (error) {
      console.error(
        'Upload error:',
        error
      )

      alert(
        'Unable to upload bill.'
      )
    } finally {
      setUploading(false)
    }
  }

  if (!isOpen) {
    return null
  }

  const subtotal =
    Number(formData.total || 0) -
    Number(formData.gst || 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-3 backdrop-blur-sm sm:p-5">

      <div className="
        flex
        max-h-[94vh]
        w-full
        max-w-6xl
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-2xl
      ">

        {/* ================================
            HEADER
        ================================= */}
        <div className="
          flex
          shrink-0
          items-center
          justify-between
          border-b
          border-slate-100
          bg-white
          px-5
          py-4
          sm:px-6
        ">

          <div className="flex items-center gap-3">

            <div className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-blue-50
              text-blue-500
            ">
              <FaFileInvoice />
            </div>

            <div>

              <h2 className="text-lg font-bold text-slate-800">
                {editingBill
                  ? 'Edit Bill'
                  : 'Create New Bill'}
              </h2>

              <p className="text-xs text-slate-400">
                Add customer and billing details
              </p>

            </div>

          </div>

          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={handlePrint}
              className="
                hidden
                items-center
                gap-2
                rounded-lg
                border
                border-slate-200
                px-3
                py-2
                text-xs
                font-semibold
                text-slate-600
                transition
                hover:bg-slate-50
                sm:flex
              "
            >
              <FaPrint />
              Print
            </button>

            <button
              type="button"
              onClick={onClose}
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
                hover:text-red-500
              "
            >
              <FaTimes />
            </button>

          </div>

        </div>

        {/* ================================
            CONTENT
        ================================= */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto"
        >

          <div className="space-y-6 p-5 sm:p-6">

            {/* ==============================
                EMAIL / UPLOAD
            =============================== */}
            <div className="
              rounded-2xl
              border
              border-blue-100
              bg-blue-50/50
              p-4
            ">

              <div className="
                flex
                flex-col
                gap-3
                lg:flex-row
                lg:items-center
              ">

                <div className="flex items-center gap-3">

                  <div className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-white
                    text-blue-500
                    shadow-sm
                  ">
                    <FaEnvelope />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Send Bill
                    </p>

                    <p className="text-xs text-slate-400">
                      Email or upload this bill
                    </p>
                  </div>

                </div>

                <div className="flex flex-1 flex-col gap-2 sm:flex-row">

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="Customer email address"
                    className="
                      flex-1
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-4
                      py-2.5
                      text-sm
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-blue-400
                      focus:ring-4
                      focus:ring-blue-100
                    "
                  />

                  <button
                    type="button"
                    onClick={
                      handleSendEmail
                    }
                    disabled={
                      sendingEmail
                    }
                    className="
                      rounded-xl
                      bg-blue-500
                      px-4
                      py-2.5
                      text-xs
                      font-semibold
                      text-white
                      transition
                      hover:bg-blue-600
                      disabled:opacity-50
                    "
                  >
                    {sendingEmail
                      ? 'Sending...'
                      : 'Send Email'}
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleUpload
                    }
                    disabled={
                      uploading
                    }
                    className="
                      flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-4
                      py-2.5
                      text-xs
                      font-semibold
                      text-slate-600
                      transition
                      hover:border-blue-200
                      hover:bg-blue-50
                      hover:text-blue-500
                      disabled:opacity-50
                    "
                  >
                    <FaUpload />

                    {uploading
                      ? 'Uploading...'
                      : 'Upload'}
                  </button>

                </div>

              </div>

            </div>

            {/* ==============================
                BILL DETAILS
            =============================== */}
            <div>

              <div className="mb-4">

                <h3 className="text-sm font-bold text-slate-800">
                  Bill Information
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Enter customer and bill details
                </p>

              </div>

              <div className="
                grid
                grid-cols-1
                gap-4
                md:grid-cols-2
                xl:grid-cols-3
              ">

                {/* Bill Number */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Bill Number
                  </label>

                  <input
                    type="text"
                    value={formData.number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        number:
                          e.target.value,
                      })
                    }
                    placeholder="e.g. INV-001"
                    required
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-4
                      py-2.5
                      text-sm
                      outline-none
                      transition
                      focus:border-blue-400
                      focus:bg-white
                      focus:ring-4
                      focus:ring-blue-100
                    "
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Date
                  </label>

                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        date:
                          e.target.value,
                      })
                    }
                    required
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-4
                      py-2.5
                      text-sm
                      outline-none
                      transition
                      focus:border-blue-400
                      focus:bg-white
                      focus:ring-4
                      focus:ring-blue-100
                    "
                  />
                </div>

                {/* Customer */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Customer Name
                  </label>

                  <input
                    type="text"
                    value={formData.customer}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer:
                          e.target.value,
                      })
                    }
                    placeholder="Customer name"
                    required
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-4
                      py-2.5
                      text-sm
                      outline-none
                      transition
                      focus:border-blue-400
                      focus:bg-white
                      focus:ring-4
                      focus:ring-blue-100
                    "
                  />
                </div>

                {/* GST */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Customer GST
                  </label>

                  <input
                    type="text"
                    value={
                      formData.customerGst
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customerGst:
                          e.target.value,
                      })
                    }
                    placeholder="GST number"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-4
                      py-2.5
                      text-sm
                      uppercase
                      outline-none
                      transition
                      focus:border-blue-400
                      focus:bg-white
                      focus:ring-4
                      focus:ring-blue-100
                    "
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Payment Status
                  </label>

                  <select
                    value={
                      formData.status
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status:
                          e.target.value,
                      })
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-4
                      py-2.5
                      text-sm
                      outline-none
                      transition
                      focus:border-blue-400
                      focus:bg-white
                      focus:ring-4
                      focus:ring-blue-100
                    "
                  >
                    <option value="pending">
                      Pending
                    </option>

                    <option value="paid">
                      Paid
                    </option>
                  </select>
                </div>

              </div>

            </div>

            {/* ==============================
                ITEMS
            =============================== */}
            <div>

              <div className="
                mb-4
                flex
                items-center
                justify-between
              ">

                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Bill Items
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Add products or services
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    handleAddItem
                  }
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-blue-500
                    px-3
                    py-2
                    text-xs
                    font-semibold
                    text-white
                    shadow-sm
                    shadow-blue-100
                    transition
                    hover:bg-blue-600
                  "
                >
                  <FaPlus />
                  Add Item
                </button>

              </div>

              <div className="
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
              ">

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[750px]">

                    <thead>
                      <tr className="bg-slate-50">

                        <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Product
                        </th>

                        <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Pack Size
                        </th>

                        <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Qty
                        </th>

                        <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Rate
                        </th>

                        <th className="px-3 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Amount
                        </th>

                        <th className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Action
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {formData.items.map(
                        (item, index) => (
                          <tr
                            key={index}
                            className="border-t border-slate-100"
                          >

                            <td className="px-4 py-2.5">

                              <input
                                type="text"
                                value={
                                  item.description
                                }
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    'description',
                                    e.target.value
                                  )
                                }
                                placeholder="Product name"
                                className="
                                  w-full
                                  min-w-[200px]
                                  rounded-lg
                                  border
                                  border-slate-200
                                  bg-white
                                  px-3
                                  py-2
                                  text-xs
                                  outline-none
                                  focus:border-blue-400
                                  focus:ring-2
                                  focus:ring-blue-50
                                "
                              />

                            </td>

                            <td className="px-3 py-2.5">

                              <input
                                type="text"
                                value={
                                  item.packSize
                                }
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    'packSize',
                                    e.target.value
                                  )
                                }
                                placeholder="Size"
                                className="
                                  w-24
                                  rounded-lg
                                  border
                                  border-slate-200
                                  px-3
                                  py-2
                                  text-xs
                                  outline-none
                                  focus:border-blue-400
                                "
                              />

                            </td>

                            <td className="px-3 py-2.5">

                              <input
                                type="number"
                                value={
                                  item.qty
                                }
                                min="1"
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    'qty',
                                    Number(
                                      e.target.value
                                    ) || 0
                                  )
                                }
                                className="
                                  w-20
                                  rounded-lg
                                  border
                                  border-slate-200
                                  px-3
                                  py-2
                                  text-xs
                                  outline-none
                                  focus:border-blue-400
                                "
                              />

                            </td>

                            <td className="px-3 py-2.5">

                              <input
                                type="number"
                                value={
                                  item.rate
                                }
                                min="0"
                                step="0.01"
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    'rate',
                                    Number(
                                      e.target.value
                                    ) || 0
                                  )
                                }
                                className="
                                  w-24
                                  rounded-lg
                                  border
                                  border-slate-200
                                  px-3
                                  py-2
                                  text-xs
                                  outline-none
                                  focus:border-blue-400
                                "
                              />

                            </td>

                            <td className="px-3 py-2.5 text-right">

                              <span className="text-sm font-semibold text-slate-700">
                                ₹
                                {Number(
                                  item.amount ||
                                    0
                                ).toFixed(2)}
                              </span>

                            </td>

                            <td className="px-3 py-2.5 text-center">

                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveItem(
                                    index
                                  )
                                }
                                className="
                                  flex
                                  h-8
                                  w-8
                                  mx-auto
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

                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>

                {formData.items.length ===
                  0 && (
                  <div className="px-5 py-10 text-center">

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-300">
                      <FaFileInvoice />
                    </div>

                    <p className="mt-3 text-sm font-medium text-slate-500">
                      No items added
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Click "Add Item" to add products
                    </p>

                  </div>
                )}

              </div>

            </div>

            {/* ==============================
                TOTALS
            =============================== */}
            <div className="flex justify-end">

              <div className="
                w-full
                rounded-2xl
                border
                border-slate-100
                bg-slate-50
                p-5
                sm:w-80
              ">

                <div className="space-y-3">

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Subtotal
                    </span>

                    <span className="font-medium text-slate-700">
                      ₹
                      {subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      SGST (9%)
                    </span>

                    <span className="font-medium text-slate-700">
                      ₹
                      {Number(
                        formData.sgst || 0
                      ).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      CGST (9%)
                    </span>

                    <span className="font-medium text-slate-700">
                      ₹
                      {Number(
                        formData.cgst || 0
                      ).toFixed(2)}
                    </span>
                  </div>

                  <div className="
                    border-t
                    border-slate-200
                    pt-3
                  ">

                    <div className="flex justify-between">

                      <span className="font-bold text-slate-800">
                        Total
                      </span>

                      <span className="text-lg font-bold text-blue-500">
                        ₹
                        {Number(
                          formData.total || 0
                        ).toFixed(2)}
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* ================================
              FOOTER ACTIONS
          ================================= */}
          <div className="
            sticky
            bottom-0
            flex
            items-center
            justify-end
            gap-3
            border-t
            border-slate-100
            bg-white
            px-5
            py-4
            sm:px-6
          ">

            <button
              type="button"
              onClick={onClose}
              className="
                rounded-xl
                border
                border-slate-200
                px-5
                py-2.5
                text-sm
                font-semibold
                text-slate-600
                transition
                hover:bg-slate-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              className="
                rounded-xl
                bg-blue-500
                px-6
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
              {editingBill
                ? 'Update Bill'
                : 'Create Bill'}
            </button>

          </div>

        </form>

      </div>

    </div>
  )
}