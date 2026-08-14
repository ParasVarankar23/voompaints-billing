'use client'

const COMPANY = {
  name: 'VOOM PAINTS & Jagdamb Paints',
  address: 'Shop No 1, Sai Sharan CHS Plot No. 15, Sector 1, Khanda Colony Panvel 410206',
  phone: '+91 99676 15133 / +91 84229 11456',
  email: 'sagarnalwade@gmail.com',
  gstin: '27AIXPN1343G1ZY',
}

const formatMoney = (value) => {
  return Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const formatDate = (value) => {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function QuotationPrint({
  quotation,
}) {
  if (!quotation) return null

  const items = Array.isArray(quotation.items)
    ? quotation.items
    : []

  const subtotal =
    Number(quotation.subtotal) ||
    items.reduce(
      (sum, item) =>
        sum +
        Number(item.amount || 0),
      0
    )

  const sgst =
    Number(quotation.sgst) ||
    subtotal * 0.09

  const cgst =
    Number(quotation.cgst) ||
    subtotal * 0.09

  const gst = sgst + cgst

  const total =
    Number(quotation.total) ||
    subtotal + gst

  const bank =
    quotation.bank || {
      name: 'CANARA BANK',
      accountNumber: '52153070008808',
      branch: 'Kalamboli',
      ifsc: 'CNRB0015215',
    }

  return (
    <div className="quotation-print mx-auto w-full max-w-[794px] bg-white text-slate-800 shadow-xl">

      {/* HEADER */}

      <div className="border-b-4 border-blue-600 px-8 py-7">

        <div className="flex items-start justify-between gap-6">

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-blue-700">
              {COMPANY.name}
            </h1>

            <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">
              {COMPANY.address}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Phone: {COMPANY.phone}
            </p>

            <p className="text-xs text-slate-500">
              Email: {COMPANY.email}
            </p>

            <p className="mt-1 text-xs font-semibold text-slate-600">
              GSTIN: {COMPANY.gstin}
            </p>
          </div>

          <div className="text-right">

            <h2 className="text-3xl font-bold uppercase tracking-wide text-slate-800">
              Quotation
            </h2>

            <div className="mt-3 space-y-1 text-xs">

              <p>
                <span className="font-semibold text-slate-500">
                  Quotation No:
                </span>{' '}
                <span className="font-bold">
                  {quotation.number || '-'}
                </span>
              </p>

              <p>
                <span className="font-semibold text-slate-500">
                  Date:
                </span>{' '}
                {formatDate(quotation.date)}
              </p>

              {quotation.validUntil && (
                <p>
                  <span className="font-semibold text-slate-500">
                    Valid Until:
                  </span>{' '}
                  {formatDate(
                    quotation.validUntil
                  )}
                </p>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* CUSTOMER / FROM */}

      <div className="grid grid-cols-2 border-b border-slate-200">

        <div className="border-r border-slate-200 p-6">

          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-blue-600">
            Quotation To
          </p>

          <h3 className="text-base font-bold text-slate-800">
            {quotation.customer || '-'}
          </h3>

          <p className="mt-2 whitespace-pre-line text-xs leading-5 text-slate-500">
            {quotation.customerAddress || '-'}
          </p>

          {quotation.customerPhone && (
            <p className="mt-2 text-xs text-slate-500">
              Phone: {quotation.customerPhone}
            </p>
          )}

          {quotation.customerEmail && (
            <p className="break-all text-xs text-slate-500">
              Email: {quotation.customerEmail}
            </p>
          )}

          {quotation.customerGst && (
            <p className="mt-1 text-xs font-semibold text-slate-600">
              GSTIN: {quotation.customerGst}
            </p>
          )}

        </div>

        <div className="p-6">

          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-blue-600">
            From
          </p>

          <h3 className="text-base font-bold text-slate-800">
            {COMPANY.name}
          </h3>

          <p className="mt-2 whitespace-pre-line text-xs leading-5 text-slate-500">
            {COMPANY.address}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Phone: {COMPANY.phone}
          </p>

          <p className="text-xs text-slate-500">
            Email: {COMPANY.email}
          </p>

          <p className="mt-1 text-xs font-semibold text-slate-600">
            GSTIN: {COMPANY.gstin}
          </p>

        </div>

      </div>

      {/* TITLE */}

      <div className="px-8 pt-7">

        <div className="rounded-lg bg-blue-50 px-4 py-3">

          <p className="text-sm font-semibold text-blue-700">
            Product / Service Details
          </p>

        </div>

      </div>

      {/* PRODUCTS */}

      <div className="px-8 py-5">

        <table className="w-full border-collapse">

          <thead>

            <tr className="bg-slate-800 text-white">

              <th className="w-10 border border-slate-700 px-3 py-3 text-center text-[10px]">
                #
              </th>

              <th className="border border-slate-700 px-3 py-3 text-left text-[10px]">
                Product / Description
              </th>

              <th className="w-24 border border-slate-700 px-3 py-3 text-center text-[10px]">
                Pack Size
              </th>

              <th className="w-16 border border-slate-700 px-3 py-3 text-center text-[10px]">
                Qty
              </th>

              <th className="w-24 border border-slate-700 px-3 py-3 text-right text-[10px]">
                Rate
              </th>

              <th className="w-28 border border-slate-700 px-3 py-3 text-right text-[10px]">
                Amount
              </th>

            </tr>

          </thead>

          <tbody>

            {items.map((item, index) => {

              const amount =
                Number(item.amount) ||
                Number(item.qty || 0) *
                  Number(item.rate || 0)

              return (
                <tr key={index}>

                  <td className="border border-slate-200 px-3 py-3 text-center text-xs">
                    {index + 1}
                  </td>

                  <td className="border border-slate-200 px-3 py-3 text-xs font-medium">
                    {item.description || '-'}
                  </td>

                  <td className="border border-slate-200 px-3 py-3 text-center text-xs">
                    {item.packSize || '-'}
                  </td>

                  <td className="border border-slate-200 px-3 py-3 text-center text-xs">
                    {item.qty || 0}
                  </td>

                  <td className="border border-slate-200 px-3 py-3 text-right text-xs">
                    ₹{formatMoney(item.rate)}
                  </td>

                  <td className="border border-slate-200 px-3 py-3 text-right text-xs font-semibold">
                    ₹{formatMoney(amount)}
                  </td>

                </tr>
              )
            })}

          </tbody>

        </table>

      </div>

      {/* TOTALS */}

      <div className="flex justify-end px-8">

        <div className="w-full max-w-sm">

          <div className="flex justify-between border-b border-slate-100 py-2 text-xs text-slate-600">
            <span>Subtotal</span>
            <span className="font-semibold">
              ₹{formatMoney(subtotal)}
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-100 py-2 text-xs text-slate-600">
            <span>SGST (9%)</span>
            <span>
              ₹{formatMoney(sgst)}
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-100 py-2 text-xs text-slate-600">
            <span>CGST (9%)</span>
            <span>
              ₹{formatMoney(cgst)}
            </span>
          </div>

          <div className="mt-1 flex justify-between rounded-lg bg-blue-600 px-4 py-3 text-white">

            <span className="text-sm font-bold">
              Grand Total
            </span>

            <span className="text-sm font-bold">
              ₹{formatMoney(total)}
            </span>

          </div>

        </div>

      </div>

      {/* BANK + TERMS */}

      <div className="grid grid-cols-2 gap-8 px-8 py-8">

        <div>

          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-600">
            Bank Details
          </h3>

          <div className="rounded-lg border border-slate-200 p-4 text-xs">

            <p className="font-bold text-slate-800">
              {bank.name}
            </p>

            <p className="mt-2 text-slate-500">
              A/c No.: {bank.accountNumber}
            </p>

            <p className="mt-1 text-slate-500">
              Branch: {bank.branch}
            </p>

            <p className="mt-1 text-slate-500">
              IFSC: {bank.ifsc}
            </p>

          </div>

        </div>

        <div>

          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-600">
            Notes
          </h3>

          <div className="text-xs leading-5 text-slate-500">
            <p>
              This quotation is valid until the date
              mentioned above.
            </p>

            <p className="mt-2">
              Prices are subject to the applicable
              GST.
            </p>

            <p className="mt-2">
              Thank you for choosing {COMPANY.name}.
            </p>
          </div>

        </div>

      </div>

      {/* SIGNATURE */}

      <div className="flex justify-end px-8 pb-8">

        <div className="w-48 text-center">

          <div className="mb-3 flex h-20 items-center justify-center rounded-full border-2 border-blue-600 text-xs font-bold text-blue-600">
            FOR {COMPANY.name}
            <br />
            AUTHORISED
            <br />
            SIGNATORY
          </div>

          <div className="border-t border-slate-300 pt-2 text-[10px] font-semibold text-slate-500">
            Authorised Signatory
          </div>

        </div>

      </div>

      {/* FOOTER */}

      <div className="border-t border-slate-200 bg-slate-50 px-8 py-4 text-center text-[10px] text-slate-400">
        This is a computer-generated quotation.
      </div>

    </div>
  )
}