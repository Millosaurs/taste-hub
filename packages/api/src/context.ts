import type { NextRequest } from "next/server";

export async function createContext(_req: NextRequest) {
  return {};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
