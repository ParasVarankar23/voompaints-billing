'use client'

import { useEffect, useMemo, useState } from 'react'
import {
    FaTimes,
    FaPlus,
    FaTrash,
    FaSave,
} from 'react-icons/fa'

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
        branch: 'New Panvel',
        ifsc: 'SRCB0000450',
    },
]

const COMPANY = {
    name: 'VOOM PAINTS',
    address: 'Your Voom Paints Address',
    phone: 'Your Phone Number',
    email: 'your-email@example.com',
    gstin: 'YOUR GSTIN',
}

const createEmptyItem = () => ({
    description: '',
    packSize: '',
    qty: 1,
    rate: 0,
    amount: 0,
})

const getToday = () => {
    const date = new Date()

    return `${date.getFullYear()}-${String(
        date.getMonth() + 1
    ).padStart(2, '0')}-${String(
        date.getDate()
    ).padStart(2, '0')}`
}

const getDefaultForm = () => ({
    number: '',
    date: getToday(),
    validUntil: '',
    customer: '',
    customerAddress: '',
    customerEmail: '',
    customerPhone: '',
    customerGst: '',
    items: [createEmptyItem()],
    status: 'draft',
    bankId: 'canara',
})

export default function QuotationModal({
    isOpen,
    onClose,
    onSave,
    editingQuotation,
}) {
    const [formData, setFormData] = useState(getDefaultForm())
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const generateQuotationNumber = () => {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const random = Math.floor(1000 + Math.random() * 9000)

        return `QUO-${year}${month}-${random}`
    }

    useEffect(() => {
        if (!isOpen) return

        setError('')

        if (editingQuotation) {
            setFormData({
                number: editingQuotation.number || '',
                date: editingQuotation.date || getToday(),
                validUntil: editingQuotation.validUntil || '',
                customer: editingQuotation.customer || '',
                customerAddress:
                    editingQuotation.customerAddress ||
                    editingQuotation.address ||
                    '',
                customerEmail: editingQuotation.customerEmail || '',
                customerPhone: editingQuotation.customerPhone || '',
                customerGst: editingQuotation.customerGst || '',
                items:
                    Array.isArray(editingQuotation.items) &&
                        editingQuotation.items.length
                        ? editingQuotation.items.map((item) => ({
                            description: item.description || '',
                            packSize: item.packSize || '',
                            qty: Number(item.qty) || 1,
                            rate: Number(item.rate) || 0,
                            amount: Number(item.amount) || 0,
                        }))
                        : [createEmptyItem()],
                status: editingQuotation.status || 'draft',
                bankId: editingQuotation.bankId || 'canara',
            })
        } else {
            setFormData({
                ...getDefaultForm(),
                // leave number empty so server assigns a sequential number
                number: '',
            })
        }
    }, [isOpen, editingQuotation])

    /*
     * ==========================================================
     * PRODUCT CALCULATION
     * ==========================================================
     */

    const calculatedItems = useMemo(() => {
        return formData.items.map((item) => {
            const qty = Number(item.qty) || 0
            const rate = Number(item.rate) || 0

            return {
                ...item,
                qty,
                rate,
                amount: qty * rate,
            }
        })
    }, [formData.items])

    /*
     * ==========================================================
     * AUTOMATIC GST CALCULATION
     *
     * SGST = 9%
     * CGST = 9%
     * GST  = 18%
     * ==========================================================
     */

    const totals = useMemo(() => {
        const subtotal = calculatedItems.reduce(
            (sum, item) => sum + Number(item.amount || 0),
            0
        )

        const sgst = subtotal * 0.09
        const cgst = subtotal * 0.09
        const gst = sgst + cgst
        const total = subtotal + gst

        return {
            subtotal,
            sgst,
            cgst,
            gst,
            total,
        }
    }, [calculatedItems])

    const handleChange = (e) => {
        const { name, value } = e.target

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }))
    }

    const handleItemChange = (index, field, value) => {
        setFormData((previous) => {
            const items = [...previous.items]

            items[index] = {
                ...items[index],
                [field]: value,
            }

            return {
                ...previous,
                items,
            }
        })
    }

    const addItem = () => {
        setFormData((previous) => ({
            ...previous,
            items: [
                ...previous.items,
                createEmptyItem(),
            ],
        }))
    }

    const removeItem = (index) => {
        setFormData((previous) => {
            if (previous.items.length === 1) {
                return {
                    ...previous,
                    items: [createEmptyItem()],
                }
            }

            return {
                ...previous,
                items: previous.items.filter(
                    (_, itemIndex) => itemIndex !== index
                ),
            }
        })
    }

    /*
     * ==========================================================
     * SAVE
     * ==========================================================
     */

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!formData.customer.trim()) {
            setError('Please enter customer name.')
            return
        }

        if (!formData.customerAddress.trim()) {
            setError('Please enter customer address.')
            return
        }

        if (!formData.customerEmail.trim()) {
            setError('Please enter customer email.')
            return
        }

        // Quotation number is assigned by the server when left empty on purpose.

        const validItems = calculatedItems.filter(
            (item) =>
                item.description.trim() &&
                item.qty > 0 &&
                item.rate >= 0
        )

        if (!validItems.length) {
            setError('Please add at least one product.')
            return
        }

        try {
            setSaving(true)

            const selectedBank =
                BANKS.find(
                    (bank) => bank.id === formData.bankId
                ) || BANKS[0]

            const quotation = {
                ...formData,

                items: calculatedItems,

                subtotal: totals.subtotal,
                sgst: totals.sgst,
                cgst: totals.cgst,
                gst: totals.gst,
                total: totals.total,

                bankId: selectedBank.id,
                bank: selectedBank,

                type: 'quotation',
                company: COMPANY,
            }

            await onSave(quotation)
        } catch (err) {
            console.error('Error saving quotation:', err)

            setError(
                err.message || 'Failed to save quotation.'
            )
        } finally {
            setSaving(false)
        }
    }

    const handleClose = () => {
        if (saving) return

        setError('')
        onClose()
    }

    if (!isOpen) return null

    const selectedBank =
        BANKS.find(
            (bank) => bank.id === formData.bankId
        ) || BANKS[0]

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-2 backdrop-blur-sm sm:p-5">
            <div className="flex max-h-[96vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/* HEADER */}

                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 sm:text-xl">
                            {editingQuotation
                                ? 'Edit Quotation'
                                : 'Create New Quotation'}
                        </h2>

                        <p className="mt-1 text-xs text-slate-400">
                            Create a professional quotation
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-red-50 hover:text-red-500"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* FORM */}

                <form
                    onSubmit={handleSubmit}
                    className="flex-1 overflow-y-auto"
                >
                    <div className="space-y-6 p-4 sm:p-6">

                        {/* ERROR */}

                        {error && (
                            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                                {error}
                            </div>
                        )}

                        {/* QUOTATION DETAILS */}

                        <section>
                            <div className="mb-4 flex items-center gap-2">
                                <div className="h-6 w-1 rounded-full bg-blue-600" />

                                <h3 className="font-semibold text-slate-800">
                                    Quotation Details
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                        Quotation No.
                                    </label>

                                    <input
                                        type="text"
                                        name="number"
                                        value={formData.number}
                                        onChange={handleChange}
                                        readOnly
                                        placeholder="Will be assigned automatically"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                        Date
                                    </label>

                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                        Valid Until
                                    </label>

                                    <input
                                        type="date"
                                        name="validUntil"
                                        value={formData.validUntil}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="sent">Sent</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>

                            </div>
                        </section>

                        {/* CUSTOMER */}

                        <section>
                            <div className="mb-4 flex items-center gap-2">
                                <div className="h-6 w-1 rounded-full bg-blue-600" />

                                <h3 className="font-semibold text-slate-800">
                                    Customer Details
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                        Customer Name
                                    </label>

                                    <input
                                        type="text"
                                        name="customer"
                                        value={formData.customer}
                                        onChange={handleChange}
                                        placeholder="Enter customer name"
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                        Email Address
                                    </label>

                                    <input
                                        type="email"
                                        name="customerEmail"
                                        value={formData.customerEmail}
                                        onChange={handleChange}
                                        placeholder="customer@example.com"
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                        Phone Number
                                    </label>

                                    <input
                                        type="tel"
                                        name="customerPhone"
                                        value={formData.customerPhone}
                                        onChange={handleChange}
                                        placeholder="Enter phone number"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                        GSTIN
                                    </label>

                                    <input
                                        type="text"
                                        name="customerGst"
                                        value={formData.customerGst}
                                        onChange={handleChange}
                                        placeholder="Customer GSTIN"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm uppercase outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                        Customer Address
                                    </label>

                                    <textarea
                                        name="customerAddress"
                                        value={formData.customerAddress}
                                        onChange={handleChange}
                                        placeholder="Enter complete customer address"
                                        rows={3}
                                        required
                                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                                    />
                                </div>

                            </div>
                        </section>

                        {/* PRODUCTS */}

                        <section>

                            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-1 rounded-full bg-blue-600" />

                                    <h3 className="font-semibold text-slate-800">
                                        Products / Services
                                    </h3>
                                </div>

                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                                >
                                    <FaPlus />
                                    Add Product
                                </button>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-slate-200">

                                <table className="w-full min-w-[760px]">

                                    <thead>
                                        <tr className="bg-slate-50">

                                            <th className="w-10 px-3 py-3 text-center text-xs font-bold text-slate-500">
                                                #
                                            </th>

                                            <th className="px-3 py-3 text-left text-xs font-bold text-slate-500">
                                                Product / Description
                                            </th>

                                            <th className="w-32 px-3 py-3 text-left text-xs font-bold text-slate-500">
                                                Pack Size
                                            </th>

                                            <th className="w-24 px-3 py-3 text-right text-xs font-bold text-slate-500">
                                                Qty
                                            </th>

                                            <th className="w-32 px-3 py-3 text-right text-xs font-bold text-slate-500">
                                                Rate
                                            </th>

                                            <th className="w-32 px-3 py-3 text-right text-xs font-bold text-slate-500">
                                                Amount
                                            </th>

                                            <th className="w-12 px-3 py-3" />

                                        </tr>
                                    </thead>

                                    <tbody>

                                        {calculatedItems.map(
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
                                                            value={item.description}
                                                            onChange={(e) =>
                                                                handleItemChange(
                                                                    index,
                                                                    'description',
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Product name"
                                                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                                        />
                                                    </td>

                                                    <td className="px-3 py-3">
                                                        <input
                                                            type="text"
                                                            value={item.packSize}
                                                            onChange={(e) =>
                                                                handleItemChange(
                                                                    index,
                                                                    'packSize',
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="1 L"
                                                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                                        />
                                                    </td>

                                                    <td className="px-3 py-3">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="1"
                                                            value={item.qty}
                                                            onChange={(e) =>
                                                                handleItemChange(
                                                                    index,
                                                                    'qty',
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-right text-sm outline-none focus:border-blue-500"
                                                        />
                                                    </td>

                                                    <td className="px-3 py-3">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.rate}
                                                            onChange={(e) =>
                                                                handleItemChange(
                                                                    index,
                                                                    'rate',
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-right text-sm outline-none focus:border-blue-500"
                                                        />
                                                    </td>

                                                    <td className="px-3 py-3 text-right text-sm font-semibold text-slate-700">
                                                        ₹
                                                        {Number(
                                                            item.amount || 0
                                                        ).toFixed(2)}
                                                    </td>

                                                    <td className="px-3 py-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeItem(index)
                                                            }
                                                            className="text-slate-400 hover:text-red-500"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </td>

                                                </tr>
                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>
                        </section>

                        {/* TAX + BANK */}

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                            {/* AUTOMATIC TAX */}

                            <section>

                                <div className="mb-4 flex items-center gap-2">
                                    <div className="h-6 w-1 rounded-full bg-blue-600" />

                                    <h3 className="font-semibold text-slate-800">
                                        Tax Calculation
                                    </h3>
                                </div>

                                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

                                    <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                                        <span className="text-sm text-slate-600">
                                            SGST (9%)
                                        </span>

                                        <span className="font-semibold text-slate-800">
                                            ₹{totals.sgst.toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-sm text-slate-600">
                                            CGST (9%)
                                        </span>

                                        <span className="font-semibold text-slate-800">
                                            ₹{totals.cgst.toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="border-t border-blue-100 pt-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-slate-700">
                                                Total GST (18%)
                                            </span>

                                            <span className="font-bold text-blue-600">
                                                ₹{totals.gst.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="mt-3 text-xs text-slate-400">
                                        SGST and CGST are automatically calculated at
                                        9% each from the subtotal.
                                    </p>

                                </div>
                            </section>

                            {/* BANK */}

                            <section>

                                <div className="mb-4 flex items-center gap-2">
                                    <div className="h-6 w-1 rounded-full bg-blue-600" />

                                    <h3 className="font-semibold text-slate-800">
                                        Bank Details
                                    </h3>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                        Select Bank
                                    </label>

                                    <select
                                        name="bankId"
                                        value={formData.bankId}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
                                    >
                                        {BANKS.map((bank) => (
                                            <option
                                                key={bank.id}
                                                value={bank.id}
                                            >
                                                {bank.name}
                                            </option>
                                        ))}
                                    </select>

                                    <div className="mt-3 rounded-lg bg-white p-3 text-xs text-slate-500">

                                        <p>
                                            <strong className="text-slate-700">
                                                A/c No.:
                                            </strong>{' '}
                                            {selectedBank.accountNumber}
                                        </p>

                                        <p className="mt-1">
                                            <strong className="text-slate-700">
                                                Branch:
                                            </strong>{' '}
                                            {selectedBank.branch}
                                        </p>

                                        <p className="mt-1">
                                            <strong className="text-slate-700">
                                                IFSC:
                                            </strong>{' '}
                                            {selectedBank.ifsc}
                                        </p>

                                    </div>

                                </div>
                            </section>

                        </div>

                        {/* TOTAL */}

                        <section>
                            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:p-5">

                                <div className="ml-auto max-w-md space-y-3">

                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Subtotal</span>

                                        <span className="font-semibold">
                                            ₹{totals.subtotal.toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>SGST (9%)</span>

                                        <span>
                                            ₹{totals.sgst.toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>CGST (9%)</span>

                                        <span>
                                            ₹{totals.cgst.toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="border-t border-blue-100 pt-3">

                                        <div className="flex items-center justify-between">

                                            <span className="text-base font-bold text-slate-800">
                                                Grand Total
                                            </span>

                                            <span className="text-xl font-bold text-blue-600">
                                                ₹
                                                {totals.total.toLocaleString(
                                                    'en-IN',
                                                    {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    }
                                                )}
                                            </span>

                                        </div>

                                    </div>

                                </div>

                            </div>
                        </section>

                    </div>

                    {/* FOOTER */}

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-4 py-4 sm:flex-row sm:justify-end sm:px-6">

                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={saving}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <FaSave />
                                    {editingQuotation
                                        ? 'Update Quotation'
                                        : 'Save Quotation'}
                                </>
                            )}
                        </button>

                    </div>
                </form>
            </div>
        </div>
    )
}