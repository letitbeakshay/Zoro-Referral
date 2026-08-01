// src/app/customer/page.tsx
"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, Ticket, AlertCircle, Calendar, User, Phone, Mail, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"

function CustomerLeadContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const refParam = searchParams.get("ref") || ""

  const { toast } = useToast()
  
  // State variables
  const [referralCode, setReferralCode] = React.useState(refParam.toUpperCase())
  const [isValidated, setIsValidated] = React.useState(false)
  const [validating, setValidating] = React.useState(false)
  const [referrerName, setReferrerName] = React.useState("")
  const [offerDetails, setOfferDetails] = React.useState({ discountAmount: 500 })

  // Lead fields
  const [customerName, setCustomerName] = React.useState("")
  const [customerPhone, setCustomerPhone] = React.useState("")
  const [customerEmail, setCustomerEmail] = React.useState("")
  const [plan, setPlan] = React.useState("quarterly")
  const [preferredVisitDate, setPreferredVisitDate] = React.useState("")
  
  const [submitLoading, setSubmitLoading] = React.useState(false)
  const [validationError, setValidationError] = React.useState("")

  // Auto-validate if referral code is in url
  React.useEffect(() => {
    if (refParam) {
      handleValidateCode(refParam)
    }
  }, [refParam])

  const handleValidateCode = async (codeToValidate: string) => {
    const cleanCode = codeToValidate.trim().toUpperCase()
    if (!cleanCode) {
      setValidationError("Please enter a referral code.")
      return
    }

    setValidating(true)
    setValidationError("")
    setIsValidated(false)

    try {
      const response = await fetch(`/api/referral?code=${encodeURIComponent(cleanCode)}`)
      const data = await response.json()

      if (response.ok && data.isValid) {
        setIsValidated(true)
        setReferrerName(data.referrerName)
        setOfferDetails({ discountAmount: Number(data.discountAmount) })
        toast({
          type: "success",
          message: `Referral code verified! Referred by ${data.referrerName}.`,
        })
      } else {
        setValidationError(data.error || "Invalid referral code.")
        toast({
          type: "error",
          message: data.error || "Invalid referral code.",
        })
      }
    } catch (err) {
      console.error("Code validation error:", err)
      setValidationError("Failed to validate referral code. Please check your network connection.")
    } finally {
      setValidating(false)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim() || !preferredVisitDate) {
      toast({
        type: "error",
        message: "Please fill in all the required fields.",
      })
      return
    }

    setSubmitLoading(true)

    try {
      const response = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referralCode,
          customerName,
          customerPhone,
          customerEmail,
          plan,
          preferredVisitDate,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          type: "success",
          message: "Referral submitted successfully!",
        })
        router.push(`/customer/thank-you?name=${encodeURIComponent(customerName)}&discount=${offerDetails.discountAmount}`)
      } else {
        toast({
          type: "error",
          message: data.error || "Failed to submit lead.",
        })
      }
    } catch (err) {
      console.error("Lead submission error:", err)
      toast({
        type: "error",
        message: "Network error occurred. Please try again.",
      })
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-b from-background to-emerald-50/20 dark:to-emerald-950/5">
      {/* Header */}
      <header className="px-6 py-5 flex items-center border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-10">
        <Link href="/" className="mr-4 p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="font-bold text-lg tracking-tight">New Gym Guest Registration</span>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col justify-center px-4 py-8 max-w-md mx-auto w-full space-y-6">
        <Card className="shadow-xl premium-shadow">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto p-3 rounded-full bg-emerald-50 text-primary dark:bg-emerald-950 dark:text-emerald-300 w-fit">
              <Ticket className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-extrabold">Claim Your Discount</CardTitle>
            <CardDescription>
              Enter a gym member's referral code to unlock your ₹500 joining offer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 1. Referral Code Section */}
            <div className="space-y-3">
              <label htmlFor="refCode" className="text-sm font-semibold block">
                Referral Code
              </label>
              <div className="flex gap-2">
                <Input
                  id="refCode"
                  type="text"
                  placeholder="e.g. ZR1001"
                  value={referralCode}
                  onChange={(e) => {
                    setReferralCode(e.target.value.toUpperCase())
                    setIsValidated(false)
                    setValidationError("")
                  }}
                  disabled={validating || isValidated}
                  className="uppercase tracking-wider"
                />
                {!isValidated ? (
                  <Button
                    onClick={() => handleValidateCode(referralCode)}
                    disabled={validating || !referralCode.trim()}
                    className="shrink-0 rounded-xl"
                  >
                    {validating ? "Validating..." : "Validate"}
                  </Button>
                ) : (
                  <div className="flex items-center justify-center p-2.5 bg-emerald-500 text-white rounded-xl">
                    <Check className="h-5 w-5" />
                  </div>
                )}
              </div>

              {/* Error state */}
              {validationError && (
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 animate-in fade-in duration-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}
            </div>

            {/* 2. Progressive Reveal Offer and Lead Form */}
            {isValidated && (
              <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                {/* Congratulations Banner */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-900/30 dark:text-emerald-200 text-center space-y-1">
                  <p className="font-extrabold text-lg text-emerald-700 dark:text-emerald-400">
                    🎉 Congratulations!
                  </p>
                  <p className="text-sm font-semibold">
                    You will receive <span className="underline decoration-2">₹{offerDetails.discountAmount} OFF</span> on any Quarterly or Annual Membership.
                  </p>
                  <p className="text-xs opacity-80 mt-1">
                    Referred by {referrerName}
                  </p>
                </div>

                {/* Lead Form */}
                <form onSubmit={handleFormSubmit} className="space-y-4 pt-2 border-t border-border">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-semibold block">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 opacity-50" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="pl-10"
                        required
                        disabled={submitLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-semibold block">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 h-4 w-4 opacity-50" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="pl-10"
                        required
                        disabled={submitLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold block">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 opacity-50" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="e.g. rahul@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={submitLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="plan" className="text-sm font-semibold block">
                        Interested Plan
                      </label>
                      <Select
                        id="plan"
                        value={plan}
                        onChange={(e) => setPlan(e.target.value)}
                        disabled={submitLoading}
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="half_yearly">Half Yearly</option>
                        <option value="yearly">Yearly</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="date" className="text-sm font-semibold block">
                        Preferred Visit Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 opacity-50 pointer-events-none" />
                        <Input
                          id="date"
                          type="date"
                          value={preferredVisitDate}
                          onChange={(e) => setPreferredVisitDate(e.target.value)}
                          className="pl-10 pr-2"
                          required
                          disabled={submitLoading}
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full rounded-xl mt-4" disabled={submitLoading}>
                    {submitLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
                        Registering...
                      </span>
                    ) : (
                      "Claim Discount & Book Visit"
                    )}
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function CustomerLeadPage() {
  return (
    <React.Suspense fallback={
      <div className="flex flex-1 flex-col items-center justify-center p-20 space-y-4 min-h-screen">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">Initializing registration form...</p>
      </div>
    }>
      <CustomerLeadContent />
    </React.Suspense>
  )
}
