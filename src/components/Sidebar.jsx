'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FaHome,
  FaFileInvoice,
  FaFileAlt,
  FaSignOutAlt,
  FaReceipt,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
} from 'react-icons/fa'

export default function Sidebar({
  isOpen,
  setIsOpen,
  onLogout,
}) {
  const pathname = usePathname()

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: FaHome,
    },
    {
      path: '/bills',
      label: 'Bills',
      icon: FaFileInvoice,
    },
    {
      path: '/quotations',
      label: 'Quotations',
      icon: FaFileAlt,
    },
  ]

  const isActiveRoute = (path) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard'
    }

    return (
      pathname === path ||
      pathname.startsWith(`${path}/`)
    )
  }

  return (
    <>
      {/* ================================
          MOBILE OVERLAY
      ================================= */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ================================
          SIDEBAR
      ================================= */}
      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          flex-col
          border-r
          border-slate-200
          bg-white
          shadow-xl
          transition-all
          duration-300
          ease-in-out

          ${isOpen ? 'w-64' : 'w-20'}

          lg:relative
          lg:z-30
          lg:shadow-none

          ${
            isOpen
              ? 'translate-x-0'
              : '-translate-x-full lg:translate-x-0'
          }
        `}
      >

        {/* ================================
            LOGO
        ================================= */}
        <div
          className={`
            flex
            h-20
            shrink-0
            items-center
            border-b
            border-slate-100
            px-4
            ${
              isOpen
                ? 'justify-between'
                : 'justify-center'
            }
          `}
        >

          <Link
            href="/dashboard"
            onClick={() => {
              if (window.innerWidth < 1024) {
                setIsOpen(false)
              }
            }}
            className="flex items-center gap-3"
          >

            {/* Logo Icon */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500 shadow-md shadow-blue-100">
              <FaReceipt className="text-lg text-white" />
            </div>

            {/* Logo Text */}
            {isOpen && (
              <div className="overflow-hidden">
                <h1 className="whitespace-nowrap text-lg font-bold text-slate-800">
                  Billing<span className="text-blue-500">App</span>
                </h1>

                <p className="whitespace-nowrap text-[10px] font-medium text-slate-400">
                  Billing Management
                </p>
              </div>
            )}

          </Link>

          {/* Mobile Close */}
          {isOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="
                rounded-lg
                p-2
                text-slate-400
                transition
                hover:bg-slate-100
                hover:text-slate-700
                lg:hidden
              "
              aria-label="Close sidebar"
            >
              <FaTimes />
            </button>
          )}

        </div>

        {/* ================================
            NAVIGATION
        ================================= */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">

          {isOpen && (
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Main Menu
            </p>
          )}

          <div className="space-y-1.5">

            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActiveRoute(item.path)

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      setIsOpen(false)
                    }
                  }}
                  title={!isOpen ? item.label : undefined}
                  className={`
                    group
                    flex
                    items-center
                    rounded-xl
                    px-3
                    py-3
                    transition-all
                    duration-200

                    ${
                      isOpen
                        ? 'gap-3'
                        : 'justify-center'
                    }

                    ${
                      active
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }
                  `}
                >

                  {/* Icon */}
                  <div
                    className={`
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      transition

                      ${
                        active
                          ? 'bg-blue-500 text-white shadow-sm shadow-blue-100'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-500'
                      }
                    `}
                  >
                    <Icon className="text-sm" />
                  </div>

                  {/* Label */}
                  {isOpen && (
                    <span className="text-sm font-medium">
                      {item.label}
                    </span>
                  )}

                  {/* Active Indicator */}
                  {active && isOpen && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500" />
                  )}

                </Link>
              )
            })}

          </div>

        </nav>

        {/* ================================
            LOGOUT
        ================================= */}
        <div className="border-t border-slate-100 p-3">

          <button
            onClick={onLogout}
            title={!isOpen ? 'Logout' : undefined}
            className={`
              group
              flex
              w-full
              items-center
              rounded-xl
              px-3
              py-3
              text-slate-500
              transition-all
              duration-200
              hover:bg-red-50
              hover:text-red-600

              ${
                isOpen
                  ? 'gap-3'
                  : 'justify-center'
              }
            `}
          >

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-red-100 group-hover:text-red-600">
              <FaSignOutAlt className="text-sm" />
            </div>

            {isOpen && (
              <span className="text-sm font-medium">
                Logout
              </span>
            )}

          </button>

        </div>

        {/* ================================
            DESKTOP COLLAPSE BUTTON
        ================================= */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="
            absolute
            -right-3
            top-[74px]
            hidden
            h-7
            w-7
            items-center
            justify-center
            rounded-full
            border
            border-slate-200
            bg-white
            text-slate-500
            shadow-sm
            transition
            hover:border-blue-200
            hover:text-blue-500
            lg:flex
          "
          aria-label={
            isOpen
              ? 'Collapse sidebar'
              : 'Expand sidebar'
          }
        >
          {isOpen ? (
            <FaChevronLeft className="text-[10px]" />
          ) : (
            <FaChevronRight className="text-[10px]" />
          )}
        </button>

      </aside>
    </>
  )
}