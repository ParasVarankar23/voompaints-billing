import fs from 'fs'
import { NextResponse } from 'next/server'
import path from 'path'

const dataPath = path.join(
  process.cwd(),
  'src',
  'data',
  'bills.json'
)

function readBills() {
  try {
    if (!fs.existsSync(dataPath)) {
      return []
    }

    const contents = fs.readFileSync(dataPath, 'utf8').trim()
    if (!contents) {
      return []
    }

    return JSON.parse(contents)
  } catch (error) {
    console.error('Read bills error:', error)
    return []
  }
}

function writeBills(bills) {
  fs.writeFileSync(
    dataPath,
    JSON.stringify(bills, null, 2),
    'utf8'
  )
}

export async function GET(request) {
  try {
    const all = readBills()

    // Support pagination via query params: ?page=1&limit=20
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

        return NextResponse.json({ bills: paged, total: all.length, page, limit })
      }
    } catch (e) {
      // parsing URL failed; fall back to returning full list
      console.warn('Failed to parse pagination params for /api/bills', e)
    }

    return NextResponse.json(all)
  } catch (err) {
    console.error('GET /api/bills error:', err)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    const bills = readBills()

    const lastId = bills.reduce(
      (max, bill) =>
        Math.max(max, Number(bill.id) || 0),
      0
    )

    const bill = {
      id: lastId + 1,

      // Auto-generate bill number when not provided: INV{YEAR}{SEQUENCE}
      number: data.number || `INV${new Date().getFullYear()}${lastId + 1}`,
      date: data.date || '',

      customer: data.customer || '',
      customerAddress:
        data.customerAddress || '',
      customerPhone:
        data.customerPhone || '',
      customerEmail:
        data.customerEmail || '',
      customerGst:
        data.customerGst || '',

      items: Array.isArray(data.items)
        ? data.items
        : [],

      sgst: Number(data.sgst) || 0,
      cgst: Number(data.cgst) || 0,
      gst: Number(data.gst) || 0,
      total: Number(data.total) || 0,

      bank: data.bank || 'canara',

      type: 'bill',

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),
    }

    bills.push(bill)

    writeBills(bills)

    return NextResponse.json(
      bill,
      { status: 201 }
    )
  } catch (error) {
    console.error(
      'Create bill error:',
      error
    )

    return NextResponse.json(
      {
        success: false,
        message:
          'Failed to create bill',
      },
      { status: 500 }
    )
  }
}