import React from 'react'
import { TShirt, Door, SmileySticker, Monitor, HandWaving } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AvatarPreview from '@/components/AvatarPreview'
import { DEFAULT_AVATAR_CONFIG } from '@/utils/avatarAssets'

type PlayNavbarProps = {
    username: string
    skin: string
    realmId?: string
    shareId?: string
    avatarConfig?: Record<string, string> | null
}

const PlayNavbar: React.FC<PlayNavbarProps> = ({ username, skin, realmId, shareId, avatarConfig }) => {
    const config =
        avatarConfig && Object.keys(avatarConfig).length > 0
            ? { ...DEFAULT_AVATAR_CONFIG, ...avatarConfig }
            : DEFAULT_AVATAR_CONFIG
    const router = useRouter()

    function onClickSkinButton() {
        const returnUrl = realmId ? `/play/${realmId}${shareId ? `?shareId=${shareId}` : ''}` : '/app'
        router.push(`/app/avatar?return=${encodeURIComponent(returnUrl)}`)
    }

    return (
        <div className="w-full h-12 flex-shrink-0 bg-[#1E2035]/95 backdrop-blur flex flex-row items-center justify-center gap-1 px-3 py-1.5 select-none border-t border-[#2D3054]">
            <Link
                href="/app"
                className="p-2 rounded-xl hover:bg-white/10 text-[#8B8FA3] hover:text-white transition-colors"
                title="Leave room"
            >
                <Door className="w-5 h-5" />
            </Link>

            <div className="h-9 bg-[#252840] rounded-xl overflow-hidden flex flex-row items-center border border-[#2D3054]">
                <div className="w-10 h-full border-r border-[#2D3054] relative grid place-items-center flex-shrink-0">
                    <AvatarPreview avatarConfig={config} size={32} className="absolute bottom-0" />
                </div>
                <div className="flex flex-col px-2 min-w-0">
                    <p className="text-white text-[11px] font-medium truncate max-w-[100px]">{username}</p>
                    <p className="text-[#6B7280] text-[10px]">Available</p>
                </div>
            </div>

            <button
                type="button"
                className="p-2 rounded-xl hover:bg-white/10 text-[#8B8FA3] hover:text-white transition-colors"
                title="Screen share"
            >
                <Monitor className="w-5 h-5" />
            </button>
            <button
                type="button"
                className="p-2 rounded-xl hover:bg-white/10 text-[#8B8FA3] hover:text-white transition-colors"
                title="Wave"
            >
                <HandWaving className="w-5 h-5" />
            </button>
            <button
                type="button"
                className="p-2 rounded-xl hover:bg-white/10 text-[#8B8FA3] hover:text-white transition-colors"
                title="Emote"
            >
                <SmileySticker className="w-5 h-5" />
            </button>
            <button
                type="button"
                className="p-2 rounded-xl hover:bg-white/10 text-[#8B8FA3] hover:text-white transition-colors"
                onClick={onClickSkinButton}
                title="Avatar / Skin"
            >
                <TShirt className="w-5 h-5" />
            </button>
        </div>
    )
}

export default PlayNavbar
