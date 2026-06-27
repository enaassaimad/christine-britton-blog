// Lightweight typed fetch helpers for the frontend
import type { Post, Category, SiteSetting, User, Comment, Media } from './types'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'content-type': 'application/json', ...(options?.headers || {}) },
    ...options,
  })
  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const data = await res.json()
      message = data.error || message
    } catch {}
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

export const api = {
  auth: {
    me: () => request<{ user: User | null }>('/api/auth/me'),
    login: (email: string, password: string) =>
      request<{ user: User }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    logout: () => request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),
  },
  posts: {
    list: (params: Record<string, string | number | boolean | undefined> = {}) => {
      const q = new URLSearchParams()
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') q.set(k, String(v))
      })
      return request<{ posts: (Post & { author: User; category: Category; _count?: { comments: number } })[]; total: number; totalPages: number }>(`/api/posts?${q}`)
    },
    get: (id: string) => request<{ post: Post & { author: User; category: Category } }>(`/api/posts/${id}`),
    getBySlug: (slug: string) =>
      request<{ post: Post & { author: User; category: Category; comments: Comment[] }; related: (Post & { author: User; category: Category })[] }>(`/api/posts/slug/${slug}`),
    create: (data: any) => request<{ post: Post }>('/api/posts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<{ post: Post }>(`/api/posts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id: string) => request<{ ok: boolean }>(`/api/posts/${id}`, { method: 'DELETE' }),
  },
  categories: {
    list: () => request<{ categories: (Category & { _count?: { posts: number } })[] }>('/api/categories'),
    create: (data: any) => request<{ category: Category }>('/api/categories', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<{ category: Category }>(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id: string) => request<{ ok: boolean }>(`/api/categories/${id}`, { method: 'DELETE' }),
  },
  comments: {
    list: (status = 'ALL') => request<{ comments: (Comment & { post: { id: string; title: string; slug: string } })[] }>(`/api/comments?status=${status}`),
    create: (data: { postId: string; author: string; email: string; content: string }) =>
      request<{ comment: Comment }>('/api/comments', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<{ comment: Comment }>(`/api/comments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => request<{ ok: boolean }>(`/api/comments/${id}`, { method: 'DELETE' }),
  },
  settings: {
    get: () => request<{ setting: SiteSetting }>('/api/settings'),
    update: (data: any) => request<{ setting: SiteSetting }>('/api/settings', { method: 'PUT', body: JSON.stringify(data) }),
  },
  media: {
    list: () => request<{ media: Media[] }>('/api/media'),
    create: (data: any) => request<{ media: Media }>('/api/media', { method: 'POST', body: JSON.stringify(data) }),
    remove: (id: string) => request<{ ok: boolean }>(`/api/media/${id}`, { method: 'DELETE' }),
    upload: async (file: File) => {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Upload failed')
      return res.json() as Promise<{ url: string }>
    },
  },
  stats: {
    get: () =>
      request<{
        totals: { posts: number; published: number; drafts: number; views: number; likes: number; comments: number; pendingComments: number; subscribers: number; categories: number }
        topPosts: { id: string; title: string; slug: string; views: number; likes: number; category: { name: string } }[]
        categoriesWithCounts: { name: string; count: number }[]
        recentPosts: { id: string; title: string; slug: string; status: string; createdAt: string; category: { name: string } }[]
      }>('/api/stats'),
  },
  subscribers: {
    create: (email: string, name?: string) =>
      request<{ subscriber: { id: string } }>('/api/subscribers', { method: 'POST', body: JSON.stringify({ email, name }) }),
  },
  generateImage: (prompt: string, size = '1344x768') =>
    request<{ url: string; prompt: string; size: string }>('/api/generate-image', {
      method: 'POST',
      body: JSON.stringify({ prompt, size }),
    }),
}
