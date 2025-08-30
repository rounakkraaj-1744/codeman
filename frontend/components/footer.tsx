"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground px-6 py-8 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">

        {/* Left: Brand & Tagline */}
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold tracking-tight">CodeMan</h2>
          <p className="text-sm opacity-75">Built by devs, for devs.</p>
        </div>

        {/* Center: Quick Links */}
        <ul className="flex gap-6 text-sm font-medium">
          <li>
            <Link href="/" className="hover:underline">Home</Link>
          </li>
          <li>
            <Link href="/about" className="hover:underline">About</Link>
          </li>
          <li>
            <a href="https://github.com/yourrepo" target="_blank" className="hover:underline">GitHub</a>
          </li>
        </ul>

        {/* Right: Call to Action / Button */}
        <div className="text-center md:text-right">
          <Button variant="secondary" asChild>
            <Link href="/upload">Upload a Snippet</Link>
          </Button>
        </div>
      </div>

      {/* Bottom: Copyright */}
      <div className="mt-6 text-center text-xs opacity-60">
        © {new Date().getFullYear()} CodeMan — All rights reserved.
      </div>
    </footer>
  )
}
