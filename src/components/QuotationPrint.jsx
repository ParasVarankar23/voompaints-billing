'use client'

const COMPANY = {
  name: 'JAGDAMB PAINTS',
  address: 'Shop No 1, Sai Sharan CHS Plot No. 15, Sector 1, Khanda Colony Panvel 410206',
  phone: '+91 99676 15133 / +91 84229 11456',
  email: 'sagarnn84@gmail.com',
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
    <div className="quotation-print mx-auto w-full max-w-[900px] bg-white p-6 text-slate-800 shadow-xl">
      <div className="mb-6 flex items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Voom Paints & Services logo" className="h-16 w-16 object-contain" />
          <div>
            <h1 className="text-2xl font-black tracking-tight text-blue-700">Voom Paints & Services</h1>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Sai Sharan CHS, Shop No 1, Sector 1, Khanda Colony,<br />
              Panvel, Navi Mumbai 410206
            </p>
          </div>
        </div>

        <div className="text-right text-xl font-bold uppercase tracking-wide text-slate-800">
          Quotation
        </div>
      </div>

      <div className="space-y-4 text-sm leading-7 text-slate-700">
        <div className="font-bold">To. {quotation.customer || 'Prajwal Khandagale'}</div>
        <div>Dear Sir,</div>
        <div className="font-bold">Subject: Offer for Painting work</div>
        <div>Date: {formatDate(quotation.date) || '10-08-2026'}</div>

        <p>
          Voom Paints is an end-to-end, hassle free painting service company. The benefits of employing
          Voom Paints for your home painting needs is multifold.
        </p>

        <ul className="list-disc pl-6">
          <li>Wide range of products and specialty finishes</li>
          <li>Product and budget consultation</li>
          <li>Trained painters</li>
          <li>Covering and masking of household items</li>
          <li>Regular site supervision</li>
          <li>Cleaning of the site post work completion</li>
          <li>Authentic Company material only</li>
          <li>Site evaluation and measurement</li>
        </ul>

        <p>
          We take this opportunity to thank you for considering giving your valuable business to us and also for the courtesy extended to us during our discussion.
        </p>

        <p>Further to our discussion please find enclosed our painting quotation for the site.</p>

        <div className="mt-4 font-bold">Painting Estimate:</div>

        <div className="overflow-hidden border border-slate-200">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-blue-50">
              <tr>
                <th className="border border-slate-200 px-2 py-2 text-left">Sr.No.</th>
                <th className="border border-slate-200 px-2 py-2 text-left">Area</th>
                <th className="border border-slate-200 px-2 py-2 text-left">Area (sq.ft)</th>
                <th className="border border-slate-200 px-2 py-2 text-left">Surface</th>
                <th className="border border-slate-200 px-2 py-2 text-left">Product</th>
                <th className="border border-slate-200 px-2 py-2 text-right">Rate / sq.ft</th>
                <th className="border border-slate-200 px-2 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? items.map((item, index) => (
                <tr key={index}>
                  <td className="border border-slate-200 px-2 py-2">{index + 1}</td>
                  <td className="border border-slate-200 px-2 py-2">{item.area || item.packSize || 'All Area'}</td>
                  <td className="border border-slate-200 px-2 py-2">{item.packSize || item.area || '0'}</td>
                  <td className="border border-slate-200 px-2 py-2">{item.surface || item.description || 'Ceiling'}</td>
                  <td className="border border-slate-200 px-2 py-2">{item.product || item.description || 'Tractor Uno'}</td>
                  <td className="border border-slate-200 px-2 py-2 text-right">₹{formatMoney(item.rate)}</td>
                  <td className="border border-slate-200 px-2 py-2 text-right">₹{formatMoney(Number(item.amount) || Number(item.qty || 0) * Number(item.rate || 0))}</td>
                </tr>
              )) : (
                <tr>
                  <td className="border border-slate-200 px-2 py-2">1</td>
                  <td className="border border-slate-200 px-2 py-2">All Area</td>
                  <td className="border border-slate-200 px-2 py-2">0</td>
                  <td className="border border-slate-200 px-2 py-2">Ceiling</td>
                  <td className="border border-slate-200 px-2 py-2">Tractor Uno</td>
                  <td className="border border-slate-200 px-2 py-2 text-right">₹0.00</td>
                  <td className="border border-slate-200 px-2 py-2 text-right">₹0.00</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
            <span>GSTIN</span>
            <span className="font-semibold text-slate-800">{COMPANY.gstin}</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 text-sm text-slate-600">
            <span>Phone</span>
            <span className="font-semibold text-slate-800">{COMPANY.phone}</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 text-sm text-slate-600">
            <span>Email</span>
            <span className="font-semibold text-slate-800">{COMPANY.email}</span>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm text-slate-700">
          <div className="flex justify-between gap-4"><span>Subtotal</span><span>₹{formatMoney(subtotal)}</span></div>
          <div className="flex justify-between gap-4"><span>SGST (9%)</span><span>₹{formatMoney(sgst)}</span></div>
          <div className="flex justify-between gap-4"><span>CGST (9%)</span><span>₹{formatMoney(cgst)}</span></div>
          <div className="flex justify-between gap-4 text-base font-bold"><span>Total</span><span>₹{formatMoney(total)}</span></div>
        </div>

        <p className="text-xs text-slate-500">
          Note: Above rates are inclusive of LABOUR + MATERIAL. No warranty on leakage, seapage, cracks and undulations.
        </p>

        <div className="mt-4 font-bold">Payment Policy</div>
        <div>30% advance payment</div>
        <div>30% after 1st completion of 2 bed.</div>
        <div>30% after completion of Hall and kitchen putty work</div>
        <div>10% before completion work</div>

        <div className="mt-5 font-bold">Other Terms &amp; Conditions</div>
        <ul className="list-disc pl-6 text-xs text-slate-600">
          <li>Upgrading to any high-sheen finish enhances visibility of the undulations on wall substrate.</li>
          <li>Areas related to the rectification of substrate undulations are outside the purview of painting job.</li>
          <li>All rework claims, shall be subject to inspection of site by Authorized Voom Paints representative.</li>
          <li>Liability is limited to making good the affected areas only.</li>
          <li>Work shall commence 3 days from collection of relevant cheques and work order as applicable.</li>
          <li>Refund paid for any stoppage of work shall be at the direction of Voom Paints.</li>
          <li>Orders for a particular shade once accepted will not be changed if paint is tinted.</li>
        </ul>

        <p className="mt-4">
          In case of any doubt on the surface conditions, you are free to take suggestion and advise from anybody related to the Civil, waterproofing and structural field.
        </p>

        <p>In case you need any other information, please feel free to call us.</p>

        <div className="mt-6">
          <div>Warm regards,</div>
          <div className="font-bold">Sagar Nalawade (8422911546)</div>
        </div>
      </div>
    </div>
  )
}