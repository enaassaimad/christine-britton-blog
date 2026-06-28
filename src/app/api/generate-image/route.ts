import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import path from 'path'
import { writeFile, mkdir } from 'fs/promises'
import ZAI from 'z-ai-web-dev-sdk'

const SUPPORTED_SIZES = ['1024x1024', '768x1344', '864x1152', '1344x768', '1152x864', '1440x720', '720x1440']

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { prompt?: string; size?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const prompt = (body.prompt || '').trim()
  const size = SUPPORTED_SIZES.includes(body.size || '') ? (body.size as string) : '1344x768'

  if (!prompt) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
  if (prompt.length > 1000) return NextResponse.json({ error: 'Prompt is too long (max 1000 chars)' }, { status: 400 })

  try {
    const zai = await ZAI.create()
    const response = await zai.images.generations.create({ prompt, size })
    const base64 = response.data?.[0]?.base64
    if (!base64) return NextResponse.json({ error: 'Image generation returned no data' }, { status: 502 })

    const buffer = Buffer.from(base64, 'base64')
    const filename = `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, filename), buffer)

    const url = `/uploads/${filename}`
    await db.media.create({ data: { url, alt: prompt.slice(0, 200), type: 'image', caption: prompt.slice(0, 200) } })

    return NextResponse.json({ url, prompt, size })
  } catch (e: any) {
    const msg = e?.message || 'Image generation failed'
    if (/429|rate|too many/i.test(msg)) {
      return NextResponse.json({ error: 'The image service is busy right now — please wait a few seconds and try again.' }, { status: 429 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
