import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

function getLogoDataUri() {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png')
    const logoBuffer = fs.readFileSync(logoPath)
    return `data:image/png;base64,${logoBuffer.toString('base64')}`
  } catch (error) {
    console.warn('Failed to load logo.png for email/PDF branding:', error)
    return '/logo.png'
  }
}

const LOGO_DATA_URI = getLogoDataUri()

// Company details used in generated emails / print HTML
const COMPANY = {
  billName: 'VOOM PAINTS',
  quotationName: 'Voom Paints & Services',
  address: 'Sai Sharan CHS, Shop No 1, Sector 1, Khanda Colony, Panvel, Navi Mumbai 410206',
  phone: '+91 99676 15133 / +91 84229 11456',
  email: 'sagarnn84@gmail.com',
  gstin: '27AIXPN1343G1ZY',
}

export async function POST(request) {
  try {
    const body = await request.json()

    const {
      to,
      bill,
      quotation,
      type,
    } = body

    // Support both bill and quotation
    const document = quotation || bill

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!to) {
      return NextResponse.json(
        {
          success: false,
          message: 'Recipient email is required',
        },
        { status: 400 }
      )
    }

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Bill or quotation data is required',
        },
        { status: 400 }
      )
    }

    // ==========================================
    // SMTP CONFIGURATION
    // ==========================================

    if (
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'SMTP_USER or SMTP_PASS is missing in .env.local',
        },
        { status: 500 }
      )
    }

    // Allow self-signed certificates in development or when explicitly enabled.
    // For production, set SMTP_ALLOW_SELF_SIGNED to 'false' (or unset) for stricter checks.
    const allowSelfSigned =
      process.env.SMTP_ALLOW_SELF_SIGNED === 'true' ||
      process.env.NODE_ENV !== 'production'

    const transporter = nodemailer.createTransport({
      host:
        process.env.SMTP_HOST ||
        'smtp.gmail.com',

      port:
        Number(
          process.env.SMTP_PORT || 587
        ),

      secure: false,

      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },

      tls: {
        // If allowed, do not reject self-signed certs (useful for dev/testing)
        rejectUnauthorized: !allowSelfSigned ? true : false,
      },
    })

    if (allowSelfSigned) {
      console.warn('send-email: allowing self-signed SMTP certificates (SMTP_ALLOW_SELF_SIGNED=true or non-production NODE_ENV)')
    }

    // ==========================================
    // DOCUMENT TYPE
    // ==========================================

    const isBill = type === 'bill'

    const documentTitle = isBill
      ? 'Tax Invoice'
      : 'Quotation'

    const documentLabel = isBill
      ? 'Bill'
      : 'Quotation'

    const companyName = isBill
      ? COMPANY.billName
      : COMPANY.quotationName

    // ==========================================
    // BANK
    // ==========================================

    const bank =
      document.bank === 'saraswat'
        ? {
          name: 'SARASWAT BANK',
          accountNumber:
            '810000000009068',
          branch:
            'YOUR SARASWAT BRANCH',
          ifsc: 'SRCB0000450',
        }
        : {
          name: 'CANARA BANK',
          accountNumber:
            '52153070008808',
          branch: 'Kalamboli',
          ifsc: 'CNRB0015215',
        }

    // ==========================================
    // ITEMS
    // ==========================================

    const items = Array.isArray(
      document.items
    )
      ? document.items
      : []

    // ==========================================
    // TOTALS
    // ==========================================

    const total = Number(
      document.total || 0
    )

    const gst = Number(
      document.gst || 0
    )

    const subtotal =
      total - gst

    const sgst = Number(
      document.sgst || 0
    )

    const cgst = Number(
      document.cgst || 0
    )

    // ==========================================
    // ITEMS HTML
    // ==========================================

    const itemsHtml =
      items.length > 0
        ? items
          .map(
            (item, index) => `
                <tr>

                  <td class="center">
                    ${index + 1}
                  </td>

                  <td>
                    ${escapeHtml(
              item.description ||
              '-'
            )}
                  </td>

                  <td class="center">
                    ${escapeHtml(
              item.packSize ||
              '-'
            )}
                  </td>

                  <td class="center">
                    ${Number(
              item.qty || 0
            )}
                  </td>

                  <td class="right">
                    ₹${Number(
              item.rate || 0
            ).toFixed(2)}
                  </td>

                  <td class="right">
                    ₹${Number(
              item.amount || 0
            ).toFixed(2)}
                  </td>

                </tr>
              `
          )
          .join('')
        : `
            <tr>
              <td
                colspan="6"
                class="empty"
              >
                No items
              </td>
            </tr>
          `

    // ==========================================
    // HTML EMAIL
    // ==========================================

    const billHtmlContent = `
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
/>

<title>
  ${documentTitle}
</title>

<style>

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 30px 15px;
  background: #f1f5f9;
  font-family:
    Arial,
    Helvetica,
    sans-serif;
  color: #334155;
}

.container {
  max-width: 850px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow:
    0 10px 30px
    rgba(15, 23, 42, 0.08);
}

.top-line {
  height: 6px;
  background: #2563eb;
}

.content {
  padding: 30px;
}

/* ==========================================
   HEADER
========================================== */

.header {
  display: table;
  width: 100%;
  padding-bottom: 25px;
  border-bottom: 2px solid #dbeafe;
}

.company {
  display: table-cell;
  width: 55%;
  vertical-align: top;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.company-logo {
  width: 84px;
  height: 84px;
  object-fit: contain;
  flex-shrink: 0;
}


.company-tagline {
  margin-top: 5px;
  color: #64748b;
  font-size: 12px;
}

.company-details {
  margin-top: 12px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.7;
}

.document {
  display: table-cell;
  width: 45%;
  text-align: right;
  vertical-align: top;
}

.document-title {
  margin: 0;
  color: #0f172a;
  font-size: 23px;
  font-weight: 800;
  text-transform: uppercase;
}

.document-number {
  margin-top: 8px;
  color: #475569;
  font-size: 12px;
}

.document-date {
  margin-top: 5px;
  color: #475569;
  font-size: 12px;
}

/* ==========================================
   CUSTOMER
========================================== */

.customer-section {
  margin-top: 25px;
  padding: 18px;
  border: 1px solid #dbe3ef;
  border-radius: 10px;
  background: #ffffff;
}

.section-title {
  margin-bottom: 9px;
  color: #2563eb;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.customer-name {
  color: #0f172a;
  font-size: 16px;
  font-weight: 700;
}

.customer-info {
  margin-top: 6px;
  color: #475569;
  font-size: 12px;
  line-height: 1.7;
}

/* ==========================================
   TABLE
========================================== */

.items {
  margin-top: 25px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  padding: 11px 8px;
  background: #eff6ff;
  border: 1px solid #dbe3ef;
  color: #1e40af;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

td {
  padding: 10px 8px;
  border: 1px solid #e2e8f0;
  color: #334155;
  font-size: 12px;
}

.center {
  text-align: center;
}

.right {
  text-align: right;
}

.empty {
  padding: 20px;
  text-align: center;
  color: #94a3b8;
}

/* ==========================================
   TOTALS
========================================== */

.bottom-section {
  margin-top: 25px;
  display: table;
  width: 100%;
}

.bank {
  display: table-cell;
  width: 55%;
  vertical-align: top;
  padding-right: 20px;
}

.bank-box {
  padding: 17px;
  border: 1px solid #dbe3ef;
  border-radius: 10px;
  background: #f8fafc;
}

.bank-title {
  margin-bottom: 10px;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.bank-row {
  margin: 4px 0;
  color: #475569;
  font-size: 11px;
  line-height: 1.6;
}

.totals {
  display: table-cell;
  width: 45%;
  vertical-align: top;
}

.total-row {
  display: table;
  width: 100%;
  padding: 6px 0;
  font-size: 12px;
}

.total-label {
  display: table-cell;
  color: #64748b;
}

.total-value {
  display: table-cell;
  text-align: right;
  color: #334155;
  font-weight: 600;
}

.grand-total {
  margin-top: 8px;
  padding: 13px;
  border-radius: 9px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 16px;
  font-weight: 800;
}

.grand-total-label {
  display: inline-block;
}

.grand-total-value {
  float: right;
}

/* ==========================================
   FOOTER
========================================== */

.footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.thank-you {
  color: #334155;
  font-size: 12px;
}

.note {
  margin-top: 8px;
  color: #94a3b8;
  font-size: 10px;
}

/* ==========================================
   MOBILE
========================================== */

@media only screen and (max-width: 650px) {

  body {
    padding: 10px;
  }

  .content {
    padding: 18px;
  }

  .header,
  .bottom-section {
    display: block;
  }

  .company,
  .document,
  .bank,
  .totals {
    display: block;
    width: 100%;
  }

  .document {
    margin-top: 20px;
    text-align: left;
  }

  .bank {
    padding-right: 0;
    margin-bottom: 20px;
  }

  .company-name {
    font-size: 24px;
  }

}

</style>

</head>

<body>

<div class="container">

  <div class="top-line"></div>

  <div class="content">

    <!-- HEADER -->

    <div class="header">

      <div class="company">

        <div class="brand-row">
          <img
            class="company-logo"
            src="${LOGO_DATA_URI}"
            alt="${escapeHtml(companyName)} logo"
          />

          <div>
            <div class="company-name">
              ${escapeHtml(companyName)}
            </div>

            <div class="company-tagline">
              Paints • Colours • Solutions
            </div>
          </div>
        </div>

        <div class="company-details">
          ${escapeHtml(COMPANY.address)}<br>
          ${escapeHtml('Panvel, Maharashtra')}<br>
          Phone: ${escapeHtml(COMPANY.phone)}<br>
          Email: ${escapeHtml(COMPANY.email)}
        </div>

      </div>

      <div class="document">

        <div class="document-title">
          ${documentTitle}
        </div>

        <div class="document-number">
          ${documentLabel} No:
          <strong>
            ${escapeHtml(
      document.number || '-'
    )}
          </strong>
        </div>

        <div class="document-date">
          Date:
          <strong>
            ${escapeHtml(
      document.date || '-'
    )}
          </strong>
        </div>

      </div>

    </div>

    <!-- CUSTOMER -->

    <div class="customer-section">

      <div class="section-title">
        Customer Details
      </div>

      <div class="customer-name">
        ${escapeHtml(
      document.customer || '-'
    )}
      </div>

      <div class="customer-info">

        ${document.customerAddress
        ? `
              Address:
              ${escapeHtml(
          document.customerAddress
        )}
              <br>
            `
        : ''
      }

        ${document.customerPhone
        ? `
              Phone:
              ${escapeHtml(
          document.customerPhone
        )}
              <br>
            `
        : ''
      }

        ${document.customerEmail
        ? `
              Email:
              ${escapeHtml(
          document.customerEmail
        )}
              <br>
            `
        : ''
      }

        GSTIN:
        ${escapeHtml(
        document.customerGst ||
        'N/A'
      )}

      </div>

    </div>

    <!-- ITEMS -->

    <div class="items">

      <table>

        <thead>

          <tr>

            <th>
              #
            </th>

            <th
              style="
                text-align:left;
              "
            >
              Product
            </th>

            <th>
              Pack Size
            </th>

            <th>
              Qty
            </th>

            <th>
              Rate
            </th>

            <th>
              Amount
            </th>

          </tr>

        </thead>

        <tbody>

          ${itemsHtml}

        </tbody>

      </table>

    </div>

    <!-- BANK + TOTAL -->

    <div class="bottom-section">

      <div class="bank">

        <div class="bank-box">

          <div class="bank-title">
            Bank Details
          </div>

          <div class="bank-row">
            <strong>
              Bank:
            </strong>
            ${bank.name}
          </div>

          <div class="bank-row">
            <strong>
              A/c No.:
            </strong>
            ${bank.accountNumber}
          </div>

          <div class="bank-row">
            <strong>
              Branch:
            </strong>
            ${bank.branch}
          </div>

          <div class="bank-row">
            <strong>
              IFSC:
            </strong>
            ${bank.ifsc}
          </div>

        </div>

      </div>

      <div class="totals">

        <div class="total-row">

          <span class="total-label">
            Subtotal
          </span>

          <span class="total-value">
            ₹${subtotal.toFixed(2)}
          </span>

        </div>

        <div class="total-row">

          <span class="total-label">
            SGST (9%)
          </span>

          <span class="total-value">
            ₹${sgst.toFixed(2)}
          </span>

        </div>

        <div class="total-row">

          <span class="total-label">
            CGST (9%)
          </span>

          <span class="total-value">
            ₹${cgst.toFixed(2)}
          </span>

        </div>

        <div class="grand-total">

          <span class="grand-total-label">
            Grand Total
          </span>

          <span class="grand-total-value">
            ₹${total.toFixed(2)}
          </span>

        </div>

      </div>

    </div>

    <!-- FOOTER -->

    <div class="footer">

      <div class="thank-you">
        Thank you for choosing
        <strong>${escapeHtml(companyName)}</strong>.
      </div>

      <div class="note">
        This is a computer generated
        ${documentTitle.toLowerCase()}.
      </div>

    </div>

  </div>

</div>

</body>

</html>
`

    const htmlContent = isBill
      ? billHtmlContent
      : buildQuotationOfferHtml(document)

    // If the caller only wants the generated HTML (no send), return it
    if (body?.returnHtml) {
      console.log(
        `Generated ${documentLabel.toLowerCase()} HTML for preview/download`,
        { type, id: document.id, number: document.number }
      )

      return NextResponse.json({
        success: true,
        html: htmlContent,
      })
    }

    // ==========================================
    // SEND EMAIL
    // ==========================================

    await transporter.sendMail({
      from:
        `"${companyName}" <${process.env.SMTP_USER}>`,

      to,

      subject:
        `${documentTitle} ${document.number || ''} - ${companyName}`,

      html: htmlContent,
    })

    console.log(
      `Sent ${documentLabel.toLowerCase()} email to ${to}`,
      {
        type,
        id: document.id,
        number: document.number,
      }
    )

    return NextResponse.json({
      success: true,
      message:
        `${documentTitle} sent successfully`,
    })
  } catch (error) {
    console.error('Email error:', error)

    const payload = {
      success: false,
      message: error?.message || 'Failed to send email',
      code: error?.code || null,
    }

    // Include stack trace only in non-production for debugging
    if (process.env.NODE_ENV !== 'production') {
      payload.stack = error?.stack
    }

    return NextResponse.json(payload, { status: 500 })
  }
}

