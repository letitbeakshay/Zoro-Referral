// src/app/api/notifications/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Fetch notifications
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const notifications = await prisma.notification.findMany({
      where: unreadOnly ? { read: false } : {},
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ notifications }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

// POST: Mark notification(s) as read
export async function POST(request: Request) {
  try {
    const { notificationId, markAll } = await request.json()

    if (markAll) {
      await prisma.notification.updateMany({
        where: { read: false },
        data: { read: true },
      })
      return NextResponse.json({ success: true, message: 'All notifications marked as read' }, { status: 200 })
    }

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 })
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    })

    return NextResponse.json({ notification: updated }, { status: 200 })
  } catch (error: any) {
    console.error('Error updating notification:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
