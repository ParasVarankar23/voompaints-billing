'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'

export default function ClientLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Pages that don't need Navbar + Sidebar
  const publicPages = ['/login']

  const isPublicPage = publicPages.includes(pathname)

  // ==========================================
  // CHECK LOGIN
  // ==========================================
  useEffect(() => {
    const checkUser = () => {
      try {
        const userData = localStorage.getItem('user')

        if (!userData) {
          setUser(null)

          if (!isPublicPage) {
            router.replace('/login')
          }

          return
        }

        const parsedUser = JSON.parse(userData)

        setUser(parsedUser)
      } catch (error) {
        console.error('Error reading user:', error)

        localStorage.removeItem('user')
        setUser(null)

        if (!isPublicPage) {
          router.replace('/login')
        }
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [pathname, router, isPublicPage])

  // ==========================================
  // LOGOUT
  // ==========================================
  const handleLogout = () => {
    localStorage.removeItem('user')

    setUser(null)

    setIsSidebarOpen(false)

    router.replace('/login')
  }

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef7ff]">

        <div className="text-center">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500 shadow-lg shadow-blue-200">

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

  // ==========================================
  // PUBLIC PAGES
  // ==========================================
  if (isPublicPage) {
    return children
  }

  // ==========================================
  // NOT LOGGED IN
  // ==========================================
  if (!user) {
    return null
  }

  // ==========================================
  // APPLICATION LAYOUT
  // ==========================================
  return (
    <div className="flex min-h-screen bg-[#f5f9ff]">

      {/* ======================================
          SIDEBAR
      ======================================= */}
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLogout={handleLogout}
      />

      {/* ======================================
          MAIN APPLICATION
      ======================================= */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* ====================================
            NAVBAR
        ===================================== */}
        <Navbar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          user={user}
          onLogout={handleLogout}
        />

        {/* ====================================
            PAGE CONTENT
        ===================================== */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">

          {children}

        </main>

      </div>

    </div>
  )
}