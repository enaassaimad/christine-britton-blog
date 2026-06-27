import { db } from '../src/lib/db'

async function main() {
  // ===== LEGAL PAGES (AdSense-required) =====
  const pages = [
    {
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      type: 'LEGAL',
      order: 1,
      excerpt: 'How we collect, use and protect your information.',
      content: `## Privacy Policy

Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

Christine Britton ("we", "us", or "our") operates this website (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.

### Information we collect

**Information you provide directly**

- Your name and email address when you subscribe to our newsletter or contact us.
- Comments you leave on articles (along with your name and email).
- Any information you voluntarily provide in forms on our site.

**Information collected automatically**

- Log data: your IP address, browser type, pages visited, time spent on pages, and referring URLs.
- Cookies and similar technologies: see our [Cookie Policy](/page/cookie-policy) for details.

### How we use your information

We use collected data to:

1. Provide, maintain, and improve our Service.
2. Send newsletters and updates you have opted into (you can unsubscribe at any time).
3. Respond to your comments, questions, and customer service requests.
4. Monitor and analyse usage patterns to improve user experience.
5. Detect, prevent, and address technical issues, fraud, or security concerns.

### Cookies

We use cookies and similar tracking technologies to track activity on our Service and store certain information. See our [Cookie Policy](/page/cookie-policy) for a detailed explanation.

### Third-party services

We may use third-party services that collect, monitor and analyse data to provide us with analytics and advertising. These include:

- **Google AdSense & Google Analytics**: Google uses cookies to serve ads based on your prior visits to our website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to our site and/or other internet sites.
- **Social media platforms**: such as Pinterest, Instagram, Facebook, and YouTube when you interact with embedded content or links.

You can opt out of personalised advertising by visiting [Google Ads Settings](https://www.google.com/settings/ads). You can also opt out of third-party vendors' use of cookies for personalised advertising by visiting [www.aboutads.info](https://www.aboutads.info).

### Affiliate disclosure

Some links on this website are affiliate links. If you click on an affiliate link and make a purchase, we may receive a small commission at no additional cost to you. We only recommend products and services we genuinely use and believe will add value to our readers. See our [Affiliate Disclosure](/page/disclaimer) for more details.

### Data security

We take reasonable measures to protect your personal information from unauthorised access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.

### Your data protection rights

Depending on your location, you may have the right to:

- Access the personal information we hold about you.
- Request correction of inaccurate or incomplete data.
- Request deletion of your personal data.
- Object to or restrict our processing of your data.
- Withdraw consent at any time.

To exercise these rights, please contact us using the details on our [Contact page](/contact).

### Children's privacy

Our Service does not address anyone under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us so we can delete it.

### Changes to this policy

We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.

### Contact us

If you have questions about this Privacy Policy, please contact us via our [Contact page](/contact).`,
    },
    {
      title: 'Terms & Conditions',
      slug: 'terms-and-conditions',
      type: 'LEGAL',
      order: 2,
      excerpt: 'The terms governing your use of this website.',
      content: `## Terms & Conditions

Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

Welcome to Christine Britton. These Terms and Conditions ("Terms") govern your use of our website. By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service.

### Use of the Service

**Permitted use**: You may use our Service for personal, non-commercial purposes including reading articles, leaving comments, and subscribing to our newsletter.

**Prohibited conduct**: You agree not to:

1. Use the Service in any way that violates applicable laws or regulations.
2. Impersonate another person or misrepresent your affiliation.
3. Engage in any conduct that could disable, overburden, or impair the Service.
4. Use any robot, spider, or other automatic device to access the Service.
5. Republish, sell, or rent our content without express written permission.
6. Submit comments or content that is unlawful, harmful, defamatory, obscene, or infringes on intellectual property rights.

### Intellectual property

The Service and its original content, features, and functionality — including articles, images, tutorials, and downloadable resources — are the exclusive property of Christine Britton and are protected by international copyright, trademark, and other intellectual property laws.

You may share links to our content on social media and may quote brief excerpts with attribution and a link back to the original article. Reproduction of full articles without permission is prohibited.

### Tutorials and instructions

Our art tutorials, guides, and instructions are provided for informational and educational purposes only. Results may vary based on individual skill, materials used, and environmental factors. We are not responsible for any outcome resulting from following our tutorials.

### Digital products

Any digital products (ebooks, courses, templates) sold through our Service are provided under the specific licence terms accompanying that product. Unless otherwise stated, digital products are licensed for personal use only and may not be redistributed or resold.

### User comments

By posting comments on our Service, you grant us a non-exclusive, royalty-free, worldwide, perpetual licence to use, reproduce, and display those comments. You are solely responsible for the content of your comments and represent that you have the right to post them.

We reserve the right to moderate, edit, or remove comments at our discretion.

### Third-party links

Our Service may contain links to third-party websites or services that are not owned or controlled by Christine Britton. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.

### Affiliate links

Some links on this website are affiliate links. See our [Privacy Policy](/page/privacy-policy) and [Disclaimer](/page/disclaimer) for details.

### Limitation of liability

To the maximum extent permitted by law, Christine Britton shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of your use of the Service.

### Changes to these Terms

We reserve the right to modify these Terms at any time. We will update the "Last updated" date at the top of this page. Your continued use of the Service after changes constitutes acceptance of the new Terms.

### Governing law

These Terms shall be governed by the laws of the United Kingdom, without regard to its conflict of law provisions.

### Contact

If you have questions about these Terms, please contact us via our [Contact page](/contact).`,
    },
    {
      title: 'Disclaimer',
      slug: 'disclaimer',
      type: 'LEGAL',
      order: 3,
      excerpt: 'Affiliate disclosure and general disclaimers.',
      content: `## Disclaimer

Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

### General information

The information provided by Christine Britton on this website is for general informational and educational purposes only. All information is provided in good faith; however, we make no representation or warranty of any kind regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the site.

### Professional advice disclaimer

The content on this website — including but not limited to art tutorials, technique guides, product recommendations, and material reviews — is based on personal experience and opinion. It is not intended as professional advice. Always exercise your own judgement and seek appropriate professional advice where required.

### Art materials and safety

Some art materials (including but not limited to resins, solvents, pigments, and sealants) may pose health or safety risks if misused. Always:

- Read and follow the manufacturer's instructions and safety data sheets.
- Work in a well-ventilated area and use appropriate protective equipment.
- Keep art materials away from children and pets.

Christine Britton accepts no liability for any injury, damage, or loss resulting from the use of materials or techniques described on this website.

### Affiliate disclosure

This website participates in affiliate marketing programs, including the Amazon Associates program and other affiliate advertising programs designed to provide a means for sites to earn advertising fees by linking to products.

**What this means:** Some links on this site are affiliate links. If you click on an affiliate link and make a purchase, we may receive a small commission at no additional cost to you. We only recommend products and services that we have personally used and believe will add value to our readers.

**Your trust matters:** Affiliate income helps us keep this site running and our content free. It never influences our editorial recommendations — if we don't believe in a product, we won't promote it.

### Earnings disclaimer

Any references to potential earnings, outcomes, or results from applying techniques described on this site are for illustrative purposes only and do not guarantee similar results. Individual outcomes depend on many factors including skill, effort, and circumstances.

### External links disclaimer

This website may contain links to external websites that are not provided or maintained by us. We do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.

### Testimonials and reviews

Testimonials and product reviews reflect the individual reviewer's experience and are not necessarily typical. Your experience may vary.

### Consent

By using our website, you hereby consent to our disclaimer and agree to its terms.

### Contact

If you require any more information or have questions about our disclaimer, please contact us via our [Contact page](/contact).`,
    },
    {
      title: 'Cookie Policy',
      slug: 'cookie-policy',
      type: 'LEGAL',
      order: 4,
      excerpt: 'How and why we use cookies.',
      content: `## Cookie Policy

Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

This Cookie Policy explains how Christine Britton ("we", "us") uses cookies and similar technologies on our website. It describes what these technologies are, why we use them, and your rights to control their use.

### What are cookies?

Cookies are small text files that websites place on your device when you visit them. They are widely used to make websites work more efficiently and to provide information to site owners. Cookies allow websites to remember your actions and preferences over a period of time, so you don't have to re-enter them every time you visit.

### Types of cookies we use

**Essential cookies**

These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences or filling in forms.

**Preference cookies**

These cookies enable the website to remember choices you make (such as your username, language, or region) and provide enhanced, more personal features.

**Analytics cookies**

These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us know which pages are the most and least popular and see how visitors move around the site.

**Advertising cookies**

These cookies may be set on our site by our advertising partners (including Google AdSense). They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites.

### Specific cookies we use

| Cookie | Purpose | Duration |
|--------|---------|----------|
| \_ga, \_gid | Google Analytics — tracks site usage | 2 years / 24 hours |
| \_gcl\_au | Google AdSense — conversion tracking | 3 months |
| IDE | DoubleClick — ad personalisation | 1 year |
| NID | Google — user preferences | 6 months |
| wordpress\_logged\_in | Authentication (if applicable) | Session |
| consent | Your cookie consent preferences | 1 year |

### Third-party cookies

In addition to our own cookies, we use cookies from trusted third-party services including:

- **Google AdSense** — to serve and measure advertising.
- **Google Analytics** — to understand how visitors use our site.
- **Social media platforms** (Pinterest, Instagram, Facebook, YouTube) — when you interact with embedded content.

### Managing cookies

You have several options to manage or delete cookies:

**Browser settings**: Most web browsers allow you to control cookies through their settings. You can usually block all cookies, accept only first-party cookies, or delete existing cookies. See your browser's help documentation for instructions.

**Opt out of personalised ads**: Visit [Google Ads Settings](https://www.google.com/settings/ads) to opt out of personalised advertising from Google.

**Opt out of third-party cookies**: Visit [www.aboutads.info/choices](https://www.aboutads.info/choices) or [www.youronlinechoices.eu](https://www.youronlinechoices.eu) to opt out of interest-based advertising from participating companies.

### Updates to this policy

We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated revision date.

### Contact us

If you have questions about our use of cookies, please contact us via our [Contact page](/contact).`,
    },
    {
      title: 'DMCA Policy',
      slug: 'dmca-policy',
      type: 'LEGAL',
      order: 5,
      excerpt: 'How to report copyright infringement.',
      content: `## DMCA / Copyright Policy

Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

Christine Britton respects the intellectual property rights of others and expects users of our website to do the same. This policy describes how to report copyright infringement under the Digital Millennium Copyright Act (DMCA) and equivalent laws.

### Reporting copyright infringement

If you believe that content on our website infringes your copyright, please send a written notice to us via our [Contact page](/contact) with the following information:

1. **Identification of the copyrighted work** — a description of the original work that you claim has been infringed.

2. **Identification of the infringing material** — the URL or specific location on our website of the material you believe is infringing.

3. **Your contact information** — your full name, mailing address, telephone number, and email address.

4. **A statement of good faith belief** — a statement that you have a good faith belief that the disputed use is not authorised by the copyright owner, its agent, or the law.

5. **A statement of accuracy** — a statement, made under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner or authorised to act on the copyright owner's behalf.

6. **Your physical or electronic signature**.

### Counter-notification

If you believe that your content was removed from our site in error, you may submit a counter-notification with the following:

1. Identification of the material that was removed.
2. A statement under penalty of perjury that you have a good faith belief the material was removed in error.
3. Your contact information and consent to the jurisdiction of the local courts.
4. Your physical or electronic signature.

### Repeat infringers

We will terminate the accounts of users who are found to be repeat infringers of copyright.

### Our content

All original content on this website — including articles, images, tutorials, videos, and downloadable resources — is the property of Christine Britton and is protected by copyright law. Unauthorised reproduction, distribution, or modification of our content is prohibited.

If you wish to use our content beyond what is permitted under our [Terms & Conditions](/page/terms-and-conditions), please contact us to request permission.

### Contact

Send all copyright notices and counter-notifications via our [Contact page](/contact) with "DMCA Notice" or "DMCA Counter-Notice" in the subject line.`,
    },
  ]

  for (const p of pages) {
    await db.page.upsert({
      where: { slug: p.slug },
      update: { title: p.title, content: p.content, excerpt: p.excerpt, type: p.type, order: p.order, showInFooter: true },
      create: { ...p, showInFooter: true },
    })
  }
  console.log(`Seeded ${pages.length} legal pages`)

  // ===== DIGITAL PRODUCTS =====
  const products = [
    {
      title: 'The Complete Fluid Art Handbook',
      slug: 'complete-fluid-art-handbook',
      excerpt: 'A 120-page ebook covering every acrylic pouring technique — from your first dirty pour to advanced cell formation.',
      description: `## Everything you need to master fluid art

A 120-page illustrated ebook covering every acrylic pouring technique — from your very first dirty pour to advanced cell formation, swiping, and resin finishing.

### What's inside

- **8 technique chapters**: dirty pour, flip cup, swipe, bloom, dutch pour, puddle pour, string pull, and tree ring pour.
- **Recipe cards**: exact paint-to-pouring-medium ratios for each technique.
- **Troubleshooting guide**: cracks, muddy colours, missing cells — and how to fix them.
- **Supply list**: the exact products I use, with links.
- **Bonus video access**: QR codes linking to private demonstration videos.

### Who it's for

Whether you've never poured before or you've made hundreds of pieces, this handbook will sharpen your technique and reignite your creativity.`,
      coverImage: '/uploads/product-handbook.jpg',
      coverAlt: 'The Complete Fluid Art Handbook ebook cover',
      price: '$19.99',
      originalPrice: '$29.99',
      buyUrl: 'https://gumroad.com/l/fluid-art-handbook',
      buyLabel: 'Buy the ebook',
      category: 'ebook',
      featured: true,
      tags: 'fluid art,acrylic pouring,ebook,beginners',
      order: 1,
    },
    {
      title: 'Resin Art for Beginners — Video Course',
      slug: 'resin-art-beginners-course',
      excerpt: 'A 2-hour video course taking you from resin safety to your first three finished pieces — coasters, ocean art, and a geode tray.',
      description: `## Go from resin novice to confident creator

A 2-hour video course taught by Christine, taking you from resin safety basics to your first three finished pieces.

### Course modules

1. **Resin safety & setup** (15 min) — gloves, ventilation, surfaces, and what not to do.
2. **Mixing & colouring** (20 min) — perfect ratios, mica powders, alcohol inks, and avoiding sticky patches.
3. **Project 1: Geode coasters** (30 min) — layering, gold leaf, and finishing.
4. **Project 2: Ocean wave art** (30 min) — the heat-gun wave technique that goes viral.
5. **Project 3: River-pour tray** (25 min) — pouring into a mould, doming, and demoulding.

### What you get

- Lifetime access to all video lessons.
- Downloadable supply list and mixing cheat sheet.
- Private community access for feedback and questions.

### Requirements

- A well-ventilated workspace.
- Basic resin kit (links to recommended supplies included).`,
      coverImage: '/uploads/product-resin-course.jpg',
      coverAlt: 'Resin Art for Beginners video course cover',
      price: '$34.99',
      buyUrl: 'https://gumroad.com/l/resin-art-course',
      buyLabel: 'Enrol now',
      category: 'course',
      featured: true,
      tags: 'resin art,video course,beginners',
      order: 2,
    },
    {
      title: 'Posca Art Pattern Pack — 50 Printable Designs',
      slug: 'posca-pattern-pack',
      excerpt: '50 hand-drawn posca-ready patterns you can print and trace. Perfect for jumpstarting your next canvas.',
      description: `## 50 patterns, endless possibilities

A downloadable pack of 50 hand-drawn patterns designed specifically for posca marker art. Print them, trace them, or use them as inspiration for your own compositions.

### What's included

- **50 high-resolution PDF patterns** (A4 and letter size).
- **10 botanical**, **10 geometric**, **10 mandala**, **10 abstract**, and **10 seasonal** designs.
- **PNG versions** for digital tracing on tablets.
- **Bonus: a mini video tutorial** on how to scale and transfer patterns to canvas.

### How to use

1. Print the pattern at your desired size.
2. Transfer to canvas using carbon paper or a light box.
3. Fill in with posca markers using the techniques from our [Posca Art guides](/category/posca-art).

### Licence

Personal use only. You may sell finished artworks made from these patterns, but you may not resell or redistribute the pattern files themselves.`,
      coverImage: '/uploads/product-pattern-pack.jpg',
      coverAlt: 'Posca Art Pattern Pack cover',
      price: '$9.99',
      originalPrice: '$14.99',
      buyUrl: 'https://gumroad.com/l/posca-pattern-pack',
      buyLabel: 'Get the pack',
      category: 'template',
      featured: true,
      tags: 'posca art,patterns,printable,template',
      order: 3,
    },
    {
      title: 'The Quantum Prescription',
      slug: 'the-quantum-prescription',
      excerpt: 'Christine Britton\'s book exploring the intersection of creativity, consciousness, and healing the body with the mind.',
      description: `## Healing the body with the mind

Christine Britton's deeply personal exploration of the intersection between creativity, consciousness, and healing.

### About the book

After decades as an artist and teacher, Christine began investigating the connection between creative expression and physical wellbeing. *The Quantum Prescription* is the result — part memoir, part investigation, part practical guide.

Drawing on research from neuroscience, psychoneuroimmunology, and her own lived experience, the book explores:

- How creative practice changes the brain.
- The measurable effects of mindfulness and flow states on physical health.
- Practical exercises for bringing creativity into your own healing journey.
- Why it is never too late to begin.

### Formats

- **PDF ebook** — instant download.
- **EPUB** — for e-readers.
- **MOBI** — for Kindle.

### Praise

> "A gentle, wise and scientifically grounded case for picking up a brush — at any age." — Reader review

> "Christine's voice is warm and persuasive. This book changed how I think about my own creativity." — Reader review`,
      coverImage: '/uploads/product-quantum.jpg',
      coverAlt: 'The Quantum Prescription book cover',
      price: '$12.99',
      buyUrl: 'https://gumroad.com/l/quantum-prescription',
      buyLabel: 'Buy the book',
      category: 'ebook',
      featured: false,
      tags: 'book,creativity,healing,mindfulness',
      order: 4,
    },
    {
      title: 'Doodle Journal Starter Kit',
      slug: 'doodle-journal-starter-kit',
      excerpt: 'Everything you need to start a daily doodle practice: 30 printable prompt cards, a guidebook, and 4 video lessons.',
      description: `## Start your doodle habit today

A complete starter kit for anyone who has ever wanted to keep a doodle journal but didn't know where to begin.

### What's inside

- **30 printable prompt cards** — one for each day of your first month.
- **A 24-page guidebook** — covering supplies, mindset, and 12 easy patterns.
- **4 video lessons** (10 min each) — warm-ups, patterns, reflective doodling, and building a daily habit.
- **Printable dot-grid pages** — to get you started before you buy a notebook.

### Who it's for

- Complete beginners who think they "can't draw".
- Artists returning to a daily practice.
- Anyone looking for a calming, screen-free creative habit.

### What you need

- A printer (for the cards and pages) or a tablet.
- A pen and some paper. That's it.`,
      coverImage: '/uploads/product-doodle-kit.jpg',
      coverAlt: 'Doodle Journal Starter Kit cover',
      price: '$7.99',
      buyUrl: 'https://gumroad.com/l/doodle-journal-kit',
      buyLabel: 'Get the kit',
      category: 'bundle',
      featured: false,
      tags: 'doodle art,journal,beginners,printable',
      order: 5,
    },
  ]

  for (const p of products) {
    await db.digitalProduct.upsert({
      where: { slug: p.slug },
      update: { title: p.title, excerpt: p.excerpt, description: p.description, coverImage: p.coverImage, coverAlt: p.coverAlt, price: p.price, originalPrice: p.originalPrice, buyUrl: p.buyUrl, buyLabel: p.buyLabel, category: p.category, featured: p.featured, tags: p.tags, order: p.order },
      create: { ...p },
    })
  }
  console.log(`Seeded ${products.length} digital products`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
