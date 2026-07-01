import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const setting = await db.siteSetting.findUnique({ where: { id: 'singleton' } })
  if (!setting) {
    // create default singleton
    return NextResponse.json({ setting: await db.siteSetting.create({ data: { id: 'singleton' } }) })
  }
  return NextResponse.json({ setting })
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const allowed = [
    'siteName', 'tagline', 'description', 'logoText', 'logoUrl', 'faviconUrl',
    'primaryColor', 'accentColor',
    'email', 'phone', 'location',
    'twitter', 'instagram', 'facebook', 'linkedin', 'pinterest', 'youtube',
    'aboutTitle', 'aboutContent', 'aboutImage',
    'adsenseClient', 'adsenseSlotHeader', 'adsenseSlotInArticle', 'adsenseSlotSidebar', 'adsenseSlotFooter', 'adsenseSlotInContent',
    'adsEnabled',
    'newsletterTitle', 'newsletterText',
    'footerText',
    'aiApiKey', 'aiModel',
    'theme',
  ]
  const data: any = {}
  for (const k of allowed) if (k in body) data[k] = body[k]
  const setting = await db.siteSetting.upsert({
    where: { id: 'singleton' },
    update: data,
    create: { id: 'singleton', ...data },
  })
  return NextResponse.json({ setting })
}
