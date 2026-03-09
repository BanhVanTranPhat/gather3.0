'use client'

import { Monitor, Play } from "lucide-react";

export default function VideoDemo() {
  return (
    <div className="hidden lg:flex flex-1 items-center justify-center p-8 xl:p-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-emerald-50/50 to-cyan-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800" />
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-teal-200/30 rounded-full blur-3xl dark:bg-teal-900/20" />
      <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-emerald-200/30 rounded-full blur-3xl dark:bg-emerald-900/20" />

      <div className="relative z-10 w-full max-w-3xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-2 px-4 py-1 bg-white dark:bg-gray-600 rounded-md text-xs text-slate-400 dark:text-gray-400 border border-gray-200 dark:border-gray-500">
                <Monitor className="w-3 h-3" />
                The Gathering — Demo
              </div>
            </div>
          </div>

          <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
            <div className="text-center text-slate-500">
              <Play className="w-16 h-16 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Không gian làm việc ảo</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 text-sm text-slate-500 dark:text-gray-400">
          <Play className="w-4 h-4 text-teal-500" />
          <span>
            Không gian làm việc ảo —{" "}
            <span className="font-semibold text-teal-600 dark:text-teal-400">
              kết nối đội nhóm từ xa
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
