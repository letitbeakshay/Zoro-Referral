// src/app/customer/thank-you/page.tsx
"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, Home, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function GuestThankYouContent() {
  const searchParams = useSearchParams()
  const name = searchParams.get("name") || "Guest"
  const discount = searchParams.get("discount") || "500"

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-b from-background to-emerald-50/20 dark:to-emerald-950/5">
      {/* Main Container */}
      <main className="flex-1 flex flex-col justify-center px-4 py-8 max-w-md mx-auto w-full">
        <Card className="shadow-xl premium-shadow border-emerald-500/20 text-center">
          <CardHeader className="space-y-4">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 relative">
              <CheckCircle2 className="h-10 w-10 animate-pulse" />
              <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-accent animate-bounce" />
            </div>
            <CardTitle className="text-3xl font-extrabold text-foreground">
              Offer Reserved!
            </CardTitle>
            <CardDescription className="text-emerald-700 dark:text-emerald-400 font-bold text-base">
              Thank you, {name}!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-900/30 text-sm space-y-3 leading-relaxed text-muted-foreground">
              <p className="font-semibold text-foreground">
                Your ₹{discount} joining discount has been successfully linked to your phone number.
              </p>
              <p>
                We have notified the gym staff. To claim your offer, simply visit the gym on your selected date and share your phone number at the reception.
              </p>
            </div>

            <div className="pt-2">
              <Link href="/">
                <Button className="w-full rounded-xl">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function GuestThankYouPage() {
  return (
    <React.Suspense fallback={
      <div className="flex flex-1 flex-col items-center justify-center p-20 space-y-4 min-h-screen">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">Loading success details...</p>
      </div>
    }>
      <GuestThankYouContent />
    </React.Suspense>
  )
}
