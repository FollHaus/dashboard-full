'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import cn from 'classnames'
import { useLayoutEffect, useRef, useState } from 'react'
import { Menu, User } from 'lucide-react'

const routes = [
  { label: 'Главная', path: '/' },
  { label: 'Склад', path: '/products' },
  { label: 'Задачи', path: '/tasks' },
  { label: 'Отчёты', path: '/reports' },
]

export default function Header() {
  const pathname = usePathname()
  const navRef = useRef<HTMLElement>(null)
  const underlineRef = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)

  const openProfileMenu = () => {
    console.info('profile')
  }

  useLayoutEffect(() => {
    const nav = navRef.current
    const underline = underlineRef.current
    const activeLink = nav?.querySelector<HTMLAnchorElement>('a.active')
    if (nav && underline && activeLink) {
      const el = activeLink.getBoundingClientRect()
      const navBox = nav.getBoundingClientRect()
      underline.style.width = `${el.width}px`
      underline.style.left = `${el.left - navBox.left}px`
    }
  }, [pathname])

  const renderLink = (route: { label: string; path: string }, isMobile = false) => {
    const isActive = pathname === route.path
    const baseClasses = isMobile
      ? cn(
          'px-3 py-2 rounded-lg transition-colors',
          isActive
            ? 'bg-primary-300/40 text-neutral-900 font-semibold'
            : 'hover:bg-neutral-200'
        )
      : cn(
          'nav-link px-1 py-1 text-neutral-900/70 hover:text-neutral-900 hover:bg-neutral-200 rounded transition-colors',
          isActive && 'active text-neutral-900 font-semibold'
        )
    return (
      <Link
        key={route.path}
        href={route.path}
        className={baseClasses}
        aria-current={isActive ? 'page' : undefined}
        onClick={() => isMobile && setOpen(false)}
      >
        {route.label}
      </Link>
    )
  }

  return (
    <header className="sticky top-0 z-40 bg-neutral-100/90 backdrop-blur border-b border-neutral-300 shadow-sm">
      <div className="mx-auto max-w-7xl h-16 px-4 md:px-6 flex items-center justify-between gap-6">
        <Link
          href="/"
          className="font-cnbold text-xl md:text-2xl font-semibold text-neutral-900/90"
        >
          И.П. Муллиев
        </Link>

        <nav ref={navRef} className="relative hidden md:flex items-center gap-8">
          {routes.map((r) => renderLink(r))}
          <span
            id="nav-underline"
            ref={underlineRef}
            className="absolute -bottom-[10px] h-[3px] bg-primary-500 rounded-full transition-all duration-300"
          />
        </nav>

        <div className="flex items-center gap-3">
          <button
            id="profileBtn"
            aria-label="Профиль"
            className={cn(
              'h-10 w-10 rounded-full bg-neutral-200 flex items-center justify-center hover:bg-neutral-300',
              'focus:outline-none focus:ring-2 focus:ring-primary-300'
            )}
            onClick={openProfileMenu}
          >
            <User className="w-5 h-5 text-neutral-900" />
          </button>

          <button
            className="md:hidden h-10 w-10 rounded-xl bg-neutral-200 flex items-center justify-center hover:bg-neutral-300"
            aria-label="Открыть меню"
            onClick={() => setOpen((prev) => !prev)}
          >
            <Menu className="w-5 h-5 text-neutral-900" />
          </button>
        </div>
      </div>

      <div
        id="mobileNav"
        className={cn(
          'md:hidden border-t border-neutral-300 bg-neutral-100',
          open ? 'block' : 'hidden'
        )}
      >
        <nav className="px-3 py-2 flex flex-col">
          {routes.map((r) => renderLink(r, true))}
        </nav>
      </div>
    </header>
  )
}
