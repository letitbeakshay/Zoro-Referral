// src/app/login/page.tsx
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Lock, Mail, Dumbbell, ShieldAlert, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password) {
      toast({
        type: "error",
        message: "Please enter both email and password.",
      })
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      if (error) {
        toast({
          type: "error",
          message: error.message || "Invalid login credentials.",
        })
      } else if (data.session) {
        toast({
          type: "success",
          message: "Logged in successfully! Redirecting...",
        })
        
        // Wait briefly for middleware cookies to register, then redirect
        setTimeout(() => {
          router.replace("/admin/dashboard")
          router.refresh()
        }, 800)
      }
    } catch (err: any) {
      console.error("Login exception:", err)
      toast({
        type: "error",
        message: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-b from-background to-emerald-50/20 dark:to-emerald-950/5">
      {/* Header */}
      <header className="px-6 py-5 flex items-center border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-10">
        <Link href="/" className="mr-4 p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="font-bold text-lg tracking-tight">Staff Area</span>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col justify-center px-4 py-8 max-w-md mx-auto w-full">
        <Card className="shadow-xl premium-shadow border-primary/10">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto p-3 rounded-full bg-primary text-primary-foreground w-fit">
              <Dumbbell className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-extrabold">Zoro Staff Login</CardTitle>
            <CardDescription>
              Sign in with your admin credentials to manage referrals, members, and rewards.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 opacity-50" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@zorogym.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-semibold">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      toast({
                        type: "info",
                        message: "Please contact your Zoro Gym IT administrator to reset your password.",
                      })
                    }
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 opacity-50" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full rounded-xl mt-4" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
                    Signing in...
                  </span>
                ) : (
                  "Access Admin Dashboard"
                )}
              </Button>
            </form>

            <div className="mt-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-200 text-xs leading-relaxed font-medium">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Authorized access only. All actions on this portal are tracked and logged in the system audit registry.
              </span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
