// components/Navbar.tsx
"use client";

import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40  flex justify-center px-4 pt-4">
      <div className="w-full max-w-6xl flex items-center justify-between rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xl shadow-lg px-5 md:px-8 py-3">
        {/* Logo / brand */}
        <button
          type="button"
          onClick={() => router.push("/central")}
          className="flex items-center gap-2 group"
        >
          <div className="h-9 w-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 text-white font-black text-lg shadow-md group-hover:scale-105 transition-transform">
            L
          </div>
          <span className="text-sm md:text-base font-semibold tracking-wide text-emerald-50 group-hover:text-white transition-colors">
            Loanverse
          </span>
        </button>

        {/* Right side actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={() => router.push("/central")}
            className="px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium text-emerald-50/90 hover:text-white border border-emerald-300/50 bg-white/5 hover:bg-white/15 transition-colors"
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium text-emerald-50/90 hover:text-white border border-emerald-300/50 bg-white/5 hover:bg-white/15 transition-colors"
          >
            Profile
          </button>

          <button
            type="button"
            onClick={async () => {
              await fetch("/api/users/logout", { method: "GET" });
              router.push("/login");
            }}
            className="px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold text-red-50 bg-red-500/80 hover:bg-red-600 border border-red-300/70 shadow-md transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
