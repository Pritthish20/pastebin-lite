export function nowMs(req: Request): number {
  if (process.env.TEST_MODE === "1") {
    const header = req.headers.get("x-test-now-ms")
    if (header) {
      return Number(header)
    }
  }
  return Date.now()
}
