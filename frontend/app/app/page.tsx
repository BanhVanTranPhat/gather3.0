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
    const { data: ownedRealms, error } = await auth.from('realms').select('id, name, share_id, mapTemplate')
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
        <div className='min-h-screen bg-[#f5f5f5]'>
            <Navbar />
            <div className='max-w-6xl mx-auto px-6 pt-6'>
                <RealmsMenu realms={realms} errorMessage={errorMessage}/>
            </div>
        </div>
    )
}
