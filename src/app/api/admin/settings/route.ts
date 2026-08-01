// src/app/api/admin/settings/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Fetch current settings
export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: 'default' },
    })

    if (!settings) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 })
    }

    return NextResponse.json({ settings }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

// POST/PUT: Update settings
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Strip keys we don't want to overwrite or parse
    const { id, ...settingsData } = body

    const updatedSettings = await prisma.settings.upsert({
      where: { id: 'default' },
      update: settingsData,
      create: {
        id: 'default',
        ...settingsData,
      },
    })

    // Log the event
    await prisma.auditLog.create({
      data: {
        action: 'SETTINGS_UPDATE',
        details: 'Gym parameters and campaign settings updated by Admin',
        performedBy: 'Admin',
      },
    })

    return NextResponse.json({ settings: updatedSettings }, { status: 200 })
  } catch (error: any) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: Request) { return POST(request); }
