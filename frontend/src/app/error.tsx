'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900 text-white">
      <h2 className="mb-8 text-4xl font-bold">Something went wrong!</h2>
      <p className="mb-8 text-xl">{error.message || "An unexpected error occurred"}</p>
      <button
        onClick={() => reset()}
        className="rounded-lg bg-purple-600 px-8 py-4 text-lg font-semibold hover:bg-purple-700 transition"
      >
        Try again
      </button>
    </div>
  )
}
