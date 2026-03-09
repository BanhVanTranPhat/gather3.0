'use client'

import React, { useEffect, useState } from 'react'
import { MicrophoneSlash } from '@phosphor-icons/react'
import signal from '@/utils/signal'
import { useVideoChat } from '@/app/hooks/useVideoChat'
import { videoChat } from '@/utils/video-chat/video-chat'

type SittingVideoPopupProps = {
    username: string
}

const SittingVideoPopup: React.FC<SittingVideoPopupProps> = ({ username }) => {
    const [isSitting, setIsSitting] = useState(false)
    const { isCameraMuted, isMicMuted } = useVideoChat()

    const show = isSitting && !isCameraMuted

    useEffect(() => {
        const onPlayerSitting = (sitting: boolean) => {
            setIsSitting(sitting)
        }
        signal.on('playerSitting', onPlayerSitting)
        return () => {
            signal.off('playerSitting', onPlayerSitting)
        }
    }, [])

    useEffect(() => {
        if (show) {
            videoChat.playVideoTrackAtElementId('sitting-local-video')
        } else {
            videoChat.playVideoTrackAtElementId('local-video')
        }
    }, [show])

    if (!show) return null

    return (
        <div className="absolute z-20 top-4 left-1/2 -translate-x-1/2 w-[233px] h-[130px] bg-[#0f0f1d] bg-opacity-95 rounded-lg overflow-hidden shadow-lg border border-[#424A61]">
            <div id="sitting-local-video" className="w-full h-full" />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 px-2 py-1.5 flex flex-row items-center gap-1">
                {isMicMuted && <MicrophoneSlash className="w-3 h-3 text-[#FF2F49] flex-shrink-0" />}
                <span className="text-white text-xs truncate">{username}</span>
            </div>
        </div>
    )
}

export default SittingVideoPopup
