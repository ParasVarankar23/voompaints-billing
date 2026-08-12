import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataPath = path.join(
  process.cwd(),
  'src',
  'data',
  'quotations.json'
)

function readQuotations() {
  try {
    if (!fs.existsSync(dataPath)) {
      return []
    }

    return JSON.parse(
      fs.readFileSync(dataPath, 'utf8')
    )
  } catch (error) {
    console.error(
      'Read quotations error:',
      error
    )

    return []
  }
}

function writeQuotations(quotations) {
  fs.writeFileSync(
    dataPath,
    JSON.stringify(
      quotations,
      null,
      2
    ),
    'utf8'
  )
}

export async function GET() {
  return NextResponse.json(
    readQuotations()
  )
}

export async function POST(request) {
  try {
    const data =
      await request.json()

    const quotations =
      readQuotations()

    const lastId =
      quotations.reduce(
        (max, quotation) =>
          Math.max(
            max,
            Number(quotation.id) || 0
          ),
        0
      )

    const quotation = {
      id: lastId + 1,

      number:
        data.number || '',

      date:
        data.date || '',

      customer:
        data.customer || '',

      customerAddress:
        data.customerAddress || '',

      customerPhone:
        data.customerPhone || '',

      customerGst:
        data.customerGst || '',

      items:
        Array.isArray(data.items)
          ? data.items
          : [],

      sgst:
        Number(data.sgst) || 0,

      cgst:
        Number(data.cgst) || 0,

      gst:
        Number(data.gst) || 0,

      total:
        Number(data.total) || 0,

      bank:
        data.bank || 'canara',

      status:
        data.status || 'draft',

      type: 'quotation',

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),
    }

    quotations.push(
      quotation
    )

    writeQuotations(
      quotations
    )

    return NextResponse.json(
      quotation,
      { status: 201 }
    )
  } catch (error) {
    console.error(
      'Create quotation error:',
      error
    )

    return NextResponse.json(
      {
        success: false,
        message:
          'Failed to create quotation',
      },
      { status: 500 }
    )
  }
}