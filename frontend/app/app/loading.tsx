export default function AppLoading() {
    return (
        <div className="fixed inset-0 bg-[#1a1b2e] flex flex-col items-center justify-center gap-6 z-50">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-[#3F4776] rounded-full" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-[#6C72CB] rounded-full animate-spin" />
            </div>
            <div className="flex flex-col items-center gap-2">
                <h2 className="text-xl font-semibold text-white">Loading</h2>
                <p className="text-sm text-[#9CA3AF]">Fetching your spaces...</p>
            </div>
        </div>
    )
}
