"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  Clock,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/appointments", label: "Citas", icon: Calendar },
  { href: "/admin/barbers", label: "Barberos", icon: Users },
  { href: "/admin/services", label: "Servicios", icon: Scissors },
  { href: "/admin/schedule", label: "Horarios", icon: Clock },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="flex h-screen bg-background text-foreground">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <Scissors className="h-6 w-6 text-accent" />
          <span className="text-lg font-bold tracking-wide">
            Asicale <span className="text-accent">Barber</span>
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto md:hidden"
          >
            <X className="h-5 w-5 text-muted" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:bg-border hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-border hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver al sitio
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center border-b border-border bg-card px-4 md:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6 text-muted" />
          </button>
          <span className="ml-3 text-lg font-bold tracking-wide">
            Asicale <span className="text-accent">Barber</span>
          </span>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
