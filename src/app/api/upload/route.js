import { NextResponse } from 'next/server'
import cloudinary from 'cloudinary'
import PDFDocument from 'pdfkit'

import banks from '@/data/banks.json'
import company from '@/data/company.json'

export const runtime = 'nodejs'

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// =====================================================
// HELPERS
// =====================================================

function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function getSelectedBank(bankId) {
  return (
    banks.find((bank) => bank.id === bankId) ||
    banks.find((bank) => bank.id === 'canara') ||
    banks[0]
  )
}

// =====================================================
// CREATE PDF
// =====================================================

function createInvoicePDF(bill) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
    })

    const chunks = []

    doc.on('data', (chunk) => {
      chunks.push(chunk)
    })

    doc.on('end', () => {
      resolve(Buffer.concat(chunks))
    })

    doc.on('error', reject)

    const pageWidth = 595
    const left = 40
    const right = 555
    const contentWidth = right - left

    // =================================================
    // COMPANY HEADER
    // =================================================

    doc
      .fillColor('#0f172a')
      .font('Helvetica-Bold')
      .fontSize(24)
      .text(company.name || 'VOOM PAINTS', left, 38)

    doc
      .fillColor('#2563eb')
      .font('Helvetica-Bold')
      .fontSize(18)
      .text('TAX INVOICE', 380, 42, {
        width: 175,
        align: 'right',
      })

    doc
      .fillColor('#64748b')
      .font('Helvetica')
      .fontSize(8.5)
      .text(company.address || '', left, 70, {
        width: 310,
      })

    let companyY = 84

    if (company.gstin) {
      doc.text(
        `GSTIN: ${company.gstin}`,
        left,
        companyY
      )

      companyY += 14
    }

    if (company.phone) {
      doc.text(
        `Phone: ${company.phone}`,
        left,
        companyY
      )

      companyY += 14
    }

    if (company.email) {
      doc.text(
        `Email: ${company.email}`,
        left,
        companyY
      )
    }

    // Header line
    doc
      .strokeColor('#2563eb')
      .lineWidth(2)
      .moveTo(left, 130)
      .lineTo(right, 130)
      .stroke()

    // =================================================
    // CUSTOMER / FROM SECTION
    // =================================================

    const infoTop = 150

    // -----------------------------
    // LEFT - CUSTOMER
    // -----------------------------

    doc
      .fillColor('#2563eb')
      .font('Helvetica-Bold')
      .fontSize(9)
      .text('BILL TO', left, infoTop)

    doc
      .fillColor('#0f172a')
      .font('Helvetica-Bold')
      .fontSize(11)
      .text(
        bill.customer || '-',
        left,
        infoTop + 18,
        {
          width: 235,
        }
      )

    doc
      .fillColor('#64748b')
      .font('Helvetica')
      .fontSize(8.5)
      .text(
        bill.customerAddress || '-',
        left,
        infoTop + 38,
        {
          width: 235,
          lineGap: 2,
        }
      )

    let customerY = infoTop + 72

    if (bill.customerGst) {
      doc.text(
        `GSTIN: ${bill.customerGst}`,
        left,
        customerY
      )

      customerY += 14
    }

    if (bill.customerPhone) {
      doc.text(
        `Phone: ${bill.customerPhone}`,
        left,
        customerY
      )
    }

    // -----------------------------
    // RIGHT - FROM
    // -----------------------------

    const rightColumn = 320

    doc
      .fillColor('#2563eb')
      .font('Helvetica-Bold')
      .fontSize(9)
      .text('FROM', rightColumn, infoTop)

    doc
      .fillColor('#0f172a')
      .font('Helvetica-Bold')
      .fontSize(11)
      .text(
        company.name || 'VOOM PAINTS',
        rightColumn,
        infoTop + 18
      )

    doc
      .fillColor('#64748b')
      .font('Helvetica')
      .fontSize(8.5)
      .text(
        company.address || '',
        rightColumn,
        infoTop + 38,
        {
          width: 235,
          lineGap: 2,
        }
      )

    let companyInfoY = infoTop + 72

    if (company.gstin) {
      doc.text(
        `GSTIN: ${company.gstin}`,
        rightColumn,
        companyInfoY
      )

      companyInfoY += 14
    }

    // Bill number

    doc
      .fillColor('#334155')
      .font('Helvetica-Bold')
      .fontSize(8.5)
      .text(
        'Bill No.',
        rightColumn,
        companyInfoY
      )

    doc
      .font('Helvetica')
      .text(
        bill.number || '-',
        rightColumn + 65,
        companyInfoY
      )

    companyInfoY += 15

    // Date

    doc
      .font('Helvetica-Bold')
      .text(
        'Date',
        rightColumn,
        companyInfoY
      )

    doc
      .font('Helvetica')
      .text(
        bill.date || '-',
        rightColumn + 65,
        companyInfoY
      )

    // =================================================
    // ITEMS TABLE
    // =================================================

    const tableTop = 285

    // Table header background

    doc
      .fillColor('#eff6ff')
      .roundedRect(
        left,
        tableTop,
        contentWidth,
        30,
        5
      )
      .fill()

    // Header text

    doc
      .fillColor('#334155')
      .font('Helvetica-Bold')
      .fontSize(8)

    doc.text(
      'PRODUCT',
      50,
      tableTop + 10
    )

    doc.text(
      'PACK SIZE',
      240,
      tableTop + 10
    )

    doc.text(
      'QTY',
      325,
      tableTop + 10
    )

    doc.text(
      'RATE',
      375,
      tableTop + 10
    )

    doc.text(
      'AMOUNT',
      465,
      tableTop + 10
    )

    // =================================================
    // ITEMS
    // =================================================

    const items = Array.isArray(bill.items)
      ? bill.items
      : []

    let currentY = tableTop + 42

    items.forEach((item, index) => {
      const rowHeight = 32

      // Alternating background

      if (index % 2 === 0) {
        doc
          .fillColor('#f8fafc')
          .rect(
            left,
            currentY - 7,
            contentWidth,
            rowHeight
          )
          .fill()
      }

      doc
        .fillColor('#334155')
        .font('Helvetica')
        .fontSize(8.5)

      doc.text(
        item.description || '-',
        50,
        currentY,
        {
          width: 175,
        }
      )

      doc.text(
        item.packSize || '-',
        240,
        currentY
      )

      doc.text(
        String(item.qty || 0),
        325,
        currentY
      )

      doc.text(
        formatMoney(item.rate),
        365,
        currentY
      )

      doc.text(
        formatMoney(item.amount),
        455,
        currentY
      )

      currentY += rowHeight
    })

    // Table bottom

    doc
      .strokeColor('#e2e8f0')
      .lineWidth(1)
      .moveTo(left, currentY)
      .lineTo(right, currentY)
      .stroke()

    // =================================================
    // TOTALS
    // =================================================

    const subtotal =
      Number(bill.total || 0) -
      Number(bill.gst || 0)

    const sgst = Number(bill.sgst || 0)
    const cgst = Number(bill.cgst || 0)
    const total = Number(bill.total || 0)

    const totalsX = 350

    let totalY = currentY + 25

    doc
      .fillColor('#64748b')
      .font('Helvetica')
      .fontSize(9)

    // Subtotal

    doc.text(
      'Subtotal',
      totalsX,
      totalY
    )

    doc
      .fillColor('#334155')
      .text(
        formatMoney(subtotal),
        465,
        totalY,
        {
          width: 90,
          align: 'right',
        }
      )

    totalY += 19

    // SGST

    doc
      .fillColor('#64748b')
      .text(
        'SGST (9%)',
        totalsX,
        totalY
      )

    doc
      .fillColor('#334155')
      .text(
        formatMoney(sgst),
        465,
        totalY,
        {
          width: 90,
          align: 'right',
        }
      )

    totalY += 19

    // CGST

    doc
      .fillColor('#64748b')
      .text(
        'CGST (9%)',
        totalsX,
        totalY
      )

    doc
      .fillColor('#334155')
      .text(
        formatMoney(cgst),
        465,
        totalY,
        {
          width: 90,
          align: 'right',
        }
      )

    totalY += 16

    // Divider

    doc
      .strokeColor('#cbd5e1')
      .lineWidth(1)
      .moveTo(
        totalsX,
        totalY
      )
      .lineTo(
        right,
        totalY
      )
      .stroke()

    totalY += 12

    // Grand Total

    doc
      .fillColor('#2563eb')
      .font('Helvetica-Bold')
      .fontSize(13)
      .text(
        'TOTAL',
        totalsX,
        totalY
      )

    doc.text(
      formatMoney(total),
      445,
      totalY,
      {
        width: 110,
        align: 'right',
      }
    )

    // =================================================
    // BANK DETAILS
    // =================================================

    const bank = getSelectedBank(
      bill.bank || 'canara'
    )

    const bottomTop = Math.max(
      totalY + 70,
      560
    )

    doc
      .fillColor('#f8fafc')
      .roundedRect(
        left,
        bottomTop,
        275,
        115,
        8
      )
      .fill()

    doc
      .fillColor('#2563eb')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(
        'BANK DETAILS',
        left + 15,
        bottomTop + 15
      )

    doc
      .fillColor('#475569')
      .font('Helvetica')
      .fontSize(8.5)

    doc.text(
      `Bank: ${bank.name}`,
      left + 15,
      bottomTop + 38
    )

    doc.text(
      `A/c No.: ${bank.accountNumber}`,
      left + 15,
      bottomTop + 54
    )

    doc.text(
      `Branch: ${bank.branch}`,
      left + 15,
      bottomTop + 70
    )

    doc.text(
      `IFSC: ${bank.ifsc}`,
      left + 15,
      bottomTop + 86
    )

    // =================================================
    // AUTHORISED STAMP
    // =================================================

    const stampX = 465
    const stampY = bottomTop + 53

    doc.save()

    // Outer circle

    doc
      .lineWidth(2)
      .strokeColor('#2563eb')
      .circle(
        stampX,
        stampY,
        45
      )
      .stroke()

    // Inner circle

    doc
      .lineWidth(1)
      .circle(
        stampX,
        stampY,
        37
      )
      .stroke()

    // Stamp text

    doc
      .fillColor('#2563eb')
      .font('Helvetica-Bold')
      .fontSize(7)

    doc.text(
      company.name || 'VOOM PAINTS',
      stampX - 35,
      stampY - 20,
      {
        width: 70,
        align: 'center',
      }
    )

    doc.text(
      'AUTHORISED',
      stampX - 35,
      stampY - 7,
      {
        width: 70,
        align: 'center',
      }
    )

    doc.text(
      'SIGNATORY',
      stampX - 35,
      stampY + 6,
      {
        width: 70,
        align: 'center',
      }
    )

    doc.restore()

    doc
      .fillColor('#64748b')
      .font('Helvetica')
      .fontSize(8)
      .text(
        `For ${company.name || 'VOOM PAINTS'}`,
        395,
        bottomTop + 112,
        {
          width: 140,
          align: 'center',
        }
      )

    // =================================================
    // FOOTER
    // =================================================

    doc
      .strokeColor('#e2e8f0')
      .lineWidth(1)
      .moveTo(left, 770)
      .lineTo(right, 770)
      .stroke()

    doc
      .fillColor('#94a3b8')
      .font('Helvetica')
      .fontSize(7.5)
      .text(
        'Thank you for your business.',
        left,
        783,
        {
          width: contentWidth,
          align: 'center',
        }
      )

    doc.end()
  })
}

