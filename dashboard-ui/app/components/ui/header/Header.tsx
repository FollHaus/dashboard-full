'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import cn from 'classnames'
import { useEffect, useRef, useState } from 'react'

const routes = [
  { label: 'Главная', path: '/' },
  { label: 'Склад', path: '/stock' },
  { label: 'Задачи', path: '/tasks' },
  { label: 'Отчёты', path: '/reports' },
]

export default function Header() {
  const pathname = usePathname()
  const navRef = useRef<HTMLDivElement>(null)
  const underlineRef = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)

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
      <div className="mx-auto max-w-7xl px-3 md:px-6 h-14 md:h-16 flex items-center justify-between gap-3">
        <Link href="/" className="font-cnbold text-xl md:text-2xl text-neutral-900 select-none">
          И.П. Муллиев
        </Link>

        <nav ref={navRef} className="relative hidden md:flex items-center gap-6">
          {routes.map((r) => renderLink(r))}
          <span
            id="nav-underline"
            ref={underlineRef}
            className="absolute -bottom-[9px] h-[3px] bg-primary-500 rounded-full transition-all duration-300"
          />
        </nav>

        <button className="shadow-icon" aria-label="Профиль"></button>

        <button
          className="md:hidden h-10 w-10 flex-center-center rounded-xl bg-neutral-200"
          aria-label="Меню"
          id="burger"
          onClick={() => setOpen((prev) => !prev)}
        />
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
