'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  FaArrowRight,
  FaChartLine,
  FaClock,
  FaFileAlt,
  FaFileInvoice,
  FaMoneyBillWave,
  FaPlus,
  FaSyncAlt,
} from 'react-icons/fa'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export default function DashboardPage() {
  // =========================================================
  // STATE
  // =========================================================

  const [stats, setStats] = useState({
    totalBills: 0,
    totalQuotations: 0,
    totalAmount: 0,
    pendingBills: 0,
  })

  const [recentItems, setRecentItems] = useState([])
  const [billsDataRaw, setBillsDataRaw] = useState([])

  const [activityPage, setActivityPage] = useState(1)
  const activityLimit = 5

  const [timeRange, setTimeRange] = useState('monthly')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // =========================================================
  // FETCH DASHBOARD DATA
  // =========================================================

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError('')

      /*
       * We intentionally fetch the complete bills list here
       * because dashboard statistics and charts need all bills.
       *
       * Your API should return an array of bills.
       */

      const [billsResponse, quotationsResponse] =
        await Promise.all([
          fetch('/api/bills'),
          fetch('/api/quotations'),
        ])

      if (!billsResponse.ok) {
        throw new Error('Failed to fetch bills')
      }

      if (!quotationsResponse.ok) {
        throw new Error('Failed to fetch quotations')
      }

      const billsResult =
        await billsResponse.json()

      const quotationsResult =
        await quotationsResponse.json()

      const bills = Array.isArray(billsResult)
        ? billsResult
        : billsResult?.bills || []

      const quotations = Array.isArray(
        quotationsResult
      )
        ? quotationsResult
        : quotationsResult?.quotations || []

      // Keep complete bills for chart calculations
      setBillsDataRaw(bills)

      // =====================================================
      // TOTAL AMOUNT
      // =====================================================

      const totalAmount = bills.reduce(
        (sum, bill) => {
          return (
            sum +
            Number(
              bill.total || 0
            )
          )
        },
        0
      )

      // =====================================================
      // PENDING BILLS
      // =====================================================

      const pendingBills = bills.filter(
        (bill) => {
          return (
            String(
              bill.status || ''
            ).toLowerCase() ===
            'pending'
          )
        }
      ).length

      // =====================================================
      // STATS
      // =====================================================

      setStats({
        totalBills: bills.length,
        totalQuotations:
          quotations.length,
        totalAmount,
        pendingBills,
      })

      // =====================================================
      // RECENT ACTIVITIES
      // =====================================================

      const billItems = bills.map(
        (bill) => ({
          ...bill,
          type: 'bill',
        })
      )

      const quotationItems =
        quotations.map(
          (quotation) => ({
            ...quotation,
            type: 'quotation',
          })
        )

      const allItems = [
        ...billItems,
        ...quotationItems,
      ].sort((a, b) => {
        const dateA = new Date(
          a.date ||
            a.createdAt ||
            0
        ).getTime()

        const dateB = new Date(
          b.date ||
            b.createdAt ||
            0
        ).getTime()

        return dateB - dateA
      })

      setRecentItems(allItems)

      // Always return to first activity page
      setActivityPage(1)
    } catch (err) {
      console.error(
        'Dashboard data error:',
        err
      )

      setError(
        'Unable to load dashboard data. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (amount) => {
    return `₹${Number(
      amount || 0
    ).toLocaleString('en-IN')}`
  }

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return '-'
    }

    const parsedDate =
      new Date(date)

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return String(date)
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

  // =========================================================
  // SALES CHART
  //
  // WEEKLY  = LAST 7 DAYS
  // MONTHLY = LAST 12 MONTHS
  // YEARLY  = CURRENT YEAR + PREVIOUS 4 YEARS
  // =========================================================

  const chartData = useMemo(() => {
    const bills = Array.isArray(
      billsDataRaw
    )
      ? billsDataRaw
      : []

    const now = new Date()

    // =======================================================
    // WEEKLY
    // =======================================================

    if (timeRange === 'weekly') {
      const data = []

      for (
        let i = 6;
        i >= 0;
        i--
      ) {
        const currentDate =
          new Date(now)

        currentDate.setDate(
          now.getDate() - i
        )

        const start =
          new Date(currentDate)

        start.setHours(
          0,
          0,
          0,
          0
        )

        const end =
          new Date(currentDate)

        end.setHours(
          23,
          59,
          59,
          999
        )

        const total = bills
          .filter((bill) => {
            const billDate =
              new Date(
                bill.date ||
                  bill.createdAt
              )

            if (
              Number.isNaN(
                billDate.getTime()
              )
            ) {
              return false
            }

            return (
              billDate >= start &&
              billDate <= end
            )
          })
          .reduce(
            (sum, bill) => {
              return (
                sum +
                Number(
                  bill.total || 0
                )
              )
            },
            0
          )

        data.push({
          label:
            currentDate.toLocaleDateString(
              'en-IN',
              {
                day: '2-digit',
                month: 'short',
              }
            ),
          sales: total,
        })
      }

      return data
    }

    // =======================================================
    // YEARLY
    // =======================================================

    if (timeRange === 'yearly') {
      const data = []

      for (
        let i = 4;
        i >= 0;
        i--
      ) {
        const year =
          now.getFullYear() - i

        const start = new Date(
          year,
          0,
          1,
          0,
          0,
          0,
          0
        )

        const end = new Date(
          year,
          11,
          31,
          23,
          59,
          59,
          999
        )

        const total = bills
          .filter((bill) => {
            const billDate =
              new Date(
                bill.date ||
                  bill.createdAt
              )

            if (
              Number.isNaN(
                billDate.getTime()
              )
            ) {
              return false
            }

            return (
              billDate >= start &&
              billDate <= end
            )
          })
          .reduce(
            (sum, bill) => {
              return (
                sum +
                Number(
                  bill.total || 0
                )
              )
            },
            0
          )

        data.push({
          label: String(year),
          sales: total,
        })
      }

      return data
    }

    // =======================================================
    // MONTHLY
    // =======================================================

    const data = []

    for (
      let i = 11;
      i >= 0;
      i--
    ) {
      const currentMonth =
        new Date(
          now.getFullYear(),
          now.getMonth() - i,
          1
        )

      const year =
        currentMonth.getFullYear()

      const month =
        currentMonth.getMonth()

      const start = new Date(
        year,
        month,
        1,
        0,
        0,
        0,
        0
      )

      const end = new Date(
        year,
        month + 1,
        0,
        23,
        59,
        59,
        999
      )

      const total = bills
        .filter((bill) => {
          const billDate =
            new Date(
              bill.date ||
                bill.createdAt
            )

          if (
            Number.isNaN(
              billDate.getTime()
            )
          ) {
            return false
          }

          return (
            billDate >= start &&
            billDate <= end
          )
        })
        .reduce(
          (sum, bill) => {
            return (
              sum +
              Number(
                bill.total || 0
              )
            )
          },
          0
        )

      data.push({
        label:
          currentMonth.toLocaleDateString(
            'en-IN',
            {
              month: 'short',
              year: 'numeric',
            }
          ),
        sales: total,
      })
    }

    return data
  }, [
    billsDataRaw,
    timeRange,
  ])

  // =========================================================
  // CHART TOTAL
  // =========================================================

  const chartTotal = useMemo(() => {
    return chartData.reduce(
      (sum, item) => {
        return (
          sum +
          Number(
            item.sales || 0
          )
        )
      },
      0
    )
  }, [chartData])

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalActivityPages =
    Math.max(
      1,
      Math.ceil(
        recentItems.length /
          activityLimit
      )
    )

  const currentActivities =
    recentItems.slice(
      (activityPage - 1) *
        activityLimit,
      activityPage *
        activityLimit
    )

  // =========================================================
  // CUSTOM TOOLTIP
  // =========================================================

  const CustomTooltip = ({
    active,
    payload,
    label,
  }) => {
    if (
      !active ||
      !payload ||
      payload.length === 0
    ) {
      return null
    }

    const value = Number(
      payload[0]?.value || 0
    )

    return (
      <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-xl">
        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-bold text-slate-800">
          {formatCurrency(value)}
        </p>
      </div>
    )
  }

  // =========================================================
  // STAT CARDS
  // =========================================================

  const statCards = [
    {
      title: 'Total Bills',
      value: stats.totalBills,
      description:
        'All generated bills',
      icon: FaFileInvoice,
      iconBg: 'bg-blue-50',
      iconColor:
        'text-blue-500',
    },

    {
      title: 'Quotations',
      value:
        stats.totalQuotations,
      description:
        'All quotations',
      icon: FaFileAlt,
      iconBg: 'bg-sky-50',
      iconColor:
        'text-sky-500',
    },

    {
      title: 'Total Amount',
      value:
        formatCurrency(
          stats.totalAmount
        ),
      description:
        'Total bill value',
      icon: FaMoneyBillWave,
      iconBg:
        'bg-emerald-50',
      iconColor:
        'text-emerald-500',
    },

    {
      title: 'Pending Bills',
      value:
        stats.pendingBills,
      description:
        'Bills awaiting payment',
      icon: FaClock,
      iconBg:
        'bg-orange-50',
      iconColor:
        'text-orange-500',
      valueColor:
        stats.pendingBills > 0
          ? 'text-orange-500'
          : 'text-slate-800',
    },
  ]

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="space-y-6">

        <div className="animate-pulse">
          <div className="h-7 w-40 rounded-lg bg-slate-200" />

          <div className="mt-2 h-4 w-72 rounded bg-slate-200" />
        </div>

        <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-2xl bg-slate-200"
              />
            )
          )}

        </div>

        <div className="h-[420px] animate-pulse rounded-2xl bg-slate-200" />

        <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />

      </div>
    )
  }

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <div className="space-y-6">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

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

        <button
          type="button"
          onClick={
            fetchDashboardData
          }
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


      {/* =====================================================
          ERROR
      ===================================================== */}

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
            onClick={
              fetchDashboardData
            }
            className="w-fit rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600"
          >
            Try Again
          </button>

        </div>
      )}


      {/* =====================================================
          WELCOME BANNER
      ===================================================== */}

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-sky-400 p-6 shadow-lg shadow-blue-100 sm:p-7">

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
            Create bills, manage quotations
            and keep track of your business
            finances from one simple dashboard.
          </p>

        </div>

      </div>


      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {statCards.map(
          (stat) => {
            const Icon =
              stat.icon

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
                        ${
                          stat.valueColor ||
                          'text-slate-800'
                        }
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
          }
        )}

      </div>


      {/* =====================================================
          SALES OVERVIEW
      ===================================================== */}

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">

        <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <FaChartLine className="text-blue-500" />
              </div>

              <div>

                <h2 className="text-base font-bold text-slate-800">
                  Sales Overview
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Track your sales performance
                </p>

              </div>

            </div>

            <div className="mt-5">

              <p className="text-xs font-medium text-slate-400">
                Total Sales
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-800">
                {formatCurrency(
                  chartTotal
                )}
              </p>

            </div>

          </div>


          {/* PERIOD DROPDOWN */}

          <div className="flex items-center gap-3">

            <label
              htmlFor="sales-period"
              className="text-xs font-medium text-slate-400"
            >
              Period
            </label>

            <select
              id="sales-period"
              value={timeRange}
              onChange={(event) =>
                setTimeRange(
                  event.target.value
                )
              }
              className="
                min-w-[140px]
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-2.5
                text-sm
                font-medium
                text-slate-600
                outline-none
                transition
                hover:border-blue-300
                focus:border-blue-400
                focus:ring-2
                focus:ring-blue-100
              "
            >

              <option value="weekly">
                Weekly
              </option>

              <option value="monthly">
                Monthly
              </option>

              <option value="yearly">
                Yearly
              </option>

            </select>

          </div>

        </div>


        {/* CHART */}

        <div className="h-[320px] w-full">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 5,
                bottom: 10,
              }}
              barCategoryGap="25%"
            >

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 11,
                  fill: '#94a3b8',
                }}
                dy={10}
                interval={
                  timeRange ===
                  'monthly'
                    ? 1
                    : 0
                }
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                width={65}
                tick={{
                  fontSize: 11,
                  fill: '#94a3b8',
                }}
                tickFormatter={(
                  value
                ) => {
                  const number =
                    Number(value)

                  if (
                    number >=
                    100000
                  ) {
                    return `₹${(
                      number /
                      100000
                    ).toFixed(1)}L`
                  }

                  if (
                    number >=
                    1000
                  ) {
                    return `₹${(
                      number / 1000
                    ).toFixed(0)}K`
                  }

                  return `₹${number}`
                }}
              />

              <Tooltip
                cursor={{
                  fill: '#f8fafc',
                }}
                content={
                  <CustomTooltip />
                }
              />

              <Bar
                dataKey="sales"
                name="Sales"
                fill="#3b82f6"
                radius={[
                  6,
                  6,
                  0,
                  0,
                ]}
                maxBarSize={55}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>


        {/* CHART FOOTER */}

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">

          <p className="text-xs text-slate-400">

            {timeRange ===
            'weekly'
              ? 'Last 7 days'
              : timeRange ===
                  'monthly'
                ? 'Last 12 months'
                : 'Previous 5 years'}

          </p>

          <p className="text-xs font-medium text-slate-500">
            {chartData.length}{' '}
            periods
          </p>

        </div>

      </div>


      {/* =====================================================
          RECENT ACTIVITIES
      ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

        {/* HEADER */}

        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

          <div>

            <h2 className="text-base font-bold text-slate-800">
              Recent Activities
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Your latest bills and quotations
            </p>

          </div>

          <Link
            href="/bills"
            className="
              flex
              w-fit
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


        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {recentItems.length === 0 ? (

          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">

            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
              <FaFileInvoice className="text-xl text-blue-400" />
            </div>

            <h3 className="text-sm font-semibold text-slate-700">
              No recent activities
            </h3>

            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
              Once you create bills or
              quotations, your recent
              activities will appear here.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-2">

              <Link
                href="/bills"
                className="
                  flex
                  items-center
                  gap-2
                  rounded-lg
                  bg-blue-500
                  px-4
                  py-2.5
                  text-xs
                  font-semibold
                  text-white
                  shadow-sm
                  shadow-blue-100
                  transition
                  hover:bg-blue-600
                "
              >
                <FaPlus className="text-[10px]" />

                Create Bill

              </Link>

              <Link
                href="/quotations"
                className="
                  flex
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-2.5
                  text-xs
                  font-semibold
                  text-slate-600
                  transition
                  hover:border-blue-200
                  hover:bg-blue-50
                  hover:text-blue-500
                "
              >
                <FaPlus className="text-[10px]" />

                Create Quotation

              </Link>

            </div>

          </div>

        ) : (

          <>
            {/* =================================================
                ACTIVITY TABLE
            ================================================= */}

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

                  {currentActivities.map(
                    (item, index) => {

                      const isBill =
                        item.type ===
                        'bill'

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

                          {/* TYPE */}

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


                          {/* NUMBER */}

                          <td className="px-4 py-4">

                            <p className="text-sm font-semibold text-slate-700">
                              {item.number ||
                                '-'}
                            </p>

                          </td>


                          {/* DATE */}

                          <td className="px-4 py-4">

                            <p className="text-sm text-slate-500">
                              {formatDate(
                                item.date ||
                                  item.createdAt
                              )}
                            </p>

                          </td>


                          {/* AMOUNT */}

                          <td className="px-6 py-4 text-right">

                            <p className="text-sm font-bold text-slate-700">
                              {formatCurrency(
                                item.total
                              )}
                            </p>

                          </td>

                        </tr>
                      )
                    }
                  )}

                </tbody>

              </table>

            </div>


            {/* =================================================
                PAGINATION
            ================================================= */}

            <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="text-xs text-slate-500">

                Showing{' '}

                <span className="font-semibold text-slate-700">
                  {recentItems.length ===
                  0
                    ? 0
                    : (activityPage -
                        1) *
                        activityLimit +
                      1}
                </span>

                {' '}to{' '}

                <span className="font-semibold text-slate-700">
                  {Math.min(
                    activityPage *
                      activityLimit,
                    recentItems.length
                  )}
                </span>

                {' '}of{' '}

                <span className="font-semibold text-slate-700">
                  {recentItems.length}
                </span>

                {' '}activities

              </div>


              <div className="flex items-center gap-2">

                {/* PREVIOUS */}

                <button
                  type="button"
                  onClick={() => {
                    setActivityPage(
                      (page) =>
                        Math.max(
                          1,
                          page - 1
                        )
                    )
                  }}
                  disabled={
                    activityPage <= 1
                  }
                  className={`
                    rounded-lg
                    border
                    px-3
                    py-2
                    text-xs
                    font-medium
                    transition
                    ${
                      activityPage <=
                      1
                        ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-500'
                    }
                  `}
                >
                  Previous
                </button>


                {/* PAGE */}

                <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600">
                  {activityPage}
                  {' / '}
                  {totalActivityPages}
                </div>


                {/* NEXT */}

                <button
                  type="button"
                  onClick={() => {
                    setActivityPage(
                      (page) =>
                        Math.min(
                          totalActivityPages,
                          page + 1
                        )
                    )
                  }}
                  disabled={
                    activityPage >=
                    totalActivityPages
                  }
                  className={`
                    rounded-lg
                    border
                    px-3
                    py-2
                    text-xs
                    font-medium
                    transition
                    ${
                      activityPage >=
                      totalActivityPages
                        ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-500'
                    }
                  `}
                >
                  Next
                </button>

              </div>

            </div>

          </>

        )}

      </div>

    </div>
  )
}