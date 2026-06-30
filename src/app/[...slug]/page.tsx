'use client'

// Catch-all route: renders the same app shell for all paths.
// This makes every URL directly visitable and refreshable (WordPress-style routing).
// The actual routing logic lives in the URL router (src/lib/url-router.ts) and
// the Zustand store (src/store/app-store.ts) which parses window.location on mount.
export { default } from '../page'
