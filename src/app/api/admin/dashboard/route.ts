// src/app/api/admin/dashboard/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // 1. Fetch totals in parallel
    const [
      totalMembers,
      totalReferrals,
      referralLeads,
      convertedMembers, // Visited / Joined / Month 1,2,3 / Issued
      pendingRewards,
      rewardsGiven,
      recentActivities,
      recentLeads
    ] = await Promise.all([
      prisma.member.count(),
      prisma.referral.count(),
      prisma.referral.count({ where: { status: 'lead' } }),
      prisma.referral.count({ 
        where: { 
          status: { 
            in: ['joined', 'paid_month_1', 'paid_month_2', 'paid_month_3', 'reward_eligible', 'reward_issued'] 
          } 
        } 
      }),
      prisma.referral.count({ where: { rewardStatus: 'eligible' } }),
      prisma.referral.count({ where: { rewardStatus: 'issued' } }),
      
      // Fetch last 6 audit logs
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),

      // Fetch last 5 recent leads
      prisma.referral.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          referrer: {
            select: { name: true, referralCode: true }
          }
        }
      })
    ])

    // 2. Compute conversion rate: (joined or further status / total referrals) * 100
    const conversionRate = totalReferrals > 0 
      ? Math.round((convertedMembers / totalReferrals) * 100) 
      : 0

    // 3. Compute monthly referrals (count in current calendar month)
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const monthlyReferrals = await prisma.referral.count({
      where: {
        createdAt: {
          gte: startOfMonth
        }
      }
    })

    return NextResponse.json({
      stats: {
        totalMembers,
        referralCodesGenerated: totalMembers, // Since 1 permanent code per member
        referralLeads,
        convertedMembers,
        pendingRewards,
        rewardsGiven,
        monthlyReferrals,
        conversionRate,
      },
      recentActivities,
      recentLeads,
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
