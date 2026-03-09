'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import signal from '@/utils/signal'
import { X, Minus, Maximize2, Minimize2, Users, PhoneOff, GripHorizontal } from 'lucide-react'

declare global {
    interface Window {
        JitsiMeetExternalAPI: any
    }
}

type CallInfo = {
    zoneId: string
    zoneName: string
    realmId: string
}

type JitsiCallPanelProps = {
    username: string
    realmId: string
}

type PanelSize = 'normal' | 'large'

let jitsiScriptLoaded = false

function loadJitsiScript(): Promise<void> {
    if (jitsiScriptLoaded && window.JitsiMeetExternalAPI) return Promise.resolve()
    return new Promise((resolve, reject) => {
        if (document.querySelector('script[src*="external_api.js"]')) {
            jitsiScriptLoaded = true
            resolve()
            return
        }
        const script = document.createElement('script')
        script.src = 'https://meet.jit.si/external_api.js'
        script.onload = () => { jitsiScriptLoaded = true; resolve() }
        script.onerror = reject
        document.head.appendChild(script)
    })
}

const PANEL_SIZES: Record<PanelSize, { w: number; h: number }> = {
    normal: { w: 480, h: 400 },
    large: { w: 680, h: 520 },
}

const JitsiCallPanel: React.FC<JitsiCallPanelProps> = ({ username, realmId }) => {
    const [callInfo, setCallInfo] = useState<CallInfo | null>(null)
    const [participantCount, setParticipantCount] = useState(0)
    const [minimized, setMinimized] = useState(false)
    const [panelSize, setPanelSize] = useState<PanelSize>('normal')
    const [elapsed, setElapsed] = useState(0)
    const [dragging, setDragging] = useState(false)
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const panelRef = useRef<HTMLDivElement>(null)
    const apiRef = useRef<any>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const dragStartRef = useRef<{ mouseX: number; mouseY: number; panelX: number; panelY: number } | null>(null)

    useEffect(() => {
        const onJoin = (data: CallInfo) => {
            setCallInfo(data)
            setElapsed(0)
            setMinimized(false)
            setPosition(null)
        }
        const onLeave = () => {
            if (apiRef.current) {
                apiRef.current.dispose()
                apiRef.current = null
            }
            setCallInfo(null)
            setParticipantCount(0)
            setElapsed(0)
            setMinimized(false)
            if (timerRef.current) clearInterval(timerRef.current)
        }

        signal.on('joinGroupCall', onJoin)
        signal.on('leaveGroupCall', onLeave)
        return () => {
            signal.off('joinGroupCall', onJoin)
            signal.off('leaveGroupCall', onLeave)
            if (apiRef.current) {
                apiRef.current.dispose()
                apiRef.current = null
            }
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [])

    useEffect(() => {
        if (callInfo) {
            timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [callInfo])

    useEffect(() => {
        if (!callInfo || !containerRef.current) return

        let disposed = false

        const initJitsi = async () => {
            try {
                await loadJitsiScript()
            } catch {
                console.error('Failed to load Jitsi script')
                return
            }

            if (disposed || !containerRef.current) return

            if (apiRef.current) {
                apiRef.current.dispose()
                apiRef.current = null
            }

            const roomName = `gather-${realmId.slice(0, 8)}-${callInfo.zoneId}`

            const api = new window.JitsiMeetExternalAPI('meet.jit.si', {
                roomName,
                parentNode: containerRef.current,
                width: '100%',
                height: '100%',
                userInfo: { displayName: username },
                configOverwrite: {
                    startWithAudioMuted: true,
                    startWithVideoMuted: false,
                    prejoinPageEnabled: false,
                    disableDeepLinking: true,
                    disableInviteFunctions: true,
                    hideConferenceSubject: true,
                    hideConferenceTimer: true,
                    toolbarConfig: { alwaysVisible: false, timeout: 3000 },
                    notifications: [],
                    disableProfile: true,
                    enableWelcomePage: false,
                    enableClosePage: false,
                },
                interfaceConfigOverwrite: {
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_BRAND_WATERMARK: false,
                    SHOW_POWERED_BY: false,
                    DEFAULT_BACKGROUND: '#1a1d2e',
                    FILM_STRIP_MAX_HEIGHT: 300,
                    DISABLE_FOCUS_INDICATOR: true,
                    DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
                    TOOLBAR_BUTTONS: [
                        'microphone', 'camera', 'hangup', 'tileview', 'fullscreen',
                    ],
                    TOOLBAR_ALWAYS_VISIBLE: false,
                    VERTICAL_FILMSTRIP: false,
                },
            })

            api.on('participantJoined', () => setParticipantCount(prev => prev + 1))
            api.on('participantLeft', () => setParticipantCount(prev => Math.max(0, prev - 1)))
            api.on('videoConferenceJoined', () => {
                setParticipantCount(1)
                api.executeCommand('setTileView', true)
            })
            api.on('readyToClose', () => signal.emit('leaveGroupCall'))

            apiRef.current = api
        }

        initJitsi()

        return () => { disposed = true }
    }, [callInfo?.zoneId, realmId, username])

    const onDragStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        const panel = panelRef.current
        if (!panel) return
        const rect = panel.getBoundingClientRect()
        dragStartRef.current = {
            mouseX: e.clientX,
            mouseY: e.clientY,
            panelX: rect.left,
            panelY: rect.top,
        }
        setDragging(true)
    }, [])

    useEffect(() => {
        if (!dragging) return
        const onMove = (e: MouseEvent) => {
            if (!dragStartRef.current) return
            const dx = e.clientX - dragStartRef.current.mouseX
            const dy = e.clientY - dragStartRef.current.mouseY
            setPosition({
                x: dragStartRef.current.panelX + dx,
                y: dragStartRef.current.panelY + dy,
            })
        }
        const onUp = () => {
            setDragging(false)
            dragStartRef.current = null
        }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
        return () => {
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
        }
    }, [dragging])

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60)
        const sec = s % 60
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
    }

    const toggleSize = useCallback(() => {
        setPanelSize(s => s === 'normal' ? 'large' : 'normal')
    }, [])

    if (!callInfo) return null

    const size = PANEL_SIZES[panelSize]

    const panelStyle: React.CSSProperties = position && !minimized
        ? { position: 'fixed', left: position.x, top: position.y, width: size.w, height: size.h, zIndex: 50 }
        : { position: 'absolute', top: 8, right: 8, width: size.w, height: size.h, zIndex: 30 }

    return (
        <>
            {/* Minimized bar - shown when minimized, clicking restores the panel */}
            {minimized && (
                <div
                    className="absolute z-30 bottom-16 right-3 flex items-center gap-2 bg-[#252840] border border-white/10 rounded-full px-3 py-2 shadow-xl cursor-pointer hover:bg-[#2d3055] transition-colors"
                    onClick={() => setMinimized(false)}
                >
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-white text-xs font-medium">{callInfo.zoneName}</span>
                    <span className="text-white/40 text-[10px] flex items-center gap-1">
                        <Users size={10} /> {participantCount}
                    </span>
                    <span className="text-white/30 text-[10px]">{formatTime(elapsed)}</span>
                    <button
                        onClick={(e) => { e.stopPropagation(); signal.emit('leaveGroupCall') }}
                        className="ml-1 p-1 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors"
                        title="Leave call"
                    >
                        <PhoneOff size={12} />
                    </button>
                </div>
            )}

            {/* Main panel - always mounted to keep the Jitsi iframe alive; hidden via CSS when minimized */}
            <div
                ref={panelRef}
                className="bg-[#1a1d2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col transition-[width,height] duration-200"
                style={{
                    ...panelStyle,
                    ...(minimized ? { position: 'fixed', left: -9999, top: -9999, width: 1, height: 1, overflow: 'hidden', opacity: 0, pointerEvents: 'none' } : {}),
                }}
            >
                {/* Header - draggable */}
                <div
                    className="flex items-center justify-between px-3 py-2 bg-[#252840]/80 border-b border-white/5 flex-shrink-0 select-none"
                    onMouseDown={onDragStart}
                    style={{ cursor: dragging ? 'grabbing' : 'grab' }}
                >
                    <div className="flex items-center gap-2 min-w-0">
                        <GripHorizontal size={14} className="text-white/20 flex-shrink-0" />
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                        <span className="text-white text-xs font-semibold truncate">{callInfo.zoneName}</span>
                        <span className="flex items-center gap-1 text-white/40 text-[10px] flex-shrink-0">
                            <Users size={10} /> {participantCount}
                        </span>
                        <span className="text-white/25 text-[10px] flex-shrink-0">{formatTime(elapsed)}</span>
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0" onMouseDown={e => e.stopPropagation()}>
                        <button
                            onClick={() => setMinimized(true)}
                            className="text-white/40 hover:text-white/80 p-1.5 rounded hover:bg-white/5 transition-colors"
                            title="Minimize"
                        >
                            <Minus size={13} />
                        </button>
                        <button
                            onClick={toggleSize}
                            className="text-white/40 hover:text-white/80 p-1.5 rounded hover:bg-white/5 transition-colors"
                            title={panelSize === 'normal' ? 'Enlarge' : 'Shrink'}
                        >
                            {panelSize === 'normal' ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
                        </button>
                        <button
                            onClick={() => signal.emit('leaveGroupCall')}
                            className="text-white/40 hover:text-red-400 p-1.5 rounded hover:bg-red-500/10 transition-colors"
                            title="Leave call"
                        >
                            <X size={13} />
                        </button>
                    </div>
                </div>

                {/* Jitsi iframe - always mounted */}
                <div ref={containerRef} className="flex-1 min-h-0" />
            </div>
        </>
    )
}

export default JitsiCallPanel
