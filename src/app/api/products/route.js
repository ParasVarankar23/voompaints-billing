import fs from 'fs'
import { NextResponse } from 'next/server'
import path from 'path'

const dataPath = path.join(
  process.cwd(),
  'src',
  'data',
  'products.json'
)

function readProducts() {
  if (!fs.existsSync(dataPath)) {
    return []
  }

  const products = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
  if (!Array.isArray(products)) {
    throw new Error('Products data must be a JSON array')
  }

  return products
}

function writeProducts(products) {
  fs.writeFileSync(dataPath, JSON.stringify(products, null, 2), 'utf8')
}

function validateProduct(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { error: 'A valid product object is required.' }
  }

  const name = String(data.name || '').trim()
  const brand = String(data.brand || '').trim()
  const packSize = String(data.packSize || '').trim()
  const price = Number(data.price)

  if (
    !name ||
    !brand ||
    !packSize ||
    data.price === undefined ||
    data.price === null ||
    String(data.price).trim() === '' ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    return {
      error: 'Product name, brand, pack size, and a valid non-negative price are required.',
    }
  }

  return { product: { name, brand, packSize, price } }
}

export async function GET() {
  try {
    return NextResponse.json(readProducts())
  } catch (error) {
    console.error('GET /api/products error:', error)
    return NextResponse.json(
      { success: false, message: 'Unable to load products.' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const validation = validateProduct(body)

    if (validation.error) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: 400 }
      )
    }

    const products = readProducts()
    const id = products.reduce(
      (max, product) => Math.max(max, Number(product.id) || 0),
      0
    ) + 1
    const timestamp = new Date().toISOString()
    const product = { id, ...validation.product, createdAt: timestamp, updatedAt: timestamp }

    products.push(product)
    writeProducts(products)

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create product.' },
      { status: 500 }
    )
  }
}
