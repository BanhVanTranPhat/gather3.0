'use client'
import React from 'react'
import BasicButton from '@/components/BasicButton'
import AvatarPreview from '@/components/AvatarPreview'
import { DEFAULT_AVATAR_CONFIG } from '@/utils/avatarAssets'

type IntroScreenProps = {
    realmName: string
    skin: string
    username: string
    setShowIntroScreen: (show: boolean) => void
    avatarConfig?: Record<string, string> | null
}

const IntroScreen:React.FC<IntroScreenProps> = ({ realmName, skin, username, setShowIntroScreen, avatarConfig }) => {
    const config = avatarConfig && Object.keys(avatarConfig).length > 0 ? { ...DEFAULT_AVATAR_CONFIG, ...avatarConfig } : DEFAULT_AVATAR_CONFIG

    return (
        <main className='dark-gradient w-full h-screen flex flex-col items-center justify-center'>
            <h1 className='text-4xl font-semibold mb-16'>Welcome to <span className='text-[#CAD8FF]'>{realmName}</span></h1>
            <div className='flex flex-col items-center gap-6'>
                <div className='w-24 h-24 flex items-center justify-center overflow-hidden' style={{ imageRendering: 'pixelated' }}>
                    <div style={{ transform: 'scale(1.5)', transformOrigin: 'center center' }}>
                        <AvatarPreview avatarConfig={config} size={64} />
                    </div>
                </div>
                <p className='text-lg text-white'>{username}</p>
                <BasicButton className='py-2 px-16 text-lg' onClick={() => setShowIntroScreen(false)}>
                    Join Space
                </BasicButton>
                <p className='text-sm text-white/40 mt-2'>Video & audio will be available when you sit in a call zone</p>
            </div>
        </main>
    )
}

export default IntroScreen