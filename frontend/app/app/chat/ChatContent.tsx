'use client'

import { useEffect, useRef, useState } from 'react'
import { useLobbyChat, LobbyMessage } from '@/app/hooks/useLobbyChat'
import { ChatCircle, PaperPlaneTilt } from '@phosphor-icons/react'

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatContent({ uid, displayName }: { uid: string; displayName: string }) {
  const { connected, messages, sendMessage } = useLobbyChat(uid, displayName)
  const [input, setInput] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight)
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    sendMessage(input)
    setInput('')
  }

  return (
    <>
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <ChatCircle className="w-6 h-6 text-quaternary" weight="duotone" />
          <h1 className="text-xl font-bold">Chat chung</h1>
          {connected ? (
            <span className="text-xs text-green-400 font-medium">Đang kết nối</span>
          ) : (
            <span className="text-xs text-amber-400 font-medium">Đang kết nối...</span>
          )}
        </div>

        <div
          ref={listRef}
          className="flex-1 overflow-y-auto rounded-xl bg-secondary/80 border border-white/10 flex flex-col min-h-[320px] max-h-[calc(100vh-280px)]"
        >
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
              <ChatCircle className="w-12 h-12 text-slate-500 mb-3" />
              <p className="text-slate-400 text-sm">Chưa có tin nhắn. Gõ bên dưới để bắt đầu.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1 p-4">
              {messages.map((msg) => (
                <LobbyMessageItem key={msg.id} msg={msg} currentUid={uid} />
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Nhắn tin..."
            className="flex-1 px-4 py-3 rounded-xl bg-secondary border border-white/10 text-white placeholder-slate-400 outline-none focus:border-quaternary"
            maxLength={300}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || !connected}
            className="px-4 py-3 rounded-xl bg-quaternary hover:bg-quaternaryhover text-primary font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            <PaperPlaneTilt className="w-5 h-5" />
            Gửi
          </button>
        </div>
      </div>
    </>
  )
}

function LobbyMessageItem({ msg, currentUid }: { msg: LobbyMessage; currentUid: string }) {
  const isOwn = msg.uid === currentUid
  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0 bg-light-secondary"
        title={msg.username}
      >
        {msg.username.charAt(0).toUpperCase()}
      </div>
      <div className={`flex flex-col gap-0.5 min-w-0 max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <span className="text-xs text-slate-400 px-1">{msg.username}</span>
        <div
          className={`px-3 py-2 rounded-xl break-words text-sm ${
            isOwn ? 'bg-quaternary text-primary rounded-br-md' : 'bg-white/10 text-white rounded-bl-md'
          }`}
        >
          {msg.message}
        </div>
        <span className="text-[10px] text-slate-500">{formatTime(msg.timestamp)}</span>
      </div>
    </div>
  )
}
