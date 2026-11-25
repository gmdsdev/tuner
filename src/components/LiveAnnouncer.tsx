import { useEffect, useState } from 'react'

/** How long a message must stay unchanged before it's announced. */
const SETTLE_MS = 700

/**
 * Polite live region that only speaks once the message has settled,
 * so screen readers aren't flooded while the pitch wobbles.
 */
export function LiveAnnouncer({ message }: { message: string }) {
  const [announced, setAnnounced] = useState('')

  useEffect(() => {
    const id = window.setTimeout(() => setAnnounced(message), SETTLE_MS)
    return () => window.clearTimeout(id)
  }, [message])

  return (
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {announced}
    </div>
  )
}
