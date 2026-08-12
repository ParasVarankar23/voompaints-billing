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

export async function GET() {
  return NextResponse.json(readBills())
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

      number: data.number || '',
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