/**
 * Combined seed script — populates the entire database for Vercel Postgres.
 * Run: bun run scripts/seed-all.ts
 * 
 * Prerequisites:
 *   1. Set DATABASE_URL in .env to your Postgres connection string
 *   2. Run: bun run db:push  (creates tables)
 *   3. Run: bun run scripts/seed-all.ts  (populates data)
 */
import { db } from '../src/lib/db'
import { hashPassword } from '../src/lib/auth'

async function main() {
  console.log('🌱 Seeding database...\n')

  // ===== SITE SETTINGS =====
  await db.siteSetting.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      siteName: 'Christine Britton',
      tagline: 'Fluid art, resin art & creative drawing tutorials',
      description: 'Fluid art, resin art, doodle drawing and creative tutorials from a lifelong artist on the West coast of Scotland.',
      logoText: 'Christine Britton',
      primaryColor: '#b45309',
      accentColor: '#9a3412',
      email: 'hello@christinebritton.com',
      location: 'West coast of Scotland',
      twitter: 'fluidartpaint',
      facebook: 'fluidartcommunity',
      instagram: 'christinebrittonart',
      pinterest: 'christinebrittonart',
      aboutTitle: 'About Christine',
      aboutContent: 'As a child of the 60\'s I experienced many opportunities and freedoms to explore my world. I found myself engrossed in painting and sculpture and was thrilled when people wanted to purchase my creations. Following graduation I began teaching and real life arrived. Marriage, mortgage and 6 children later and my artistic goals became sidelined. My zest for learning new ways to express my creativity is alive and kicking! From pillows, blooms, dutch pours, swiping, embellishing and trying new recipes, this art form is exciting and engaging.',
      aboutImage: '/uploads/about.jpg',
      adsenseClient: 'ca-pub-0000000000000000',
      adsenseSlotHeader: '0000000000',
      adsenseSlotInArticle: '0000000001',
      adsenseSlotSidebar: '0000000002',
      adsenseSlotFooter: '0000000003',
      adsEnabled: true,
      newsletterTitle: 'The Creative Letter',
      newsletterText: 'Weekly fluid art techniques, drawing prompts and step-by-step tutorials — straight to your inbox. No spam, ever.',
      footerText: '© 2025 Christine Britton • All rights reserved',
      aiApiKey: '',
      aiModel: 'glm-5.2',
      theme: 'art',
    },
  })
  console.log('✅ Site settings')

  // ===== ADMIN USER =====
  const existingUser = await db.user.findUnique({ where: { email: 'admin@christinebritton.com' } })
  if (!existingUser) {
    await db.user.create({
      data: {
        email: 'admin@christinebritton.com',
        name: 'Christine Britton',
        password: hashPassword('admin123'),
        role: 'ADMIN',
        bio: 'Lifelong artist on the West coast of Scotland. Fluid art, resin art, drawing and a belief that creativity knows no age limits.',
        avatar: '/uploads/author.jpg',
      },
    })
  }
  const admin = await db.user.findUnique({ where: { email: 'admin@christinebritton.com' } })
  console.log('✅ Admin user (admin@christinebritton.com / admin123)')

  // ===== CATEGORIES =====
  const cats = [
    { name: 'Fluid Art', description: 'Acrylic pouring, dutch pours, blooms and swiping — the mesmerising world of fluid art.', color: '#0d7d6e', icon: 'Droplet' },
    { name: 'Resin Art', description: 'Resin and epoxy techniques, geode coasters, ocean art and glossy finishes.', color: '#0e7490', icon: 'Gem' },
    { name: 'Drawing', description: 'Pencil art, shading techniques, sketches and realistic drawing guides.', color: '#854d0e', icon: 'Pencil' },
    { name: 'Doodle Art', description: 'Zentangle, doodle journals, name doodles and easy drawing ideas for beginners.', color: '#9333ea', icon: 'Sparkles' },
    { name: 'Posca Art', description: 'Vibrant posca marker techniques, canvas art, flowers and scenic landscapes.', color: '#be185d', icon: 'PaintBucket' },
    { name: 'Clay Art', description: 'Polymer clay, air dry clay, cardboard sculpture and handmade creations.', color: '#b45309', icon: 'Brush' },
    { name: 'Art Culture', description: 'Famous artists, history of art and the movements that shaped creative expression.', color: '#713f12', icon: 'BookOpen' },
  ]
  const categoryMap: Record<string, { id: string }> = {}
  for (const c of cats) {
    const slug = c.name.toLowerCase().replace(/[^a-z]+/g, '-')
    const cat = await db.category.upsert({
      where: { slug },
      update: { description: c.description, color: c.color, icon: c.icon },
      create: { name: c.name, slug, description: c.description, color: c.color, icon: c.icon },
    })
    categoryMap[c.name] = { id: cat.id }
  }
  console.log(`✅ ${cats.length} categories`)

  // ===== POSTS =====
  const posts = [
    {
      title: 'What Is Fluid Art Painting?',
      slug: 'what-is-fluid-art-painting',
      category: 'Fluid Art',
      excerpt: 'Fluid art, or acrylic pouring, is a delightful blend of science and creativity where liquid acrylics are poured onto canvas to make stunning abstract patterns.',
      coverImage: '/uploads/post-fluid.jpg',
      coverAlt: 'A colourful acrylic pour painting with swirling cells',
      tags: 'fluid art,acrylic pouring,abstract art,beginners',
      featured: true, trending: true,
      content: `<div class="table-of-contents"><h2>Table of Contents</h2><ol><li><a href="#section-1">Definition and Origins</a></li><li><a href="#section-2">Techniques and Methods</a></li><li><a href="#section-3">Why Fluid Art Is So Popular</a></li></ol></div>

## A delightful blend of science and creativity

Fluid art painting, also known as **acrylic pouring**, is a delightful blend of science and creativity where artists pour liquid acrylics onto canvases to make stunning abstract patterns. For more on the history, see [Wikipedia's acrylic pouring article](https://en.wikipedia.org/wiki/Acrylic_painting).

## Definition and Origins {#section-1}

Fluid art painting, commonly known as acrylic pouring, is a contemporary art technique that involves pouring acrylic paint onto a canvas to create abstract designs. This technique was pioneered by [David Alfaro Siqueiros](https://en.wikipedia.org/wiki/David_AlFaro_Siqueiros) in the 1930s.

## Techniques and Methods {#section-2}

Acrylic pouring encompasses various techniques such as **clean pour**, **dirty pour**, **flip cup**, and **swipe**. The [Tate Modern](https://www.tate.org.uk/) has documented several of these approaches.

## Why Fluid Art Is So Popular {#section-3}

Fluid art's unique blend of science and creativity continues to captivate artists and enthusiasts alike.`,
    },
    {
      title: 'How to Doodle Sketch: Easy Guide for Beginners',
      slug: 'how-to-doodle-sketch-easy-guide-for-beginners',
      category: 'Doodle Art',
      excerpt: 'Anyone can doodle. This beginner-friendly guide covers the supplies, the mindset and the simple steps to start doodling with confidence today.',
      coverImage: '/uploads/post-doodle.jpg',
      coverAlt: 'A hand doodling zentangle patterns in a sketchbook',
      tags: 'doodle art,drawing,beginners,sketchbook',
      featured: true, trending: true,
      content: `## Doodling is drawing without the pressure

Here's the secret nobody tells you about doodling: it is not a lesser form of art. It is the most free, most playful, most forgiving kind of drawing there is. See [this guide](https://en.wikipedia.org/wiki/Doodle) for more.

### What you need to start

- A pen you like
- Any paper
- That's it

### Five simple steps

1. Warm up with lines
2. Pick a simple shape
3. Repeat and vary
4. Add detail
5. Keep going`,
    },
    {
      title: 'Resin Art and Epoxy Techniques: A Beginner\'s Guide',
      slug: 'resin-art-and-epoxy-techniques-beginners-guide',
      category: 'Resin Art',
      excerpt: 'Glossy, glass-like and endlessly versatile — resin art is addictive. Here is everything a beginner needs to know to pour safely and beautifully.',
      coverImage: '/uploads/post-resin.jpg',
      coverAlt: 'A glossy resin art piece with embedded pigments',
      tags: 'resin art,epoxy,beginners,tutorial',
      featured: false, trending: true,
      content: `## Glossy, glass-like and endlessly versatile

There is nothing quite like the finish of cured resin. For safety guidelines, see [this resource](https://en.wikipedia.org/wiki/Epoxy).

### Safety first

- Wear nitrile gloves
- Work in a well-ventilated space
- Protect your surfaces

### The basic pour

1. Measure precisely
2. Mix slowly
3. Split and colour
4. Pour
5. Torch the bubbles
6. Cover and cure`,
    },
  ]

  for (const p of posts) {
    const existing = await db.post.findUnique({ where: { slug: p.slug } })
    if (existing) continue
    await db.post.create({
      data: {
        title: p.title, slug: p.slug, excerpt: p.excerpt, content: p.content,
        coverImage: p.coverImage, coverAlt: p.coverAlt, tags: p.tags,
        featured: p.featured, trending: p.trending, status: 'PUBLISHED',
        categoryId: categoryMap[p.category].id, authorId: admin!.id,
        publishedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000),
        views: Math.floor(Math.random() * 4000) + 200,
        likes: Math.floor(Math.random() * 200) + 10,
      },
    })
  }
  console.log(`✅ ${posts.length} posts`)

  // ===== LEGAL PAGES =====
  const pages = [
    { title: 'Privacy Policy', slug: 'privacy-policy', type: 'LEGAL', order: 1, excerpt: 'How we collect, use and protect your information.', content: '## Privacy Policy\n\nThis page describes our policies regarding the collection, use, and disclosure of personal data. We use Google AdSense and cookies. See our [Cookie Policy](/page/cookie-policy) for details.' },
    { title: 'Terms & Conditions', slug: 'terms-and-conditions', type: 'LEGAL', order: 2, excerpt: 'The terms governing your use of this website.', content: '## Terms & Conditions\n\nBy using our website, you agree to these terms. Reproduction of content without permission is prohibited.' },
    { title: 'Disclaimer', slug: 'disclaimer', type: 'LEGAL', order: 3, excerpt: 'Affiliate disclosure and general disclaimers.', content: '## Disclaimer\n\nSome links on this website are affiliate links. We only recommend products we genuinely use and love.' },
    { title: 'Cookie Policy', slug: 'cookie-policy', type: 'LEGAL', order: 4, excerpt: 'How and why we use cookies.', content: '## Cookie Policy\n\nWe use cookies for analytics and advertising. You can opt out via your browser settings.' },
    { title: 'DMCA Policy', slug: 'dmca-policy', type: 'LEGAL', order: 5, excerpt: 'How to report copyright infringement.', content: '## DMCA Policy\n\nTo report copyright infringement, contact us with the required information.' },
  ]
  for (const p of pages) {
    await db.page.upsert({
      where: { slug: p.slug },
      update: { title: p.title, content: p.content, excerpt: p.excerpt, type: p.type, order: p.order, showInFooter: true },
      create: { ...p, showInFooter: true },
    })
  }
  console.log(`✅ ${pages.length} legal pages`)

  // ===== DIGITAL PRODUCTS =====
  const products = [
    { title: 'The Complete Fluid Art Handbook', slug: 'complete-fluid-art-handbook', excerpt: 'A 120-page ebook covering every acrylic pouring technique.', description: '## Everything you need to master fluid art\n\nA 120-page illustrated ebook.', coverImage: '/uploads/product-handbook.jpg', coverAlt: 'Fluid Art Handbook ebook cover', price: '$19.99', originalPrice: '$29.99', buyUrl: 'https://gumroad.com/l/fluid-art-handbook', buyLabel: 'Buy the ebook', category: 'ebook', featured: true, tags: 'fluid art,ebook', order: 1 },
    { title: 'Resin Art for Beginners — Video Course', slug: 'resin-art-beginners-course', excerpt: 'A 2-hour video course taking you from resin safety to your first finished pieces.', description: '## Go from resin novice to confident creator\n\nA 2-hour video course.', coverImage: '/uploads/product-resin-course.jpg', coverAlt: 'Resin Art course cover', price: '$34.99', buyUrl: 'https://gumroad.com/l/resin-art-course', buyLabel: 'Enrol now', category: 'course', featured: true, tags: 'resin art,course', order: 2 },
    { title: 'Posca Art Pattern Pack — 50 Printable Designs', slug: 'posca-pattern-pack', excerpt: '50 hand-drawn posca-ready patterns you can print and trace.', description: '## 50 patterns, endless possibilities\n\nA downloadable pack of 50 patterns.', coverImage: '/uploads/product-pattern-pack.jpg', coverAlt: 'Posca Pattern Pack cover', price: '$9.99', originalPrice: '$14.99', buyUrl: 'https://gumroad.com/l/posca-pattern-pack', buyLabel: 'Get the pack', category: 'template', featured: true, tags: 'posca art,patterns', order: 3 },
    { title: 'The Quantum Prescription', slug: 'the-quantum-prescription', excerpt: 'Christine Britton\'s book exploring creativity, consciousness, and healing.', description: '## Healing the body with the mind\n\nChristine Britton\'s exploration of creativity and healing.', coverImage: '/uploads/product-quantum.jpg', coverAlt: 'The Quantum Prescription book cover', price: '$12.99', buyUrl: 'https://gumroad.com/l/quantum-prescription', buyLabel: 'Buy the book', category: 'ebook', featured: false, tags: 'book,creativity', order: 4 },
    { title: 'Doodle Journal Starter Kit', slug: 'doodle-journal-starter-kit', excerpt: 'Everything you need to start a daily doodle practice.', description: '## Start your doodle habit today\n\nA complete starter kit for doodle journaling.', coverImage: '/uploads/product-doodle-kit.jpg', coverAlt: 'Doodle Journal Starter Kit cover', price: '$7.99', buyUrl: 'https://gumroad.com/l/doodle-journal-kit', buyLabel: 'Get the kit', category: 'bundle', featured: false, tags: 'doodle art,journal', order: 5 },
  ]
  for (const p of products) {
    await db.digitalProduct.upsert({
      where: { slug: p.slug },
      update: { title: p.title, excerpt: p.excerpt, description: p.description, coverImage: p.coverImage, coverAlt: p.coverAlt, price: p.price, originalPrice: p.originalPrice, buyUrl: p.buyUrl, buyLabel: p.buyLabel, category: p.category, featured: p.featured, tags: p.tags, order: p.order },
      create: { ...p },
    })
  }
  console.log(`✅ ${products.length} digital products`)

  console.log('\n✅ Seed complete!')
  console.log('\n📝 Admin login:')
  console.log('   Email: admin@christinebritton.com')
  console.log('   Password: admin123')
  console.log('\n🌐 Admin URL: https://your-domain.com/admin')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
