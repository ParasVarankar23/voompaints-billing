import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request) {
  try {
    const {
      to,
      bill,
      type,
    } = await request.json()

    if (!to) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Recipient email is required',
        },
        { status: 400 }
      )
    }

    if (!bill) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Bill or quotation data is required',
        },
        { status: 400 }
      )
    }

    const transporter =
      nodemailer.createTransport({
        host:
          process.env.SMTP_HOST,
        port: Number(
          process.env.SMTP_PORT ||
            587
        ),
        secure: false,
        auth: {
          user:
            process.env.SMTP_USER,
          pass:
            process.env.SMTP_PASS,
        },
      })

    const isBill =
      type === 'bill'

    const items = Array.isArray(
      bill.items
    )
      ? bill.items
      : []

    const subtotal =
      Number(bill.total || 0) -
      Number(bill.gst || 0)

    const htmlContent = `
<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8">

<style>

body {
  font-family: Arial, sans-serif;
  background: #f5f9ff;
  margin: 0;
  padding: 30px;
  color: #334155;
}

.container {
  max-width: 800px;
  margin: auto;
  background: white;
  border-radius: 16px;
  padding: 30px;
  border: 1px solid #e2e8f0;
}

.brand {
  font-size: 24px;
  font-weight: bold;
  color: #2563eb;
}

.title {
  font-size: 20px;
  font-weight: bold;
  margin-top: 8px;
}

.header {
  border-bottom: 2px solid #dbeafe;
  padding-bottom: 20px;
  margin-bottom: 25px;
}

.details {
  margin-bottom: 25px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #eff6ff;
  padding: 10px;
  text-align: left;
  font-size: 13px;
}

td {
  padding: 10px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 13px;
}

.totals {
  max-width: 300px;
  margin-left: auto;
  margin-top: 25px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
}

.grand-total {
  border-top: 2px solid #e2e8f0;
  padding-top: 10px;
  margin-top: 8px;
  font-size: 18px;
  font-weight: bold;
  color: #2563eb;
}

.bank {
  margin-top: 30px;
  padding: 18px;
  background: #f8fafc;
  border-radius: 10px;
}

</style>

</head>

<body>

<div class="container">

<div class="header">

<div class="brand">
JAGDAMB PAINTS
</div>

<div class="title">
${isBill ? 'Tax Invoice' : 'Quotation'}
</div>

</div>

<div class="details">

<p>
<strong>Customer:</strong>
${bill.customer || '-'}
</p>

<p>
<strong>GSTIN:</strong>
${bill.customerGst || 'N/A'}
</p>

<p>
<strong>
${isBill ? 'Bill' : 'Quotation'} No:
</strong>
${bill.number || '-'}
</p>

<p>
<strong>Date:</strong>
${bill.date || '-'}
</p>

</div>

<table>

<thead>

<tr>

<th>Product</th>
<th>Pack Size</th>
<th>Qty</th>
<th>Rate</th>
<th>Amount</th>

</tr>

</thead>

<tbody>

${items
  .map(
    (item) => `
<tr>

<td>
${item.description || '-'}
</td>

<td>
${item.packSize || '-'}
</td>

<td>
${item.qty || 0}
</td>

<td>
₹${Number(
  item.rate || 0
).toFixed(2)}
</td>

<td>
₹${Number(
  item.amount || 0
).toFixed(2)}
</td>

</tr>
`
  )
  .join('')}

</tbody>

</table>

<div class="totals">

<div class="total-row">
<span>Subtotal</span>
<strong>
₹${subtotal.toFixed(2)}
</strong>
</div>

<div class="total-row">
<span>SGST (9%)</span>
<strong>
₹${Number(
  bill.sgst || 0
).toFixed(2)}
</strong>
</div>

<div class="total-row">
<span>CGST (9%)</span>
<strong>
₹${Number(
  bill.cgst || 0
).toFixed(2)}
</strong>
</div>

<div class="total-row grand-total">

<span>Total</span>

<strong>
₹${Number(
  bill.total || 0
).toFixed(2)}
</strong>

</div>

</div>

${
  isBill
    ? `
<div class="bank">

<strong>
Bank Details
</strong>

<p>
Bank: CANARA BANK
</p>

<p>
A/c No.: 52153070008808
</p>

<p>
Branch: Kalamboli
</p>

<p>
IFSC Code: CNRB0015215
</p>

</div>
`
    : ''
}

</div>

</body>

</html>
`

    await transporter.sendMail({
      from: `"Jagdamb Paints" <${process.env.SMTP_USER}>`,
      to,
      subject: `${
        isBill
          ? 'Bill'
          : 'Quotation'
      } ${bill.number || ''} from Jagdamb Paints`,
      html: htmlContent,
    })

    return NextResponse.json({
      success: true,
      message:
        'Email sent successfully',
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