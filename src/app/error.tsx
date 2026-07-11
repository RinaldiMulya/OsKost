"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Application error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#0a0f0a] flex items-center justify-center px-4">
            {/* Ambient glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-red-500/8 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 text-center max-w-md">
                {/* Error icon */}
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                    <span className="text-3xl">⚠️</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
                    Terjadi Kesalahan
                </h2>
                <p className="text-sm text-zinc-500 mb-8">
                    Sesuatu yang tidak terduga terjadi. Tim kami sudah diberitahu.
                </p>

                <button
                    onClick={() => reset()}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-400 to-cyan-400 text-black font-bold text-sm uppercase tracking-wider hover:shadow-[0_0_30px_rgba(0,204,64,0.3)] transition-all duration-300 cursor-pointer"
                >
                    Coba Lagi
                </button>
            </div>
        </div>
    );
}
