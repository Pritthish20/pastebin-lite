import { redis } from "@/lib/redis"
import { nanoid } from "nanoid"

export async function POST(req: Request) {
  let body
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 })
  }

  const { content, ttl_seconds, max_views } = body

  // Validation
  if (typeof content !== "string" || content.trim().length === 0) {
    return Response.json({ error: "invalid_content" }, { status: 400 })
  }

  if (ttl_seconds !== undefined) {
    if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
      return Response.json({ error: "invalid_ttl" }, { status: 400 })
    }
  }

  if (max_views !== undefined) {
    if (!Number.isInteger(max_views) || max_views < 1) {
      return Response.json({ error: "invalid_max_views" }, { status: 400 })
    }
  }

  const id = nanoid(10)
  const now = Date.now()

  const paste = {
    content,
    createdAtMs: now,
    expiresAtMs: ttl_seconds ? now + ttl_seconds * 1000 : null,
    maxViews: max_views ?? null,
    views: 0
  }

  await redis.set(`paste:${id}`, JSON.stringify(paste))

  const origin = req.headers.get("origin")

  return Response.json({
    id,
    url: `${origin}/p/${id}`
  })
}