// ==========================================
// QUOTATION OFFER HTML
// ==========================================

function formatOfferDate(value) {
  if (!value) return '10-08-2026'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`
}

function buildQuotationOfferHtml(document) {
  const customerName = document.customer || 'Prajwal Khandagale'
  const total = Number(document.total || 0)
  const estimateTotal = Math.max(total, 0)

  const quoteRows = Array.isArray(document.items) && document.items.length > 0
    ? document.items.map((item, index) => {
      const area = escapeHtml(item.area || item.packSize || 'All Area')
      const areaSqft = escapeHtml(item.packSize || item.area || '0')
      const surface = escapeHtml(item.surface || item.description || 'Ceiling')
      const product = escapeHtml(item.product || item.description || 'Tractor Uno')
      const rate = Number(item.rate || 0)
      const qty = Number(item.qty || 1)
      const amount = Number(item.amount || rate * qty || 0)

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${area}</td>
          <td>${areaSqft}</td>
          <td>${surface}</td>
          <td>${product}</td>
          <td class="right">₹${rate.toFixed(2)}</td>
          <td class="right">₹${amount.toFixed(2)}</td>
        </tr>
      `
    }).join('')
    : `
      <tr>
        <td>1</td>
        <td>All Area</td>
        <td>0</td>
        <td>Ceiling</td>
        <td>Tractor Uno</td>
        <td class="right">₹0.00</td>
        <td class="right">₹0.00</td>
      </tr>
    `

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Quotation</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      background: #f8fafc;
      color: #1f2937;
      padding: 24px;
    }
    .quote {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
      padding: 36px 28px;
    }
    .header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      margin-bottom: 18px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 18px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .logo {
      width: 72px;
      height: 72px;
      object-fit: contain;
    }
    .company-name {
      font-size: 22px;
      font-weight: 800;
      color: #1d4ed8;
      line-height: 1.2;
    }
    .company-address {
      font-size: 12px;
      color: #475569;
      line-height: 1.6;
      margin-top: 4px;
    }
    .heading {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      text-align: right;
    }
    .letter {
      margin-top: 20px;
      font-size: 14px;
      line-height: 1.8;
      color: #334155;
    }
    .letter strong { color: #0f172a; }
    .subject { margin: 8px 0 12px; font-weight: 700; }
    .to-line { margin: 18px 0 6px; font-weight: 700; }
    .table-wrap { margin-top: 18px; overflow-x: auto; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 12px;
    }
    th, td {
      border: 1px solid #dbe3ef;
      padding: 8px 10px;
      text-align: left;
      vertical-align: middle;
    }
    th {
      background: #eff6ff;
      color: #1e40af;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 10px;
    }
    .right { text-align: right; }
    .total-block {
      margin-top: 18px;
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      text-align: right;
    }
    .terms {
      margin-top: 18px;
      font-size: 12px;
      color: #334155;
      line-height: 1.8;
      padding-left: 18px;
    }
    .terms li { margin-bottom: 6px; }
    .small { font-size: 12px; color: #475569; }
    .company-meta {
      margin-top: 18px;
      font-size: 12px;
      color: #475569;
      line-height: 1.8;
      padding: 12px 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }
    .totals-box {
      margin-top: 18px;
      max-width: 300px;
      margin-left: auto;
      font-size: 12px;
      color: #334155;
    }
    .totals-box > div {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 6px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    .grand-total {
      padding-top: 10px;
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      border-bottom: none;
    }
    @media (max-width: 700px) {
      body { padding: 12px; }
      .quote { padding: 20px 16px; }
      .header-row { display: block; }
      .heading { text-align: left; margin-top: 14px; }
    }
  </style>
</head>
<body>
  <div class="quote">
    <div class="header-row">
      <div class="brand">
        <img class="logo" src="${LOGO_DATA_URI}" alt="Voom Paints & Services logo" />
        <div>
          <div class="company-name">Voom Paints & Services</div>
          <div class="company-address">
            Sai Sharan CHS, Shop No 1, Sector 1, Khanda Colony,<br />
            Panvel, Navi Mumbai 410206
          </div>
        </div>
      </div>
      <div class="heading">Quotation</div>
    </div>

    <div class="letter">
      <div class="to-line">To. ${escapeHtml(customerName)}</div>
      <div>Dear Sir,</div>
      <div class="subject">Subject: Offer for Painting work</div>
      <div>Date: ${escapeHtml(formatOfferDate(document.date))}</div>

      <p>Voom Paints is an end-to-end, hassle free painting service company, The benefits of employing Voom Paints for your home painting needs is multifold.</p>

      <ul>
        <li>Wide range of products and specialty finishes</li>
        <li>Product and budget consultation</li>
        <li>Trained painters</li>
        <li>Covering and masking of household items</li>
        <li>Regular site supervision</li>
        <li>Cleaning of the site post work completion</li>
        <li>Authentic Company material only</li>
        <li>Site evaluation and measurement</li>
      </ul>

      <p>We take this opportunity to thank you for considering giving your valuable business to us and also for the courtesy extended to us during our discussion.</p>
      <p>Further to our discussion please find enclosed our painting quotation for the site.</p>

      <div><strong>Painting Estimate :</strong></div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Sr.No.</th>
              <th>Area</th>
              <th>Area (sq.ft)</th>
              <th>Surface</th>
              <th>Product</th>
              <th class="right">Rate / sq.ft</th>
              <th class="right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${quoteRows}
          </tbody>
        </table>
      </div>

      <div class="company-meta">
        <div><strong>GSTIN:</strong> 27AIXPN1343G1ZY</div>
        <div><strong>Phone:</strong> +91 99676 15133 / +91 84229 11456</div>
        <div><strong>Email:</strong> sagarnn84@gmail.com</div>
      </div>

      <div class="totals-box">
        <div><span>Subtotal</span><strong>₹${Number(document.subtotal || 0).toFixed(2)}</strong></div>
        <div><span>SGST (9%)</span><strong>₹${Number(document.sgst || 0).toFixed(2)}</strong></div>
        <div><span>CGST (9%)</span><strong>₹${Number(document.cgst || 0).toFixed(2)}</strong></div>
        <div class="grand-total"><span>Total</span><strong>₹${Number(estimateTotal || 0).toFixed(2)}</strong></div>
      </div>

      <p class="small">Note: Above rates are inclusive of LABOUR + MATERIAL. No warranty on leakage, seapage, cracks and undulations.</p>
      <p class="small">Standard procedure for full painting (interior): covering the furniture, touch up of putty, sanding, 1 coat of primer, 2/3 finish paint, cleaning of site.</p>

      <div><strong>Payment Policy</strong></div>
      <div>30% advance payment</div>
      <div>30% after 1st completion of 2 bed.</div>
      <div>30% after completion of Hall and kitchen putty work</div>
      <div>10% before completion work</div>
      <div class="small">*(1st Cheque will be collected at the time of signing the contract)</div>
      <div class="small">*(Cheques should be collected in the name of "Voom Paints" only.)</div>

      <div><strong>Other Terms &amp; Conditions</strong></div>
      <ul class="terms">
        <li>Upgrading to any high-sheen finish enhances visibility of the undulations on wall substrate. Areas related to the rectification of substrate undulations are outside the purview of painting job.</li>
        <li>All rework claims, shall be subject to inspection of site by Authorized Voom Paints representative.</li>
        <li>Liability is limited to making good the affected areas only.</li>
        <li>Work shall commence 3 days from collection of relevant cheques and work order as applicable.</li>
        <li>Refund paid for any stoppage of work, shall be at the direction of Voom Paints. It shall be limited to the extent of job left unfinished.</li>
        <li>Orders for a particular shade once accepted will not be changed if paint is tinted.</li>
        <li>All deadlines for project completion is subject to customer handing over site according to Voom Paints guide lines.</li>
        <li>Standard waterproofing, civil and painting methodology will be followed.</li>
        <li>Estimate is valid only for the areas mentioned above. If any additional area is included in the scope of painting, the required amount will be charged from the customer.</li>
        <li>The amount has to be paid in advance keeping Payment Policy (see above) in mind.</li>
        <li>Kindly retain these documents for all future communication.</li>
      </ul>

      <p>In case of any doubt on the surface conditions, you are free to take suggestion and advise from anybody related to the Civil, waterproofing and structural field.</p>
      <p>In case you need any other information, please feel free to call us.</p>

      <div class="signoff">
        <div>Warm regards,</div>
        <div><strong>Sagar Nalawade</strong> (8422911546)</div>
      </div>

      <p><strong>Some benefits of an Apply- Supply model are mentioned below.</strong></p>
      <ol>
        <li>We do a testing of the surface so that you will be aware of the substrate condition.</li>
        <li>We will inform you in case we observe any abnormality on the surface unearthed during scrapping job, which may require a civil job to be conducted by you.</li>
        <li>We recommend a proper painting system so that an excellent performance can be expected after the painting is carried out.</li>
        <li>We submit a thorough estimate with detailed measurement and offer the option of joint measurement prior to the job.</li>
        <li>We have selected our panel of applicators only after detailed evaluation and trained them regarding the recommended practices so you can be rest assured about the quality of workmanship.</li>
        <li>Our applicators are specially trained for covering furniture and other valuable accessories before painting job starts and cleaning the leftovers of paint marks etc after job is done.</li>
        <li>Our dedicated supervisors visit the sites periodically and will update you on the progress of the work.</li>
      </ol>
    </div>
  </div>
</body>
</html>
  `
}

// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(value) {
  return String(value ?? '')
    .replace(
      /&/g,
      '&amp;'
    )
    .replace(
      /</g,
      '&lt;'
    )
    .replace(
      />/g,
      '&gt;'
    )
    .replace(
      /"/g,
      '&quot;'
    )
    .replace(
      /'/g,
      '&#039;'
    )
}