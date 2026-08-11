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
      fs.readFileSync(
        dataPath,
        'utf8'
      )
    )
  } catch (error) {
    console.error(
      'Read quotations error:',
      error
    )

    return []
  }
}

function writeQuotations(
  quotations
) {
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

export async function PUT(
  request,
  { params }
) {
  try {
    const { id } = await params

    const quotationId = Number(id)

    const updatedQuotation =
      await request.json()

    const quotations =
      readQuotations()

    const index =
      quotations.findIndex(
        (quotation) =>
          Number(quotation.id) ===
          quotationId
      )

    if (index === -1) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Quotation not found',
        },
        { status: 404 }
      )
    }

    quotations[index] = {
      ...quotations[index],
      ...updatedQuotation,
      id: quotations[index].id,
      type: 'quotation',
      updatedAt:
        new Date().toISOString(),
    }

    writeQuotations(quotations)

    return NextResponse.json(
      quotations[index]
    )
  } catch (error) {
    console.error(
      'Update quotation error:',
      error
    )

    return NextResponse.json(
      {
        success: false,
        message:
          'Failed to update quotation',
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

    const quotationId = Number(id)

    const quotations =
      readQuotations()

    const filtered =
      quotations.filter(
        (quotation) =>
          Number(quotation.id) !==
          quotationId
      )

    if (
      filtered.length ===
      quotations.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Quotation not found',
        },
        { status: 404 }
      )
    }

    writeQuotations(filtered)

    return NextResponse.json({
      success: true,
      message:
        'Quotation deleted successfully',
    })
  } catch (error) {
    console.error(
      'Delete quotation error:',
      error
    )

    return NextResponse.json(
      {
        success: false,
        message:
          'Failed to delete quotation',
      },
      { status: 500 }
    )
  }
}