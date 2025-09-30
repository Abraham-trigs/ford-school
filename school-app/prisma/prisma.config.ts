// prisma.config.ts
import { defineConfig } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  schema: 'prisma/schema.prisma', // points to your Prisma schema
  client: {
    output: 'node_modules/.prisma/client', // default Prisma Client output
  },
  // optional: shadow database for dev migrations to avoid enum & P3006 issues
  shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
});
