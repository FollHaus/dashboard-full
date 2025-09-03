'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import cn from 'classnames'
import { useState } from 'react'
import {
  Menu,
  User,
  Home,
  Package,
  CheckSquare,
  BarChart3,
} from 'lucide-react'

const routes = [
  { label: 'Главная', path: '/', icon: Home },
  { label: 'Склад', path: '/products', icon: Package },
  { label: 'Задачи', path: '/tasks', icon: CheckSquare },
  { label: 'Отчёты', path: '/reports', icon: BarChart3 },
]

export default function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const toggleProfileMenu = () => setProfileOpen((prev) => !prev)
  const toggleMobile = () => setMobileOpen((prev) => !prev)

  const renderLink = (
    route: { label: string; path: string; icon: React.ElementType },
    isMobile = false
  ) => {
    const isActive = pathname === route.path
    const Icon = route.icon
    const baseClasses = cn(
      'relative inline-flex items-center gap-2 px-3 py-2 text-sm font-medium',
      'text-neutral-900/80 hover:bg-neutral-200 hover:text-neutral-900 rounded-lg transition-colors',
      isActive && 'bg-green-100 text-green-700 font-semibold hover:bg-green-200 active:bg-green-100',
      isMobile && 'w-full'
    )

    return (
      <Link
        key={route.path}
        href={route.path}
        className={baseClasses}
        aria-current={isActive ? 'page' : undefined}
        onClick={() => isMobile && setMobileOpen(false)}
      >
        <Icon className="w-4 h-4" />
        {route.label}
      </Link>
    )
  }

  return (
    <header className="sticky top-0 z-40 bg-neutral-100/95 backdrop-blur border-b border-neutral-300 shadow-sm rounded-b-xl">
      <div className="mx-auto max-w-7xl h-[64px] px-4 md:px-6 flex items-center justify-between gap-6">
        <Link
          href="/"
          className="font-cnbold text-xl md:text-2xl font-semibold text-neutral-900/90"
        >
          И.П. Мулиев
        </Link>

        <nav className="relative hidden md:flex flex-1 items-center justify-evenly">
          {routes.map((r) => renderLink(r))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              id="profileBtn"
              aria-label="Профиль"
              className={cn(
                'h-10 w-10 rounded-full bg-neutral-200 flex items-center justify-center hover:bg-neutral-300',
                'focus:outline-none focus:ring-2 focus:ring-primary-300'
              )}
              onClick={toggleProfileMenu}
            >
              <User className="w-5 h-5 text-neutral-900" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl bg-neutral-100 shadow-card border border-neutral-300 py-1">
                <button className="w-full text-left px-3 py-2 hover:bg-neutral-200">
                  Профиль
                </button>
                <button className="w-full text-left px-3 py-2 hover:bg-neutral-200">
                  Настройки
                </button>
                <button className="w-full text-left px-3 py-2 text-error hover:bg-error/10">
                  Выход
                </button>
              </div>
            )}
          </div>

          <button
            className="md:hidden h-10 w-10 rounded-xl bg-neutral-200 flex items-center justify-center hover:bg-neutral-300"
            aria-label="Открыть меню"
            onClick={toggleMobile}
          >
            <Menu className="w-5 h-5 text-neutral-900" />
          </button>
        </div>
      </div>

      <div
        id="mobileNav"
        className={cn(
          'md:hidden border-t border-neutral-300 bg-neutral-100',
          mobileOpen ? 'block' : 'hidden'
        )}
      >
        <nav className="px-3 py-2 flex flex-col gap-1">
          {routes.map((r) => renderLink(r, true))}
        </nav>
      </div>
    </header>
  )
}
