'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import Image from 'next/image'

export function Navbar() {
  const pathname = usePathname()

  // Hide navbar on auth and dashboard pages
  if (pathname?.startsWith('/auth') || pathname?.startsWith('/dashboard')) return null

  const links = [
    { href: '/dashboard', label: 'Benefits' },
    { href: '/search', label: 'How it work' },
    { href: '/literature-review', label: 'Testimonials' },
    { href: '/trends', label: 'Pricing' },
  ]

  return (
    <nav className="bg-hero-section-bg">
      <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex items-center justify-between">
        {/* Brand Name */}
        <Link href="/" className="flex items-center">
          <span className="text-2xl tracking-wide" style={{ fontFamily: 'var(--font-bungee)', color: 'hsl(45, 100%, 50%)' }}>
            Research Flow
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[15px] font-medium transition-colors hover:text-foreground ${pathname === link.href
                ? 'text-foreground'
                : 'text-foreground/70'
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="hidden sm:block">
            <button className="navbar-cta-btn">
              Login
            </button>
          </Link>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 mt-8">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg font-medium"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link href="/auth/login">
                    <button className="navbar-cta-btn w-full mt-4">
                      Login
                    </button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
