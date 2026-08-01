// src/app/admin/layout.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  Share2, 
  Settings, 
  LogOut, 
  Dumbbell, 
  Menu, 
  X,
  Bell
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [adminName, setAdminName] = React.useState("Zoro Admin")
  const [unreadNotifications, setUnreadNotifications] = React.useState(0)

  // Fetch notifications count
  React.useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/notifications?unreadOnly=true')
        if (response.ok) {
          const data = await response.json()
          setUnreadNotifications(data.notifications?.length || 0)
        }
      } catch (err) {
        console.error("Failed to fetch notification count:", err)
      }
    }
    
    fetchUnreadCount()
    // Poll every 10 seconds for real-time dashboard notifications feel
    const interval = setInterval(fetchUnreadCount, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast({
        type: "success",
        message: "Signed out successfully.",
      })
      router.replace("/login")
      router.refresh()
    } catch (err: any) {
      toast({
        type: "error",
        message: err.message || "Failed to sign out.",
      })
    }
  }

  const navLinks = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Members", href: "/admin/members", icon: Users },
    { name: "Referrals", href: "/admin/referrals", icon: Share2 },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  const isActive = (href: string) => pathname.startsWith(href)

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border shrink-0 sticky top-0 h-screen">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-border flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl overflow-hidden bg-primary relative flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="Zoro Gym Logo" className="object-cover h-full w-full" />
          </div>
          <span className="font-bold text-lg tracking-tight">Zoro Admin</span>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 mt-4 bg-muted/40 rounded-2xl border border-border/60">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Logged in as</p>
          <p className="text-sm font-bold mt-0.5 truncate">{adminName}</p>
        </div>

        {/* Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon
            const active = isActive(link.href)
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {link.name}
                {link.name === "Referrals" && unreadNotifications > 0 && (
                  <span className="ml-auto bg-amber-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                    {unreadNotifications}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border mt-auto">
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="w-full justify-start text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl"
          >
            <LogOut className="h-4.5 w-4.5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        {/* Mobile Header */}
        <header className="flex md:hidden items-center justify-between px-6 py-4 bg-card border-b border-border sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg overflow-hidden bg-primary relative flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="Zoro Gym Logo" className="object-cover h-full w-full" />
            </div>
            <span className="font-bold text-base tracking-tight">Zoro Admin</span>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/referrals" className="relative p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors">
              <Bell className="h-4.5 w-4.5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500"></span>
              )}
            </Link>
            <button
              onClick={handleSignOut}
              className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>

        {/* Mobile Bottom Sticky Nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-card/90 backdrop-blur-md border-t border-border flex items-center justify-around py-2.5 px-4 shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon
            const active = isActive(link.href)
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-all ${
                  active
                    ? "text-primary scale-105 font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className={`p-1.5 rounded-lg mb-0.5 transition-colors ${active ? 'bg-primary/10' : ''}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span>{link.name}</span>
                {link.name === "Referrals" && unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1/4 h-2 w-2 rounded-full bg-amber-500"></span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
