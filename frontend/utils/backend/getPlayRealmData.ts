'use server'
import 'server-only'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'

export async function getPlayRealmData(accessToken: string, shareId: string) {
    const userRes = await fetch(`${BACKEND_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!userRes.ok) return { data: null, error: { message: 'Invalid token' } }
    const user = await userRes.json()

    const res = await fetch(`${BACKEND_URL}/realms/by-share/${shareId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) return { data: null, error: { message: 'Realm not found' } }
    const realm = await res.json()

    if (realm.owner_id === user.id) return { data: realm, error: null }
    if (realm.only_owner) return { data: null, error: { message: 'only owner' } }
    return { data: realm, error: null }
}
