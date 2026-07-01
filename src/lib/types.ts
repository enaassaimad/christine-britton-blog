// Shared types for the frontend
export interface User {
  id: string
  email: string
  name: string
  role: string
  avatar?: string | null
  bio?: string | null
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  color?: string | null
  icon?: string | null
}

export interface Post {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  content: string
  coverImage?: string | null
  coverAlt?: string | null
  status: string
  featured: boolean
  trending: boolean
  readMinutes: number
  tags?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  showAds: boolean
  affiliateLinks?: AffiliateLink[] | null
  views: number
  likes: number
  authorId: string
  categoryId: string
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  postId: string
  author: string
  email: string
  content: string
  status: string
  createdAt: string
}

export interface AffiliateLink {
  id: string
  title: string
  url: string
  description?: string
  image?: string
  price?: string
  label?: string
}

export interface SiteSetting {
  id: string
  siteName: string
  tagline: string
  description?: string | null
  logoText?: string | null
  logoUrl?: string | null
  faviconUrl?: string | null
  primaryColor: string
  accentColor: string
  email?: string | null
  phone?: string | null
  location?: string | null
  twitter?: string | null
  instagram?: string | null
  facebook?: string | null
  linkedin?: string | null
  pinterest?: string | null
  youtube?: string | null
  aboutTitle?: string | null
  aboutContent?: string | null
  aboutImage?: string | null
  adsenseClient?: string | null
  adsenseSlotHeader?: string | null
  adsenseSlotInArticle?: string | null
  adsenseSlotSidebar?: string | null
  adsenseSlotFooter?: string | null
  adsenseSlotInContent?: string | null
  adsEnabled: boolean
  newsletterTitle?: string | null
  newsletterText?: string | null
  footerText?: string | null
  aiApiKey?: string | null
  aiModel?: string | null
}

export interface Media {
  id: string
  url: string
  alt?: string | null
  caption?: string | null
  width?: number | null
  height?: number | null
  type: string
  createdAt: string
}

export interface Page {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string | null
  type: string
  showInFooter: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export interface DigitalProduct {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  description: string
  coverImage?: string | null
  coverAlt?: string | null
  price: string
  originalPrice?: string | null
  buyUrl: string
  buyLabel: string
  category?: string | null
  featured: boolean
  tags?: string | null
  order: number
  createdAt: string
  updatedAt: string
}
