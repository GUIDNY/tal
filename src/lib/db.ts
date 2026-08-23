import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// @neondatabase/serverless converts Postgres DATE columns to JS Date objects using the
// process's local timezone (not UTC) — on a non-UTC host that silently shifts every
// @db.Date value by a day once .toISOString() is called on it downstream. Every date in
// this app is a plain calendar date with no meaningful time component, so force UTC.
process.env.TZ = "UTC";

declare global {
  var __prisma: PrismaClient | undefined;
}

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = global.__prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
