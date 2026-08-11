import { NextResponse } from 'next/server'
import fs from 'fs'
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

    const data = fs.readFileSync(
      dataPath,
      'utf8'
    )

    return JSON.parse(data)
  } catch (error) {
    console.error(
      'Read bills error:',
      error
    )

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
  return NextResponse.json(
    readBills()
  )
}

export async function POST(request) {
  try {
    const newBill =
      await request.json()

    const bills = readBills()

    const lastId = bills.reduce(
      (max, bill) =>
        Math.max(
          max,
          Number(bill.id) || 0
        ),
      0
    )

    const bill = {
      id: lastId + 1,
      ...newBill,
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