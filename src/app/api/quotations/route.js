import fs from 'fs'
import { NextResponse } from 'next/server'
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

export async function GET(request) {
  try {
    const all = readQuotations()

    try {
      const url = new URL(request.url)
      const params = url.searchParams
      const pageParam = params.get('page')
      const limitParam = params.get('limit')

      if (pageParam || limitParam) {
        const page = Math.max(1, Number(pageParam) || 1)
        const limit = Math.max(1, Number(limitParam) || 20)
        const start = (page - 1) * limit
        const paged = all.slice(start, start + limit)

        return NextResponse.json({ quotations: paged, total: all.length, page, limit })
      }
    } catch (e) {
      console.warn('Failed to parse pagination params for /api/quotations', e)
    }

    return NextResponse.json(all)
  } catch (err) {
    console.error('GET /api/quotations error:', err)
    return NextResponse.json([], { status: 500 })
  }
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

      // Auto-generate a sequential quotation number when not provided by client.
      // Format: QUO{CURRENT_YEAR}{SEQUENCE}
      // Example: for year 2026 and sequence 1 -> QUO20261
      number:
        data.number || `QUO${new Date().getFullYear()}${lastId + 1}`,

      date:
        data.date || '',

      customer:
        data.customer || '',

      customerAddress:
        data.customerAddress || '',

      customerPhone:
        data.customerPhone || '',

      customerEmail:
        data.customerEmail || '',

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