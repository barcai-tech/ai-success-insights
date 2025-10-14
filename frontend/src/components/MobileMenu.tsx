"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  LayoutDashboard,
  Upload,
  BookOpen,
  BarChart3,
  Github,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/upload",
    label: "Upload",
    icon: Upload,
  },
  {
    href: "/playbooks",
    label: "Playbooks",
    icon: BookOpen,
  },
];

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const pathname = usePathname();

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background bg-opacity-50 text-foreground z-10 flex flex-col h-screen">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Button
          variant="outline"
          size="icon"
          onClick={onClose}
          className="self-end text-3xl"
          aria-label="Close menu"
        >
          <X />
        </Button>

        <div className="text-xl font-bold">AI Success Insights</div>

        {/* 
          This placeholder <div> ensures the title remains centered 
          between the close button and an empty space on mobile screens.
        */}
        <div className="sm:hidden"></div>
      </div>

      <nav className="flex flex-col gap-6 text-xl px-4 py-8">
        <ul>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");

            return (
              <li key={item.href} className="mb-4">
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 hover:text-primary",
                    isActive && "text-primary font-semibold"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}

          <li className="mb-4">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:text-primary"
            >
              <BarChart3 className="h-5 w-5" />
              API Docs
            </a>
          </li>

          <li className="mb-4">
            <a
              href="https://github.com/barcai-tech/ai-success-insights"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:text-primary"
            >
              <Github className="h-5 w-5" />
              GitHub
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
