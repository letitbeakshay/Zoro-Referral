// src/app/api/admin/referrals/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: List all referrals
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Construct filter conditions
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search } },
        { referralCode: { contains: search, mode: 'insensitive' } },
        {
          referrer: {
            name: { contains: search, mode: 'insensitive' }
          }
        }
      ]
    }

    const referrals = await prisma.referral.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        referrer: {
          select: { name: true, phone: true, membershipStatus: true }
        }
      }
    })

    return NextResponse.json({ referrals }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching referrals:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
