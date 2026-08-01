// src/app/admin/referrals/page.tsx
"use client"

import * as React from "react"
import { 
  Search, 
  Clock, 
  Gift, 
  ArrowRight, 
  Loader2, 
  Filter, 
  Calendar, 
  Phone,
  Mail,
  Dumbbell,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  FileSpreadsheet
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/toast"

interface Referrer {
  name: string
  phone: string
  membershipStatus: string
}

interface Referral {
  id: string
  referrerId: string
  referralCode: string
  customerName: string
  customerPhone: string
  customerEmail: string
  plan: string
  status: string
  joinedDate: string | null
  rewardStatus: string
  rewardType: string | null
  createdAt: string
  referrer: Referrer
}

const STATUS_SEQUENCE = [
  "lead",
  "visited",
  "joined",
  "paid_month_1",
  "paid_month_2",
  "paid_month_3",
  "reward_eligible",
  "reward_issued"
]

const STATUS_LABELS: Record<string, string> = {
  lead: "Lead",
  visited: "Visited",
  joined: "Joined",
  paid_month_1: "Paid Month 1",
  paid_month_2: "Paid Month 2",
  paid_month_3: "Paid Month 3",
  reward_eligible: "Reward Eligible",
  reward_issued: "Reward Issued"
}

export default function AdminReferralsPage() {
  const { toast } = useToast()
  const [referrals, setReferrals] = React.useState<Referral[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")

  // Reward Modal States
  const [isRewardOpen, setIsRewardOpen] = React.useState(false)
  const [selectedReferral, setSelectedReferral] = React.useState<Referral | null>(null)
  const [rewardType, setRewardType] = React.useState("extension") // extension or wallet
  const [rewardValue, setRewardValue] = React.useState("500")
  const [actionLoading, setActionLoading] = React.useState(false)

  const fetchReferrals = React.useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/referrals')
      if (response.ok) {
        const data = await response.json()
        setReferrals(data.referrals || [])
      } else {
        toast({
          type: "error",
          message: "Failed to load referrals list.",
        })
      }
    } catch (err) {
      console.error(err)
      toast({
        type: "error",
        message: "An error occurred fetching referrals.",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    fetchReferrals()
  }, [fetchReferrals])

  const handleExportCSV = () => {
    if (referrals.length === 0) return

    const headers = [
      "Referrer Name",
      "Referral Code",
      "Customer Name",
      "Customer Phone",
      "Customer Email",
      "Plan",
      "Status",
      "Reward Status",
      "Reward Type",
      "Registered Date"
    ]
    
    const rows = filteredReferrals.map(r => [
      r.referrer.name,
      r.referralCode,
      r.customerName,
      r.customerPhone,
      r.customerEmail,
      r.plan,
      r.status,
      r.rewardStatus,
      r.rewardType || "",
      new Date(r.createdAt).toLocaleDateString()
    ])

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `ZoroGym_Referrals_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      type: "success",
      message: "Exported referrals pipeline successfully.",
    })
  }

  // Advance referral status to the next step
  const handleAdvanceStatus = async (referral: Referral) => {
    const currentIndex = STATUS_SEQUENCE.indexOf(referral.status)
    if (currentIndex === -1 || currentIndex >= STATUS_SEQUENCE.length - 1) return

    // Calculate next status
    let nextStatus = STATUS_SEQUENCE[currentIndex + 1]
    
    // Skip 'reward_eligible' status and jump straight to 'reward_eligible' if status is 'paid_month_3'
    if (referral.status === 'paid_month_3') {
      nextStatus = 'reward_eligible'
    }

    try {
      const response = await fetch('/api/admin/referral/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referralId: referral.id,
          status: nextStatus,
        }),
      })

      if (response.ok) {
        toast({
          type: "success",
          message: `Referral progressed to ${STATUS_LABELS[nextStatus]}`,
        })
        fetchReferrals()
      } else {
        const data = await response.json()
        toast({
          type: "error",
          message: data.error || "Failed to update referral status.",
        })
      }
    } catch (err) {
      console.error(err)
      toast({
        type: "error",
        message: "An error occurred updating status.",
      })
    }
  }

  // Issue reward submit handler
  const handleIssueRewardSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReferral) return

    setActionLoading(true)
    try {
      const response = await fetch('/api/admin/reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referralId: selectedReferral.id,
          rewardType,
          rewardValue: parseFloat(rewardValue),
        }),
      })

      if (response.ok) {
        toast({
          type: "success",
          message: `Reward successfully issued to ${selectedReferral.referrer.name}!`,
        })
        setIsRewardOpen(false)
        fetchReferrals()
      } else {
        const data = await response.json()
        toast({
          type: "error",
          message: data.error || "Failed to issue reward.",
        })
      }
    } catch (err) {
      console.error(err)
      toast({
        type: "error",
        message: "Network error occurred.",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const openRewardModal = (referral: Referral) => {
    setSelectedReferral(referral)
    setRewardType("extension")
    setRewardValue("500")
    setIsRewardOpen(true)
  }

  // Filter list
  const filteredReferrals = referrals.filter((r) => {
    const matchesSearch = 
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.customerPhone.includes(search) ||
      r.referralCode.toLowerCase().includes(search.toLowerCase()) ||
      r.referrer.name.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = 
      statusFilter === "all" || r.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Helper: check if status can be progressed
  const canProgress = (status: string) => {
    return status !== 'reward_issued' && status !== 'reward_eligible'
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Referrals & Conversions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor your referral funnel, advance lead billing statuses, and issue member rewards.
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <Button onClick={handleExportCSV} variant="outline" className="rounded-xl shrink-0 w-full sm:w-auto">
            <FileSpreadsheet className="h-4.5 w-4.5 mr-2" />
            CSV Export
          </Button>
        </div>
      </div>

      {/* Filter Options */}
      <Card className="rounded-2xl">
        <CardContent className="pt-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 opacity-50" />
            <Input
              placeholder="Search by customer name, referrer name, phone or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          <div className="flex gap-2 min-w-[200px]">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl"
            >
              <option value="all">All Referrals</option>
              <option value="lead">Leads</option>
              <option value="visited">Visited</option>
              <option value="joined">Joined</option>
              <option value="paid_month_3">Paid Month 3</option>
              <option value="reward_eligible">Reward Eligible</option>
              <option value="reward_issued">Reward Issued</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading referrals pipeline...</p>
        </div>
      ) : filteredReferrals.length === 0 ? (
        <Card className="rounded-2xl p-12 text-center text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto opacity-35 mb-3" />
          <p className="font-bold text-lg text-foreground">No referrals found</p>
          <p className="text-sm mt-1">Guest referrals or leads are not recorded yet.</p>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Referrer</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead>Rewards</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReferrals.map((referral) => {
                  const currentIndex = STATUS_SEQUENCE.indexOf(referral.status)
                  const hasActiveReferrer = referral.referrer.membershipStatus === 'active'

                  return (
                    <TableRow key={referral.id}>
                      <TableCell>
                        <p className="font-bold text-foreground">{referral.customerName}</p>
                        <p className="text-xs text-muted-foreground">{referral.customerPhone}</p>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">{referral.customerEmail}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-foreground">{referral.referrer.name}</p>
                        <span className="inline-flex px-2 py-0.5 bg-muted rounded-md text-[10px] font-mono text-muted-foreground">
                          {referral.referralCode}
                        </span>
                      </TableCell>
                      <TableCell className="capitalize text-xs font-semibold">{referral.plan}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          referral.status === 'reward_issued'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : referral.status === 'reward_eligible'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-emerald-300 animate-pulse'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {STATUS_LABELS[referral.status]}
                        </span>
                      </TableCell>
                      <TableCell>
                        {referral.rewardStatus === 'eligible' ? (
                          <span className="inline-flex items-center text-xs font-extrabold text-amber-600 dark:text-amber-400 gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            Eligible
                          </span>
                        ) : referral.rewardStatus === 'issued' ? (
                          <span className="inline-flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Issued ({referral.rewardType})
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!hasActiveReferrer ? (
                          <span className="text-[10px] text-rose-500 font-semibold flex items-center justify-end gap-1" title="Referrer is disabled, cannot award rewards.">
                            <AlertCircle className="h-3 w-3" /> Inactive Referrer
                          </span>
                        ) : referral.rewardStatus === 'eligible' || referral.status === 'reward_eligible' ? (
                          <Button 
                            onClick={() => openRewardModal(referral)} 
                            size="sm"
                            className="rounded-lg h-9 font-bold bg-amber-500 text-white hover:bg-amber-600 shadow-sm"
                          >
                            <Gift className="h-4 w-4 mr-1.5" />
                            Issue Reward
                          </Button>
                        ) : canProgress(referral.status) ? (
                          <Button 
                            onClick={() => handleAdvanceStatus(referral)} 
                            variant="outline"
                            size="sm"
                            className="rounded-lg h-9 text-xs"
                          >
                            Progress
                            <ArrowRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground font-medium">Completed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card List View */}
          <div className="grid gap-4 md:hidden">
            {filteredReferrals.map((referral) => {
              const hasActiveReferrer = referral.referrer.membershipStatus === 'active'
              
              return (
                <Card key={referral.id} className="rounded-2xl p-5 border border-border">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-base text-foreground leading-none">{referral.customerName}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Referred by {referral.referrer.name} ({referral.referralCode})</p>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      referral.status === 'reward_issued'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : referral.status === 'reward_eligible'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-emerald-300'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {STATUS_LABELS[referral.status]}
                    </span>
                  </div>

                  {/* Progressive Timeline Visual representation on mobile */}
                  <div className="mt-4 bg-muted/40 rounded-xl p-3.5 text-xs space-y-1.5 border border-border/50">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-medium">Customer Phone:</span>
                      <span className="font-semibold text-foreground">{referral.customerPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-medium">Interested Plan:</span>
                      <span className="font-semibold text-foreground capitalize">{referral.plan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-medium">Reward Status:</span>
                      <span>
                        {referral.rewardStatus === 'eligible' ? (
                          <span className="text-amber-600 dark:text-amber-400 font-extrabold flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Eligible
                          </span>
                        ) : referral.rewardStatus === 'issued' ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Issued ({referral.rewardType})
                          </span>
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="mt-4 flex gap-2 w-full pt-1">
                    {!hasActiveReferrer ? (
                      <div className="w-full text-center text-xs text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/20 py-2.5 rounded-xl border border-rose-100 dark:border-rose-900/30 flex items-center justify-center gap-1">
                        <AlertCircle className="h-4 w-4 shrink-0" /> Referrer Account Disabled
                      </div>
                    ) : referral.rewardStatus === 'eligible' || referral.status === 'reward_eligible' ? (
                      <Button 
                        onClick={() => openRewardModal(referral)} 
                        className="w-full rounded-xl bg-amber-500 text-white hover:bg-amber-600 font-bold shadow-sm"
                      >
                        <Gift className="h-4 w-4 mr-2" />
                        Issue Member Reward
                      </Button>
                    ) : canProgress(referral.status) ? (
                      <Button 
                        onClick={() => handleAdvanceStatus(referral)} 
                        variant="outline"
                        className="w-full rounded-xl"
                      >
                        Progress Timeline
                        <ArrowRight className="h-4 w-4 ml-1.5" />
                      </Button>
                    ) : (
                      <Button variant="ghost" disabled className="w-full rounded-xl text-xs">
                        Referral Pipeline Finished
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}

      {/* Modal: Issue Reward */}
      <Dialog open={isRewardOpen} onOpenChange={(open) => { setIsRewardOpen(open); if(!open) setSelectedReferral(null); }}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle>Issue Referral Reward</DialogTitle>
            <DialogDescription>
              A referred customer has completed 3 paid months! Choose the reward payout for <strong>{selectedReferral?.referrer.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleIssueRewardSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label htmlFor="reward-type" className="text-xs font-bold block">
                Select Reward Type
              </label>
              <Select
                id="reward-type"
                value={rewardType}
                onChange={(e) => setRewardType(e.target.value)}
                disabled={actionLoading}
              >
                <option value="extension">1 Month Membership Extension</option>
                <option value="wallet">₹500 Wallet Credit</option>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="reward-value" className="text-xs font-bold block">
                Reward Value (₹)
              </label>
              <Input
                id="reward-value"
                type="number"
                value={rewardValue}
                onChange={(e) => setRewardValue(e.target.value)}
                required
                disabled={actionLoading}
              />
            </div>

            <DialogFooter className="mt-6 flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsRewardOpen(false)}
                disabled={actionLoading}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 rounded-xl" disabled={actionLoading}>
                {actionLoading ? "Processing..." : "Reward Issued"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
