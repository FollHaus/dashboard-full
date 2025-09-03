'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import cn from 'classnames'
import { useEffect, useRef, useState } from 'react'
import { User } from 'lucide-react'

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

  useEffect(() => {
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
    return (
      <Link
        key={route.path}
        href={route.path}
        data-path={route.path}
        className={cn('nav-link', {
          active: isActive,
          'bg-neutral-200 text-neutral-900 rounded-lg': isMobile && isActive,
        })}
        aria-current={isActive ? 'page' : undefined}
        onClick={() => isMobile && setOpen(false)}
      >
        {route.label}
      </Link>
    )
  }

  return (
    <header className="w-full sticky top-0 z-40 bg-neutral-100/95 backdrop-blur supports-[backdrop-filter]:bg-neutral-100/80 border-b border-neutral-300">
      <div className="relative mx-auto max-w-7xl h-14 md:h-16 px-3 md:px-6 flex items-center justify-between gap-4">
        <Link href="/" className="font-cnbold text-xl md:text-2xl text-neutral-900 select-none">
          И.П. Муллиев
        </Link>

        <nav
          ref={navRef}
          className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2"
        >
          {routes.map((r) => renderLink(r))}
          <span
            id="nav-underline"
            ref={underlineRef}
            className="absolute -bottom-[9px] h-[3px] bg-primary-500 rounded-full transition-all duration-300"
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
            className="md:hidden h-10 w-10 flex items-center justify-center rounded-xl bg-neutral-200"
            aria-label="Меню"
            id="burger"
            onClick={() => setOpen((prev) => !prev)}
          />
        </div>
      </div>

      <div
        id="mobileMenu"
        className={cn(
          'md:hidden border-t border-neutral-300 bg-neutral-100',
          open ? 'block' : 'hidden'
        )}
      >
        <nav className="px-3 py-2 flex flex-col gap-1">
          {routes.map((r) => renderLink(r, true))}
        </nav>
      </div>
    </header>
  )
}
