// src/app/api/member/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { memberFormSchema } from '@/lib/validators'

// GET: Lookup member by phone number
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const member = await prisma.member.findUnique({
      where: { phone: phone.trim() },
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    if (member.membershipStatus !== 'active') {
      return NextResponse.json({ error: 'Membership is inactive. Please contact the reception.' }, { status: 403 })
    }

    return NextResponse.json({ member }, { status: 200 })
  } catch (error: any) {
    console.error('Error looking up member:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

// POST: Create a new member (Admin action)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validation = memberFormSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 })
    }

    const { name, phone, email, membershipId } = validation.data

    // Check if phone number already exists
    const existingMember = await prisma.member.findUnique({
      where: { phone },
    })

    if (existingMember) {
      return NextResponse.json({ error: 'A member with this phone number already exists' }, { status: 409 })
    }

    // Generate unique sequential referral code starting at ZR1001
    // Find the latest member with a referral code matching ZR[0-9]+
    const lastMember = await prisma.member.findFirst({
      where: {
        referralCode: {
          startsWith: 'ZR',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    let nextSequence = 1001
    if (lastMember) {
      const match = lastMember.referralCode.match(/^ZR(\d+)$/)
      if (match) {
        nextSequence = parseInt(match[1]) + 1
      }
    }

    const referralCode = `ZR${nextSequence}`

    // Save member to database
    const newMember = await prisma.member.create({
      data: {
        name,
        phone,
        email: email || null,
        membershipId: membershipId || null,
        referralCode,
        membershipStatus: 'active',
      },
    })

    // Log the audit event
    await prisma.auditLog.create({
      data: {
        action: 'MEMBER_CREATE',
        details: `Member ${name} (${referralCode}) created with phone ${phone}`,
        performedBy: 'Admin', // In production, we get this from active admin session
      },
    })

    // Create a notification
    await prisma.notification.create({
      data: {
        type: 'new_member',
        title: 'New Member Joined',
        message: `${name} has been added. Referral code ${referralCode} generated.`,
      },
    })

    return NextResponse.json({ member: newMember }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating member:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
