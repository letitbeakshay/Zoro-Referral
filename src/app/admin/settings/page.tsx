// src/app/admin/settings/page.tsx
"use client"

import * as React from "react"
import { 
  Save, 
  Loader2, 
  QrCode, 
  Download, 
  Printer, 
  Paintbrush, 
  Settings as SettingsIcon,
  HelpCircle,
  Eye
} from "lucide-react"
import QRCode from "qrcode"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/toast"

export default function AdminSettingsPage() {
  const { toast } = useToast()
  
  // Settings Form state
  const [gymName, setGymName] = React.useState("Zoro Gym")
  const [phone, setPhone] = React.useState("+919999999999")
  const [email, setEmail] = React.useState("contact@zorogym.com")
  const [address, setAddress] = React.useState("123 Gym Street, Fitness City")

  // Standee settings
  const [standeeHeadline, setStandeeHeadline] = React.useState("Bring a Friend.")
  const [standeeOffer, setStandeeOffer] = React.useState("Both of You Save ₹500.")
  const [standeeDiscountAmount, setStandeeDiscountAmount] = React.useState("500")
  const [standeeTerms, setStandeeTerms] = React.useState("Valid on quarterly and annual memberships.")
  const [standeeWhatsappNumber, setStandeeWhatsappNumber] = React.useState("+919999999999")
  const [primaryColor, setPrimaryColor] = React.useState("#1F6B45")

  // Coupon / Rewards settings
  const [couponPrefix, setCouponPrefix] = React.useState("ZR")
  const [couponNumberLength, setCouponNumberLength] = React.useState(4)
  const [couponAutoGeneration, setCouponAutoGeneration] = React.useState(true)
  const [couponExpiryDays, setCouponExpiryDays] = React.useState(30)
  const [couponMaxReferrals, setCouponMaxReferrals] = React.useState(10)
  const [couponRewardAmount, setCouponRewardAmount] = React.useState("500")
  const [couponDiscountAmount, setCouponDiscountAmount] = React.useState("500")
  const [couponMinPlan, setCouponMinPlan] = React.useState("quarterly")
  const [referralTerms, setReferralTerms] = React.useState("T&C Apply. Reward eligible after 3 paid months.")
  const [privacyPolicy, setPrivacyPolicy] = React.useState("Your data is safe with us.")

  const [loading, setLoading] = React.useState(true)
  const [saveLoading, setSaveLoading] = React.useState(false)
  
  const [qrUrl, setQrUrl] = React.useState("")
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  // Fetch settings from API
  const fetchSettings = React.useCallback(async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        const s = data.settings
        if (s) {
          setGymName(s.gymName)
          setPhone(s.phone)
          setEmail(s.email)
          setAddress(s.address)
          setStandeeHeadline(s.standeeHeadline)
          setStandeeOffer(s.standeeOffer)
          setStandeeDiscountAmount(String(s.standeeDiscountAmount))
          setStandeeTerms(s.standeeTerms)
          setStandeeWhatsappNumber(s.standeeWhatsappNumber)
          setPrimaryColor(s.primaryColor)
          setCouponPrefix(s.couponPrefix)
          setCouponNumberLength(s.couponNumberLength)
          setCouponAutoGeneration(s.couponAutoGeneration)
          setCouponExpiryDays(s.couponExpiryDays)
          setCouponMaxReferrals(s.couponMaxReferrals)
          setCouponRewardAmount(String(s.couponRewardAmount))
          setCouponDiscountAmount(String(s.couponDiscountAmount))
          setCouponMinPlan(s.couponMinPlan)
          setReferralTerms(s.referralTerms)
          setPrivacyPolicy(s.privacyPolicy)
        }
      } else {
        toast({
          type: "error",
          message: "Failed to load gym settings.",
        })
      }
    } catch (err) {
      console.error(err)
      toast({
        type: "error",
        message: "An error occurred fetching settings.",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // Generate Standee QR code drawn on canvas
  React.useEffect(() => {
    if (!loading && canvasRef.current) {
      const appUrl = window.location.origin || "http://localhost:3000"
      
      QRCode.toCanvas(
        canvasRef.current,
        appUrl,
        {
          width: 300,
          margin: 2,
          color: {
            dark: primaryColor || "#1F6B45",
            light: "#FFFFFF",
          },
        },
        (error) => {
          if (error) {
            console.error("Standee QR code generation error:", error)
          } else if (canvasRef.current) {
            setQrUrl(canvasRef.current.toDataURL("image/png"))
          }
        }
      )
    }
  }, [loading, primaryColor])

  // Submit Settings Update
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveLoading(true)

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gymName,
          phone,
          email,
          address,
          standeeHeadline,
          standeeOffer,
          standeeDiscountAmount: parseFloat(standeeDiscountAmount),
          standeeTerms,
          standeeWhatsappNumber,
          primaryColor,
          couponPrefix,
          couponNumberLength: parseInt(String(couponNumberLength)),
          couponAutoGeneration,
          couponExpiryDays: parseInt(String(couponExpiryDays)),
          couponMaxReferrals: parseInt(String(couponMaxReferrals)),
          couponRewardAmount: parseFloat(couponRewardAmount),
          couponDiscountAmount: parseFloat(couponDiscountAmount),
          couponMinPlan,
          referralTerms,
          privacyPolicy,
        }),
      })

      if (response.ok) {
        toast({
          type: "success",
          message: "Gym parameters and campaign configurations saved successfully!",
        })
      } else {
        toast({
          type: "error",
          message: "Failed to update settings.",
        })
      }
    } catch (err) {
      console.error(err)
      toast({
        type: "error",
        message: "An error occurred during save operations.",
      })
    } finally {
      setSaveLoading(false)
    }
  }

  // Print Standee Trigger
  const handlePrintStandee = () => {
    const appUrl = window.location.origin || "http://localhost:3000"
    
    // Open a new print window and inject beautifully structured standee
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Standee - Zoro Gym</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap');
            body {
              font-family: 'Outfit', sans-serif;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background-color: #f8fafc;
            }
            .standee {
              width: 595px; /* A4 Ratio */
              height: 842px;
              background: white;
              border: 12px solid ${primaryColor};
              border-radius: 24px;
              box-sizing: border-box;
              padding: 40px;
              display: flex;
              flex-col;
              flex-direction: column;
              justify-content: space-between;
              align-items: center;
              text-align: center;
              position: relative;
              box-shadow: 0 10px 25px rgba(0,0,0,0.05);
            }
            .badge {
              background-color: ${primaryColor}20;
              color: ${primaryColor};
              padding: 8px 18px;
              border-radius: 50px;
              font-weight: 600;
              font-size: 14px;
              letter-spacing: 1px;
              text-transform: uppercase;
            }
            .headline {
              font-size: 42px;
              font-weight: 800;
              color: #0f172a;
              margin: 15px 0 5px 0;
              line-height: 1.1;
            }
            .offer {
              font-size: 26px;
              font-weight: 700;
              color: ${primaryColor};
              margin: 0;
            }
            .qr-box {
              border: 3px dashed ${primaryColor}40;
              padding: 15px;
              border-radius: 20px;
              background-color: #f8fafc;
            }
            .qr-image {
              width: 250px;
              height: 250px;
              display: block;
            }
            .cta {
              font-size: 18px;
              font-weight: 600;
              color: #475569;
              margin: 10px 0 0 0;
            }
            .gym-name {
              font-size: 22px;
              font-weight: 800;
              color: #0f172a;
            }
            .footer-info {
              font-size: 10px;
              color: #94a3b8;
              max-width: 320px;
              line-height: 1.4;
            }
          </style>
        </head>
        <body>
          <div class="standee">
            <div class="badge">Zoro Gym Referral</div>
            
            <div>
              <h1 class="headline">${standeeHeadline}</h1>
              <p class="offer">${standeeOffer}</p>
            </div>

            <div class="qr-box">
              <img class="qr-image" src="${qrUrl}" />
              <p class="cta">Scan to Get Started</p>
            </div>

            <div>
              <div class="gym-name">${gymName}</div>
              <p class="footer-info">${standeeTerms}<br>Link: ${appUrl}</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4 min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">Loading settings panel...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Campaign Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize Standee presentation, configure referral discount criteria, and download QR codes.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        <Tabs defaultValue="standee" className="w-full">
          <TabsList className="grid grid-cols-3 rounded-xl max-w-md">
            <TabsTrigger value="standee" className="rounded-lg">
              <Paintbrush className="h-4 w-4 mr-2" />
              Standee Settings
            </TabsTrigger>
            <TabsTrigger value="rules" className="rounded-lg">
              <SettingsIcon className="h-4 w-4 mr-2" />
              Coupon Rules
            </TabsTrigger>
            <TabsTrigger value="qr" className="rounded-lg">
              <QrCode className="h-4 w-4 mr-2" />
              QR & Print
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Standee Settings */}
          <TabsContent value="standee" className="mt-4">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">Reception Standee Content</CardTitle>
                <CardDescription>
                  Modify headlines, discounts, colors and terms shown on the reception standee.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold block">Gym Name</label>
                    <Input
                      value={gymName}
                      onChange={(e) => setGymName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold block">Standee Brand Color (Hex)</label>
                    <div className="flex gap-2">
                      <Input
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        placeholder="#1F6B45"
                        required
                      />
                      <div 
                        className="h-11 w-11 rounded-xl border border-border shrink-0 shadow-xs" 
                        style={{ backgroundColor: primaryColor }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold block">Standee Primary Headline</label>
                  <Input
                    value={standeeHeadline}
                    onChange={(e) => setStandeeHeadline(e.target.value)}
                    placeholder="e.g. Bring a Friend."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold block">Standee Offer / Sub-Headline</label>
                  <Input
                    value={standeeOffer}
                    onChange={(e) => setStandeeOffer(e.target.value)}
                    placeholder="e.g. Both of You Save ₹500."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold block">Standee WhatsApp Number</label>
                    <Input
                      value={standeeWhatsappNumber}
                      onChange={(e) => setStandeeWhatsappNumber(e.target.value)}
                      placeholder="e.g. +919999999999"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold block">Standee Discount Amount (₹)</label>
                    <Input
                      type="number"
                      value={standeeDiscountAmount}
                      onChange={(e) => setStandeeDiscountAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold block">Standee Terms & Conditions Summary</label>
                  <Input
                    value={standeeTerms}
                    onChange={(e) => setStandeeTerms(e.target.value)}
                    placeholder="e.g. Valid on quarterly and annual memberships."
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Coupon / Rewards Config */}
          <TabsContent value="rules" className="mt-4">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">Campaign Campaign Rules</CardTitle>
                <CardDescription>
                  Configure referral validation boundaries, prefixes, limits, and payout values.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold block">Referral Code Prefix</label>
                    <Input
                      value={couponPrefix}
                      onChange={(e) => setCouponPrefix(e.target.value.toUpperCase())}
                      className="uppercase font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold block">Code Sequence Number Length</label>
                    <Input
                      type="number"
                      value={couponNumberLength}
                      onChange={(e) => setCouponNumberLength(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold block">Min Payout Membership Plan</label>
                    <Select
                      value={couponMinPlan}
                      onChange={(e) => setCouponMinPlan(e.target.value)}
                    >
                      <option value="monthly">Monthly Plan</option>
                      <option value="quarterly">Quarterly Plan</option>
                      <option value="half_yearly">Half Yearly Plan</option>
                      <option value="yearly">Yearly Plan</option>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold block">Guest Discount Value (₹)</label>
                    <Input
                      type="number"
                      value={couponDiscountAmount}
                      onChange={(e) => setCouponDiscountAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold block">Member Reward Value (₹)</label>
                    <Input
                      type="number"
                      value={couponRewardAmount}
                      onChange={(e) => setCouponRewardAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold block">Max Referrals Per Member</label>
                    <Input
                      type="number"
                      value={couponMaxReferrals}
                      onChange={(e) => setCouponMaxReferrals(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 py-2">
                  <Checkbox
                    id="auto-generation"
                    checked={couponAutoGeneration}
                    onCheckedChange={(checked) => setCouponAutoGeneration(!!checked)}
                  />
                  <label htmlFor="auto-generation" className="text-sm font-semibold select-none cursor-pointer">
                    Enable Auto-generation of unique permanent codes on Member registration (Recommended)
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold block">Gym Support / General Contact Phone</label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold block">Gym Email Address</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold block">Global Referral Campaign Terms & Conditions</label>
                  <Input
                    value={referralTerms}
                    onChange={(e) => setReferralTerms(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Standee Print / Download QR */}
          <TabsContent value="qr" className="mt-4">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">Print Standee QR</CardTitle>
                <CardDescription>
                  Generate large print-ready Standee sheets or download the high-resolution QR Code image.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-10 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-border shadow-xs">
                  <canvas ref={canvasRef} />
                </div>
                
                <div className="text-center space-y-1 max-w-sm">
                  <p className="font-bold text-sm">Standee QR Code</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Points to your public landing page. Scanning this pre-fills the referral campaign context on a guest's browser.
                  </p>
                </div>

                <div className="flex gap-2 w-full max-w-xs">
                  {qrUrl && (
                    <a href={qrUrl} download={`ZoroGym_Standee_QR.png`} className="flex-1">
                      <Button type="button" variant="outline" className="w-full rounded-xl">
                        <Download className="h-4 w-4 mr-2" />
                        Download PNG
                      </Button>
                    </a>
                  )}
                  <Button 
                    type="button" 
                    onClick={handlePrintStandee}
                    className="flex-1 rounded-xl"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Standee
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Global Save Button */}
        <div className="flex justify-end pt-4 border-t border-border">
          <Button 
            type="submit" 
            disabled={saveLoading} 
            className="rounded-xl px-8 shadow-md"
          >
            {saveLoading ? (
              <>
                <Loader2 className="h-4.5 w-4.5 mr-2 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="h-4.5 w-4.5 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
