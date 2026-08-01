// src/app/api/referral/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { leadFormSchema } from '@/lib/validators'

// GET: Validate referral code and fetch campaign terms
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 })
    }

    const referralCode = code.toUpperCase().trim()

    // 1. Verify code exists and find member
    const member = await prisma.member.findUnique({
      where: { referralCode },
    })

    if (!member) {
      return NextResponse.json({ isValid: false, error: 'Invalid referral code.' }, { status: 404 })
    }

    // 2. Verify member is active
    if (member.membershipStatus !== 'active') {
      return NextResponse.json({ isValid: false, error: 'Referral code is inactive (referrer is not active).' }, { status: 400 })
    }

    // Fetch active settings for the offer amount
    const settings = await prisma.settings.findUnique({
      where: { id: 'default' },
    })

    return NextResponse.json({
      isValid: true,
      referrerName: member.name,
      discountAmount: settings?.couponDiscountAmount || 500,
      rewardAmount: settings?.couponRewardAmount || 500,
      minPlan: settings?.couponMinPlan || 'quarterly',
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error validating code:', error)
    return NextResponse.json({ isValid: false, error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

// POST: Submit a new customer referral lead
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate using Zod schema
    const validation = leadFormSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 })
    }

    const { referralCode, customerName, customerPhone, customerEmail, plan, preferredVisitDate } = validation.data

    // 1. Get and Validate Member (Referrer)
    const member = await prisma.member.findUnique({
      where: { referralCode },
    })

    if (!member) {
      return NextResponse.json({ error: 'Referral code does not exist.' }, { status: 400 })
    }

    if (member.membershipStatus !== 'active') {
      return NextResponse.json({ error: 'Referrer membership is not active.' }, { status: 400 })
    }

    // 2. Validate: Customer phone not already in Referrals (phone number can only be referred once)
    const existingReferral = await prisma.referral.findUnique({
      where: { customerPhone },
    })

    if (existingReferral) {
      return NextResponse.json({ error: 'This phone number has already been referred.' }, { status: 409 })
    }

    // 3. Validate: Customer phone cannot be the member's own phone number (no self-referral)
    if (member.phone === customerPhone) {
      return NextResponse.json({ error: 'You cannot refer yourself.' }, { status: 400 })
    }

    // 4. Save Referral lead
    const newReferral = await prisma.referral.create({
      data: {
        referrerId: member.id,
        referralCode,
        customerName,
        customerPhone,
        customerEmail,
        plan,
        status: 'lead',
        joinedDate: null,
      },
    })

    // Log the event
    await prisma.auditLog.create({
      data: {
        action: 'REFERRAL_CREATE',
        details: `Customer ${customerName} (${customerPhone}) referred by ${member.name} (${referralCode}) for ${plan} plan`,
        performedBy: 'System',
      },
    })

    // Create a notification
    await prisma.notification.create({
      data: {
        type: 'new_referral',
        title: 'New Referral Lead',
        message: `${customerName} was referred by ${member.name} (${referralCode}).`,
      },
    })

    return NextResponse.json({ referral: newReferral }, { status: 201 })
  } catch (error: any) {
    console.error('Error submitting referral lead:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
