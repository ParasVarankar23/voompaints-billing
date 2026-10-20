'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  FaBoxOpen,
  FaEdit,
  FaPlus,
  FaSearch,
  FaTrash,
} from 'react-icons/fa'

const EMPTY_PRODUCT = {
  name: '',
  brand: '',
  packSize: '',
  price: '',
}

function formatPrice(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(EMPTY_PRODUCT)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products', { cache: 'no-store' })
        const data = await response.json()
        if (!response.ok || !Array.isArray(data)) {
          throw new Error(data?.message || 'Unable to load products.')
        }
        setProducts(data)
      } catch (error) {
        console.error('Error loading products:', error)
        setMessage({ type: 'error', text: error.message })
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return products

    return products.filter((product) =>
      [product.name, product.brand, product.packSize]
        .some((value) => String(value || '').toLowerCase().includes(query))
    )
  }, [products, searchTerm])

  const resetForm = () => {
    setForm(EMPTY_PRODUCT)
    setEditingId(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch(
        editingId ? `/api/products/${editingId}` : '/api/products',
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            price: Number(form.price),
          }),
        }
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Unable to save product.')
      }

      setProducts((current) => (
        editingId
          ? current.map((product) => product.id === data.id ? data : product)
          : [...current, data]
      ))
      setMessage({
        type: 'success',
        text: editingId ? 'Product updated.' : 'Product added.',
      })
      resetForm()
    } catch (error) {
      console.error('Error saving product:', error)
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (product) => {
    setEditingId(product.id)
    setForm({
      name: product.name,
      brand: product.brand,
      packSize: product.packSize,
      price: String(product.price),
    })
    setMessage({ type: '', text: '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete ${product.name} from the product catalog?`)) {
      return
    }

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Unable to delete product.')
      }

      setProducts((current) =>
        current.filter((item) => item.id !== product.id)
      )
      if (editingId === product.id) resetForm()
      setMessage({ type: 'success', text: 'Product deleted.' })
    } catch (error) {
      console.error('Error deleting product:', error)
      setMessage({ type: 'error', text: error.message })
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <FaBoxOpen className="text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Products</h1>
            <p className="text-sm text-slate-500">
              Manage products and their billing prices.
            </p>
          </div>
        </div>
        <div className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
          {products.length} {products.length === 1 ? 'product' : 'products'}
        </div>
      </header>

      {message.text && (
        <div
          role="status"
          className={`rounded-xl border px-4 py-3 text-sm ${
            message.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-green-200 bg-green-50 text-green-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 text-base font-bold text-slate-800">
          {editingId ? 'Edit product' : 'Add a product'}
        </h2>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-medium text-slate-600">
            Product name
            <input
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Interior wall paint"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Brand
            <input
              required
              value={form.brand}
              onChange={(event) => setForm({ ...form, brand: event.target.value })}
              placeholder="Brand name"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Pack size / unit
            <input
              required
              value={form.packSize}
              onChange={(event) => setForm({ ...form, packSize: event.target.value })}
              placeholder="1 L, 20 L, 500 ml"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Price (₹)
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => setForm({ ...form, price: event.target.value })}
              placeholder="0.00"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
            />
          </label>
          <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              <FaPlus />
              {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add product'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <h2 className="font-bold text-slate-800">Product catalog</h2>
          <label className="relative block sm:w-72">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search name, brand, or size"
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
            />
          </label>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-semibold text-slate-700">
              {products.length ? 'No matching products.' : 'No products yet.'}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {products.length
                ? 'Try another search term.'
                : 'Add products above to select them while creating a bill.'}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredProducts.map((product) => (
                <article key={product.id} className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-800">{product.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{product.brand} · {product.packSize}</p>
                    <p className="mt-2 text-sm font-bold text-slate-700">{formatPrice(product.price)}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(product)}
                      aria-label={`Edit ${product.name}`}
                      className="rounded-lg bg-blue-50 p-2.5 text-blue-600 hover:bg-blue-100"
                    >
                      <FaEdit />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product)}
                      aria-label={`Delete ${product.name}`}
                      className="rounded-lg bg-red-50 p-2.5 text-red-600 hover:bg-red-100"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Product</th>
                    <th className="px-5 py-3 font-semibold">Brand</th>
                    <th className="px-5 py-3 font-semibold">Pack size / unit</th>
                    <th className="px-5 py-3 text-right font-semibold">Price</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-5 py-4 font-semibold text-slate-800">{product.name}</td>
                      <td className="px-5 py-4 text-slate-600">{product.brand}</td>
                      <td className="px-5 py-4 text-slate-600">{product.packSize}</td>
                      <td className="px-5 py-4 text-right font-semibold text-slate-700">{formatPrice(product.price)}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(product)}
                            aria-label={`Edit ${product.name}`}
                            className="rounded-lg bg-blue-50 p-2.5 text-blue-600 hover:bg-blue-100"
                          >
                            <FaEdit />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(product)}
                            aria-label={`Delete ${product.name}`}
                            className="rounded-lg bg-red-50 p-2.5 text-red-600 hover:bg-red-100"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
