'use server'
import 'server-only'
import revalidate from '../revalidate'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'

export async function updateVisitedRealms(accessToken: string, shareId: string) {
    const profileRes = await fetch(`${BACKEND_URL}/profiles/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!profileRes.ok) return
    const profile = await profileRes.json()
    const visitedRealms = profile.visited_realms || []
    if (visitedRealms.includes(shareId)) return

    const updated = [...visitedRealms, shareId]
    await fetch(`${BACKEND_URL}/profiles/me`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ visited_realms: updated }),
    })
    revalidate('/app')
}
