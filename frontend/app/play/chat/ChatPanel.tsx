'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { server } from '@/utils/backend/server'
import { getToken } from '@/utils/backendApi'
import ChannelList from './ChannelList'
import DirectMessageList from './DirectMessageList'
import MessageView from './MessageView'
import MessageComposer from './MessageComposer'
import ChatHeader from './ChatHeader'
import { Hash, MessageCircle, Plus, X } from 'lucide-react'

export type ChatChannelData = {
    _id: string
    realmId: string
    name: string
    type: 'channel' | 'dm'
    members: string[]
    createdBy: string
}

export type ChatMessageData = {
    _id: string
    channelId: string
    senderId: string
    senderName: string
    content: string
    timestamp: string
}

type ChatPanelProps = {
    realmId: string
    uid: string
    username: string
}

const ChatPanel: React.FC<ChatPanelProps> = ({ realmId, uid, username }) => {
    const [channels, setChannels] = useState<ChatChannelData[]>([])
    const [activeChannel, setActiveChannel] = useState<ChatChannelData | null>(null)
    const [messages, setMessages] = useState<ChatMessageData[]>([])
    const [loading, setLoading] = useState(true)
    const [typingUser, setTypingUser] = useState<string | null>(null)
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const prevChannelRef = useRef<string | null>(null)

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'

    const fetchChannels = useCallback(async () => {
        const token = getToken()
        if (!token) return
        try {
            const res = await fetch(`${backendUrl}/chat/channels/${realmId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            if (data.channels) {
                setChannels(data.channels)
                if (!activeChannel && data.channels.length > 0) {
                    setActiveChannel(data.channels[0])
                }
            }
        } catch (e) {
            console.error('Failed to fetch channels:', e)
        } finally {
            setLoading(false)
        }
    }, [realmId, backendUrl])

    const fetchMessages = useCallback(async (channelId: string) => {
        const token = getToken()
        if (!token) return
        try {
            const res = await fetch(`${backendUrl}/chat/messages/${channelId}?limit=50`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            if (data.messages) setMessages(data.messages)
        } catch (e) {
            console.error('Failed to fetch messages:', e)
        }
    }, [backendUrl])

    useEffect(() => {
        fetchChannels()
    }, [fetchChannels])

    useEffect(() => {
        if (!activeChannel) return

        if (prevChannelRef.current) {
            server.socket.emit('leaveChatChannel', prevChannelRef.current)
        }
        server.socket.emit('joinChatChannel', activeChannel._id)
        prevChannelRef.current = activeChannel._id
        fetchMessages(activeChannel._id)
        setTypingUser(null)
    }, [activeChannel?._id, fetchMessages])

    useEffect(() => {
        const onMessage = (msg: ChatMessageData) => {
            if (msg.channelId === activeChannel?._id) {
                setMessages(prev => [...prev, msg])
            }
        }
        const onTyping = (data: { channelId: string; username: string }) => {
            if (data.channelId === activeChannel?._id && data.username !== username) {
                setTypingUser(data.username)
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
                typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 2000)
            }
        }

        server.socket.on('chatMessageReceived', onMessage)
        server.socket.on('chatUserTyping', onTyping)
        return () => {
            server.socket.off('chatMessageReceived', onMessage)
            server.socket.off('chatUserTyping', onTyping)
        }
    }, [activeChannel?._id, username])

    const sendMessage = useCallback((content: string) => {
        if (!activeChannel || !content.trim()) return
        server.socket.emit('chatMessage', {
            channelId: activeChannel._id,
            content: content.trim(),
            senderName: username,
        })
    }, [activeChannel, username])

    const handleTyping = useCallback(() => {
        if (!activeChannel) return
        server.socket.emit('chatTyping', {
            channelId: activeChannel._id,
            username,
        })
    }, [activeChannel, username])

    const createChannel = useCallback(async (name: string) => {
        const token = getToken()
        if (!token || !name.trim()) return
        try {
            const res = await fetch(`${backendUrl}/chat/channels`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ realmId, name: name.trim(), type: 'channel' }),
            })
            const data = await res.json()
            if (data.channel) {
                setChannels(prev => [...prev, data.channel])
                setActiveChannel(data.channel)
            }
        } catch (e) {
            console.error('Failed to create channel:', e)
        }
    }, [realmId, backendUrl])

    const createDM = useCallback(async (targetUid: string, targetName: string) => {
        const token = getToken()
        if (!token) return
        try {
            const res = await fetch(`${backendUrl}/chat/channels`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    realmId,
                    name: targetName,
                    type: 'dm',
                    members: [uid, targetUid],
                }),
            })
            const data = await res.json()
            if (data.channel) {
                setChannels(prev => {
                    const exists = prev.find(c => c._id === data.channel._id)
                    return exists ? prev : [...prev, data.channel]
                })
                setActiveChannel(data.channel)
            }
        } catch (e) {
            console.error('Failed to create DM:', e)
        }
    }, [realmId, uid, backendUrl])

    const channelsList = channels.filter(c => c.type === 'channel')
    const dmList = channels.filter(c => c.type === 'dm')

    if (loading) {
        return (
            <div className="absolute inset-0 z-20 bg-[#1a1d2e]/95 backdrop-blur flex items-center justify-center">
                <div className="text-white/40 text-sm">Loading chat...</div>
            </div>
        )
    }

    return (
        <div className="absolute inset-0 z-20 flex bg-[#1a1d2e]/95 backdrop-blur-sm">
            <div className="w-56 border-r border-white/10 flex flex-col shrink-0">
                <div className="px-3 py-3 border-b border-white/10">
                    <h2 className="text-white font-bold text-sm">Chat</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <ChannelList
                        channels={channelsList}
                        activeId={activeChannel?._id ?? null}
                        onSelect={setActiveChannel}
                        onCreate={createChannel}
                    />
                    <DirectMessageList
                        dms={dmList}
                        activeId={activeChannel?._id ?? null}
                        onSelect={setActiveChannel}
                        uid={uid}
                    />
                </div>
            </div>

            <div className="flex-1 flex flex-col min-w-0">
                {activeChannel ? (
                    <>
                        <ChatHeader channel={activeChannel} uid={uid} />
                        <MessageView
                            messages={messages}
                            uid={uid}
                            typingUser={typingUser}
                        />
                        <MessageComposer
                            onSend={sendMessage}
                            onTyping={handleTyping}
                            channelName={activeChannel.name}
                        />
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-white/30 text-sm">
                        Select a channel to start chatting
                    </div>
                )}
            </div>
        </div>
    )
}

export default ChatPanel
