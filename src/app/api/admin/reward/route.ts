// src/app/api/admin/reward/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST: Issue a reward to a member
export async function POST(request: Request) {
  try {
    const { referralId, rewardType, rewardValue } = await request.json()

    if (!referralId || !rewardType) {
      return NextResponse.json({ error: 'Referral ID and reward type are required' }, { status: 400 })
    }

    // 1. Get referral details
    const referral = await prisma.referral.findUnique({
      where: { id: referralId },
      include: { referrer: true },
    })

    if (!referral) {
      return NextResponse.json({ error: 'Referral not found' }, { status: 404 })
    }

    if (referral.rewardStatus !== 'eligible') {
      return NextResponse.json({ error: 'This referral is not eligible for rewards yet.' }, { status: 400 })
    }

    // 2. Validate member is active
    if (referral.referrer.membershipStatus !== 'active') {
      return NextResponse.json({ error: 'Referrer membership is currently inactive. Cannot issue reward.' }, { status: 400 })
    }

    // Fetch active settings for the coupon/reward amount if rewardValue not passed
    let finalValue = rewardValue
    if (!finalValue) {
      const settings = await prisma.settings.findUnique({
        where: { id: 'default' },
      })
      finalValue = settings?.couponRewardAmount || 500.00
    }

    // 3. Start a database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create Reward record
      const reward = await tx.reward.create({
        data: {
          memberId: referral.referrerId,
          referralId: referral.id,
          rewardType,
          rewardValue: finalValue,
          issuedBy: 'Admin', // In production, retrieved from authenticated admin session
          status: 'issued',
        },
      })

      // Update Referral status to reward_issued & rewardStatus to issued
      const updatedReferral = await tx.referral.update({
        where: { id: referralId },
        data: {
          status: 'reward_issued',
          rewardStatus: 'issued',
          rewardType,
        },
      })

      // Log the audit
      await tx.auditLog.create({
        data: {
          action: 'REWARD_ISSUE',
          details: `Reward of type '${rewardType}' (value ₹${finalValue}) issued to ${referral.referrer.name} for referral of ${referral.customerName}`,
          performedBy: 'Admin',
        },
      })

      // Create notification
      await tx.notification.create({
        data: {
          type: 'reward_issued',
          title: 'Reward Issued',
          message: `Reward '${rewardType}' issued to ${referral.referrer.name} (${referral.referralCode}).`,
        },
      })

      return { reward, referral: updatedReferral }
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error('Error issuing reward:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
