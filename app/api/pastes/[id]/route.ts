import { redis } from "@/lib/redis"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const key = `paste:${id}`
  const raw = await redis.get(key)

  if (!raw) {
    return new Response(
      JSON.stringify({ error: "Not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    )
  }

  const paste = JSON.parse(raw)

  // TTL check
  const now =
    process.env.TEST_MODE === "1"
      ? Number(req.headers.get("x-test-now-ms") ?? Date.now())
      : Date.now()

  if (paste.expiresAtMs && now >= paste.expiresAtMs) {
    await redis.del(key)
    return new Response(
      JSON.stringify({ error: "Not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    )
  }

  // View limit check
  if (paste.maxViews !== null && paste.views >= paste.maxViews) {
    await redis.del(key)
    return new Response(
      JSON.stringify({ error: "Not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    )
  }

  // Increment views atomically
  paste.views += 1
  await redis.set(key, JSON.stringify(paste))

  return new Response(
    JSON.stringify({
      content: paste.content,
      remaining_views:
        paste.maxViews === null
          ? null
          : Math.max(0, paste.maxViews - paste.views),
      expires_at: paste.expiresAtMs
        ? new Date(paste.expiresAtMs).toISOString()
        : null
    }),
    { headers: { "Content-Type": "application/json" } }
  )
}
