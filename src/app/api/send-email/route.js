import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Company details used in generated emails / print HTML
const COMPANY = {
  name: 'VOOM & JAGDAMB PAINTS',
  address: 'Shop No 1, Sai Sharan CHS Plot No. 15, Sector 1, Khanda Colony Panvel 410206',
  phone: '+91 99676 15133 / +91 84229 11456',
  email: 'sagarnalwade@gmail.com',
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
    })

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

    const htmlContent = `
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

.company-name {
  font-size: 28px;
  font-weight: 800;
  color: #1d4ed8;
  letter-spacing: 0.5px;
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

        <div class="company-name">
          ${escapeHtml(COMPANY.name)}
        </div>

        <div class="company-tagline">
          Paints • Colours • Solutions
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
        <strong>${escapeHtml(COMPANY.name)}</strong>.
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
        `"Voom Paints" <${process.env.SMTP_USER}>`,

      to,

      subject:
        `${documentTitle} ${document.number || ''} - Voom Paints`,

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
    console.error(
      'Email error:',
      error
    )

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          'Failed to send email',
      },
      { status: 500 }
    )
  }
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