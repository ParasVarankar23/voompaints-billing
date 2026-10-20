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

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const productId = Number(id)
    const body = await request.json()
    const validation = validateProduct(body)

    if (validation.error) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: 400 }
      )
    }

    const products = readProducts()
    const index = products.findIndex(
      (product) => Number(product.id) === productId
    )

    if (index === -1) {
      return NextResponse.json(
        { success: false, message: 'Product not found.' },
        { status: 404 }
      )
    }

    const updatedProduct = {
      ...products[index],
      ...validation.product,
      updatedAt: new Date().toISOString(),
    }
    products[index] = updatedProduct
    writeProducts(products)

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update product.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const productId = Number(id)
    const products = readProducts()
    const remainingProducts = products.filter(
      (product) => Number(product.id) !== productId
    )

    if (remainingProducts.length === products.length) {
      return NextResponse.json(
        { success: false, message: 'Product not found.' },
        { status: 404 }
      )
    }

    writeProducts(remainingProducts)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete product.' },
      { status: 500 }
    )
  }
}
