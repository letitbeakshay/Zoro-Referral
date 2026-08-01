// src/app/api/admin/members/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PUT: Edit Member Details
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, phone, email, membershipId } = body

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
    }

    // Check if phone is already taken by another member
    const conflictingMember = await prisma.member.findFirst({
      where: {
        phone,
        NOT: { id },
      },
    })

    if (conflictingMember) {
      return NextResponse.json({ error: 'A member with this phone number already exists' }, { status: 409 })
    }

    const updatedMember = await prisma.member.update({
      where: { id },
      data: {
        name,
        phone,
        email: email || null,
        membershipId: membershipId || null,
      },
    })

    // Log the audit
    await prisma.auditLog.create({
      data: {
        action: 'MEMBER_UPDATE',
        details: `Member details for ${name} (${updatedMember.referralCode}) updated`,
        performedBy: 'Admin',
      },
    })

    return NextResponse.json({ member: updatedMember }, { status: 200 })
  } catch (error: any) {
    console.error('Error updating member:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

// PATCH: Toggle Member Active/Inactive status
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { membershipStatus } = body

    if (!membershipStatus || !['active', 'inactive'].includes(membershipStatus)) {
      return NextResponse.json({ error: 'Valid status (active/inactive) is required' }, { status: 400 })
    }

    const updatedMember = await prisma.member.update({
      where: { id },
      data: {
        membershipStatus,
      },
    })

    // Log the audit
    await prisma.auditLog.create({
      data: {
        action: 'MEMBER_STATUS_TOGGLE',
        details: `Member status of ${updatedMember.name} (${updatedMember.referralCode}) set to ${membershipStatus}`,
        performedBy: 'Admin',
      },
    })

    return NextResponse.json({ member: updatedMember }, { status: 200 })
  } catch (error: any) {
    console.error('Error toggling member status:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
