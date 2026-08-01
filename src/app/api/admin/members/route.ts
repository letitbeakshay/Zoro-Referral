// src/app/api/admin/members/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: List all members (for admin directory)
export async function GET() {
  try {
    const members = await prisma.member.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { referrals: true }
        }
      }
    })

    return NextResponse.json({ members }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching members:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
