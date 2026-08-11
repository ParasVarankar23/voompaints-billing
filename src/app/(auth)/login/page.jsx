'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaReceipt,
  FaArrowRight,
  FaCheckCircle,
  FaChartLine,
  FaFileInvoiceDollar,
} from 'react-icons/fa'

export default function LoginPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user))
        router.push('/dashboard')
      } else {
        setError(data.message || 'Invalid email or password')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#eef7ff]">

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-blue-200/40 blur-3xl" />

        <div className="absolute -bottom-40 -right-40 h-[450px] w-[450px] rounded-full bg-sky-200/40 blur-3xl" />

      </div>

      {/* Main Layout */}
      <div className="relative z-10 flex min-h-screen">

        {/* =========================================
            LEFT SIDE
        ========================================= */}
        <section className="relative hidden w-1/2 overflow-hidden lg:flex">

          {/* Blue Decorative Background */}
          <div className="absolute inset-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-blue-500 to-sky-400">

            {/* Decorative circles */}
            <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full border-[40px] border-white/10" />

            <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full border-[50px] border-white/10" />

            <div className="absolute right-20 top-28 h-5 w-5 rounded-full bg-white/20" />

            <div className="absolute left-24 top-20 h-3 w-3 rounded-full bg-white/30" />

            <div className="absolute bottom-32 right-28 h-3 w-3 rounded-full bg-white/30" />

            {/* Content */}
            <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">

              {/* Logo */}
              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg">
                  <FaReceipt className="text-xl text-blue-500" />
                </div>

                <div>
                  <h1 className="text-xl font-bold text-white">
                    Billing<span className="text-blue-100">App</span>
                  </h1>

                  <p className="text-xs text-blue-100/80">
                    Smart Billing Solution
                  </p>
                </div>

              </div>

              {/* Main Content */}
              <div className="max-w-lg">

                <div className="mb-5 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">

                  <span className="mr-2 h-2 w-2 rounded-full bg-emerald-300" />

                  <span className="text-xs font-medium text-white">
                    Simple & Powerful
                  </span>

                </div>

                <h2 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
                  Manage your billing
                  <span className="block text-blue-100">
                    smarter & faster.
                  </span>
                </h2>

                <p className="mt-5 max-w-md text-sm leading-6 text-blue-50/85 xl:text-base xl:leading-7">
                  Create invoices, manage customers, track payments and
                  keep your business finances organized — all from one
                  simple platform.
                </p>

                {/* Features */}
                <div className="mt-8 space-y-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                      <FaCheckCircle className="text-sm text-white" />
                    </div>

                    <span className="text-sm text-white/90">
                      Easy invoice & billing management
                    </span>

                  </div>

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                      <FaChartLine className="text-sm text-white" />
                    </div>

                    <span className="text-sm text-white/90">
                      Track your business performance
                    </span>

                  </div>

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                      <FaFileInvoiceDollar className="text-sm text-white" />
                    </div>

                    <span className="text-sm text-white/90">
                      Keep your billing records organized
                    </span>

                  </div>

                </div>

              </div>

              {/* Bottom */}
              <div className="flex items-center justify-between">

                <p className="text-xs text-blue-100/70">
                  Secure business management
                </p>

                <div className="flex gap-1">
                  <span className="h-1.5 w-6 rounded-full bg-white" />
                  <span className="h-1.5 w-2 rounded-full bg-white/30" />
                  <span className="h-1.5 w-2 rounded-full bg-white/30" />
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =========================================
            RIGHT SIDE
        ========================================= */}
        <section className="flex w-full items-center justify-center px-5 py-8 sm:px-8 lg:w-1/2 lg:px-12 xl:px-20">

          <div className="w-full max-w-md">

            {/* Mobile Branding */}
            <div className="mb-8 text-center lg:hidden">

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg shadow-blue-100">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500">
                  <FaReceipt className="text-xl text-white" />
                </div>

              </div>

              <h1 className="text-2xl font-bold text-slate-800">
                Billing<span className="text-blue-500">App</span>
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Smart & simple billing solution
              </p>

            </div>

            {/* Login Card */}
            <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-xl shadow-blue-100/60 sm:p-8">

              {/* Header */}
              <div className="mb-7">

                <p className="mb-2 text-sm font-semibold text-blue-500">
                  Welcome back
                </p>

                <h2 className="text-2xl font-bold text-slate-800">
                  Sign in to your account
                </h2>

                <p className="mt-2 text-sm leading-5 text-slate-500">
                  Enter your credentials to access your dashboard.
                </p>

              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">

                  <span className="mt-0.5 text-sm">
                    ⚠️
                  </span>

                  <p className="text-sm leading-5 text-red-600">
                    {error}
                  </p>

                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Email */}
                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email address
                  </label>

                  <div className="group relative">

                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 transition-colors group-focus-within:text-blue-500" />

                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email: e.target.value,
                        })
                      }
                      placeholder="Enter your email"
                      autoComplete="email"
                      required
                      className="
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        py-3.5
                        pl-11
                        pr-4
                        text-sm
                        text-slate-800
                        outline-none
                        transition-all
                        duration-200
                        placeholder:text-slate-400
                        hover:border-blue-200
                        focus:border-blue-400
                        focus:bg-white
                        focus:ring-4
                        focus:ring-blue-100
                      "
                    />

                  </div>

                </div>

                {/* Password */}
                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="password"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      className="text-xs font-medium text-blue-500 transition hover:text-blue-600"
                    >
                      Forgot password?
                    </button>

                  </div>

                  <div className="group relative">

                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 transition-colors group-focus-within:text-blue-500" />

                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          password: e.target.value,
                        })
                      }
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className="
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        py-3.5
                        pl-11
                        pr-12
                        text-sm
                        text-slate-800
                        outline-none
                        transition-all
                        duration-200
                        placeholder:text-slate-400
                        hover:border-blue-200
                        focus:border-blue-400
                        focus:bg-white
                        focus:ring-4
                        focus:ring-blue-100
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-blue-500"
                    >
                      {showPassword ? (
                        <FaEyeSlash />
                      ) : (
                        <FaEye />
                      )}
                    </button>

                  </div>

                </div>

                {/* Remember */}
                <div className="flex items-center">

                  <label className="flex cursor-pointer items-center gap-2">

                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-blue-500"
                    />

                    <span className="text-sm text-slate-500">
                      Remember me
                    </span>

                  </label>

                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    group
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-3
                    rounded-xl
                    bg-blue-500
                    py-3.5
                    text-sm
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-blue-200
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:bg-blue-600
                    focus:outline-none
                    focus:ring-4
                    focus:ring-blue-200
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    disabled:hover:translate-y-0
                  "
                >

                  {loading ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />

                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>

                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In

                      <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
                    </>
                  )}

                </button>

              </form>

            </div>

            {/* Footer */}
            <div className="mt-6 text-center">

              <p className="text-xs text-slate-400">
                © {new Date().getFullYear()} BillingApp
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                Secure billing management system
              </p>

            </div>

          </div>

        </section>

      </div>
    </main>
  )
}