import { NextResponse } from 'next/server'
import cloudinary from 'cloudinary'
import PDFDocument from 'pdfkit'

cloudinary.v2.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env.CLOUDINARY_API_KEY,

  api_secret:
    process.env.CLOUDINARY_API_SECRET,
})

function createPDF(bill) {
  return new Promise(
    (resolve, reject) => {
      const doc =
        new PDFDocument({
          margin: 40,
        })

      const chunks = []

      doc.on('data', (chunk) => {
        chunks.push(chunk)
      })

      doc.on('end', () => {
        resolve(
          Buffer.concat(chunks)
        )
      })

      doc.on('error', reject)

      // =====================================
      // HEADER
      // =====================================

      doc
        .fontSize(22)
        .fillColor('#2563eb')
        .text(
          'JAGDAMB PAINTS'
        )

      doc
        .fontSize(16)
        .fillColor('#334155')
        .text(
          'TAX INVOICE',
          {
            align: 'right',
          }
        )

      doc.moveDown()

      doc
        .strokeColor('#dbeafe')
        .lineWidth(2)
        .moveTo(40, doc.y)
        .lineTo(
          555,
          doc.y
        )
        .stroke()

      doc.moveDown()

      // =====================================
      // BILL DETAILS
      // =====================================

      doc
        .fontSize(10)
        .fillColor('#334155')

      doc.text(
        `Bill No: ${
          bill.number || '-'
        }`
      )

      doc.text(
        `Date: ${
          bill.date || '-'
        }`
      )

      doc.text(
        `Customer: ${
          bill.customer || '-'
        }`
      )

      doc.text(
        `GSTIN: ${
          bill.customerGst ||
          'N/A'
        }`
      )

      doc.moveDown()

      // =====================================
      // ITEMS
      // =====================================

      const startY = doc.y

      doc
        .fontSize(9)
        .fillColor('#475569')

      doc.text(
        'Product',
        40,
        startY
      )

      doc.text(
        'Pack',
        240,
        startY
      )

      doc.text(
        'Qty',
        310,
        startY
      )

      doc.text(
        'Rate',
        360,
        startY
      )

      doc.text(
        'Amount',
        450,
        startY
      )

      doc.moveDown()

      doc
        .strokeColor('#e2e8f0')
        .lineWidth(1)
        .moveTo(
          40,
          doc.y
        )
        .lineTo(
          555,
          doc.y
        )
        .stroke()

      doc.moveDown()

      const items = Array.isArray(
        bill.items
      )
        ? bill.items
        : []

      items.forEach((item) => {
        const y = doc.y

        doc
          .fontSize(9)
          .fillColor('#334155')

        doc.text(
          item.description ||
            '-',
          40,
          y,
          {
            width: 190,
          }
        )

        doc.text(
          item.packSize ||
            '-',
          240,
          y
        )

        doc.text(
          String(
            item.qty || 0
          ),
          310,
          y
        )

        doc.text(
          `₹${Number(
            item.rate || 0
          ).toFixed(2)}`,
          360,
          y
        )

        doc.text(
          `₹${Number(
            item.amount || 0
          ).toFixed(2)}`,
          450,
          y
        )

        doc.moveDown(1.5)
      })

      // =====================================
      // TOTALS
      // =====================================

      doc.moveDown()

      const subtotal =
        Number(
          bill.total || 0
        ) -
        Number(
          bill.gst || 0
        )

      const sgst =
        Number(
          bill.sgst || 0
        )

      const cgst =
        Number(
          bill.cgst || 0
        )

      const total =
        Number(
          bill.total || 0
        )

      doc
        .fontSize(10)
        .text(
          `Subtotal: ₹${subtotal.toFixed(2)}`,
          {
            align: 'right',
          }
        )

      doc.text(
        `SGST (9%): ₹${sgst.toFixed(2)}`,
        {
          align: 'right',
        }
      )

      doc.text(
        `CGST (9%): ₹${cgst.toFixed(2)}`,
        {
          align: 'right',
        }
      )

      doc.moveDown(0.5)

      doc
        .fontSize(14)
        .fillColor('#2563eb')
        .text(
          `TOTAL: ₹${total.toFixed(2)}`,
          {
            align: 'right',
          }
        )

      // =====================================
      // BANK DETAILS
      // =====================================

      doc.moveDown(2)

      doc
        .fontSize(10)
        .fillColor('#334155')
        .text(
          'Bank Details'
        )

      doc
        .fontSize(9)
        .text(
          'Bank: CANARA BANK'
        )

      doc.text(
        'A/c No.: 52153070008808'
      )

      doc.text(
        'Branch: Kalamboli'
      )

      doc.text(
        'IFSC Code: CNRB0015215'
      )

      doc.end()
    }
  )
}

export async function POST(
  request
) {
  try {
    const { bill } =
      await request.json()

    if (!bill) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Bill data is required',
        },
        { status: 400 }
      )
    }

    const pdfBuffer =
      await createPDF(bill)

    const result =
      await new Promise(
        (
          resolve,
          reject
        ) => {
          const uploadStream =
            cloudinary.v2.uploader.upload_stream(
              {
                folder: 'jagdamb-paints/bills',

                public_id: `bill_${bill.number}`,

                resource_type:
                  'raw',

                format: 'pdf',

                overwrite: true,
              },
              (
                error,
                result
              ) => {
                if (error) {
                  reject(error)
                } else {
                  resolve(
                    result
                  )
                }
              }
            )

          uploadStream.end(
            pdfBuffer
          )
        }
      )

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId:
        result.public_id,
      message:
        'PDF uploaded successfully',
    })
  } catch (error) {
    console.error(
      'PDF upload error:',
      error
    )

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          'Failed to upload PDF',
      },
      { status: 500 }
    )
  }
}