"use client";

import { useEffect, useState } from "react";

interface PasteBodyInterface {
  content?: string;
  ttl_seconds?: number;
  max_views?: number;
}

function useDebouncedValueWithCommit<T>(value: T, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isCommitting, setIsCommitting] = useState(false);

  useEffect(() => {
    if (value === debouncedValue) return;

    const timer = setTimeout(() => {
      setIsCommitting(true);

      // Commit the value
      setDebouncedValue(value);

      // Keep spinner visible for a short, perceptible time
      const commitTimer = setTimeout(() => {
        setIsCommitting(false);
      }, 200);

      return () => clearTimeout(commitTimer);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay, debouncedValue]);

  return { debouncedValue, isCommitting };
}

function Spinner() {
  return (
    <span
      className="
        inline-block w-4 h-4
        border-2 border-current border-t-transparent
        rounded-full animate-spin
      "
    />
  );
}

export default function HomePage() {
  const [contentInput, setContentInput] = useState("");
  const [ttlInput, setTtlInput] = useState("");
  const [maxViewsInput, setMaxViewsInput] = useState("");

  const { debouncedValue: content, isCommitting: isContentCommitting } =
    useDebouncedValueWithCommit(contentInput);

  const { debouncedValue: ttl, isCommitting: isTtlCommitting } =
    useDebouncedValueWithCommit(ttlInput);

  const { debouncedValue: maxViews, isCommitting: isMaxViewsCommitting } =
    useDebouncedValueWithCommit(maxViewsInput);

  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isDebounceCommitting =
    isContentCommitting || isTtlCommitting || isMaxViewsCommitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");
    setUrl("");
    setCopied(false);

    try {
      const body: PasteBodyInterface = {};

      if (content) body.content = content;
      if (ttl) body.ttl_seconds = Number(ttl);
      if (maxViews) body.max_views = Number(maxViews);

      const res = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setUrl(data.url);
      setContentInput("");
      setTtlInput("");
      setMaxViewsInput("");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!url || loading) return;

    navigator.clipboard.writeText(url);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  function handleOpen() {
    if (!url || loading) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="notebook ruled w-full max-w-3xl p-6">
        <h1 className="text-2xl font-medium mb-6">Pastebin Lite</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg border border-[#E6D3A3] p-6 space-y-4"
        >
          <textarea
            className="w-full min-h-[260px] resize-none outline-none text-sm leading-6 bg-transparent"
            placeholder="Write your paste here…"
            value={contentInput}
            onChange={(e) => setContentInput(e.target.value)}
            required
          />

          <div className="flex gap-4 text-sm">
            <input
              type="number"
              min={1}
              placeholder="TTL (seconds)"
              value={ttlInput}
              onChange={(e) => setTtlInput(e.target.value)}
              className="border border-[#E6D3A3] rounded px-3 py-1 w-40 bg-transparent"
            />

            <input
              type="number"
              min={1}
              placeholder="Max views"
              value={maxViewsInput}
              onChange={(e) => setMaxViewsInput(e.target.value)}
              className="border border-[#E6D3A3] rounded px-3 py-1 w-40 bg-transparent"
            />
          </div>

          <div className="inline-flex items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              className="
               bg-[#7A3E00] text-white text-sm px-4 py-2 rounded
              hover:bg-[#653300]
                disabled:opacity-50 disabled:cursor-not-allowed
                inline-flex items-center gap-2
            "
            >
              {loading ? "Creating…" : "Create paste"}
            </button>
            {!loading && isDebounceCommitting && <Spinner />}
          </div>
        </form>

        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

        {url && (
          <div className="mt-4 text-sm space-y-2">
            <p className="break-all">{url}</p>

            <div className="flex gap-3">
              <button
                onClick={handleOpen}
                disabled={loading}
                className="
                  text-[#7A4A00] underline
                  hover:text-[#5C3A00]
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                Open
              </button>

              <button
                onClick={handleCopy}
                disabled={loading}
                className="
                  text-[#7A4A00] underline flex items-center gap-1
                  hover:text-[#5C3A00]
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                📋 {copied ? "Copied!" : "Copy link"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
