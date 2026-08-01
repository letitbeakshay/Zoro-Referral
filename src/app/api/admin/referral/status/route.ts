// src/app/api/admin/referral/status/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST/PATCH: Update referral status sequentially
export async function POST(request: Request) {
  try {
    const { referralId, status } = await request.json()

    if (!referralId || !status) {
      return NextResponse.json({ error: 'Referral ID and status are required' }, { status: 400 })
    }

    // 1. Get referral details
    const referral = await prisma.referral.findUnique({
      where: { id: referralId },
      include: { referrer: true },
    })

    if (!referral) {
      return NextResponse.json({ error: 'Referral not found' }, { status: 404 })
    }

    const previousStatus = referral.status
    let updatedRewardStatus = referral.rewardStatus

    // Check if transition triggers automated Reward Eligibility
    // When status transitions to paid_month_3, set rewardStatus to eligible
    if (status === 'paid_month_3') {
      updatedRewardStatus = 'eligible'
      
      // Check if we should trigger a system notification for the reward eligibility
      await prisma.notification.create({
        data: {
          type: 'reward_eligible',
          title: 'Reward Eligible!',
          message: `Member ${referral.referrer.name} (${referral.referralCode}) is eligible for a reward from referring ${referral.customerName}.`,
        },
      })
    }

    // 2. Perform the update
    const updatedReferral = await prisma.referral.update({
      where: { id: referralId },
      data: {
        status,
        rewardStatus: updatedRewardStatus,
        // Set joinedDate if transitioned to joined
        joinedDate: status === 'joined' && !referral.joinedDate ? new Date() : referral.joinedDate,
      },
    })

    // Log the event
    await prisma.auditLog.create({
      data: {
        action: 'REFERRAL_STATUS_CHANGE',
        details: `Referral status for ${referral.customerName} changed from ${previousStatus} to ${status}. Reward status: ${updatedRewardStatus}`,
        performedBy: 'Admin', // In production, retrieved from active session
      },
    })

    return NextResponse.json({ referral: updatedReferral }, { status: 200 })
  } catch (error: any) {
    console.error('Error updating status:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
export async function PUT(request: Request) { return POST(request); }
export async function PATCH(request: Request) { return POST(request); }
