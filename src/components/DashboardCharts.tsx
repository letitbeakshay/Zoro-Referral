// src/components/DashboardCharts.tsx
"use client"

import * as React from "react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Mock data representing recent growth and top performers
const growthData = [
  { month: "Feb", referrals: 8, signups: 6 },
  { month: "Mar", referrals: 15, signups: 10 },
  { month: "Apr", referrals: 22, signups: 18 },
  { month: "May", referrals: 30, signups: 25 },
  { month: "Jun", referrals: 45, signups: 38 },
  { month: "Jul", referrals: 58, signups: 48 },
]

const topReferrers = [
  { name: "Akshay K.", count: 12, code: "ZR1001" },
  { name: "Rahul S.", count: 8, code: "ZR1002" },
  { name: "Priya M.", count: 7, code: "ZR1005" },
  { name: "Arun P.", count: 5, code: "ZR1009" },
  { name: "Neha G.", count: 4, code: "ZR1012" },
]

export function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Referral Growth Area Chart */}
      <Card className="rounded-2xl lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base font-bold">Referral Growth & Signups</CardTitle>
          <CardDescription>Monthly trends of generated referrals vs. completed conversions</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={growthData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorReferrals" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1F6B45" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1F6B45" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
              <XAxis 
                dataKey="month" 
                stroke="#64748B" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#64748B" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: "12px", 
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.03)" 
                }}
              />
              <Area
                type="monotone"
                dataKey="referrals"
                stroke="#1F6B45"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorReferrals)"
                name="Referrals Code Generated"
              />
              <Area
                type="monotone"
                dataKey="signups"
                stroke="#22c55e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSignups)"
                name="Joined Converted Leads"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 2. Top Referrers Bar Chart */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-bold">Top Referrers</CardTitle>
          <CardDescription>Gym members driving the most referral traffic</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={topReferrers}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" opacity={0.5} />
              <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="#64748B" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                width={80}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: "12px", 
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.03)" 
                }}
              />
              <Bar dataKey="count" fill="#1F6B45" radius={[0, 6, 6, 0]} name="Successful Referrals">
                {topReferrers.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === 0 ? "#1F6B45" : index === 1 ? "#2c8458" : "#3ea16f"} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
