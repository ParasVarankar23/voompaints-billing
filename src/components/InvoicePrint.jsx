'use client'

import { useEffect } from 'react'

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
// COMPANY DETAILS
// Change these according to your actual Voom Paints
// details.
// =====================================================

const COMPANY = {
    name: 'VOOM PAINTS',

    address:
        'Shop No 1, Sai Sharan CHS Plot No. 15, Sector 1, Khanda Colony Panvel 410206',

    phone:
        '+91 99676 15133 / +91 84229 11456',

    email:
        'sagarnn84@gmail.com',

    gstin:
        '27AIXPN1343G1ZY',
}

// =====================================================
// MONEY FORMAT
// =====================================================

function formatMoney(value) {
    return `₹${Number(value || 0).toLocaleString(
        'en-IN',
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    )}`
}

// =====================================================
// DATE FORMAT
// =====================================================

function formatDate(date) {
    if (!date) return '-'

    try {
        const parsed = new Date(date)

        if (Number.isNaN(parsed.getTime())) {
            return date
        }

        return parsed.toLocaleDateString(
            'en-IN',
            {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            }
        )
    } catch {
        return date
    }
}

// =====================================================
// COMPONENT
// =====================================================

export default function InvoicePrint({
    bill,
    autoPrint = false,
}) {
    useEffect(() => {
        if (!autoPrint) return

        const timer = setTimeout(() => {
            window.print()
        }, 500)

        return () => clearTimeout(timer)
    }, [autoPrint])

    if (!bill) {
        return null
    }

    const items = Array.isArray(bill.items)
        ? bill.items
        : []

    const selectedBank =
        BANKS.find(
            (bank) => bank.id === bill.bank
        ) || BANKS[0]

    const subtotal =
        Number(
            bill.subtotal ??
            items.reduce(
                (sum, item) =>
                    sum +
                    Number(item.amount || 0),
                0
            )
        )

    const sgst =
        Number(
            bill.sgst ??
            subtotal * 0.09
        )

    const cgst =
        Number(
            bill.cgst ??
            subtotal * 0.09
        )

    const total =
        Number(
            bill.total ??
            subtotal +
            sgst +
            cgst
        )

    return (
        <>
            {/* =================================================
          SCREEN PREVIEW
      ================================================= */}

            <div className="invoice-print-wrapper min-h-screen bg-slate-100 p-3 sm:p-6">

                <div
                    id="invoice-print"
                    className="
            invoice-page
            mx-auto
            w-full
            max-w-[794px]
            bg-white
            text-slate-800
            shadow-lg
          "
                >

                    {/* =================================================
              HEADER
          ================================================= */}

                    <div className="border-b-2 border-blue-600 px-6 py-6 sm:px-10">

                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                            {/* BRAND */}

                            <div className="flex items-start gap-3">

                                <img
                                    src="/logo.png"
                                    alt="VOOM PAINTS logo"
                                    className="h-16 w-16 object-contain sm:h-20 sm:w-20"
                                />

                                <div>

                                    <h1 className="text-2xl font-black tracking-tight text-blue-700">
                                        {COMPANY.name}
                                    </h1>

                                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                        Paints & Coatings
                                    </p>

                                </div>

                            </div>

                            {/* INVOICE TITLE */}

                            <div className="text-left sm:text-right">

                                <h2 className="text-2xl font-black uppercase tracking-wide text-slate-800">
                                    Tax Invoice
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    Original for Recipient
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* =================================================
              COMPANY + CUSTOMER
          ================================================= */}

                    <div className="grid grid-cols-1 border-b border-slate-200 sm:grid-cols-2">

                        {/* CUSTOMER */}

                        <div className="border-b border-slate-200 px-6 py-5 sm:border-b-0 sm:border-r sm:px-10">

                            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                                Bill To
                            </p>

                            <h3 className="text-base font-bold text-slate-800">
                                {bill.customer || '-'}
                            </h3>

                            {bill.customerAddress && (
                                <p className="mt-2 whitespace-pre-line text-xs leading-5 text-slate-500">
                                    {bill.customerAddress}
                                </p>
                            )}

                            {bill.customerPhone && (
                                <p className="mt-2 text-xs text-slate-600">
                                    <strong>Phone:</strong>{' '}
                                    {bill.customerPhone}
                                </p>
                            )}

                            {bill.customerEmail && (
                                <p className="mt-1 break-all text-xs text-slate-600">
                                    <strong>Email:</strong>{' '}
                                    {bill.customerEmail}
                                </p>
                            )}

                            {bill.customerGst && (
                                <p className="mt-1 text-xs font-semibold text-slate-600">
                                    <strong>GSTIN:</strong>{' '}
                                    {bill.customerGst}
                                </p>
                            )}

                        </div>

                        {/* FROM */}

                        <div className="px-6 py-5 sm:px-10">

                            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                                From
                            </p>

                            <h3 className="text-base font-bold text-slate-800">
                                {COMPANY.name}
                            </h3>

                            <p className="mt-2 whitespace-pre-line text-xs leading-5 text-slate-500">
                                {COMPANY.address}
                            </p>

                            <p className="mt-2 text-xs text-slate-600">
                                <strong>Phone:</strong>{' '}
                                {COMPANY.phone}
                            </p>

                            <p className="mt-1 break-all text-xs text-slate-600">
                                <strong>Email:</strong>{' '}
                                {COMPANY.email}
                            </p>

                            {COMPANY.gstin && (
                                <p className="mt-1 text-xs font-semibold text-slate-600">
                                    <strong>GSTIN:</strong>{' '}
                                    {COMPANY.gstin}
                                </p>
                            )}

                        </div>

                    </div>

                    {/* =================================================
              BILL INFO
          ================================================= */}

                    <div className="px-6 py-5 sm:px-10">

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                            <div className="rounded-lg bg-slate-50 p-3">

                                <p className="text-[10px] font-bold uppercase text-slate-400">
                                    Invoice No.
                                </p>

                                <p className="mt-1 text-sm font-bold text-slate-800">
                                    {bill.number || '-'}
                                </p>

                            </div>

                            <div className="rounded-lg bg-slate-50 p-3">

                                <p className="text-[10px] font-bold uppercase text-slate-400">
                                    Invoice Date
                                </p>

                                <p className="mt-1 text-sm font-bold text-slate-800">
                                    {formatDate(bill.date)}
                                </p>

                            </div>

                            <div className="rounded-lg bg-slate-50 p-3">

                                <p className="text-[10px] font-bold uppercase text-slate-400">
                                    Payment
                                </p>

                                <p
                                    className={`
                    mt-1
                    text-sm
                    font-bold
                    capitalize
                    ${bill.status === 'paid'
                                            ? 'text-green-600'
                                            : 'text-orange-500'
                                        }
                  `}
                                >
                                    {bill.status || 'pending'}
                                </p>

                            </div>

                            <div className="rounded-lg bg-slate-50 p-3">

                                <p className="text-[10px] font-bold uppercase text-slate-400">
                                    Currency
                                </p>

                                <p className="mt-1 text-sm font-bold text-slate-800">
                                    INR ₹
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* =================================================
              ITEMS TABLE
          ================================================= */}

                    <div className="px-6 sm:px-10">

                        <div className="overflow-hidden rounded-xl border border-slate-200">

                            <table className="w-full border-collapse">

                                <thead>

                                    <tr className="bg-blue-600 text-white">

                                        <th className="w-10 px-3 py-3 text-center text-[10px] font-bold uppercase">
                                            #
                                        </th>

                                        <th className="px-3 py-3 text-left text-[10px] font-bold uppercase">
                                            Product / Description
                                        </th>

                                        <th className="px-3 py-3 text-center text-[10px] font-bold uppercase">
                                            Pack
                                        </th>

                                        <th className="px-3 py-3 text-center text-[10px] font-bold uppercase">
                                            Qty
                                        </th>

                                        <th className="px-3 py-3 text-right text-[10px] font-bold uppercase">
                                            Rate
                                        </th>

                                        <th className="px-3 py-3 text-right text-[10px] font-bold uppercase">
                                            Amount
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {items.length > 0 ? (
                                        items.map(
                                            (item, index) => (
                                                <tr
                                                    key={index}
                                                    className="border-b border-slate-100 last:border-0"
                                                >

                                                    <td className="px-3 py-3 text-center text-xs text-slate-400">
                                                        {index + 1}
                                                    </td>

                                                    <td className="px-3 py-3 text-xs font-semibold text-slate-700">
                                                        {item.description ||
                                                            '-'}
                                                    </td>

                                                    <td className="px-3 py-3 text-center text-xs text-slate-500">
                                                        {item.packSize ||
                                                            '-'}
                                                    </td>

                                                    <td className="px-3 py-3 text-center text-xs text-slate-600">
                                                        {item.qty || 0}
                                                    </td>

                                                    <td className="px-3 py-3 text-right text-xs text-slate-600">
                                                        {formatMoney(
                                                            item.rate
                                                        )}
                                                    </td>

                                                    <td className="px-3 py-3 text-right text-xs font-bold text-slate-700">
                                                        {formatMoney(
                                                            item.amount
                                                        )}
                                                    </td>

                                                </tr>
                                            )
                                        )
                                    ) : (
                                        <tr>

                                            <td
                                                colSpan="6"
                                                className="px-3 py-8 text-center text-xs text-slate-400"
                                            >
                                                No items
                                            </td>

                                        </tr>
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                    {/* =================================================
              TOTALS
          ================================================= */}

                    <div className="flex justify-end px-6 py-6 sm:px-10">

                        <div className="w-full max-w-sm">

                            <div className="flex justify-between border-b border-slate-100 py-2 text-sm">

                                <span className="text-slate-500">
                                    Subtotal
                                </span>

                                <span className="font-semibold text-slate-700">
                                    {formatMoney(subtotal)}
                                </span>

                            </div>

                            <div className="flex justify-between border-b border-slate-100 py-2 text-sm">

                                <span className="text-slate-500">
                                    SGST (9%)
                                </span>

                                <span className="font-semibold text-slate-700">
                                    {formatMoney(sgst)}
                                </span>

                            </div>

                            <div className="flex justify-between border-b border-slate-100 py-2 text-sm">

                                <span className="text-slate-500">
                                    CGST (9%)
                                </span>

                                <span className="font-semibold text-slate-700">
                                    {formatMoney(cgst)}
                                </span>

                            </div>

                            <div className="mt-2 flex justify-between rounded-xl bg-blue-600 px-4 py-3 text-white">

                                <span className="font-bold">
                                    Grand Total
                                </span>

                                <span className="font-bold">
                                    {formatMoney(total)}
                                </span>

                            </div>

                        </div>

                    </div>

                    {/* =================================================
              BANK DETAILS
          ================================================= */}

                    <div className="grid grid-cols-1 gap-5 border-t border-slate-200 px-6 py-6 sm:grid-cols-2 sm:px-10">

                        <div>

                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                Bank Details
                            </h3>

                            <div className="mt-3 rounded-xl bg-slate-50 p-4">

                                <p className="text-sm font-bold text-slate-800">
                                    {selectedBank.name}
                                </p>

                                <div className="mt-2 space-y-1 text-xs text-slate-500">

                                    <p>
                                        <strong>A/c No.:</strong>{' '}
                                        {selectedBank.accountNumber}
                                    </p>

                                    <p>
                                        <strong>Branch:</strong>{' '}
                                        {selectedBank.branch}
                                    </p>

                                    <p>
                                        <strong>IFSC:</strong>{' '}
                                        {selectedBank.ifsc}
                                    </p>

                                    <p>
                                        <strong>Account Name:</strong>{' '}
                                        {COMPANY.name}
                                    </p>

                                </div>

                            </div>

                        </div>

                        <div>

                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                Terms & Conditions
                            </h3>

                            <ul className="mt-3 space-y-1 text-xs leading-5 text-slate-500">

                                <li>
                                    • Goods once sold will not be returned unless agreed.
                                </li>

                                <li>
                                    • Payment should be made as per agreed terms.
                                </li>

                                <li>
                                    • Subject to applicable taxes and conditions.
                                </li>

                            </ul>

                        </div>

                    </div>

                    {/* =================================================
              AUTHORISED SIGNATORY
          ================================================= */}

                    <div className="flex justify-end px-6 pb-8 sm:px-10">

                        <div className="w-52 text-center">

                            <div className="relative mx-auto mb-3 flex h-20 w-20 items-center justify-center">

                                <div
                                    className="
                    absolute
                    inset-0
                    rounded-full
                    border-2
                    border-blue-500
                  "
                                />

                                <div
                                    className="
                    absolute
                    inset-1
                    rounded-full
                    border
                    border-blue-300
                  "
                                />

                                <div className="text-[9px] font-black uppercase leading-3 text-blue-600">
                                    Voom
                                    <br />
                                    Paints
                                    <br />
                                    Authorised
                                </div>

                            </div>

                            <div className="border-t border-slate-400 pt-2">

                                <p className="text-xs font-bold text-slate-700">
                                    For {COMPANY.name}
                                </p>

                                <p className="mt-1 text-[10px] text-slate-400">
                                    Authorised Signatory
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* =================================================
              FOOTER
          ================================================= */}

                    <div className="border-t-2 border-blue-600 bg-slate-50 px-6 py-4 text-center sm:px-10">

                        <p className="text-xs font-semibold text-slate-600">
                            Thank you for choosing {COMPANY.name}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                            This is a computer-generated invoice.
                        </p>

                    </div>

                </div>

            </div>

            {/* =================================================
          PRINT CSS
      ================================================= */}

            <style jsx global>{`
        @page {
          size: A4;
          margin: 10mm;
        }

        @media print {
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body * {
            visibility: hidden;
          }

          #invoice-print,
          #invoice-print * {
            visibility: visible;
          }

          #invoice-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: none !important;
            margin: 0 !important;
            box-shadow: none !important;
          }

          .invoice-print-wrapper {
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            min-height: auto !important;
          }

          .invoice-page {
            box-shadow: none !important;
          }

          table {
            page-break-inside: auto;
          }

          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>
        </>
    )
}