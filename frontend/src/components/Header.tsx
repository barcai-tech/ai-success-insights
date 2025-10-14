"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Menu, TrendingUp, Github } from "lucide-react";
import PageContainer from "./PageContainer";
import { NavMenu } from "./NavMenu";
import MobileMenu from "./MobileMenu";
import { ModeToggle } from "./ModeToggle";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-background/75 border-b border-slate-200/60 dark:border-slate-800/60">
      <PageContainer className="h-16 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMenuOpen(true)}
          className="flex items-center sm:hidden text-xl"
          aria-label="Open menu"
        >
          <Menu />
        </Button>

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-lg"
        >
          <TrendingUp className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline">AI Success Insights</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden sm:flex items-center space-x-4">
          <NavMenu />
          <Button asChild variant="ghost" size="icon" title="View on GitHub">
            <Link
              href="https://github.com/barcai-tech/ai-success-insights"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-5 w-5" />
            </Link>
          </Button>
          <ModeToggle />
        </div>

        {/* Mobile Mode Toggle (visible on small screens) */}
        <div className="sm:hidden">
          <ModeToggle />
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
        )}
      </PageContainer>
    </header>
  );
}
