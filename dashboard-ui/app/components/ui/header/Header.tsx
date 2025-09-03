'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import cn from 'classnames'
import { useLayoutEffect, useRef, useState } from 'react'
import { Menu, User } from 'lucide-react'

const routes = [
  { label: 'Главная', path: '/', icon: '🏠' },
  { label: 'Склад', path: '/products', icon: '📦' },
  { label: 'Задачи', path: '/tasks', icon: '✅' },
  { label: 'Отчёты', path: '/reports', icon: '📊' },
]

export default function Header() {
  const pathname = usePathname()
  const navRef = useRef<HTMLElement>(null)
  const underlineRef = useRef<HTMLSpanElement>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const toggleProfileMenu = () => setProfileOpen((prev) => !prev)
  const toggleMobile = () => setMobileOpen((prev) => !prev)

  useLayoutEffect(() => {
    const updateUnderline = () => {
      const nav = navRef.current
      const underline = underlineRef.current
      const activeLink = nav?.querySelector<HTMLAnchorElement>('a.active')
      if (nav && underline && activeLink) {
        const el = activeLink.getBoundingClientRect()
        const navBox = nav.getBoundingClientRect()
        underline.style.width = `${el.width}px`
        underline.style.left = `${el.left - navBox.left}px`
      }
    }

    updateUnderline()
    window.addEventListener('resize', updateUnderline)
    return () => window.removeEventListener('resize', updateUnderline)
  }, [pathname])

  const renderLink = (
    route: { label: string; path: string; icon: string },
    isMobile = false
  ) => {
    const isActive = pathname === route.path
    const baseClasses = isMobile
      ? cn(
          'px-3 py-2 rounded-lg transition-colors flex items-center',
          isActive
            ? 'bg-primary-300/40 text-neutral-900 font-semibold'
            : 'hover:bg-neutral-200'
        )
      : cn('nav-link inline-flex items-center', isActive && 'active')
    return (
      <Link
        key={route.path}
        href={route.path}
        className={baseClasses}
        aria-current={isActive ? 'page' : undefined}
        onClick={() => isMobile && setMobileOpen(false)}
      >
        <span className="mr-2">{route.icon}</span>
        {route.label}
      </Link>
    )
  }

  return (
    <header className="sticky top-0 z-40 bg-neutral-100/95 backdrop-blur border-b border-neutral-300 shadow-sm">
      <div className="mx-auto max-w-7xl h-[64px] px-4 md:px-6 flex items-center justify-between gap-6">
        <Link
          href="/"
          className="font-cnbold text-xl md:text-2xl font-semibold text-neutral-900/90"
        >
          И.П. Мулиев
        </Link>

        <nav
          ref={navRef}
          className="relative hidden md:flex flex-1 items-center justify-evenly"
        >
          {routes.map((r) => renderLink(r))}
          <span
            id="nav-underline"
            ref={underlineRef}
            className="absolute -bottom-[10px] h-[3px] bg-success rounded-full transition-all duration-300"
          />
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
        <nav className="px-3 py-2 flex flex-col">
          {routes.map((r) => renderLink(r, true))}
        </nav>
      </div>
    </header>
  )
}