// =====================================================
// POST
// =====================================================

export async function POST(request) {
  try {
    const { bill } = await request.json()

    if (!bill) {
      return NextResponse.json(
        {
          success: false,
          message: 'Bill data is required',
        },
        {
          status: 400,
        }
      )
    }

    if (!bill.number) {
      return NextResponse.json(
        {
          success: false,
          message: 'Bill number is required',
        },
        {
          status: 400,
        }
      )
    }

    // Create PDF

    const pdfBuffer =
      await createInvoicePDF(bill)

    // Upload PDF to Cloudinary

    const result = await new Promise(
      (resolve, reject) => {
        const uploadStream =
          cloudinary.v2.uploader.upload_stream(
            {
              folder:
                'voom-paints/invoices',

              public_id:
                `invoice_${bill.number}`,

              resource_type: 'raw',

              format: 'pdf',

              overwrite: true,
            },

            (error, result) => {
              if (error) {
                reject(error)
              } else {
                resolve(result)
              }
            }
          )

        uploadStream.end(pdfBuffer)
      }
    )

    return NextResponse.json({
      success: true,

      url: result.secure_url,

      publicId: result.public_id,

      message:
        'Invoice PDF created successfully',
    })
  } catch (error) {
    console.error(
      'Upload/PDF error:',
      error
    )

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          'Failed to create invoice PDF',
      },
      {
        status: 500,
      }
    )
  }
}