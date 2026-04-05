"use client";

import Link from "next/link";
import { useState } from "react";
import { SearchDialog } from "./SearchDialog";

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/gobierno", label: "Gobierno" },
  { href: "/gobierno-actual", label: "Gobierno Actual" },
  { href: "/presupuesto", label: "Presupuesto" },
  { href: "/economia", label: "Economía" },
  { href: "/asamblea", label: "Asamblea" },
  { href: "/contrataciones", label: "Contrataciones" },
  { href: "/relaciones", label: "Relaciones" },
  { href: "/datos", label: "Datos" },
  { href: "/acerca", label: "Acerca" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-primary text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-2xl">🇨🇷</span>
            <span>GobiernoCR</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-light transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <SearchDialog />

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-md hover:bg-primary-light"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menú"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="lg:hidden pb-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-light transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
