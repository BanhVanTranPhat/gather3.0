'use client'
import React, { useEffect } from 'react'
import Link from 'next/link'
import { PlusCircleIcon, ChatBubbleLeftRightIcon, ArrowRightEndOnRectangleIcon } from '@heroicons/react/24/outline'
import { useModal } from '@/app/hooks/useModal'
import { useProfile } from '@/app/contexts/ProfileContext'
import BasicButton from '../BasicButton'
import { UserAvatarDisplay } from '../UserAvatarDisplay'

type NavbarChildProps = {
    name: string
    avatar?: string | null
}

export const NavbarChild: React.FC<NavbarChildProps> = ({ name, avatar }) => {
    const { setModal } = useModal()
    const { setProfile } = useProfile()

    useEffect(() => {
        setProfile(avatar ?? null, name)
    }, [avatar, name, setProfile])

    return (
        <div className='h-16'>
            <div className='w-full fixed bg-secondary flex flex-row items-center p-2 pl-8 justify-end sm:justify-between z-10'>
                <div className='hidden sm:flex flex-row items-center gap-2'>
                    <Link href="/app/chat" className="flex items-center gap-2 py-[10px] px-3 rounded-lg text-white hover:bg-light-secondary transition-colors">
                        <ChatBubbleLeftRightIcon className='h-5 w-5' />
                        Chat
                    </Link>
                    <BasicButton onClick={() => setModal('Join Realm')} className='flex flex-row items-center gap-2 py-[10px] !bg-transparent border border-[#3F4776] hover:!bg-white/5'>
                        Join Space
                        <ArrowRightEndOnRectangleIcon className='h-5'/>
                    </BasicButton>
                    <BasicButton onClick={() => setModal('Create Realm')} className='flex flex-row items-center gap-2 py-[10px]'>
                        Create Space
                        <PlusCircleIcon className='h-5'/>
                    </BasicButton>
                </div>
                <div
                    className='flex flex-row items-center gap-4 hover:bg-light-secondary animate-colors rounded-full cursor-pointer py-1 px-1 select-none'
                    onClick={() => setModal('Account Dropdown')}
                >
                    <p className='text-white'>{name}</p>
                    <UserAvatarDisplay
                        avatar={avatar ?? undefined}
                        displayName={name}
                        size="md"
                        className='ring-2 ring-white/20 ring-offset-2 ring-offset-secondary'
                    />
                </div>
            </div>
        </div>
    )
}