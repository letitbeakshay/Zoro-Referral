// src/app/page.tsx
import Link from "next/link"
import { Dumbbell, Users, UserPlus, ShieldAlert } from "lucide-react"
import { prisma } from "@/lib/prisma"

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Home({ searchParams }: PageProps) {
  // Await searchParams as required in Next.js 15
  const resolvedSearchParams = await searchParams
  const refCode = typeof resolvedSearchParams.ref === "string" ? resolvedSearchParams.ref.toUpperCase().trim() : ""

  // Fetch campaign settings from the database (or fallback)
  let settings = {
    gymName: "Zoro Gym",
    standeeHeadline: "Bring a Friend.",
    standeeOffer: "Both of You Save ₹500.",
    standeeTerms: "Valid on quarterly and annual memberships.",
    primaryColor: "#1F6B45"
  }

  try {
    const dbSettings = await prisma.settings.findUnique({
      where: { id: "default" },
    })
    if (dbSettings) {
      settings = {
        gymName: dbSettings.gymName,
        standeeHeadline: dbSettings.standeeHeadline,
        standeeOffer: dbSettings.standeeOffer,
        standeeTerms: dbSettings.standeeTerms,
        primaryColor: dbSettings.primaryColor || "#1F6B45"
      }
    }
  } catch (error) {
    console.error("Could not fetch DB settings on landing:", error)
  }

  // Pre-fill query param for forwarding to new customer form
  const customerLink = refCode ? `/customer?ref=${refCode}` : "/customer"

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-b from-background to-emerald-50/20 dark:to-emerald-950/5">
      {/* Top Header */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary text-primary-foreground">
            <Dumbbell className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">{settings.gymName}</span>
        </div>
        <Link 
          href="/login" 
          className="text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border hover:bg-muted/50 transition-colors"
        >
          Staff Login
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col justify-center px-4 py-8 max-w-md mx-auto w-full">
        {/* Dynamic Standee Display */}
        <div className="text-center space-y-3 mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            🤝 Referral Program
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            {settings.standeeHeadline}
          </h1>
          <p className="text-xl font-bold text-foreground opacity-90">
            {settings.standeeOffer}
          </p>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            {settings.standeeTerms}
          </p>
        </div>

        {/* Action Choice Card */}
        <div className="bg-card rounded-3xl border border-border p-6 shadow-xl premium-shadow space-y-6">
          <h2 className="text-center font-semibold text-lg">Are you an existing member or a new guest?</h2>
          
          <div className="grid gap-4">
            {/* Existing Member Option */}
            <Link
              href="/member"
              className="group flex items-center gap-4 p-5 rounded-2xl border border-border bg-background hover:bg-emerald-50/10 hover:border-primary/40 transition-all duration-300 focus:outline-hidden focus:ring-2 focus:ring-primary active:scale-[0.99]"
            >
              <div className="p-3.5 rounded-xl bg-emerald-50 text-primary dark:bg-emerald-950 dark:text-emerald-300 group-hover:scale-105 transition-transform duration-200">
                <Users className="h-6 w-6" />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-foreground text-base">Existing Member</p>
                <p className="text-xs text-muted-foreground mt-0.5">Lookup your referral code to share with friends</p>
              </div>
            </Link>

            {/* New Customer Option */}
            <Link
              href={customerLink}
              className="group flex items-center gap-4 p-5 rounded-2xl border border-border bg-background hover:bg-emerald-50/10 hover:border-primary/40 transition-all duration-300 focus:outline-hidden focus:ring-2 focus:ring-primary active:scale-[0.99]"
            >
              <div className="p-3.5 rounded-xl bg-primary text-primary-foreground group-hover:scale-105 transition-transform duration-200">
                <UserPlus className="h-6 w-6" />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-foreground text-base">New Customer</p>
                {refCode ? (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                    Referral code <span className="underline font-bold">{refCode}</span> pre-filled!
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-0.5">Claim ₹500 discount code to join Zoro Gym</p>
                )}
              </div>
            </Link>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="py-6 text-center border-t border-border mt-auto">
        <p className="text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} Zoro Gym. All rights reserved. By continuing, you agree to our Terms & Privacy Policy.
        </p>
      </footer>
    </div>
  )
}
