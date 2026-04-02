"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const tabs = [
  { label: "Write", href: "/" },
  { label: "Archive", href: "/archive" },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-2xl px-4 flex gap-6">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              pathname === tab.href
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
