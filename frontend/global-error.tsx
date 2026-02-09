'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900 text-white">
          <h2 className="mb-8 text-4xl font-bold">App Crashed!</h2>
          <button
            onClick={() => reset()}
            className="rounded-lg bg-purple-600 px-8 py-4 text-lg font-semibold hover:bg-purple-700"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
