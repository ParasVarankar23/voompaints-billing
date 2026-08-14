'use client'

import { useState, useRef, useEffect } from 'react'
import {
  FaBars,
  FaBell,
  FaChevronDown,
  FaSignOutAlt,
  FaUser,
  FaCog,
} from 'react-icons/fa'

export default function Navbar({
  isSidebarOpen,
  setIsSidebarOpen,
  user,
  onLogout,
}) {
  const [profileOpen, setProfileOpen] = useState(false)
  const profileBtnRef = useRef(null)
  const profileDropdownRef = useRef(null)

  useEffect(() => {
    function handleOutsideClick(e) {
      if (!profileOpen) return

      const btn = profileBtnRef.current
      const dropdown = profileDropdownRef.current

      if (btn && btn.contains(e.target)) return
      if (dropdown && dropdown.contains(e.target)) return

      setProfileOpen(false)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [profileOpen])

  const userName =
    user?.name ||
    user?.username ||
    'User'

  const userEmail = user?.email || ''

  const userInitial =
    userName?.charAt(0)?.toUpperCase() || 'U'

  return (
    <header className="sticky top-0 z-30 h-20 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">

        {/* ================================
            LEFT SIDE
        ================================= */}
        <div className="flex items-center gap-3">

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() =>
              setIsSidebarOpen(!isSidebarOpen)
            }
            className="
              flex h-10 w-10 items-center justify-center
              rounded-xl text-slate-500
              transition-all duration-200
              hover:bg-blue-50 hover:text-blue-500
              lg:hidden
            "
            aria-label="Open menu"
          >
            <FaBars className="text-lg" />
          </button>

          {/* Desktop Sidebar Toggle */}
          <button
            type="button"
            onClick={() =>
              setIsSidebarOpen(!isSidebarOpen)
            }
            className="
              hidden h-10 w-10 items-center justify-center
              rounded-xl text-slate-500
              transition-all duration-200
              hover:bg-blue-50 hover:text-blue-500
              lg:flex
            "
            aria-label="Toggle sidebar"
          >
            <FaBars className="text-lg" />
          </button>

          {/* Brand / Page Title */}
          <div className="hidden sm:block">
            <h1 className="text-base font-semibold text-slate-800">
              Billing App
            </h1>

            <p className="mt-0.5 text-xs text-slate-400">
              Manage your business easily
            </p>
          </div>

        </div>

        {/* ================================
            RIGHT SIDE
        ================================= */}
        <div className="flex items-center gap-2 sm:gap-4">

          {/* Notification */}
          <button
            type="button"
            className="
              relative flex h-10 w-10
              items-center justify-center
              rounded-xl text-slate-500
              transition-all duration-200
              hover:bg-blue-50 hover:text-blue-500
            "
            aria-label="Notifications"
          >
            <FaBell className="text-base" />

            {/* Notification Dot */}
            <span className="
              absolute right-2.5 top-2
              h-2 w-2 rounded-full
              border-2 border-white
              bg-blue-500
            " />
          </button>

          {/* Divider */}
          <div className="hidden h-8 w-px bg-slate-200 sm:block" />

          {/* Profile */}
          <div className="relative">

            <button
              ref={profileBtnRef}
              type="button"
              onClick={() =>
                setProfileOpen(!profileOpen)
              }
              className="
                flex items-center gap-2
                rounded-xl p-1.5
                transition-all duration-200
                hover:bg-slate-50
              "
              aria-expanded={profileOpen}
            >

              {/* Avatar */}
              <div className="
                flex h-9 w-9 shrink-0
                items-center justify-center
                rounded-xl
                bg-blue-500
                text-sm font-bold
                text-white
                shadow-sm shadow-blue-100
              ">
                {userInitial}
              </div>

              {/* User Information */}
              <div className="hidden max-w-[160px] text-left md:block">

                <p className="
                  truncate
                  text-sm
                  font-semibold
                  text-slate-700
                ">
                  {userName}
                </p>

                <p className="
                  truncate
                  text-[11px]
                  text-slate-400
                ">
                  {userEmail}
                </p>

              </div>

              {/* Arrow */}
              <FaChevronDown
                className={`
                  hidden
                  text-[10px]
                  text-slate-400
                  transition-transform
                  duration-200
                  md:block
                  ${profileOpen ? 'rotate-180' : ''}
                `}
              />

            </button>

            {/* ================================
                PROFILE DROPDOWN
            ================================= */}
            {profileOpen && (
              <>
                {/* Click outside */}
                <button
                  type="button"
                  aria-label="Close profile menu"
                  className="
                    fixed inset-0 z-40
                    h-full w-full
                    cursor-default
                  "
                  onClick={() =>
                    setProfileOpen(false)
                  }
                />

                {/* Dropdown */}
                <div
                  ref={profileDropdownRef}
                  className="
                    absolute right-0 top-14 z-50
                    w-64 overflow-hidden
                    rounded-2xl
                    border border-slate-200
                    bg-white
                    shadow-xl
                    shadow-slate-200/70
                  ">

                  {/* User Details */}
                  <div className="
                    border-b
                    border-slate-100
                    bg-slate-50/70
                    p-4
                  ">

                    <div className="flex items-center gap-3">

                      {/* Large Avatar */}
                      <div className="
                        flex h-11 w-11 shrink-0
                        items-center justify-center
                        rounded-xl
                        bg-blue-500
                        text-sm font-bold
                        text-white
                      ">
                        {userInitial}
                      </div>

                      <div className="min-w-0">

                        <p className="
                          truncate
                          text-sm
                          font-semibold
                          text-slate-800
                        ">
                          {userName}
                        </p>

                        <p className="
                          truncate
                          text-xs
                          text-slate-400
                        ">
                          {userEmail}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* Profile Options */}
                  <div className="p-2">

                    <button
                      type="button"
                      onClick={() =>
                        setProfileOpen(false)
                      }
                      className="
                        flex w-full
                        items-center gap-3
                        rounded-xl
                        px-3 py-2.5
                        text-sm
                        text-slate-600
                        transition
                        hover:bg-slate-50
                        hover:text-slate-800
                      "
                    >
                      <span className="
                        flex h-8 w-8
                        items-center justify-center
                        rounded-lg
                        bg-slate-100
                      ">
                        <FaUser className="text-xs text-slate-500" />
                      </span>

                      <span>My Profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setProfileOpen(false)
                      }
                      className="
                        flex w-full
                        items-center gap-3
                        rounded-xl
                        px-3 py-2.5
                        text-sm
                        text-slate-600
                        transition
                        hover:bg-slate-50
                        hover:text-slate-800
                      "
                    >
                      <span className="
                        flex h-8 w-8
                        items-center justify-center
                        rounded-lg
                        bg-slate-100
                      ">
                        <FaCog className="text-xs text-slate-500" />
                      </span>

                      <span>Settings</span>
                    </button>

                  </div>

                  {/* Logout */}
                  <div className="
                    border-t
                    border-slate-100
                    p-2
                  ">

                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false)
                        onLogout()
                      }}
                      className="
                        flex w-full
                        items-center gap-3
                        rounded-xl
                        px-3 py-2.5
                        text-sm font-medium
                        text-red-500
                        transition
                        hover:bg-red-50
                      "
                    >

                      <span className="
                        flex h-8 w-8
                        items-center justify-center
                        rounded-lg
                        bg-red-50
                      ">
                        <FaSignOutAlt className="text-xs text-red-500" />
                      </span>

                      <span>Logout</span>

                    </button>

                  </div>

                </div>
              </>
            )}

          </div>

        </div>

      </div>
    </header>
  )
}