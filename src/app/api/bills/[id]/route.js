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

    return JSON.parse(
      fs.readFileSync(dataPath, 'utf8')
    )
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

export async function PUT(
  request,
  { params }
) {
  try {
    const { id } = await params

    const billId = Number(id)

    const data = await request.json()

    const bills = readBills()

    const index = bills.findIndex(
      (bill) =>
        Number(bill.id) === billId
    )

    if (index === -1) {
      return NextResponse.json(
        {
          success: false,
          message: 'Bill not found',
        },
        { status: 404 }
      )
    }

    const updatedBill = {
      ...bills[index],

      number:
        data.number ??
        bills[index].number,

      date:
        data.date ??
        bills[index].date,

      customer:
        data.customer ??
        bills[index].customer,

      customerAddress:
        data.customerAddress ??
        bills[index].customerAddress,

      customerPhone:
        data.customerPhone ??
        bills[index].customerPhone,

      customerEmail:
        data.customerEmail ??
        bills[index].customerEmail,

      customerGst:
        data.customerGst ??
        bills[index].customerGst,

      items:
        Array.isArray(data.items)
          ? data.items
          : bills[index].items,

      sgst:
        data.sgst !== undefined
          ? Number(data.sgst)
          : bills[index].sgst,

      cgst:
        data.cgst !== undefined
          ? Number(data.cgst)
          : bills[index].cgst,

      gst:
        data.gst !== undefined
          ? Number(data.gst)
          : bills[index].gst,

      total:
        data.total !== undefined
          ? Number(data.total)
          : bills[index].total,

      // allow status updates (paid, pending, cancelled)
      status:
        data.status ?? bills[index].status,

      bank:
        data.bank ||
        bills[index].bank ||
        'canara',

      type: 'bill',

      updatedAt:
        new Date().toISOString(),
    }

    bills[index] = updatedBill

    writeBills(bills)

    return NextResponse.json(
      updatedBill
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
          message: 'Bill not found',
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