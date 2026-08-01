// src/app/admin/dashboard/page.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Users, 
  Ticket, 
  UserCheck, 
  Clock, 
  Gift, 
  TrendingUp, 
  Loader2, 
  Activity,
  ArrowRight,
  Plus,
  Dumbbell
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { DashboardCharts } from "@/components/DashboardCharts"

interface Stats {
  totalMembers: number
  referralCodesGenerated: number
  referralLeads: number
  convertedMembers: number
  pendingRewards: number
  rewardsGiven: number
  monthlyReferrals: number
  conversionRate: number
}

interface ActivityLog {
  id: string
  action: string
  details: string
  performedBy: string
  createdAt: string
}

interface RecentLead {
  id: string
  customerName: string
  customerPhone: string
  plan: string
  status: string
  createdAt: string
  referrer: {
    name: string
    referralCode: string
  }
}

export default function AdminDashboardPage() {
  const { toast } = useToast()
  const [stats, setStats] = React.useState<Stats | null>(null)
  const [activities, setActivities] = React.useState<ActivityLog[]>([])
  const [recentLeads, setRecentLeads] = React.useState<RecentLead[]>([])
  const [loading, setLoading] = React.useState(true)

  const fetchDashboardData = React.useCallback(async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setActivities(data.recentActivities || [])
        setRecentLeads(data.recentLeads || [])
      } else {
        toast({
          type: "error",
          message: "Failed to load dashboard statistics.",
        })
      }
    } catch (err) {
      console.error(err)
      toast({
        type: "error",
        message: "An error occurred fetching dashboard metrics.",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4 min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">Loading dashboard overview...</p>
      </div>
    )
  }

  // Format activity action names to readable sentences
  const formatAction = (action: string) => {
    return action
      .replace(/_/g, " ")
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const kpis = [
    { 
      title: "Total Members", 
      value: stats?.totalMembers || 0, 
      desc: "Unique registered accounts",
      icon: Users,
      color: "text-[#1F6B45] dark:text-emerald-400 bg-[#EAF8F2] dark:bg-emerald-950/40"
    },
    { 
      title: "Referral Leads", 
      value: stats?.referralLeads || 0, 
      desc: "Guest registrations in queue",
      icon: Ticket,
      color: "text-[#1F6B45] dark:text-emerald-400 bg-[#EAF8F2] dark:bg-emerald-950/40"
    },
    { 
      title: "Converted Members", 
      value: stats?.convertedMembers || 0, 
      desc: "Leads who joined the gym",
      icon: UserCheck,
      color: "text-[#1F6B45] dark:text-emerald-400 bg-[#EAF8F2] dark:bg-emerald-950/40"
    },
    { 
      title: "Conversion Rate", 
      value: `${stats?.conversionRate || 0}%`, 
      desc: "Ratio of leads converting",
      icon: TrendingUp,
      color: "text-[#1F6B45] dark:text-emerald-400 bg-[#EAF8F2] dark:bg-emerald-950/40"
    },
    { 
      title: "Pending Rewards", 
      value: stats?.pendingRewards || 0, 
      desc: "Awaiting admin selection",
      icon: Clock,
      color: "text-[#1F6B45] dark:text-emerald-400 bg-[#EAF8F2] dark:bg-emerald-950/40"
    },
    { 
      title: "Rewards Given", 
      value: stats?.rewardsGiven || 0, 
      desc: "Extensions and credits issued",
      icon: Gift,
      color: "text-[#1F6B45] dark:text-emerald-400 bg-[#EAF8F2] dark:bg-emerald-950/40"
    },
  ]

  return (
    <div className="space-y-8 pb-10">
      {/* Banner Card */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-r from-[#1F6B45] to-emerald-800 text-white p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/5 blur-xl"></div>
        <div className="absolute bottom-0 left-1/3 -mb-6 h-24 w-24 rounded-full bg-white/5 blur-lg"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight">Referral Management Console</h1>
            <p className="text-emerald-100 text-sm max-w-md font-medium leading-relaxed">
              Track gym registrations, evaluate referral program yields, and manage campaign settings.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link href="/admin/members" className="w-full sm:w-auto">
              <Button className="bg-white hover:bg-emerald-50 text-[#1F6B45] border-none rounded-xl font-bold px-5 h-11 shrink-0 w-full">
                <Plus className="h-4.5 w-4.5 mr-2" />
                Add Gym Member
              </Button>
            </Link>
            <Link href="/admin/referrals" className="w-full sm:w-auto">
              <Button variant="ghost" className="bg-transparent border border-white/35 hover:bg-white/10 text-white hover:text-white hover:border-white rounded-xl px-5 h-11 shrink-0 w-full">
                Process Leads
                <ArrowRight className="h-4.5 w-4.5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.title} className="rounded-2xl border border-border/80">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1.5 min-w-0">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider truncate">{kpi.title}</p>
                  <p className="text-3xl font-extrabold tracking-tight text-foreground">{kpi.value}</p>
                  <p className="text-[10px] text-muted-foreground leading-none">{kpi.desc}</p>
                </div>
                <div className={`p-4 rounded-2xl shrink-0 ${kpi.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Analytics Charts */}
      <DashboardCharts />

      {/* Grid: Leads and Audit Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Referral Leads */}
        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Recent Signups</CardTitle>
              <CardDescription>Latest guest leads referred to Zoro Gym</CardDescription>
            </div>
            <Link href="/admin/referrals">
              <Button variant="ghost" size="sm" className="rounded-lg text-primary text-xs hover:text-emerald-700">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentLeads.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                No referral leads registered yet.
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                    <div className="space-y-1 min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">{lead.customerName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        Referred by {lead.referrer.name} ({lead.referrer.referralCode})
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        lead.status === 'lead'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                      }`}>
                        {lead.status}
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audit Log Activities Timeline */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              System Audit Registry
            </CardTitle>
            <CardDescription>Timeline of actions logged in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                No activity logs recorded yet.
              </div>
            ) : (
              <div className="relative border-l border-border pl-5 ml-2.5 space-y-5">
                {activities.map((activity) => (
                  <div key={activity.id} className="relative">
                    {/* Circle marker */}
                    <span className="absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background flex items-center justify-center"></span>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-xs font-bold text-foreground">
                          {formatAction(activity.action)}
                        </p>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {activity.details}
                      </p>
                      <p className="text-[10px] text-muted-foreground opacity-85">
                        Action performed by: <span className="font-semibold">{activity.performedBy}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
