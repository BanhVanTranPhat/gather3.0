import { createClient } from '@/utils/auth/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar/Navbar'
import RealmsMenu from './RealmsMenu/RealmsMenu'
import { getVisitedRealms } from '@/utils/backend/getVisitedRealms'

export default async function App() {

    const auth = await createClient()
    if (!auth?.auth) {
        return redirect('/signin')
    }

    const { data: { user } } = await auth.auth.getUser()
    const { data: { session } } = await auth.auth.getSession()

    if (!user || !session) {
        return redirect('/signin')
    }

    const realms: any = []
    const { data: ownedRealms, error } = await auth.from('realms').select('id, name, share_id')
    if (ownedRealms) {
        realms.push(...ownedRealms)
    }
    if (session) {
        let { data: visitedRealms, error: visitedRealmsError } = await getVisitedRealms(session.access_token)
        if (visitedRealms) {
            visitedRealms = visitedRealms.map((realm) => ({ ...realm, shared: true }))
            realms.push(...visitedRealms)
        }
    }
    const errorMessage = error?.message || ''

    return (
        <div>
            <Navbar />
            <h1 className='text-3xl pl-4 sm:pl-8 pt-8'>Your Spaces</h1>
            <RealmsMenu realms={realms} errorMessage={errorMessage}/>
        </div>
    )
}