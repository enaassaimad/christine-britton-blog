/**
 * SEO Score Calculator
 * Analyzes article content against focus keywords and returns a detailed score.
 * Target: 88%+ to pass AdSense-friendly content quality.
 */

export interface SEOScoreResult {
  score: number // 0-100
  passed: boolean // true if >= 88
  checks: {
    label: string
    passed: boolean
    points: number
    maxPoints: number
    detail: string
  }[]
}

interface SEOInput {
  title: string
  content: string // markdown
  excerpt?: string
  metaTitle?: string
  metaDescription?: string
  slug?: string
  coverAlt?: string
  focusKeyword: string
  relatedKeywords?: string[]
}

export function calculateSEOScore(input: SEOInput): SEOScoreResult {
  const { title, content, excerpt, metaTitle, metaDescription, slug, coverAlt, focusKeyword, relatedKeywords } = input
  const fk = focusKeyword.toLowerCase().trim()
  const plainText = content.replace(/<[^>]*>/g, ' ').replace(/[#*`>_~]/g, '').replace(/\s+/g, ' ').trim().toLowerCase()
  const words = plainText.split(/\s+/).filter(Boolean)
  const wordCount = words.length

  const checks: SEOScoreResult['checks'] = []

  // 1. Focus keyword in title (10 pts)
  const fkInTitle = title.toLowerCase().includes(fk)
  checks.push({
    label: 'Focus keyword in title',
    passed: fkInTitle,
    points: fkInTitle ? 10 : 0,
    maxPoints: 10,
    detail: fkInTitle ? `Found "${focusKeyword}" in the title.` : `Add "${focusKeyword}" to the title.`,
  })

  // 2. Focus keyword in first paragraph (10 pts)
  const firstParaMatch = content.match(/^(?:#{1,6}\s.*?\n+)?([^#\n]+)/)
  const firstPara = (firstParaMatch ? firstParaMatch[1] : content.slice(0, 300)).toLowerCase()
  const fkInFirstPara = firstPara.includes(fk)
  checks.push({
    label: 'Focus keyword in first paragraph',
    passed: fkInFirstPara,
    points: fkInFirstPara ? 10 : 0,
    maxPoints: 10,
    detail: fkInFirstPara ? 'Found in the opening paragraph.' : 'Add the focus keyword within the first 150 words.',
  })

  // 3. Focus keyword in headings (10 pts)
  const headings = content.match(/^#{1,6}\s+.+$/gm) || []
  const fkInHeadings = headings.some((h) => h.toLowerCase().includes(fk))
  checks.push({
    label: 'Focus keyword in headings',
    passed: fkInHeadings,
    points: fkInHeadings ? 10 : 0,
    maxPoints: 10,
    detail: fkInHeadings ? `Found in ${headings.filter((h) => h.toLowerCase().includes(fk)).length} heading(s).` : 'Use the focus keyword in at least one H2/H3 heading.',
  })

  // 4. Focus keyword density 0.5%-2.5% (10 pts)
  const fkCount = (plainText.match(new RegExp(fk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
  const density = wordCount > 0 ? (fkCount / wordCount) * 100 : 0
  const densityOk = density >= 0.5 && density <= 2.5
  const densityPartial = density > 0 && density < 3.5
  checks.push({
    label: 'Focus keyword density (0.5%–2.5%)',
    passed: densityOk,
    points: densityOk ? 10 : densityPartial ? 5 : 0,
    maxPoints: 10,
    detail: `${fkCount} occurrences (${density.toFixed(2)}%). ${densityOk ? 'Ideal range.' : 'Aim for 0.5%–2.5%.'}`,
  })

  // 5. Related keywords present (10 pts)
  const related = (relatedKeywords || []).map((k) => k.toLowerCase().trim()).filter(Boolean)
  const relatedFound = related.filter((k) => plainText.includes(k))
  const relatedScore = related.length > 0 ? Math.round((relatedFound.length / related.length) * 10) : 0
  checks.push({
    label: 'Related keywords present',
    passed: related.length > 0 && relatedFound.length >= Math.ceil(related.length / 2),
    points: relatedScore,
    maxPoints: 10,
    detail: related.length === 0 ? 'No related keywords provided.' : `${relatedFound.length}/${related.length} found: ${relatedFound.join(', ') || 'none'}`,
  })

  // 6. Content length > 600 words (10 pts)
  const lengthOk = wordCount >= 600
  const lengthPartial = wordCount >= 300
  checks.push({
    label: 'Content length (600+ words)',
    passed: lengthOk,
    points: lengthOk ? 10 : lengthPartial ? 5 : 0,
    maxPoints: 10,
    detail: `${wordCount} words. ${lengthOk ? 'Great depth.' : 'Aim for 600+ words for better SEO.'}`,
  })

  // 7. Meta description with focus keyword (10 pts)
  const meta = (metaDescription || excerpt || '').toLowerCase()
  const metaOk = meta.length >= 120 && meta.length <= 160 && meta.includes(fk)
  const metaPartial = meta.length >= 80 && meta.includes(fk)
  checks.push({
    label: 'Meta description (120–160 chars) with focus keyword',
    passed: metaOk,
    points: metaOk ? 10 : metaPartial ? 5 : 0,
    maxPoints: 10,
    detail: `${meta.length} chars. ${metaOk ? 'Perfect length + keyword.' : meta.includes(fk) ? 'Has keyword but adjust length to 120–160.' : 'Add the focus keyword to the meta description.'}`,
  })

  // 8. External links present (10 pts)
  const externalLinks = (content.match(/https?:\/\/(?!localhost|127\.0\.0\.1)[^\s")\]]+/g) || []).length
  const linksOk = externalLinks >= 2
  const linksPartial = externalLinks >= 1
  checks.push({
    label: 'External links (2+)',
    passed: linksOk,
    points: linksOk ? 10 : linksPartial ? 5 : 0,
    maxPoints: 10,
    detail: `${externalLinks} external link(s). ${linksOk ? 'Good.' : 'Add 2+ authoritative external links.'}`,
  })

  // 9. Image alt text with focus keyword (5 pts)
  const altOk = !!coverAlt && coverAlt.toLowerCase().includes(fk)
  const altPartial = !!coverAlt && coverAlt.length > 10
  checks.push({
    label: 'Cover image alt text with focus keyword',
    passed: altOk,
    points: altOk ? 5 : altPartial ? 2 : 0,
    maxPoints: 5,
    detail: altOk ? 'Alt text includes focus keyword.' : coverAlt ? 'Alt text set but missing focus keyword.' : 'Add descriptive alt text with the focus keyword.',
  })

  // 10. Slug contains focus keyword (5 pts)
  const slugText = (slug || '').toLowerCase()
  const slugOk = slugText.includes(fk.replace(/\s+/g, '-'))
  checks.push({
    label: 'Slug contains focus keyword',
    passed: slugOk,
    points: slugOk ? 5 : 0,
    maxPoints: 5,
    detail: slugOk ? `Slug "/${slugText}" includes keyword.` : 'Add the focus keyword to the URL slug.',
  })

  // 11. Heading structure (H2 + H3) (5 pts)
  const h2Count = (content.match(/^##\s+.+$/gm) || []).length
  const h3Count = (content.match(/^###\s+.+$/gm) || []).length
  const structureOk = h2Count >= 2 && h3Count >= 1
  const structurePartial = h2Count >= 1
  checks.push({
    label: 'Heading structure (2+ H2, 1+ H3)',
    passed: structureOk,
    points: structureOk ? 5 : structurePartial ? 2 : 0,
    maxPoints: 5,
    detail: `${h2Count} H2, ${h3Count} H3. ${structureOk ? 'Well structured.' : 'Add more subheadings for readability.'}`,
  })

  // 12. Short paragraphs (readability) (5 pts)
  const paragraphs = content.split(/\n\n+/).filter((p) => p.trim() && !p.trim().startsWith('#'))
  const avgParaLen = paragraphs.length > 0 ? paragraphs.reduce((s, p) => s + p.split(/\s+/).length, 0) / paragraphs.length : 0
  const readOk = avgParaLen > 0 && avgParaLen <= 120
  const readPartial = avgParaLen > 0 && avgParaLen <= 180
  checks.push({
    label: 'Readable paragraphs (avg ≤ 120 words)',
    passed: readOk,
    points: readOk ? 5 : readPartial ? 2 : 0,
    maxPoints: 5,
    detail: `Avg ${Math.round(avgParaLen)} words/paragraph. ${readOk ? 'Easy to read.' : 'Break up long paragraphs.'}`,
  })

  const totalPoints = checks.reduce((s, c) => s + c.points, 0)
  const maxTotal = checks.reduce((s, c) => s + c.maxPoints, 0)
  const score = Math.round((totalPoints / maxTotal) * 100)

  return {
    score,
    passed: score >= 88,
    checks,
  }
}
