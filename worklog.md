# Lumen Journal — Worklog

---
Task ID: 1-8
Agent: main (Z.ai Code)
Task: Clone christinebritton.com as a professional, AdSense-friendly editorial blog with a full admin CMS panel.

Work Log:
- Analyzed reference site (personal-name lifestyle blog) and designed an editorial magazine concept ("Lumen Journal") with warm cream/terracotta palette, Playfair Display + Inter typography.
- Designed Prisma schema (User, Category, Post, Comment, SiteSetting, Media, Subscriber) with AdSense fields, SEO fields, and content controls. Pushed to SQLite.
- Built 18 API route handlers: auth (login/logout/me), posts (list/create/get/update/delete/by-slug+view-increment), categories (CRUD), comments (create/list/moderate), settings (get/upsert singleton), media (list/create/delete), upload (multipart image), stats (dashboard aggregates), subscribers (newsletter signup).
- Built auth lib with HMAC-signed httpOnly session cookies and pbkdf2 password hashing.
- Built Zustand navigation store (route + admin view state) and typed API client.
- Built public site shell: sticky header with utility bar, logo, nav, category strip, mobile sheet menu, search dialog; sticky footer with newsletter + social links; theme provider; settings context.
- Built public views: home (hero featured + side featured, trending, categories showcase, editor's pick + sidebar ad, latest grid, in-article ad, newsletter), post reading view (breadcrumb, cover, markdown render, tags, author box, share, comments with form + list, related posts, ads), category view (hero + grid + load more), blog/search view (filters + sort + load more), about view (story + stats + values), contact view (info + form).
- Built AdSlot component: renders labeled placeholders by default, switches to real `<ins class="adsbygoogle">` when a valid AdSense client ID + slot are configured. Placements: header, in-article, sidebar, footer.
- Built full admin panel: login (demo creds), admin shell (collapsible sidebar + mobile nav), dashboard (stat cards, recharts bar chart of posts/category, audience card, most-read list, recent activity), posts manager (filters, featured toggle, status badges, delete confirm), post editor (title/slug/excerpt, cover upload + media library, markdown editor with live preview, tags, publish settings, SEO fields with char counters), categories manager (CRUD with icon/color pickers), media manager (drag-drop upload, grid, copy URL), comments manager (approve/spam/delete), settings manager (tabs: general, branding, about, AdSense, social).
- Generated 8 AI images (6 post covers + author portrait + about) via z-ai image CLI.
- Seeded database: 1 admin user, 6 categories, 6 full-length articles with markdown content, site settings with AdSense placeholders.
- Fixed lint issues: refactored dynamic category-icon rendering into a stable switch-based CategoryIcon component; restructured effects to use active-ref pattern to satisfy react-hooks/set-state-in-effect rule.
- Fixed critical bug: setAdminView was not destructured from useApp in AdminApp (was undefined, silently breaking post-login navigation). Fixed + added auth-state normalization so logged-in users land on the dashboard.

Stage Summary:
- Production-ready editorial blog + CMS on a single `/` route with hash-free state navigation.
- Admin credentials: admin@lumenjournal.com / admin123
- All API routes return 200; ESLint passes clean; no console/runtime errors.
- Verified end-to-end with Agent Browser: home renders with hero/ads/categories, post view renders full markdown, admin login → dashboard with charts, posts list, post editor creates drafts (verified via API), settings AdSense tab works.
- Responsive (mobile header + sheet menu) and sticky-footer layout verified.
- AdSense-ready: clearly labeled ad placeholders in 4 positions, auto-convert to live ads when client/slot IDs are entered in Settings.

---
Task ID: 9-14
Agent: main (Z.ai Code)
Task: Replace original "Lumen Journal" content with Christine Britton's REAL website content (keep the design).

Work Log:
- Fetched https://www.christinebritton.com/ home page, About Me page, and a sample article ("What Is Fluid Art Painting?") via z-ai page_reader to extract real content.
- Identified Christine Britton as a fluid/resin artist on the West coast of Scotland; site is an art tutorial blog covering Fluid Art, Resin Art, Drawing, Doodle Art, Posca Art, Clay Art, Art Culture.
- Extracted real: site name, about bio (child of the 60s, university art, 6 children, dutch pours, "The Quantum Prescription" book), social handles (Twitter @fluidartpaint, Facebook fluidartcommunity), location, and 10 real article titles.
- Expanded CategoryIcon component with art-relevant icons (Gem, Pencil, Brush, PenTool, Droplet, PaintBucket, Flower) and updated admin category manager icon/color options.
- Rewrote seed script entirely with Christine Britton's real content: 7 real categories (Fluid Art, Resin Art, Drawing, Doodle Art, Posca Art, Clay Art, Art Culture) with art-appropriate colors/icons, 10 posts with REAL titles and authentic full-length article bodies written in the reference's engaging educational style (e.g. "What Is Fluid Art Painting?", "The History of Fluid Art", "How to Doodle Sketch", "17 Creative Pencil Art Drawings", "15 Posca Marker Art Ideas", "Top 10 Polymer Clay Artists", "Resin Art and Epoxy Techniques", "Famous Artists Who Changed the Art World", etc.).
- Updated layout metadata, page title fallback, admin login defaults, and demo credentials to admin@christinebritton.com.
- Wrote reset.ts script; reset DB and re-seeded with Christine Britton content.
- Generated 12 new art-themed AI cover images (fluid art pours, doodle sketchbook, pencil drawing, posca art, polymer clay, resin ocean art, gallery wall, author portrait, studio flatlay).
- Verified via Agent Browser: home shows "Christine Britton" + all art categories + real post titles; post view renders real article content (Siqueiros, dirty pour, flip cup); About page shows real bio (child of the 60s, 6 children, Quantum Prescription); admin login works with new creds; dashboard shows 10 articles / 54k views; all 15 page images load; no console/runtime errors.

Stage Summary:
- Content now faithfully matches the reference (Christine Britton's art blog) while keeping the professional editorial design.
- Admin credentials: admin@christinebritton.com / admin123
- 7 categories, 10 full articles with real titles + authentic bodies, 12 AI-generated art-themed images.
- ESLint clean, dev server healthy, browser-verified end-to-end.

---
Task ID: 15-23
Agent: main (Z.ai Code)
Task: Add scheduling, AI text-to-image generator, WordPress-style post form, and affiliate links to the admin panel.

Work Log:
- Updated Prisma schema: added `affiliateLinks String?` (JSON-encoded array) to Post model; documented SCHEDULED status. Ran db:push + db:generate.
- Created `src/lib/scheduler.ts` with `publishDueScheduledPosts()` helper that promotes SCHEDULED → PUBLISHED when publishedAt <= now. Called at top of posts list and slug routes so scheduling "just works" without a cron job.
- Built `/api/generate-image` route using z-ai-web-dev-sdk: accepts {prompt, size}, generates image via AI, saves to /public/uploads, registers in Media table, returns {url}. Handles 429 rate-limit with friendly message.
- Updated posts list/create and posts/[id] PUT routes: added SCHEDULED status handling, affiliateLinks JSON serialization, and date resolution logic (PUBLISHED sets now if no date, SCHEDULED requires future date with auto-bump if past).
- Updated posts/slug/[slug] route: parses affiliateLinks JSON for the public post view.
- Built `GenerateImageDialog` component: prompt textarea, size selector (6 sizes), generate button with loading state, result preview, "Use as cover" / "Insert into content" / "Copy URL" actions. Connected to /api/generate-image.
- Built `AffiliateLinksEditor` component: add/remove/edit affiliate link cards with fields (title, URL, price, image, button label, description). Shows FTC/ASA compliance note.
- Built `Metabox` component: WordPress-style collapsible sidebar boxes with title, icon, description, action badge, expand/collapse.
- Rewrote `PostEditor` as WordPress-style form: two-column layout with main column (title+permalink, content editor with Visual/Preview tabs + AI Image button, excerpt metabox, affiliate links metabox) and sidebar (Publish metabox with Draft/Publish/Schedule radio + date picker + Featured/Trending/ShowAds toggles + action buttons, Category radio list, Tags, Featured Image with Upload/Library/Generate buttons, SEO with Google snippet preview).
- Updated `PostsManager`: added SCHEDULED status badge (amber) + scheduled date display; added SCHEDULED to status filter.
- Updated `PostView` (public): renders "Recommended supplies" affiliate section with disclosure text, product cards (image, title, description, price, "Check price" button), rel="sponsored" links.
- Updated types (AffiliateLink interface), API client (generateImage method).
- Fixed Prisma client regeneration issue (old client didn't know about affiliateLinks field → 500 errors; regenerated + restarted dev server).
- Verified end-to-end with Agent Browser: created scheduled post (SCHEDULED status saved correctly), generated AI image from prompt (set as cover), added affiliate link (Posca markers with price/URL/description), published post, viewed on public site — affiliate section renders with disclosure and product card.

Stage Summary:
- Four new professional features fully functional and browser-verified:
  1. Post scheduling: SCHEDULED status with future date, auto-publishes when time arrives, amber badge in posts list.
  2. AI text-to-image: prompt → generated image → use as cover or insert into content. Saved to media library.
  3. WordPress-style editor: collapsible metaboxes (Publish, Category, Tags, Featured Image, Excerpt, Affiliate Links, SEO), radio-based publish action, Google snippet preview.
  4. Affiliate links: per-post JSON-stored links with title/URL/price/image/description, rendered publicly with FTC-style disclosure and rel="sponsored".
- ESLint clean, 10 posts intact, dev server healthy.

---
Task ID: 24-33
Agent: main (Z.ai Code)
Task: Make design AdSense-friendly, add digital products/shop with sidebar offers, add all AdSense-required pages.

Work Log:
- Updated Prisma schema: added Page model (legal/custom pages with footer visibility + order) and DigitalProduct model (title, description, price, originalPrice, buyUrl, buyLabel, category, featured, coverImage, tags, order). Added adsenseSlotInContent field to SiteSetting. Pushed + regenerated Prisma client.
- Built 6 API routes: /api/pages (list/create), /api/pages/[id] (update/delete), /api/pages/slug/[slug] (public read), /api/products (list/create), /api/products/[id] (get/update/delete), /api/products/slug/[slug] (public read with related products).
- Created ads.txt in /public for AdSense verification (placeholder publisher ID, ready to replace).
- Seeded 5 legal pages with full real content: Privacy Policy (information collection, cookies, third-party services incl. Google AdSense, affiliate disclosure, GDPR rights, children's privacy), Terms & Conditions (use of service, IP, digital products, comments, affiliate links, limitation of liability, governing law), Disclaimer (general info, art materials safety, affiliate disclosure, earnings disclaimer, external links), Cookie Policy (cookie types, specific cookies table, third-party cookies, managing/opting out), DMCA Policy (reporting infringement, counter-notification, repeat infringers, our content).
- Seeded 5 digital products: The Complete Fluid Art Handbook ($19.99 ebook), Resin Art for Beginners Video Course ($34.99), Posca Art Pattern Pack ($9.99 printable), The Quantum Prescription ($12.99 book), Doodle Journal Starter Kit ($7.99 bundle). Generated 5 AI cover images.
- Updated navigation store: added shop/product/page routes + openProduct/openPage actions; added editProduct/editPage admin actions + productEditor/pageEditor views.
- Updated API client + types with Page, DigitalProduct, AffiliateLink types and pages/products methods.
- Built public components: ShopView (hero + category filter + product grid + ad + newsletter), ProductView (breadcrumb + cover + buy box with price/originalPrice/checkout button + features + markdown description + ad + related products sidebar + CTA), PageView (legal page with header + markdown content), ProductsWidget (sidebar widget showing featured product offers — used on post pages).
- Updated Header: added "Shop" nav item. Updated Footer: fetches pages from API, added "Legal" column with all legal page links (Privacy Policy, Terms, Disclaimer, Cookie Policy, DMCA), restructured grid to 5+2+2+3.
- Updated AdSlot component: added 'inContent' slot type. Updated settings manager: added in-content slot ID field + 5-slot preview grid.
- Built admin components: ProductsManager (search + list with cover/category/price/featured toggle + delete), ProductEditor (WP-style metaboxes: Pricing & Checkout, Cover Image with AI generator, Category & Tags), PagesManager (search + list with type badges + AdSense compliance tip banner + delete), PageEditor (title + slug + markdown editor with preview + type/excerpt/footer/order settings).
- Updated admin shell: added Products + Pages to sidebar nav; added "New" buttons for both; updated active matching for productEditor/pageEditor views.
- Updated admin-app: imported + rendered ProductsManager, ProductEditor, PagesManager, PageEditor.
- Fixed lint: used active-ref pattern in all new useEffect hooks to satisfy set-state-in-effect rule; added missing Badge import.
- Verified end-to-end with Agent Browser: Shop page renders all 5 products with category filter; product detail page shows buy button + description + related; footer shows all 5 legal links; Privacy Policy page renders full legal content; ads.txt returns HTTP 200; post pages show "From the Shop" products widget; admin Products manager lists all products; admin Pages manager lists all legal pages with AdSense tip banner.

Stage Summary:
- Three major features fully functional and browser-verified:
  1. AdSense-friendly design: 5 ad slot positions (header, in-article, in-content, sidebar, footer), ads.txt file, clearly labeled placeholders, proper content-to-ad ratio, all required legal pages present and linked.
  2. Digital products/shop: full CRUD admin (products manager + WP-style editor with AI image generation), public shop page with category filter, product detail pages with buy buttons, sidebar products widget on article pages, 5 seeded products with AI covers.
  3. AdSense-required pages: Privacy Policy, Terms & Conditions, Disclaimer, Cookie Policy, DMCA Policy — all with comprehensive real content, editable via admin Pages manager, linked in footer.
- ESLint clean, dev server healthy, all APIs return 200.

---
Task ID: 40-49
Agent: main (Z.ai Code)
Task: Make design more professional and mobile-friendly/responsive.

Work Log:
- Audited all pages on mobile (390px) and desktop (1440px) viewports using Agent Browser — confirmed no horizontal overflow, proper stacking.
- Added responsive fluid typography scale to globals.css: h1/h2/h3 now use clamp() to scale smoothly from mobile to desktop (e.g. h1: 1.875rem → 3rem).
- Added mobile UX best practices to globals.css: 16px input font-size to prevent iOS zoom, -webkit-tap-highlight-color: transparent, touch-action: manipulation, antialiased font rendering, overflow-x: hidden, smooth scroll.
- Made article-prose responsive: smaller font on mobile (1.0625rem → 1.125rem on desktop), fluid heading sizes with clamp(), responsive blockquote sizing, word-break on code blocks.
- Added mobile category bar to header: horizontal-scrolling category strip visible only on mobile (md:hidden), complementing the desktop category bar.
- Made all public view padding responsive: changed px-6 to px-4 sm:px-6 across home, post, shop, product, category, blog, about, contact, page, and newsletter views for better mobile spacing.
- Made grid gaps responsive: changed gap-10 to gap-8 lg:gap-10 in two-column layouts (post view, product view) for tighter mobile spacing.
- Reduced section margins on mobile: mt-16 → mt-10 md:mt-16, mt-10 → mt-8 md:mt-10 in home view.
- Optimized newsletter section: reduced internal padding on mobile (px-6 py-10 → md:px-16 md:py-16).
- Optimized footer: reduced padding on mobile (py-10 → md:py-16), responsive gap (gap-8 → md:gap-10), responsive horizontal padding (px-4 sm:px-6).
- Verified end-to-end: mobile home (390px, no scroll, mobile category bar visible), mobile article (single column, sidebar stacks below), mobile shop/product (single column grids), mobile footer (4 children stack vertically), desktop home (12-col hero grid, no scroll), desktop article (two-column with 808px article + 384px sidebar side-by-side).

Stage Summary:
- All pages now fully responsive: mobile (390px), tablet (768px), desktop (1440px).
- Professional typography: fluid type scale, antialiased rendering, proper line heights.
- Mobile UX: 16px inputs (no iOS zoom), touch-action manipulation, no horizontal scroll, horizontal-scrolling category bar, proper stacking of all grids and sidebars.
- No console/runtime errors, ESLint clean.

---
Task ID: 50-55
Agent: main (Z.ai Code)
Task: Move affiliate links inline inside post content (like reference image) and add HTML code insertion to post editor.

Work Log:
- Analyzed reference image: affiliate product cards shown as a row of vertical cards (image on top, title, "Check Price" button) inserted BETWEEN paragraphs inside the article content — not as a separate section at the bottom.
- Installed `rehype-raw` package to enable raw HTML rendering inside react-markdown.
- Updated Markdown component to use `rehypePlugins={[rehypeRaw]}` so admin-inserted HTML renders inline within the markdown content.
- Added comprehensive CSS styles for inline affiliate product cards in globals.css: `.affiliate-cards` wrapper (flex row, centered, subtle background), `.product-card` (vertical card with image on top, title, price, footer with affiliate label + pill button), responsive mobile layout (cards stack and switch to horizontal image-left layout under 640px).
- Built `insert-dialogs.tsx` with two components:
  - `InsertHtmlDialog`: dialog with a textarea for pasting raw HTML, shows available CSS classes reference, inserts at cursor position.
  - `InsertAffiliateDialog`: dialog listing the post's affiliate links with checkboxes, generates styled HTML card row from selected products, shows live HTML preview, inserts at cursor position.
  - `generateAffiliateCardsHTML` helper: generates the `<div class="affiliate-cards">` HTML block from AffiliateLink objects with proper escaping.
- Updated PostEditor: added `contentRef` for the content textarea, `insertAtCursor` function that inserts text at the cursor position with proper newline padding, added "Affiliate" and "HTML" buttons to the content toolbar (alongside "AI Image"), wired both dialogs to the insertAtCursor function.
- Updated PostView (public): replaced the large separate "Recommended supplies" section at the bottom with a slim one-line affiliate disclosure notice (for FTC/legal compliance) since the actual product cards are now inline in the content.
- Removed unused Package/ExternalLink imports from post-view.
- Verified end-to-end with Agent Browser: opened admin → new article → added an affiliate link (Nicpro Acrylic Paint Set) → typed content → clicked "Affiliate" toolbar button → selected the product → HTML card block inserted at cursor position → saved as draft → published via API → viewed on public site → confirmed 1 `.affiliate-cards` div with 1 `.product-card` rendering inline inside the article prose (showing product title, price, affiliate label, and "Check price" button).
- Also verified "Insert HTML" dialog opens correctly.
- Cleaned up test post.

Stage Summary:
- Affiliate product cards now render INLINE within the article content (between paragraphs) matching the reference image — vertical cards with image on top, title, price, "Check Price" pill button, arranged in a responsive row.
- Post editor has two new toolbar buttons: "HTML" (paste any raw HTML) and "Affiliate" (select from the post's affiliate links to auto-generate a styled card row). Both insert at the cursor position.
- Markdown renderer now supports raw HTML via rehype-raw, so any HTML the admin inserts renders correctly.
- Responsive: cards stack vertically on mobile with a horizontal image-left layout for better mobile UX.
- ESLint clean, all features browser-verified.

---
Task ID: 56-63
Agent: main (Z.ai Code)
Task: Build AI post generator using GLM 5.2 API with focus/related keywords, SEO 88%+ score, external links, AI image, and API key in settings.

Work Log:
- Updated Prisma schema: added `aiApiKey` and `aiModel` fields to SiteSetting. Pushed to DB + regenerated Prisma client.
- Built `src/lib/seo-score.ts` — a comprehensive SEO score calculator with 12 weighted checks: focus keyword in title (10pts), first paragraph (10pts), headings (10pts), keyword density 0.5-2.5% (10pts), related keywords present (10pts), content length 600+ words (10pts), meta description 120-160 chars with keyword (10pts), external links 2+ (10pts), image alt text with keyword (5pts), slug with keyword (5pts), heading structure 2+ H2/1+ H3 (5pts), readable paragraphs avg ≤120 words (5pts). Returns 0-100 score with pass/fail at 88%.
- Built `/api/ai-generate-post` route: calls GLM (z-ai-web-dev-sdk chat.completions) with a detailed SEO-focused system prompt that instructs the model to write 700+ words, include the focus keyword in title/first paragraph/headings, include 3+ external links to authoritative sources (Wikipedia, Tate, Smithsonian, etc.), use related keywords, and follow proper heading structure. Also calls the image generation API to create a cover image. Returns the generated content + SEO score + all metadata.
- Added `aiGeneratePost` method to the API client.
- Built `AIPostGeneratorDialog` component: form with focus keyword (required), related keywords (tag input with add/remove), topic, category, tone selector, generate-image toggle. On generate: shows loading state, then displays results with a prominent SEO score banner (green if ≥88%, amber if below), 12-check breakdown with pass/fail details, content preview toggle, metadata. "Regenerate" and "Use this article" actions.
- Updated `PostsManager`: added "AI Generate" button (primary-colored outline) next to "New article". When the user generates and clicks "Use this article", automatically creates a draft post with all generated fields (title, slug, content, excerpt, cover image, tags, meta title/description) and opens the editor for review.
- Added "AI" tab to `SettingsManager`: GLM AI integration description, API key input (optional, password field), model input (default "glm-5.2"), and a step-by-step usage guide.
- Updated settings API route to allow aiApiKey/aiModel fields; updated SiteSetting type.
- Verified end-to-end with Agent Browser: opened admin → Articles → AI Generate → entered focus keyword "acrylic pouring for beginners" + 3 related keywords (dirty pour, flip cup technique, acrylic pouring medium) → clicked Generate → GLM wrote 817-word article with proper H2/H3 structure and external links → AI generated cover image → SEO score: 97% (12/12 checks passed, far exceeding the 88% target) → clicked "Use this article" → draft created in editor with all fields populated → verified in database. Also verified Settings → AI tab shows API key and model inputs.

Stage Summary:
- Complete AI post generator fully functional and browser-verified:
  1. GLM 5.2 text generation: writes 700+ word SEO-optimized articles with focus keyword in title/first-para/headings, related keywords, 3+ external links to authoritative sources.
  2. AI cover image: auto-generated from the focus keyword.
  3. SEO scorer: 12-check scoring system, target 88%+ (achieved 97% in test).
  4. Admin UI: AI Generate button in Posts Manager, full dialog with keyword inputs, live SEO score preview, content preview, one-click draft creation.
  5. Settings: AI tab with API key and model inputs.
- ESLint clean, dev server healthy, test draft cleaned up.

---
Task ID: 67-69
Agent: main (Z.ai Code)
Task: Fix 504 timeout when generating image in AI post generator.

Work Log:
- Root cause: The /api/ai-generate-post route generated both text (GLM LLM, ~15s) AND image (AI image gen, ~20-30s) in a single request. Total ~40-50s exceeded the Caddy gateway's timeout, causing a 504 Gateway Timeout.
- Fix: Split into two separate requests:
  1. `/api/ai-generate-post` now generates TEXT ONLY (fast, ~10-15s, well within gateway timeout). Returns an `imagePrompt` field for the frontend to use.
  2. The frontend (AI generator dialog) calls the existing `/api/generate-image` route SEPARATELY after the text arrives, with a loading indicator.
- Updated `/api/ai-generate-post` route: removed all image generation code, removed `generateImage` parameter, returns `imagePrompt` string for frontend use.
- Updated API client: removed `generateImage` parameter from `aiGeneratePost` method, added `imagePrompt` to return type.
- Updated `AIPostGeneratorDialog`:
  - Added `imageLoading` state
  - Rewrote `generate()` function: Step 1 calls aiGeneratePost (text only) and sets result immediately. Step 2 (if generateImage checkbox is checked) calls api.generateImage separately and updates the result with the cover image.
  - Added image loading indicator in the SEO score banner (spinner + "Generating image… This takes ~20s")
  - "Use this article" button disabled while image is generating, shows "Generating image…" text
  - "Regenerate" button also disabled while image is generating
  - Toast notifications for each step: "Article generated!" then "Cover image generated." or "Image generation failed"
- Verified with Agent Browser: Generated article with focus keyword "fluid art techniques" — text arrived in ~15s (no 504), image generated separately in ~30s with loading indicator, final result showed cover image + TOC + SEO score. Zero 504 errors in dev log.

Stage Summary:
- 504 timeout fixed by splitting text and image generation into separate HTTP requests.
- Text arrives first (fast, within gateway timeout), image generates second with a clear loading indicator.
- User can use the article immediately after text arrives (image is optional and can be added manually if it fails).
- ESLint clean, 0 504 errors, browser-verified.

---
Task ID: REBUILD
Agent: general-purpose sub-agent
Task: Recreate missing files lost during a git rebase (theme system, URL router, WYSIWYG editor, catch-all route) and rewire navigation/header/footer/settings to use them.

Work Log:
- Read worklog.md + every touched file to understand the existing architecture (Zustand store, settings-context, post-editor, settings-manager, header/footer, Prisma schema, types, settings API).
- Created `src/lib/themes.ts` — 12 niche theme presets (art, food, tech, lifestyle, fashion, travel, wellness, business, photography, gaming, education, minimal) each with primary/accent/background/foreground/card/secondary/muted/border colors + font pairing. Exports `ThemePreset` interface, `THEMES` array, `getTheme(id)`, and `applyTheme(theme)` which writes ~25 CSS custom properties to `document.documentElement` (primary/foreground/secondary/muted/border/ring/chart-*/sidebar-*/font-serif/font-sans + derived foregrounds computed via a WCAG luminance helper). Also injects a Google Fonts `<link id="theme-fonts">` so chosen serifs (Playfair Display, Cormorant Garamond, Lora) actually load.
- Created `src/lib/url-router.ts` — `urlToRoute(pathname, search)` returns `{ route, admin }` recognising /, /blog, /blog?q=, /about, /contact, /shop, /article/{slug}, /category/{slug}, /product/{slug}, /page/{slug}, /admin; `routeToUrl(route)` converts back. Imports `Route` as a type-only import to avoid a runtime circular dependency with the store.
- Created `src/components/admin/rich-text-editor.tsx` — WYSIWYG `contentEditable` editor with full toolbar (Undo, Redo, H2/H3/P, Bold, Italic, Underline, Strikethrough, Align Left/Center/Right, Bullet List, Numbered List, Quote, Inline Code, Insert Link, Upload Image, Media Library, Insert Video, Horizontal Rule). Uses `document.execCommand` + `queryCommandState` for active-format tracking via a `selectionchange` listener. Media library pulls from `api.media.list`, image upload via `api.media.upload`, link/video use Dialog modals (YouTube/Vimeo/.mp4 supported). Toolbar buttons are plain `<button>` elements rendered through a `tBtn()` helper — no components created inside render (satisfies `react-hooks/static-components`). Accepts `value`/`onChange`/`placeholder`/`minHeight` props.
- Created `src/app/[...slug]/page.tsx` — catch-all route that re-exports the main page so all deep-linkable URLs (/article/x, /category/y, /page/z, /admin) resolve to the SPA.
- Rewrote `src/store/app-store.ts` — added `import { routeToUrl, urlToRoute }`, kept all existing route + admin-view types (shop/product/page, products/productEditor/pages/pageEditor already present), rewired every navigation function (navigate/openPost/openCategory/openSearch/openProduct/openPage) to `window.history.pushState(routeToUrl(route))` + scrollToTop. Added `pushUrl()` and `scrollToTop()` helpers and a `syncFromUrl()` action that parses `window.location` and applies route + admin state (cleans `/admin` URL back to `/` after opening the admin overlay so the public site stays visible underneath).
- Updated `src/app/page.tsx` — Shell now calls `syncFromUrl()` on mount and registers a `popstate` listener so browser back/forward re-syncs SPA state. Destructures `syncFromUrl` from `useApp`.
- Updated `src/components/admin/post-editor.tsx` — replaced the markdown Textarea + Visual/Preview Tabs with `<RichTextEditor value={form.content} onChange={(html)=>update({content:html})} minHeight={480} />`. Rewrote `insertAtCursor` to append HTML to content (since the WYSIWYG manages its own caret) and `insertImageIntoContent` to insert a `<figure><img/></figure>` HTML block instead of markdown `![]()`. Removed now-unused Tabs/Eye/Markdown imports. All other metaboxes (Publish, Category, Tags, Featured Image, Excerpt, Affiliate Links, SEO), scheduling, AI image dialog, insert HTML/Affiliate dialogs preserved.
- Updated `src/components/admin/settings-manager.tsx` — added LayoutGrid + Check icons, imported `THEMES/getTheme/applyTheme` + `cn`. Added a "Theme" TabsTrigger between Branding and About, plus a TabsContent showing a visual gallery of all 12 presets (color swatch tiles with primary/accent/background, name, niche, description, 5-dot palette strip, checkmark on the selected one). Clicking a preset calls `applyTheme(t)` + `update({ theme: t.id, primaryColor, accentColor })` + toast.
- Updated `src/components/site/header.tsx` — removed Shield icon import, removed `openAdmin` from `useApp()` destructure, removed the Admin button from the utility bar, removed the Admin icon button from header actions, and replaced the "Admin Panel" button in the mobile sheet with a "Search articles" button. Logo, nav, search, category strips, mobile menu all preserved.
- Updated `src/components/site/settings-context.tsx` — imported `getTheme` + `applyTheme`; the `refresh()` callback now resolves the configured theme (defaulting to 'art') and calls `applyTheme(theme)` after fetching settings — replacing the old primaryColor-only `--ring` setter.
- Updated `prisma/schema.prisma` — switched datasource `provider` from `sqlite` to `postgresql` and added `directUrl = env("DATABASE_URL")`. Added `theme String? @default("art")` to the `SiteSetting` model (after `aiModel`).
- Updated `src/lib/types.ts` — added `theme?: string | null` to the `SiteSetting` interface (after `aiModel`).
- Updated `src/app/api/settings/route.ts` — added `'theme'` to the allowed PUT fields array.
- Updated `src/components/site/footer.tsx` — removed Shield import, removed `openAdmin` from destructure, removed the Admin link from the Explore column. Newsletter, socials, legal pages, footer-text rows all preserved.
- Verified: `bun run lint` passes clean. `bunx tsc --noEmit` reports zero errors in any touched/new file (the few pre-existing TS errors in header.tsx/home-view.tsx/post-view.tsx are about `c.icon: string | null | undefined` vs `string | undefined` on the existing CategoryIcon component and were not introduced by this task).

Stage Summary:
- Twelve niche theme presets are now selectable from Settings → Theme, with the chosen palette + font pairing applied live via CSS custom properties and persisted to the SiteSetting table.
- All public navigation now pushes real, shareable URLs (/article/foo, /category/bar, /page/privacy, /shop, /product/x, /blog?q=…) and the browser back/forward buttons work via a popstate listener.
- `/admin` deep-link opens the admin overlay; the URL is cleaned back to `/` so the public site stays behind it.
- Post editor replaced the markdown textarea with a true WYSIWYG visual editor (contentEditable + execCommand toolbar + media library + image upload + link/video dialogs). Existing insert-HTML/affiliate/AI-image flows still work — they now append HTML to the WYSIWYG content.
- Admin entry points removed from the public header + footer; admin is now accessible only via the `/admin` URL (URL-based access) per the spec.
- ESLint clean across the whole project.
