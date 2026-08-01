// src/app/member/success/page.tsx
"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, Copy, Download, Share2, Award, QrCode, Loader2 } from "lucide-react"
import QRCode from "qrcode"
import confetti from "canvas-confetti"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"

function MemberSuccessContent() {
  const searchParams = useSearchParams()
  const code = searchParams.get("code") || "ZR1001"
  const name = searchParams.get("name") || "Member"
  
  const { toast } = useToast()
  const [copied, setCopied] = React.useState(false)
  const [qrUrl, setQrUrl] = React.useState("")
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  // Trigger confetti on load
  React.useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#1F6B45", "#4ADE80", "#ffffff"],
    })
  }, [])

  // Generate QR Code on canvas and get data URL for download
  React.useEffect(() => {
    if (code && canvasRef.current) {
      const appUrl = window.location.origin || "http://localhost:3000"
      const referralLink = `${appUrl}?ref=${code}`

      QRCode.toCanvas(
        canvasRef.current,
        referralLink,
        {
          width: 250,
          margin: 2,
          color: {
            dark: "#1F6B45", // Primary green
            light: "#FFFFFF",
          },
        },
        (error) => {
          if (error) {
            console.error("QR Code generation error:", error)
          } else if (canvasRef.current) {
            setQrUrl(canvasRef.current.toDataURL("image/png"))
          }
        }
      )
    }
  }, [code])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast({
        type: "success",
        message: "Referral code copied to clipboard!",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Copy failed:", err)
      toast({
        type: "error",
        message: "Failed to copy code. Please copy it manually.",
      })
    }
  }

  const handleWhatsAppShare = () => {
    const appUrl = window.location.origin || "http://localhost:3000"
    const referralLink = `${appUrl}?ref=${code}`
    
    const shareText = `Hi!
I have been working out at Zoro Gym.
Use my referral code: ${code}

You will get ₹500 OFF on your membership.
After joining, just tell them my code.

Join here:
${referralLink}`

    const encodedText = encodeURIComponent(shareText)
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, "_blank")
  }

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-b from-background to-emerald-50/20 dark:to-emerald-950/5">
      {/* Header */}
      <header className="px-6 py-5 flex items-center border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-10">
        <Link href="/member" className="mr-4 p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="font-bold text-lg tracking-tight">Your Referral Code</span>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col justify-center px-4 py-8 max-w-md mx-auto w-full space-y-6">
        <Card className="shadow-xl premium-shadow border-emerald-500/20">
          <CardHeader className="text-center space-y-2 pb-2">
            <div className="mx-auto p-3 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 w-fit animate-bounce">
              <Award className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-extrabold text-primary">🎉 Welcome, {name}!</CardTitle>
            <CardDescription>
              Here is your permanent referral code. Share it with friends and earn rewards when they join!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Big Referral Code Display */}
            <div className="bg-muted/50 rounded-2xl p-5 border border-border flex flex-col items-center justify-center space-y-2 relative overflow-hidden">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Share Code
              </span>
              <span className="text-4xl font-extrabold tracking-wider text-foreground select-all">
                {code}
              </span>
              <div className="flex gap-2 w-full mt-4">
                <Button onClick={handleCopy} variant="outline" className="flex-1 rounded-xl">
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-emerald-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code
                    </>
                  )}
                </Button>
                <Button onClick={handleWhatsAppShare} className="flex-1 rounded-xl bg-[#25D366] hover:bg-[#20ba59] border-none text-white shadow-md">
                  <Share2 className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="flex flex-col items-center justify-center space-y-4 pt-4 border-t border-border">
              <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                <QrCode className="h-4 w-4" />
                Referral QR Code
              </span>
              <div className="bg-white p-4 rounded-2xl border border-border shadow-xs">
                <canvas ref={canvasRef} className="mx-auto" />
              </div>
              <p className="text-xs text-muted-foreground text-center max-w-xs">
                Friends can scan this QR code directly with their phone camera to pre-fill your code on their screen.
              </p>
              {qrUrl && (
                <a href={qrUrl} download={`ZoroGym_Referral_${code}.png`} className="w-full">
                  <Button variant="outline" className="w-full rounded-xl">
                    <Download className="h-4 w-4 mr-2" />
                    Download QR Code Image
                  </Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function MemberSuccessPage() {
  return (
    <React.Suspense fallback={
      <div className="flex flex-1 flex-col items-center justify-center p-20 space-y-4 min-h-screen">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Preparing sharing tools...</p>
      </div>
    }>
      <MemberSuccessContent />
    </React.Suspense>
  )
}
