import { createClient } from '@/utils/auth/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar/Navbar'
import ChatContent from './ChatContent'

export default async function ChatPage() {
  const auth = await createClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) redirect('/signin')

  const displayName = (user.user_metadata as { displayName?: string })?.displayName || user.email?.split('@')[0] || ''

  return (
    <div className="min-h-screen bg-primary text-white flex flex-col">
      <Navbar />
      <ChatContent uid={user.id} displayName={displayName} />
    </div>
  )
}
