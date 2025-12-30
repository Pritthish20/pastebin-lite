import { redis } from "@/lib/redis"
import { notFound } from "next/navigation"

export default async function PastePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const raw = await redis.get(`paste:${id}`)
  if (!raw) notFound()

  const paste = JSON.parse(raw)
  const now = Date.now()

  if (paste.expiresAtMs && now >= paste.expiresAtMs) notFound()
  if (paste.maxViews !== null && paste.views >= paste.maxViews) notFound()

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-[#FFF7E6]">
      <div className="w-full max-w-3xl bg-white border border-[#E6D3A3] rounded-lg p-6">
        <pre className="whitespace-pre-wrap text-sm leading-6">
          {paste.content}
        </pre>
      </div>
    </main>
  )
}
