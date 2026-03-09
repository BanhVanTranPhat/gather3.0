'use client'
import signal from '@/utils/signal'
import React, { useState, useEffect, useRef } from 'react'
import { Chat, ArrowUpLeft, PaperPlaneTilt } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

type ChatLogProps = {}

type Message = {
    content: string,
    username: string,
    color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'pink' | 'orange' | 'cyan' | 'white' | 'black'
}

function getColorClass(color: Message['color']) {
    switch (color) {
        case 'red':
            return 'text-red-500'
        case 'blue':
            return 'text-blue-500'
        case 'green':
            return 'text-green-500'
        case 'yellow':
            return 'text-yellow-500'
        case 'purple':
            return 'text-purple-500'
        case 'pink':
            return 'text-pink-500'
        case 'orange':
            return 'text-orange-500'
        case 'cyan':
            return 'text-cyan-500'
        case 'white':
            return 'text-white'
        case 'black':
            return 'text-black'
        default:
            return 'text-white'
    }
}

const MAX_MESSAGE_LENGTH = 500

const ChatLog: React.FC<ChatLogProps> = () => {
    const [messages, setMessages] = useState<Message[]>([])
    const [expanded, setExpanded] = useState(true)
    const [inputValue, setInputValue] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const onNewMessage = (message: Message) => {
            setMessages(prevMessages => [message, ...prevMessages])
        }

        const onNewRoomChat = (data: { name: string, channelId: string }) => {
            setMessages([{
                content: `Joined room ${data.name}. ${data.channelId ? 'Chat will be sent to channel: #' + data.channelId : ''}`,
                username: '',
                color: 'green'
            }])
        }

        signal.on('newMessage', onNewMessage)
        signal.on('newRoomChat', onNewRoomChat)

        return () => {
            signal.off('newMessage', onNewMessage)
            signal.off('newRoomChat', onNewRoomChat)
        }
    }, [])

    const expand = () => {
        setExpanded(true)
    }

    const collapse = () => {
        setExpanded(false)
    }

    const sendMessage = () => {
        const content = inputValue.trim()
        if (!content || content.length > MAX_MESSAGE_LENGTH) return
        signal.emit('message', content)
        setInputValue('')
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <div className='absolute top-0 left-0 z-10'>
            <AnimatePresence mode="wait">
                {!expanded && (
                    <motion.div
                        key="collapsed"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        className='bg-secondary hover:bg-light-secondary animate-colors p-2 grid place-items-center rounded-br-lg cursor-pointer'
                        onClick={expand}
                    >
                        <Chat className='h-7 w-7' />
                    </motion.div>
                )}
                {expanded && (
                    <motion.div
                        key="expanded"
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.15 }}
                        className='bg-secondary bg-opacity-95 w-[500px] max-h-[280px] rounded-br-lg transparent-scrollbar relative flex flex-col'
                    >
                    <div className='flex-1 min-h-0 flex flex-col-reverse overflow-y-scroll p-2 pr-10'>
                        {messages.map((message, index) => (
                            <div key={index} className={getColorClass(message.color)}>
                                {message.username && <span className='font-bold'>{message.username}: </span>}{message.content}
                            </div>
                        ))}
                    </div>
                    <div className='flex gap-2 p-2 border-t border-light-gray'>
                        <input
                            ref={inputRef}
                            type='text'
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                            onKeyDown={handleKeyDown}
                            placeholder='Nhập tin nhắn... (Enter để gửi)'
                            className='flex-1 bg-darkblue rounded-lg px-3 py-2 text-sm text-white placeholder-[#9CA3AF] outline-none focus:ring-1 focus:ring-quaternary'
                            maxLength={MAX_MESSAGE_LENGTH}
                        />
                        <button
                            type='button'
                            onClick={sendMessage}
                            disabled={!inputValue.trim()}
                            className='p-2 rounded-lg bg-quaternary hover:bg-quaternaryhover disabled:opacity-50 disabled:cursor-not-allowed text-primary transition-colors'
                            title='Gửi'
                        >
                            <PaperPlaneTilt className='w-5 h-5' />
                        </button>
                    </div>
                    <button
                        type='button'
                        className='absolute bottom-2 right-2 rounded-lg bg-darkblue hover:bg-light-secondary p-2 transition-colors'
                        onClick={collapse}
                        title='Thu gọn'
                    >
                        <ArrowUpLeft className='h-4 w-4' />
                    </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ChatLog
