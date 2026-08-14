'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FaFileInvoice,
  FaFileAlt,
  FaMoneyBillWave,
  FaClock,
  FaArrowRight,
  FaPlus,
  FaSyncAlt,
  FaChartLine,
} from 'react-icons/fa'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalBills: 0,
    totalQuotations: 0,
    totalAmount: 0,
    pendingBills: 0,
  })

  const [recentItems, setRecentItems] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ==========================================
  // FETCH DASHBOARD DATA
  // ==========================================
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError('')

      const [billsRes, quotationsRes] =
        await Promise.all([
          fetch('/api/bills'),
          fetch('/api/quotations'),
        ])

      if (!billsRes.ok || !quotationsRes.ok) {
        throw new Error(
          'Failed to fetch dashboard data'
        )
      }

      const billsData = await billsRes.json()
      const quotationsData =
        await quotationsRes.json()

      // Make sure API response is an array
      const bills = Array.isArray(billsData)
        ? billsData
        : billsData?.bills || []

      const quotations = Array.isArray(
        quotationsData
      )
        ? quotationsData
        : quotationsData?.quotations || []

      // ========================================
      // TOTAL AMOUNT
      // ========================================
      const totalAmount = bills.reduce(
        (sum, bill) =>
          sum + Number(bill.total || 0),
        0
      )

      // ========================================
      // PENDING BILLS
      // ========================================
      const pendingBills = bills.filter(
        (bill) =>
          String(bill.status).toLowerCase() ===
          'pending'
      ).length

      // ========================================
      // STATS
      // ========================================
      setStats({
        totalBills: bills.length,
        totalQuotations: quotations.length,
        totalAmount,
        pendingBills,
      })

      // ========================================
      // RECENT ACTIVITIES
      // ========================================
      const billItems = bills.map((bill) => ({
        ...bill,
        type: 'bill',
      }))

      const quotationItems = quotations.map(
        (quotation) => ({
          ...quotation,
          type: 'quotation',
        })
      )

      const allItems = [
        ...billItems,
        ...quotationItems,
      ]
        .sort(
          (a, b) =>
            new Date(b.date || b.createdAt) -
            new Date(a.date || a.createdAt)
        )
        .slice(0, 5)

      setRecentItems(allItems)
    } catch (err) {
      console.error(
        'Error fetching dashboard data:',
        err
      )

      setError(
        'Unable to load dashboard data. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // FORMAT CURRENCY
  // ==========================================
  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString(
      'en-IN'
    )}`
  }

  // ==========================================
  // FORMAT DATE
  // ==========================================
  const formatDate = (date) => {
    if (!date) return '-'

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) {
      return date
    }

    return parsedDate.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    )
  }

  // ==========================================
  // STAT CARDS
  // ==========================================
  const statCards = [
    {
      title: 'Total Bills',
      value: stats.totalBills,
      description: 'All generated bills',
      icon: FaFileInvoice,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
      valueColor: 'text-slate-800',
    },
    {
      title: 'Quotations',
      value: stats.totalQuotations,
      description: 'All quotations',
      icon: FaFileAlt,
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-500',
      valueColor: 'text-slate-800',
    },
    {
      title: 'Total Amount',
      value: formatCurrency(
        stats.totalAmount
      ),
      description: 'Total bill value',
      icon: FaMoneyBillWave,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
      valueColor: 'text-slate-800',
    },
    {
      title: 'Pending Bills',
      value: stats.pendingBills,
      description: 'Bills awaiting payment',
      icon: FaClock,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-500',
      valueColor:
        stats.pendingBills > 0
          ? 'text-orange-500'
          : 'text-slate-800',
    },
  ]

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading) {
    return (
      <div className="space-y-6">

        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-7 w-40 rounded-lg bg-slate-200" />

          <div className="mt-2 h-4 w-72 rounded bg-slate-200" />
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-2xl border border-slate-100 bg-white p-5"
            >
              <div className="flex justify-between">

                <div className="space-y-3">
                  <div className="h-4 w-24 rounded bg-slate-200" />
                  <div className="h-8 w-20 rounded bg-slate-200" />
                </div>

                <div className="h-11 w-11 rounded-xl bg-slate-200" />

              </div>
            </div>
          ))}

        </div>

        {/* Table Skeleton */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6">

          <div className="mb-6 h-5 w-40 rounded bg-slate-200" />

          <div className="space-y-4">

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-12 animate-pulse rounded-lg bg-slate-100"
              />
            ))}

          </div>

        </div>

      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ======================================
          PAGE HEADER
      ======================================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p className="text-sm font-semibold text-blue-500">
            Overview
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-800">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your billing activity from one place.
          </p>
        </div>

        {/* Refresh */}
        <button
          type="button"
          onClick={fetchDashboardData}
          className="
            flex
            w-fit
            items-center
            gap-2
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            py-2.5
            text-sm
            font-medium
            text-slate-600
            shadow-sm
            transition
            hover:border-blue-200
            hover:bg-blue-50
            hover:text-blue-500
          "
        >
          <FaSyncAlt className="text-xs" />

          Refresh
        </button>

      </div>

      {/* ======================================
          ERROR
      ======================================= */}
      {error && (
        <div className="flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm font-semibold text-red-600">
              Something went wrong
            </p>

            <p className="mt-1 text-xs text-red-500">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={fetchDashboardData}
            className="w-fit rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-600"
          >
            Try Again
          </button>

        </div>
      )}

      {/* ======================================
          WELCOME BANNER
      ======================================= */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-sky-400 p-6 shadow-lg shadow-blue-100 sm:p-7">

        {/* Decorative Circle */}
        <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full border-[25px] border-white/10" />

        <div className="absolute -bottom-24 right-24 h-40 w-40 rounded-full border-[20px] border-white/10" />

        <div className="relative z-10">

          <div className="mb-2 flex items-center gap-2">

            <FaChartLine className="text-sm text-blue-100" />

            <span className="text-xs font-semibold uppercase tracking-wider text-blue-100">
              Business Overview
            </span>

          </div>

          <h2 className="text-xl font-bold text-white sm:text-2xl">
            Welcome to BillingApp
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-50/90">
            Create bills, manage quotations and
            keep track of your business finances
            from one simple dashboard.
          </p>

        </div>

      </div>

      {/* ======================================
          STAT CARDS
      ======================================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {statCards.map((stat) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.title}
              className="
                group
                rounded-2xl
                border
                border-slate-100
                bg-white
                p-5
                shadow-sm
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:border-blue-100
                hover:shadow-md
              "
            >

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <p
                    className={`
                      mt-2
                      text-2xl
                      font-bold
                      ${stat.valueColor}
                    `}
                  >
                    {stat.value}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {stat.description}
                  </p>

                </div>

                <div
                  className={`
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    ${stat.iconBg}
                  `}
                >
                  <Icon
                    className={`text-lg ${stat.iconColor}`}
                  />
                </div>

              </div>

            </div>
          )
        })}

      </div>

      {/* ======================================
          RECENT ACTIVITIES
      ======================================= */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

          <div>

            <h2 className="text-base font-bold text-slate-800">
              Recent Activities
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Your latest bills and quotations
            </p>

          </div>

          <div className="flex items-center gap-2">

            <Link
              href="/bills"
              className="
                flex
                items-center
                gap-2
                rounded-lg
                px-3
                py-2
                text-xs
                font-semibold
                text-blue-500
                transition
                hover:bg-blue-50
              "
            >
              View Bills

              <FaArrowRight className="text-[10px]" />
            </Link>

          </div>

        </div>

        {/* Empty State */}
        {recentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">

            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
              <FaFileInvoice className="text-xl text-blue-400" />
            </div>

            <h3 className="text-sm font-semibold text-slate-700">
              No recent activities
            </h3>

            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
              Once you create bills or quotations,
              your recent activities will appear here.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-2">

              <Link
                href="/bills"
                className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-100 transition hover:bg-blue-600"
              >
                <FaPlus className="text-[10px]" />
                Create Bill
              </Link>

              <Link
                href="/quotations"
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-500"
              >
                <FaPlus className="text-[10px]" />
                Create Quotation
              </Link>

            </div>

          </div>
        ) : (

          /* ====================================
             DESKTOP TABLE
          ===================================== */
          <div className="overflow-x-auto">

            <table className="w-full min-w-[650px]">

              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">

                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Type
                  </th>

                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Number
                  </th>

                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Date
                  </th>

                  <th className="px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Amount
                  </th>

                </tr>
              </thead>

              <tbody>

                {recentItems.map((item, index) => {

                  const isBill =
                    item.type === 'bill'

                  return (
                    <tr
                      key={`${item.type || 'item'}-${item._id || item.id || index}`}
                      className="
                        border-b
                        border-slate-50
                        transition
                        last:border-0
                        hover:bg-blue-50/30
                      "
                    >

                      {/* Type */}
                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div
                            className={`
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-lg
                              ${
                                isBill
                                  ? 'bg-blue-50 text-blue-500'
                                  : 'bg-sky-50 text-sky-500'
                              }
                            `}
                          >
                            {isBill ? (
                              <FaFileInvoice className="text-sm" />
                            ) : (
                              <FaFileAlt className="text-sm" />
                            )}
                          </div>

                          <span
                            className={`
                              rounded-full
                              px-2.5
                              py-1
                              text-[11px]
                              font-semibold
                              ${
                                isBill
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'bg-sky-50 text-sky-600'
                              }
                            `}
                          >
                            {isBill
                              ? 'Bill'
                              : 'Quotation'}
                          </span>

                        </div>

                      </td>

                      {/* Number */}
                      <td className="px-4 py-4">

                        <p className="text-sm font-semibold text-slate-700">
                          {item.number || '-'}
                        </p>

                      </td>

                      {/* Date */}
                      <td className="px-4 py-4">

                        <p className="text-sm text-slate-500">
                          {formatDate(
                            item.date ||
                            item.createdAt
                          )}
                        </p>

                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 text-right">

                        <p className="text-sm font-bold text-slate-700">
                          {formatCurrency(
                            item.total
                          )}
                        </p>

                      </td>

                    </tr>
                  )
                })}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  )
}