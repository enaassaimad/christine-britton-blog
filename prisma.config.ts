// Prisma config for v6 compatibility — ensures db push works with the env DATABASE_URL
import path from 'node:path'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
})
