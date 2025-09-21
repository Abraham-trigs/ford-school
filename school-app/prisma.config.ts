// prisma.config.ts
import type { Config } from "@prisma/client";

const config: Config = {
  // Future-proof: seed command for Prisma >= 6
  seed: "ts-node prisma/seed.ts",
};

export default config;
