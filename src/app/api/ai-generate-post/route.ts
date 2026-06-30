import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { calculateSEOScore } from '@/lib/seo-score'
import { slugify, excerptFromContent, estimateReadTime } from '@/lib/helpers'

interface GenerateBody {
  focusKeyword: string
  relatedKeywords: string[]
  topic?: string
  category?: string
  tone?: string
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: GenerateBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const focusKeyword = (body.focusKeyword || '').trim()
  if (!focusKeyword) return NextResponse.json({ error: 'Focus keyword is required' }, { status: 400 })

  const relatedKeywords = (body.relatedKeywords || []).filter((k) => k.trim())
  const topic = body.topic || focusKeyword
  const tone = body.tone || 'informative and engaging'

  // Fetch the API key and model from site settings
  const setting = await db.siteSetting.findUnique({ where: { id: 'singleton' } })
  const apiKey = setting?.aiApiKey || ''
  const model = setting?.aiModel || 'glm-5.2'

  if (!apiKey) {
    return NextResponse.json({ error: 'No AI API key configured. Go to Settings → AI and enter your GLM API key.' }, { status: 400 })
  }

  const systemPrompt = `You are an expert SEO content writer and editor for an art blog (Christine Britton — fluid art, resin art, drawing, doodle art, posca art, clay art). You write high-quality, original, AdSense-friendly articles that score 88%+ on SEO checks. You write in Markdown.`

  const userPrompt = `Write a comprehensive, SEO-optimized blog article with the following requirements:

**Focus keyword:** ${focusKeyword}
**Related keywords:** ${relatedKeywords.join(', ') || 'none'}
**Topic:** ${topic}
**Tone:** ${tone}

## SEO Requirements (MUST follow all):
1. Include the focus keyword "${focusKeyword}" in the TITLE (as an H1 at the very top using "# ").
2. Include the focus keyword "${focusKeyword}" in the FIRST PARAGRAPH (within the first 150 words).
3. Include the focus keyword "${focusKeyword}" in at least ONE H2 heading (## heading).
4. Use the focus keyword naturally 4-8 times throughout (density 0.5%-2.5%).
5. Include at least 2 of the related keywords naturally in the text.
6. Write at least 700 words of substantive content.
7. Include at least 2 H2 (##) headings and 1 H3 (###) heading.
8. Keep paragraphs short (under 120 words on average) for readability.
9. Include at least 3 EXTERNAL LINKS to authoritative sources (use real URLs like https://en.wikipedia.org/..., https://www.artsy.net/..., https://www.smithsonianmag.com/..., https://www.tate.org.uk/..., etc.). Format links as: [link text](https://example.com)
10. Include a "## Conclusion" or "## Final thoughts" section at the end.
11. Do NOT include any meta description, SEO score, or commentary — only the article markdown.
12. Do NOT wrap the output in code blocks.

## Table of Contents (REQUIRED):
Immediately AFTER the title and BEFORE the first paragraph, insert a table of contents in this exact HTML format:

<div class="table-of-contents">
<h2>Table of Contents</h2>
<ol>
<li><a href="#section-1">First Section Title</a></li>
<li><a href="#section-2">Second Section Title</a></li>
<li><a href="#section-3">Third Section Title</a></li>
</ol>
</div>

Then for each H2 heading in the article, add an id attribute matching the href, like: ## First Section Title {#section-1}
Use section-1, section-2, section-3 etc. as IDs, matching the order of the TOC entries.

## Content structure:
# [Engaging title with focus keyword]

<div class="table-of-contents">
<h2>Table of Contents</h2>
<ol>
<li><a href="#section-1">[First H2 title]</a></li>
<li><a href="#section-2">[Second H2 title]</a></li>
<li><a href="#section-3">[Third H2 title]</a></li>
</ol>
</div>

[Introductory paragraph that includes the focus keyword and hooks the reader]

## [First major section] {#section-1}
[Content with related keywords, external links to authoritative sources]

### [Subsection]
[Detailed content]

## [Second major section] {#section-2}
[More content with examples and external links]

## [Third major section or Conclusion] {#section-3}
[Summary paragraph with focus keyword]

Write the article now:`

  try {
    // Call GLM API directly via open.bigmodel.cn
    const glmResponse = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'assistant', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        thinking: { type: 'disabled' },
        max_tokens: 65536,
        temperature: 1.0,
      }),
    })

    if (!glmResponse.ok) {
      const errText = await glmResponse.text()
      let errMsg = `GLM API error (${glmResponse.status})`
      try {
        const errJson = JSON.parse(errText)
        errMsg = errJson.error?.message || errJson.error?.code || errMsg
      } catch {
        if (errText) errMsg = errText.slice(0, 200)
      }
      if (glmResponse.status === 401) errMsg = 'Invalid API key. Check Settings → AI.'
      if (glmResponse.status === 429) errMsg = 'GLM API rate limit reached. Please wait and try again.'
      return NextResponse.json({ error: errMsg }, { status: glmResponse.status })
    }

    const completion = await glmResponse.json()
    let articleContent = completion.choices?.[0]?.message?.content || ''

    if (!articleContent.trim()) {
      return NextResponse.json({ error: 'GLM returned empty content. Please try again.' }, { status: 502 })
    }

    // Clean up: remove code block wrappers if the model added them
    articleContent = articleContent.replace(/^```(?:markdown)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()

    // Extract title from the first H1
    const titleMatch = articleContent.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1].trim() : topic
    // Remove the H1 from the content (we render it separately in the post view)
    const contentWithoutH1 = articleContent.replace(/^#\s+.+\n?/m, '').trim()

    // Generate slug from title
    const slug = slugify(title)

    // Auto-generate excerpt
    const excerpt = excerptFromContent(contentWithoutH1, 155)

    // Generate meta description
    const metaDescription = excerpt

    // Calculate SEO score
    const seoResult = calculateSEOScore({
      title,
      content: contentWithoutH1,
      excerpt,
      metaDescription,
      slug,
      coverAlt: '',
      focusKeyword,
      relatedKeywords,
    })

    // Generate tags from keywords
    const tags = [focusKeyword, ...relatedKeywords].slice(0, 6).join(', ')

    // Build a suggested image prompt for the frontend to use
    const imagePrompt = `A vibrant, editorial-style illustration for an article about "${focusKeyword}". Art style: ${body.category || 'fluid art'}. Professional, high-quality, suitable for a blog cover image.`

    return NextResponse.json({
      title,
      slug,
      content: contentWithoutH1,
      excerpt,
      metaTitle: title,
      metaDescription,
      coverImage: null,
      coverAlt: '',
      tags,
      focusKeyword,
      relatedKeywords,
      seoScore: seoResult,
      readMinutes: estimateReadTime(contentWithoutH1),
      wordCount: contentWithoutH1.split(/\s+/).filter(Boolean).length,
      imageGenerated: false,
      imagePrompt,
    })
  } catch (e: any) {
    const msg = e?.message || 'AI generation failed'
    if (/429|rate|too many/i.test(msg)) {
      return NextResponse.json({ error: 'The AI service is busy right now — please wait a few seconds and try again.' }, { status: 429 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
