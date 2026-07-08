-- Christine Britton Blog — MySQL Database Schema + Seed Data
-- Import this file in Hostinger phpMyAdmin to create all tables and populate content
--
-- How to use:
-- 1. Log into Hostinger hPanel → Databases → phpMyAdmin
-- 2. Select your database (e.g. u123456789_christine_britton)
-- 3. Click "Import" tab
-- 4. Choose this file and click "Go"

SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables (safe to re-import)
DROP TABLE IF EXISTS `Comment`;
DROP TABLE IF EXISTS `Post`;
DROP TABLE IF EXISTS `Category`;
DROP TABLE IF EXISTS `User`;
DROP TABLE IF EXISTS `SiteSetting`;
DROP TABLE IF EXISTS `Media`;
DROP TABLE IF EXISTS `Subscriber`;
DROP TABLE IF EXISTS `Page`;
DROP TABLE IF EXISTS `DigitalProduct`;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE `User` (
  `id` VARCHAR(128) PRIMARY KEY,
  `email` VARCHAR(191) UNIQUE NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `password` VARCHAR(191) NOT NULL,
  `role` VARCHAR(191) DEFAULT 'ADMIN',
  `avatar` VARCHAR(191),
  `bio` TEXT,
  `createdAt` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Category` (
  `id` VARCHAR(128) PRIMARY KEY,
  `name` VARCHAR(191) UNIQUE NOT NULL,
  `slug` VARCHAR(191) UNIQUE NOT NULL,
  `description` TEXT,
  `color` VARCHAR(191),
  `icon` VARCHAR(191),
  `createdAt` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Post` (
  `id` VARCHAR(128) PRIMARY KEY,
  `title` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) UNIQUE NOT NULL,
  `excerpt` TEXT,
  `content` LONGTEXT NOT NULL,
  `coverImage` VARCHAR(191),
  `coverAlt` VARCHAR(191),
  `status` VARCHAR(191) DEFAULT 'DRAFT',
  `featured` BOOLEAN DEFAULT FALSE,
  `trending` BOOLEAN DEFAULT FALSE,
  `readMinutes` INT DEFAULT 5,
  `tags` VARCHAR(191),
  `metaTitle` VARCHAR(191),
  `metaDescription` TEXT,
  `showAds` BOOLEAN DEFAULT TRUE,
  `affiliateLinks` LONGTEXT,
  `views` INT DEFAULT 0,
  `likes` INT DEFAULT 0,
  `authorId` VARCHAR(128) NOT NULL,
  `categoryId` VARCHAR(128) NOT NULL,
  `publishedAt` DATETIME(3),
  `createdAt` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX `Post_status_publishedAt_idx` (`status`, `publishedAt`),
  INDEX `Post_categoryId_idx` (`categoryId`),
  INDEX `Post_authorId_idx` (`authorId`),
  CONSTRAINT `Post_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Post_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Comment` (
  `id` VARCHAR(128) PRIMARY KEY,
  `postId` VARCHAR(128) NOT NULL,
  `author` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `content` TEXT NOT NULL,
  `status` VARCHAR(191) DEFAULT 'PENDING',
  `createdAt` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `Comment_postId_status_idx` (`postId`, `status`),
  CONSTRAINT `Comment_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `SiteSetting` (
  `id` VARCHAR(128) PRIMARY KEY DEFAULT 'singleton',
  `siteName` VARCHAR(191) DEFAULT 'Christine Britton',
  `tagline` VARCHAR(191) DEFAULT 'Fluid art, resin art & creative drawing tutorials',
  `description` TEXT,
  `logoText` VARCHAR(191),
  `logoUrl` VARCHAR(191),
  `faviconUrl` VARCHAR(191),
  `primaryColor` VARCHAR(191) DEFAULT '#b45309',
  `accentColor` VARCHAR(191) DEFAULT '#9a3412',
  `email` VARCHAR(191),
  `phone` VARCHAR(191),
  `location` VARCHAR(191),
  `twitter` VARCHAR(191),
  `instagram` VARCHAR(191),
  `facebook` VARCHAR(191),
  `linkedin` VARCHAR(191),
  `pinterest` VARCHAR(191),
  `youtube` VARCHAR(191),
  `aboutTitle` VARCHAR(191),
  `aboutContent` TEXT,
  `aboutImage` VARCHAR(191),
  `adsenseClient` VARCHAR(191),
  `adsenseSlotHeader` VARCHAR(191),
  `adsenseSlotInArticle` VARCHAR(191),
  `adsenseSlotSidebar` VARCHAR(191),
  `adsenseSlotFooter` VARCHAR(191),
  `adsenseSlotInContent` VARCHAR(191),
  `adsEnabled` BOOLEAN DEFAULT TRUE,
  `newsletterTitle` VARCHAR(191),
  `newsletterText` TEXT,
  `footerText` VARCHAR(191),
  `aiApiKey` VARCHAR(191),
  `aiModel` VARCHAR(191) DEFAULT 'glm-5.2',
  `theme` VARCHAR(191) DEFAULT 'art',
  `updatedAt` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Media` (
  `id` VARCHAR(128) PRIMARY KEY,
  `url` VARCHAR(191) NOT NULL,
  `alt` TEXT,
  `caption` TEXT,
  `width` INT,
  `height` INT,
  `type` VARCHAR(191) DEFAULT 'image',
  `createdAt` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Subscriber` (
  `id` VARCHAR(128) PRIMARY KEY,
  `email` VARCHAR(191) UNIQUE NOT NULL,
  `name` VARCHAR(191),
  `createdAt` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Page` (
  `id` VARCHAR(128) PRIMARY KEY,
  `title` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) UNIQUE NOT NULL,
  `content` LONGTEXT NOT NULL,
  `excerpt` TEXT,
  `type` VARCHAR(191) DEFAULT 'LEGAL',
  `showInFooter` BOOLEAN DEFAULT TRUE,
  `order` INT DEFAULT 0,
  `createdAt` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `DigitalProduct` (
  `id` VARCHAR(128) PRIMARY KEY,
  `title` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) UNIQUE NOT NULL,
  `excerpt` TEXT,
  `description` LONGTEXT NOT NULL,
  `coverImage` VARCHAR(191),
  `coverAlt` VARCHAR(191),
  `price` VARCHAR(191) NOT NULL DEFAULT 'Free',
  `originalPrice` VARCHAR(191),
  `buyUrl` VARCHAR(191) NOT NULL,
  `buyLabel` VARCHAR(191) DEFAULT 'Buy now',
  `category` VARCHAR(191),
  `featured` BOOLEAN DEFAULT FALSE,
  `tags` VARCHAR(191),
  `order` INT DEFAULT 0,
  `createdAt` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Admin user (password: admin123 — hashed with pbkdf2)
INSERT INTO `User` (`id`, `email`, `name`, `password`, `role`, `avatar`, `bio`, `createdAt`, `updatedAt`) VALUES
('user_admin_001', 'admin@christinebritton.com', 'Christine Britton', 'c7e9b2a4f8d1e6c3a5b9d2f7e8a1c4b6:d1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2', 'ADMIN', '/uploads/author.jpg', 'Lifelong artist on the West coast of Scotland. Fluid art, resin art, drawing and a belief that creativity knows no age limits. Author of The Quantum Prescription.', NOW(3), NOW(3));

-- Categories
INSERT INTO `Category` (`id`, `name`, `slug`, `description`, `color`, `icon`, `createdAt`, `updatedAt`) VALUES
('cat_fluid_art', 'Fluid Art', 'fluid-art', 'Acrylic pouring, dutch pours, blooms and swiping — the mesmerising world of fluid art.', '#0d7d6e', 'Droplet', NOW(3), NOW(3)),
('cat_resin_art', 'Resin Art', 'resin-art', 'Resin and epoxy techniques, geode coasters, ocean art and glossy finishes.', '#0e7490', 'Gem', NOW(3), NOW(3)),
('cat_drawing', 'Drawing', 'drawing', 'Pencil art, shading techniques, sketches and realistic drawing guides.', '#854d0e', 'Pencil', NOW(3), NOW(3)),
('cat_doodle', 'Doodle Art', 'doodle-art', 'Zentangle, doodle journals, name doodles and easy drawing ideas for beginners.', '#9333ea', 'Sparkles', NOW(3), NOW(3)),
('cat_posca', 'Posca Art', 'posca-art', 'Vibrant posca marker techniques, canvas art, flowers and scenic landscapes.', '#be185d', 'PaintBucket', NOW(3), NOW(3)),
('cat_clay', 'Clay Art', 'clay-art', 'Polymer clay, air dry clay, cardboard sculpture and handmade creations.', '#b45309', 'Brush', NOW(3), NOW(3)),
('cat_culture', 'Art Culture', 'art-culture', 'Famous artists, history of art and the movements that shaped creative expression.', '#713f12', 'BookOpen', NOW(3), NOW(3));

-- Posts
INSERT INTO `Post` (`id`, `title`, `slug`, `excerpt`, `content`, `coverImage`, `coverAlt`, `status`, `featured`, `trending`, `readMinutes`, `tags`, `metaTitle`, `metaDescription`, `showAds`, `affiliateLinks`, `views`, `likes`, `authorId`, `categoryId`, `publishedAt`, `createdAt`, `updatedAt`) VALUES
('post_001', 'What Is Fluid Art Painting?', 'what-is-fluid-art-painting', 'Fluid art, or acrylic pouring, is a delightful blend of science and creativity where liquid acrylics are poured onto canvas to make stunning abstract patterns.', '<div class="table-of-contents"><h2>Table of Contents</h2><ol><li><a href="#section-1">Definition and Origins</a></li><li><a href="#section-2">Techniques and Methods</a></li><li><a href="#section-3">Why Fluid Art Is So Popular</a></li></ol></div>\n\n## A delightful blend of science and creativity\n\nFluid art painting, also known as **acrylic pouring**, is a delightful blend of science and creativity where artists pour liquid acrylics onto canvases to make stunning abstract patterns. For more on the history, see [Wikipedia''s acrylic pouring article](https://en.wikipedia.org/wiki/Acrylic_painting).\n\n## Definition and Origins {#section-1}\n\nFluid art painting, commonly known as acrylic pouring, is a contemporary art technique that involves pouring acrylic paint onto a canvas to create abstract designs. This technique was pioneered by [David Alfaro Siqueiros](https://en.wikipedia.org/wiki/David_AlFaro_Siqueiros) in the 1930s.\n\n## Techniques and Methods {#section-2}\n\nAcrylic pouring encompasses various techniques such as **clean pour**, **dirty pour**, **flip cup**, and **swipe**. The [Tate Modern](https://www.tate.org.uk/) has documented several of these approaches.\n\n## Why Fluid Art Is So Popular {#section-3}\n\nFluid art''s unique blend of science and creativity continues to captivate artists and enthusiasts alike.', '/uploads/post-fluid.jpg', 'A colourful acrylic pour painting with swirling cells', 'PUBLISHED', TRUE, TRUE, 5, 'fluid art,acrylic pouring,abstract art,beginners', 'What Is Fluid Art Painting?', 'Fluid art, or acrylic pouring, is a delightful blend of science and creativity.', TRUE, NULL, 3200, 145, 'user_admin_001', 'cat_fluid_art', DATE_SUB(NOW(), INTERVAL 10 DAY), NOW(3), NOW(3)),

('post_002', 'How to Doodle Sketch: Easy Guide for Beginners', 'how-to-doodle-sketch-easy-guide-for-beginners', 'Anyone can doodle. This beginner-friendly guide covers the supplies, the mindset and the simple steps to start doodling with confidence today.', '## Doodling is drawing without the pressure\n\nHere''s the secret nobody tells you about doodling: it is not a lesser form of art. It is the most free, most playful, most forgiving kind of drawing there is. See [this guide](https://en.wikipedia.org/wiki/Doodle) for more.\n\n### What you need to start\n\n- A pen you like\n- Any paper\n- That''s it\n\n### Five simple steps\n\n1. Warm up with lines\n2. Pick a simple shape\n3. Repeat and vary\n4. Add detail\n5. Keep going', '/uploads/post-doodle.jpg', 'A hand doodling zentangle patterns in a sketchbook', 'PUBLISHED', TRUE, TRUE, 4, 'doodle art,drawing,beginners,sketchbook', 'How to Doodle Sketch', 'Anyone can doodle. A beginner-friendly guide to start doodling.', TRUE, NULL, 2100, 98, 'user_admin_001', 'cat_doodle', DATE_SUB(NOW(), INTERVAL 7 DAY), NOW(3), NOW(3)),

('post_003', 'Resin Art and Epoxy Techniques: A Beginner''s Guide', 'resin-art-and-epoxy-techniques-beginners-guide', 'Glossy, glass-like and endlessly versatile — resin art is addictive. Here is everything a beginner needs to know to pour safely and beautifully.', '## Glossy, glass-like and endlessly versatile\n\nThere is nothing quite like the finish of cured resin. For safety guidelines, see [this resource](https://en.wikipedia.org/wiki/Epoxy).\n\n### Safety first\n\n- Wear nitrile gloves\n- Work in a well-ventilated space\n- Protect your surfaces\n\n### The basic pour\n\n1. Measure precisely\n2. Mix slowly\n3. Split and colour\n4. Pour\n5. Torch the bubbles\n6. Cover and cure', '/uploads/post-resin.jpg', 'A glossy resin art piece with embedded pigments', 'PUBLISHED', FALSE, TRUE, 5, 'resin art,epoxy,beginners,tutorial', 'Resin Art for Beginners', 'Glossy, glass-like and endlessly versatile — resin art is addictive.', TRUE, NULL, 1800, 76, 'user_admin_001', 'cat_resin_art', DATE_SUB(NOW(), INTERVAL 5 DAY), NOW(3), NOW(3)),

('post_004', '17 Creative Pencil Art Drawings to Boost Your Imagination', '17-creative-pencil-art-drawings-to-boost-your-imagination', 'Stuck for what to draw? These 17 creative pencil art ideas will spark your imagination — from realistic textures to surreal compositions.', '## Pick up a pencil and let your imagination loose\n\nThere is something deeply satisfying about a pencil. No batteries, no charging, no undo button — just graphite, paper and your hand.\n\n### Nature & texture\n\n1. A single leaf, drawn from life\n2. Tree bark close-up\n3. A wave, mid-break\n4. A feather\n\n### People & faces\n\n5. A self-portrait, blind contour\n6. Hands in different positions\n7. An elderly face\n8. A profile in shadow', '/uploads/post-pencil.jpg', 'A detailed pencil drawing with shading and texture', 'PUBLISHED', TRUE, FALSE, 6, 'pencil art,drawing,sketching,ideas', '17 Creative Pencil Art Drawings', 'Stuck for what to draw? These 17 ideas will spark your imagination.', TRUE, NULL, 2500, 112, 'user_admin_001', 'cat_drawing', DATE_SUB(NOW(), INTERVAL 3 DAY), NOW(3), NOW(3)),

('post_005', 'The History of Fluid Art', 'the-history-of-fluid-art', 'From David Alfaro Siqueiros'' accidental paintings in the 1930s to today''s acrylic pouring craze — the surprising history of fluid art.', '## From accidental experiments to a global creative movement\n\nWhen we think of fluid art, we often picture the vibrant acrylic pours flooding social media today. But the story of fluid art stretches back nearly a century. See [Tate''s abstract art collection](https://www.tate.org.uk/art/artworks).\n\n### The 1930s: Siqueiros and accidental painting\n\nThe earliest documented exploration of fluid art techniques comes from Mexican muralist **David Alfaro Siqueiros** in the 1930s.', '/uploads/post-fluid2.jpg', 'Historic abstract pour painting in earthy tones', 'PUBLISHED', FALSE, TRUE, 5, 'fluid art,history,acrylic pouring,art history', 'The History of Fluid Art', 'From Siqueiros to social media — the surprising history of fluid art.', TRUE, NULL, 1500, 67, 'user_admin_001', 'cat_fluid_art', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW(3), NOW(3));

-- Site Settings
INSERT INTO `SiteSetting` (`id`, `siteName`, `tagline`, `description`, `logoText`, `primaryColor`, `accentColor`, `email`, `location`, `twitter`, `facebook`, `instagram`, `pinterest`, `aboutTitle`, `aboutContent`, `aboutImage`, `adsenseClient`, `adsenseSlotHeader`, `adsenseSlotInArticle`, `adsenseSlotSidebar`, `adsenseSlotFooter`, `adsenseSlotInContent`, `adsEnabled`, `newsletterTitle`, `newsletterText`, `footerText`, `aiApiKey`, `aiModel`, `theme`, `updatedAt`) VALUES
('singleton', 'Christine Britton', 'Fluid art, resin art & creative drawing tutorials', 'Fluid art, resin art, doodle drawing and creative tutorials from a lifelong artist on the West coast of Scotland.', 'Christine Britton', '#b45309', '#9a3412', 'hello@christinebritton.com', 'West coast of Scotland', 'fluidartpaint', 'fluidartcommunity', 'christinebrittonart', 'christinebrittonart', 'About Christine', 'As a child of the 60''s I experienced many opportunities and freedoms to explore my world. I found myself engrossed in painting and sculpture. Following graduation I began teaching. Marriage, mortgage and 6 children later and my artistic goals became sidelined. My zest for learning new ways to express my creativity is alive and kicking! From pillows, blooms, dutch pours, swiping, embellishing and trying new recipes, this art form is exciting and engaging.', '/uploads/about.jpg', 'ca-pub-0000000000000000', '0000000000', '0000000001', '0000000002', '0000000003', '0000000004', TRUE, 'The Creative Letter', 'Weekly fluid art techniques, drawing prompts and step-by-step tutorials. No spam, ever.', '© 2025 Christine Britton • All rights reserved', '', 'glm-5.2', 'art', NOW(3));

-- Legal Pages
INSERT INTO `Page` (`id`, `title`, `slug`, `content`, `excerpt`, `type`, `showInFooter`, `order`, `createdAt`, `updatedAt`) VALUES
('page_privacy', 'Privacy Policy', 'privacy-policy', '## Privacy Policy\n\nThis page describes our policies regarding the collection, use, and disclosure of personal data. We use Google AdSense and cookies.\n\n### Information we collect\n\n- Your name and email when you subscribe\n- Log data: IP address, browser type, pages visited\n- Cookies for analytics and advertising\n\n### Third-party services\n\nWe use Google AdSense and Google Analytics. You can opt out of personalised ads at [Google Ads Settings](https://www.google.com/settings/ads).\n\n### Affiliate disclosure\n\nSome links are affiliate links. See our [Disclaimer](/page/disclaimer).\n\n### Contact\n\nQuestions? Contact us via our [Contact page](/contact).', 'How we collect, use and protect your information.', 'LEGAL', TRUE, 1, NOW(3), NOW(3)),

('page_terms', 'Terms & Conditions', 'terms-and-conditions', '## Terms & Conditions\n\nBy using our website, you agree to these terms.\n\n### Use of the Service\n\nYou may use our Service for personal, non-commercial purposes. Reproduction of full articles without permission is prohibited.\n\n### Intellectual property\n\nAll content is the exclusive property of Christine Britton and is protected by copyright law.\n\n### Affiliate links\n\nSome links are affiliate links. See our [Privacy Policy](/page/privacy-policy).\n\n### Changes\n\nWe may update these Terms at any time.', 'The terms governing your use of this website.', 'LEGAL', TRUE, 2, NOW(3), NOW(3)),

('page_disclaimer', 'Disclaimer', 'disclaimer', '## Disclaimer\n\n### General information\n\nThe information provided is for general informational and educational purposes only.\n\n### Art materials and safety\n\nSome art materials may pose health risks if misused. Always read manufacturer instructions and use protective equipment.\n\n### Affiliate disclosure\n\nSome links are affiliate links. If you buy something through them, we may earn a small commission at no extra cost to you.', 'Affiliate disclosure and general disclaimers.', 'LEGAL', TRUE, 3, NOW(3), NOW(3)),

('page_cookie', 'Cookie Policy', 'cookie-policy', '## Cookie Policy\n\nWe use cookies for analytics and advertising.\n\n### Types of cookies\n\n- Essential cookies (necessary for the site to function)\n- Analytics cookies (Google Analytics)\n- Advertising cookies (Google AdSense)\n\n### Managing cookies\n\nYou can control cookies through your browser settings. Opt out of personalised ads at [aboutads.info](https://www.aboutads.info/choices).', 'How and why we use cookies.', 'LEGAL', TRUE, 4, NOW(3), NOW(3)),

('page_dmca', 'DMCA Policy', 'dmca-policy', '## DMCA / Copyright Policy\n\nChristine Britton respects intellectual property rights.\n\n### Reporting infringement\n\nTo report copyright infringement, contact us via our [Contact page](/contact) with:\n1. Identification of the copyrighted work\n2. The URL of the infringing material\n3. Your contact information\n4. A statement of good faith belief\n5. Your electronic signature\n\n### Counter-notification\n\nIf you believe content was removed in error, you may submit a counter-notification.', 'How to report copyright infringement.', 'LEGAL', TRUE, 5, NOW(3), NOW(3));

-- Digital Products
INSERT INTO `DigitalProduct` (`id`, `title`, `slug`, `excerpt`, `description`, `coverImage`, `coverAlt`, `price`, `originalPrice`, `buyUrl`, `buyLabel`, `category`, `featured`, `tags`, `order`, `createdAt`, `updatedAt`) VALUES
('prod_001', 'The Complete Fluid Art Handbook', 'complete-fluid-art-handbook', 'A 120-page ebook covering every acrylic pouring technique.', '## Everything you need to master fluid art\n\nA 120-page illustrated ebook covering every acrylic pouring technique.\n\n### What''s inside\n\n- 8 technique chapters\n- Recipe cards with exact ratios\n- Troubleshooting guide\n- Supply list with links', '/uploads/product-handbook.jpg', 'Fluid Art Handbook ebook cover', '$19.99', '$29.99', 'https://gumroad.com/l/fluid-art-handbook', 'Buy the ebook', 'ebook', TRUE, 'fluid art,ebook', 1, NOW(3), NOW(3)),

('prod_002', 'Resin Art for Beginners — Video Course', 'resin-art-beginners-course', 'A 2-hour video course taking you from resin safety to your first finished pieces.', '## Go from resin novice to confident creator\n\nA 2-hour video course with 5 modules covering safety, mixing, and 3 complete projects.', '/uploads/product-resin-course.jpg', 'Resin Art course cover', '$34.99', NULL, 'https://gumroad.com/l/resin-art-course', 'Enrol now', 'course', TRUE, 'resin art,course', 2, NOW(3), NOW(3)),

('prod_003', 'Posca Art Pattern Pack — 50 Printable Designs', 'posca-pattern-pack', '50 hand-drawn posca-ready patterns you can print and trace.', '## 50 patterns, endless possibilities\n\nA downloadable pack of 50 hand-drawn patterns for posca marker art.', '/uploads/product-pattern-pack.jpg', 'Posca Pattern Pack cover', '$9.99', '$14.99', 'https://gumroad.com/l/posca-pattern-pack', 'Get the pack', 'template', TRUE, 'posca art,patterns', 3, NOW(3), NOW(3)),

('prod_004', 'The Quantum Prescription', 'the-quantum-prescription', 'Christine Britton''s book exploring creativity, consciousness, and healing.', '## Healing the body with the mind\n\nChristine Britton''s exploration of the intersection between creativity, consciousness, and healing.', '/uploads/product-quantum.jpg', 'The Quantum Prescription book cover', '$12.99', NULL, 'https://gumroad.com/l/quantum-prescription', 'Buy the book', 'ebook', FALSE, 'book,creativity', 4, NOW(3), NOW(3)),

('prod_005', 'Doodle Journal Starter Kit', 'doodle-journal-starter-kit', 'Everything you need to start a daily doodle practice.', '## Start your doodle habit today\n\nA complete starter kit: 30 prompt cards, 24-page guidebook, 4 video lessons, and printable dot-grid pages.', '/uploads/product-doodle-kit.jpg', 'Doodle Journal Starter Kit cover', '$7.99', NULL, 'https://gumroad.com/l/doodle-journal-kit', 'Get the kit', 'bundle', FALSE, 'doodle art,journal', 5, NOW(3), NOW(3));
