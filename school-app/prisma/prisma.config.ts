// prisma.config.ts
import dotenv from "dotenv";
dotenv.config();

const config: {
  schema: string;
  client: { output: string };
  shadowDatabaseUrl?: string;
} = {
  schema: "prisma/schema.prisma",
  client: {
    output: "node_modules/.prisma/client",
  },
  shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
};

export default config;
