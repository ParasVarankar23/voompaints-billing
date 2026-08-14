'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({
  children,
}) {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] =
    useState(true)

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem('user')

      if (!storedUser) {
        router.replace('/login')
        return
      }

      const parsedUser =
        JSON.parse(storedUser)

      setUser(parsedUser)
    } catch (error) {
      console.error(
        'User authentication error:',
        error
      )

      localStorage.removeItem('user')
      router.replace('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    setSidebarOpen(false)

    router.replace('/login')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f9ff]">

        <div className="text-center">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500 shadow-lg shadow-blue-100">

            <svg
              className="h-6 w-6 animate-spin text-white"
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

          </div>

          <p className="text-sm font-medium text-slate-500">
            Loading BillingApp...
          </p>

        </div>

      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f9ff]">

      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      <div className={`flex min-w-0 flex-1 flex-col overflow-hidden ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}`}>

        <Navbar
          isSidebarOpen={sidebarOpen}
          setIsSidebarOpen={setSidebarOpen}
          user={user}
          onLogout={handleLogout}
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          {children}
        </main>

      </div>

    </div>
  )
}