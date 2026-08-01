// src/app/member/page.tsx
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Phone, Search, Users, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"

export default function MemberLookupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [phone, setPhone] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [notFound, setNotFound] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clean phone number input
    const cleanPhone = phone.trim()
    if (!cleanPhone) {
      toast({
        type: "error",
        message: "Please enter your phone number.",
      })
      return
    }

    setLoading(true)
    setNotFound(false)

    try {
      const response = await fetch(`/api/member?phone=${encodeURIComponent(cleanPhone)}`)
      const data = await response.json()

      if (response.ok && data.member) {
        toast({
          type: "success",
          message: "Welcome back! Referral code found.",
        })
        // Redirect to success page passing the referral code and referrer name
        router.push(`/member/success?code=${data.member.referralCode}&name=${encodeURIComponent(data.member.name)}`)
      } else {
        setNotFound(true)
        toast({
          type: "error",
          message: data.error || "We couldn't find your membership.",
        })
      }
    } catch (error) {
      console.error("Lookup error:", error)
      toast({
        type: "error",
        message: "Something went wrong. Please check your connection and try again.",
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
        <span className="font-bold text-lg tracking-tight">Existing Member Lookup</span>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col justify-center px-4 py-8 max-w-md mx-auto w-full">
        <Card className="shadow-xl premium-shadow">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto p-3 rounded-full bg-emerald-50 text-primary dark:bg-emerald-950 dark:text-emerald-300 w-fit">
              <Users className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-extrabold">Welcome Back!</CardTitle>
            <CardDescription>
              Enter your registered phone number to access your unique referral code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notFound ? (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/30 dark:text-rose-200">
                  <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                  <p className="text-sm font-medium leading-relaxed">
                    We couldn't find your membership. Please contact the reception.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Button variant="outline" onClick={() => setNotFound(false)}>
                    Try Different Number
                  </Button>
                  <Link href="/" className="w-full">
                    <Button variant="ghost" className="w-full">
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-semibold block">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 opacity-50" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="e.g. 9999999999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
                      Searching...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Search className="h-4 w-4" />
                      Find My Code
                    </span>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
