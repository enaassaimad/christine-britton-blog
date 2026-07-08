// Prisma config — loads .env explicitly so DATABASE_URL is available
import path from 'node:path'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  // Explicitly load .env so Prisma finds DATABASE_URL
  loadEnv: true,
})
