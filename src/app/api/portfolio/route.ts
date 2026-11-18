import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { enforcePortfolioReadRateLimit } from "@/lib/rate-limit";
import { getPortfolioProjects } from "@/lib/portfolio-repository";
import { extractClientIp, hashIp } from "@/lib/security";
import {
  PORTFOLIO_CATEGORIES,
  PORTFOLIO_CATEGORY_SLUGS,
} from "@/schemas/portfolio";

const portfolioQuerySchema = z.object({
  category: z.enum(PORTFOLIO_CATEGORY_SLUGS).optional(),
  featured: z.enum(["true", "false"]).optional(),
});

export async function GET(request: NextRequest) {
  const env = getServerEnv();
  const ipHash = hashIp(extractClientIp(request.headers), env.IP_HASH_SALT);

  const limit = await enforcePortfolioReadRateLimit(ipHash);
  if (!limit.allowed) {
    const retryAfter = Math.max(
      1,
      limit.resetUnixSec - Math.floor(Date.now() / 1000)
    );
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const parsedQuery = portfolioQuerySchema.safeParse({
    category: searchParams.get("category") ?? undefined,
    featured: searchParams.get("featured") ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid portfolio query parameters.",
        allowedCategories: PORTFOLIO_CATEGORIES.map((c) => c.slug),
      },
      { status: 400 }
    );
  }

  let projects = await getPortfolioProjects();

  if (parsedQuery.data.category) {
    projects = projects.filter((p) => p.category === parsedQuery.data.category);
  }

  if (parsedQuery.data.featured === "true") {
    projects = projects.filter((p) => p.isFeatured);
  }

  return NextResponse.json(
    {
      ok: true,
      count: projects.length,
      categories: PORTFOLIO_CATEGORIES,
      projects,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    }
  );
}
