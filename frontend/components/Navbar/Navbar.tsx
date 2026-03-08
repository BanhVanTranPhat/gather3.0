import React from 'react'
import { createClient } from '@/utils/auth/server'
import { NavbarChild } from './NavbarChild'
import { formatEmailToName } from '@/utils/formatEmailToName'

export const Navbar:React.FC = async () => {

    const auth = await createClient()

    const { data: { user } } = await auth.auth.getUser()

    return (
        <NavbarChild name={formatEmailToName(user?.user_metadata?.email ?? user?.email ?? '')} avatar_url={user?.user_metadata?.avatar_url ?? ''}/>
    )
}
