'use client'
import React, { useEffect, useState } from 'react'
import PixiApp from './PixiApp'
import { RealmData } from '@/utils/pixi/types'
import PlayNavbar from './PlayNavbar'
import PlaySidebar from './PlaySidebar'
import ChatPanel from './chat/ChatPanel'
import CalendarPanel from './CalendarPanel'
import LibraryPanel from './LibraryPanel'
import ForumPanel from './ForumPanel'
import MapZoomControls from './MapZoomControls'
import MiniMap from './MiniMap'
import OverviewMap from './OverviewMap'
import FocusRoomPanel from './FocusRoomPanel'
import GitHubPanel from './GitHubPanel'
import JitsiCallPanel from './JitsiCallPanel'
import { useModal } from '../hooks/useModal'
import signal from '@/utils/signal'
import IntroScreen from './IntroScreen'

type PlayClientProps = {
    mapData: RealmData
    username: string
    access_token: string
    realmId: string
    uid: string
    ownerId: string
    shareId: string
    initialSkin: string
    name: string
    avatarConfig?: Record<string, string> | null
}

const PlayClient: React.FC<PlayClientProps> = ({
    mapData,
    username,
    access_token,
    realmId,
    uid,
    ownerId,
    shareId,
    initialSkin,
    name,
    avatarConfig,
}) => {
    const { setErrorModal, setDisconnectedMessage } = useModal()
    const [showIntroScreen, setShowIntroScreen] = useState(true)
    const [skin, setSkin] = useState(initialSkin || '009')
    const [showChatPanel, setShowChatPanel] = useState(false)
    const [showCalendarPanel, setShowCalendarPanel] = useState(false)
    const [showLibraryPanel, setShowLibraryPanel] = useState(false)
    const [showForumPanel, setShowForumPanel] = useState(false)
    const [inviteUrl, setInviteUrl] = useState('')

    useEffect(() => {
        setInviteUrl(`${window.location.origin}/play/${realmId}${shareId ? `?shareId=${shareId}` : ''}`)
    }, [realmId, shareId])

    useEffect(() => {
        const onShowKickedModal = (message: string) => {
            setErrorModal('Disconnected')
            setDisconnectedMessage(message)
        }
        const onShowDisconnectModal = () => {
            setErrorModal('Disconnected')
            setDisconnectedMessage('You have been disconnected from the server.')
        }
        const onSwitchSkin = (skin: string) => setSkin(skin)

        signal.on('showKickedModal', onShowKickedModal)
        signal.on('showDisconnectModal', onShowDisconnectModal)
        signal.on('switchSkin', onSwitchSkin)
        return () => {
            signal.off('showKickedModal', onShowKickedModal)
            signal.off('showDisconnectModal', onShowDisconnectModal)
            signal.off('switchSkin', onSwitchSkin)
        }
    }, [])

    return (
        <>
            {!showIntroScreen && (
                <div className="flex h-screen w-full bg-primary">
                    <PlaySidebar
                        username={username}
                        currentUid={uid}
                        ownerId={ownerId}
                        roomName={name}
                        realmId={realmId}
                        inviteUrl={inviteUrl}
                        avatarConfig={avatarConfig}
                        showChatPanel={showChatPanel}
                        onToggleChatPanel={() => setShowChatPanel((v) => !v)}
                        showCalendarPanel={showCalendarPanel}
                        onToggleCalendarPanel={(v) => setShowCalendarPanel(v)}
                        showLibraryPanel={showLibraryPanel}
                        onToggleLibraryPanel={(v) => setShowLibraryPanel(v)}
                        showForumPanel={showForumPanel}
                        onToggleForumPanel={(v) => setShowForumPanel(v)}
                    />
                    <div className="flex-1 flex flex-col min-w-0 relative">
                        <div className="flex-1 relative min-h-0">
                            <MapZoomControls />
                            <MiniMap />
                            <OverviewMap />
                            <FocusRoomPanel />
                            <GitHubPanel />
                            <JitsiCallPanel username={username} realmId={realmId} />
                            <PixiApp
                                mapData={mapData}
                                className="w-full h-full"
                                username={username}
                                access_token={access_token}
                                realmId={realmId}
                                uid={uid}
                                shareId={shareId}
                                initialSkin={skin}
                                avatarConfig={avatarConfig || undefined}
                            />
                            {showChatPanel && <ChatPanel realmId={realmId} uid={uid} username={username} />}
                            {showCalendarPanel && <CalendarPanel realmId={realmId} uid={uid} username={username} />}
                            {showLibraryPanel && <LibraryPanel realmId={realmId} uid={uid} username={username} />}
                            {showForumPanel && <ForumPanel realmId={realmId} uid={uid} username={username} />}
                        </div>
                        <PlayNavbar
                            username={username}
                            skin={skin}
                            realmId={realmId}
                            shareId={shareId}
                            avatarConfig={avatarConfig || undefined}
                        />
                    </div>
                </div>
            )}
            {showIntroScreen && (
                <IntroScreen
                    realmName={name}
                    skin={skin}
                    username={username}
                    setShowIntroScreen={setShowIntroScreen}
                    avatarConfig={avatarConfig || undefined}
                />
            )}
        </>
    )
}
export default PlayClient
