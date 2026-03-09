'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChatCircle, Bell, Gear, List } from '@phosphor-icons/react'

type PlayTopBarProps = {
    roomName: string
    onChatClick?: () => void
    onSidebarToggle?: () => void
}

const PlayTopBar: React.FC<PlayTopBarProps> = ({ roomName, onChatClick, onSidebarToggle }) => {
    const [showNotifications, setShowNotifications] = useState(false)

    return (
        <header className="h-12 flex-shrink-0 bg-primary border-b border-[#3F4776] flex items-center justify-between px-4 select-none">
            <div className="flex items-center gap-3">
                {onSidebarToggle && (
                    <button
                        type="button"
                        onClick={onSidebarToggle}
                        className="p-1.5 rounded-lg hover:bg-light-secondary text-white/90 lg:hidden"
                        aria-label="Toggle sidebar"
                    >
                        <List className="w-6 h-6" />
                    </button>
                )}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-lg font-bold text-[#CAD8FF]">
                        G
                    </div>
                    <span className="text-white font-medium truncate max-w-[180px] sm:max-w-[240px]">
                        {roomName}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={onChatClick}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-light-secondary text-white text-sm font-medium"
                >
                    <ChatCircle className="w-5 h-5" weight="duotone" />
                    <span className="hidden sm:inline">Trò chuyện</span>
                </button>
                <button
                    type="button"
                    onClick={() => setShowNotifications((v) => !v)}
                    className="p-2 rounded-lg hover:bg-light-secondary text-white/80"
                    aria-label="Notifications"
                >
                    <Bell className="w-5 h-5" />
                </button>
                <Link
                    href="/app"
                    className="p-2 rounded-lg hover:bg-light-secondary text-white/80"
                    aria-label="Settings / Home"
                >
                    <Gear className="w-5 h-5" />
                </Link>
            </div>
        </header>
    )
}

export default PlayTopBar
