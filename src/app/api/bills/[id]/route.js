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

    return JSON.parse(
      fs.readFileSync(
        dataPath,
        'utf8'
      )
    )
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
    JSON.stringify(
      bills,
      null,
      2
    ),
    'utf8'
  )
}

export async function PUT(
  request,
  { params }
) {
  try {
    const { id } = await params

    const billId = Number(id)

    const updatedBill =
      await request.json()

    const bills = readBills()

    const index = bills.findIndex(
      (bill) =>
        Number(bill.id) === billId
    )

    if (index === -1) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Bill not found',
        },
        { status: 404 }
      )
    }

    bills[index] = {
      ...bills[index],
      ...updatedBill,
      id: bills[index].id,
      type: 'bill',
      updatedAt:
        new Date().toISOString(),
    }

    writeBills(bills)

    return NextResponse.json(
      bills[index]
    )
  } catch (error) {
    console.error(
      'Update bill error:',
      error
    )

    return NextResponse.json(
      {
        success: false,
        message:
          'Failed to update bill',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request,
  { params }
) {
  try {
    const { id } = await params

    const billId = Number(id)

    const bills = readBills()

    const filteredBills =
      bills.filter(
        (bill) =>
          Number(bill.id) !== billId
      )

    if (
      filteredBills.length ===
      bills.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Bill not found',
        },
        { status: 404 }
      )
    }

    writeBills(filteredBills)

    return NextResponse.json({
      success: true,
      message:
        'Bill deleted successfully',
    })
  } catch (error) {
    console.error(
      'Delete bill error:',
      error
    )

    return NextResponse.json(
      {
        success: false,
        message:
          'Failed to delete bill',
      },
      { status: 500 }
    )
  }
}