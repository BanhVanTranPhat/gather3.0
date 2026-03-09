'use server'
import 'server-only'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'

export async function getVisitedRealms(access_token: string) {
    const profileRes = await fetch(`${BACKEND_URL}/profiles/me`, {
        headers: { Authorization: `Bearer ${access_token}` },
    })
    if (!profileRes.ok) return { data: null, error: { message: 'Invalid token' } }
    const profile = await profileRes.json()
    const shareIds: string[] = profile.visited_realms || []
    const visitedRealms: any[] = []
    const realmsToRemove: string[] = []

    for (const shareId of shareIds) {
        const res = await fetch(`${BACKEND_URL}/realms/by-share/${shareId}`, {
            headers: { Authorization: `Bearer ${access_token}` },
        })
        if (res.ok) {
            const data = await res.json()
            visitedRealms.push({ id: data.id, name: data.name, share_id: data.share_id })
        } else {
            realmsToRemove.push(shareId)
        }
    }

    if (realmsToRemove.length > 0) {
        const updated = shareIds.filter((s: string) => !realmsToRemove.includes(s))
        await fetch(`${BACKEND_URL}/profiles/me`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${access_token}`,
            },
            body: JSON.stringify({ visited_realms: updated }),
        })
    }

    return { data: visitedRealms, error: null }
}
