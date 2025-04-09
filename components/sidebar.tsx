"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Utensils, Activity, Droplet, LineChart, Settings, LogOut } from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      href: "/nutrition",
      icon: Utensils,
      label: "Nutrition",
    },
    {
      href: "/activity",
      icon: Activity,
      label: "Activity",
    },
    {
      href: "/hydration",
      icon: Droplet,
      label: "Hydration",
    },
    {
      href: "/insights",
      icon: LineChart,
      label: "Insights",
    },
    {
      href: "/settings",
      icon: Settings,
      label: "Settings",
    },
  ]

  return (
    <div className="flex h-full w-16 flex-col items-center border-r border-white/10 bg-black/20 py-4 md:w-60">
      <div className="flex h-14 items-center justify-center md:justify-start md:px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-neon-blue to-neon-purple">
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">NL</div>
          </div>
          <span className="hidden text-xl font-bold neon-text md:inline-block">NutriLife</span>
        </Link>
      </div>

      <div className="mt-8 flex w-full flex-1 flex-col gap-2 px-2">
        {routes.map((route) => (
          <Button
            key={route.href}
            variant="ghost"
            asChild
            className={cn(
              "flex h-12 w-full items-center justify-start gap-4 px-4",
              pathname === route.href
                ? "bg-white/10 text-white hover:bg-white/20"
                : "text-white/60 hover:bg-white/10 hover:text-white",
            )}
          >
            <Link href={route.href}>
              <route.icon className="h-5 w-5" />
              <span className="hidden md:inline-block">{route.label}</span>
            </Link>
          </Button>
        ))}
      </div>

      <div className="mt-auto w-full px-2">
        <Button
          variant="ghost"
          className="flex h-12 w-full items-center justify-start gap-4 px-4 text-white/60 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          <span className="hidden md:inline-block">Sign Out</span>
        </Button>
      </div>
    </div>
  )
}

