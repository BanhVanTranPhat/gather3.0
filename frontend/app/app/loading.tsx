export default function AppLoading() {
    return (
        <div className="fixed inset-0 bg-[#f5f5f5] flex flex-col items-center justify-center gap-5 z-50">
            <div className="w-14 h-14 bg-[#2b2d42] rounded-2xl flex items-center justify-center shadow-lg">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <circle cx="8" cy="8" r="3" fill="#fff"/>
                    <circle cx="16" cy="8" r="3" fill="#fff"/>
                    <circle cx="8" cy="16" r="3" fill="#fff"/>
                    <circle cx="16" cy="16" r="3" fill="#fff"/>
                    <circle cx="12" cy="12" r="2" fill="#fff" opacity="0.6"/>
                </svg>
            </div>
            <div className="w-48 h-1.5 bg-gray-300 rounded-full overflow-hidden">
                <div className="h-full bg-[#2b2d42] rounded-full animate-[loadingBar_2s_ease-in-out_infinite]" />
            </div>
            <p className="text-sm text-gray-500 font-medium">Loading data...</p>
        </div>
    )
}
