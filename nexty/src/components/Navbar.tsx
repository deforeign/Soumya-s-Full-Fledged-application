// components/Navbar.tsx
"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 flex justify-center px-4 pt-4">
      <div className="w-full max-w-6xl flex items-center justify-between rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xl shadow-lg px-5 md:px-8 py-3">
        {/* Logo / brand */}
        <button
          type="button"
          onClick={() => router.push("/central")}
          className="flex items-center gap-2 group"
        >
          <span
            className="
              text-xl md:text-2xl            
              font-extrabold                 
              bg-gradient-to-r 
                from-emerald-300 
                via-teal-200 
                to-sky-300                   /* softer, brighter gradient */
              bg-clip-text text-transparent 
              drop-shadow-[0_0_18px_rgba(56,189,248,0.45)] /* glow */
              group-hover:translate-x-1 
              group-hover:scale-[1.03]       /* subtle grow on hover */
              transition-all duration-300
            "
          >
            Loanverse
          </span>
        </button>

        {/* Right side actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={() => router.push("/central")}
            className="px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium text-emerald-50/90 hover:text-white border border-emerald-300/50 bg-white/5 backdrop-blur-sm hover:bg-white/15 hover:border-white/30 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium text-emerald-50/90 hover:text-white border border-emerald-300/50 bg-white/5 backdrop-blur-sm hover:bg-white/15 hover:border-white/30 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            Profile
          </button>

          <button
            type="button"
            onClick={() => router.push("/repayment")}
            className="px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold text-emerald-50/90 hover:text-white border border-emerald-400/60 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 backdrop-blur-sm hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-blue-500/20 hover:border-emerald-400/50 shadow-md hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            Repay
          </button>

          <button
            type="button"
            onClick={async () => {
              await fetch("/api/users/logout", { method: "GET" });
              router.push("/login");
            }}
            className="px-4 md:px-5 py-1.5 md:py-2 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold text-white bg-gradient-to-r from-red-500/90 to-rose-600/90 border border-red-400/50 shadow-lg hover:shadow-red-500/40 hover:from-red-600/95 hover:to-rose-700/95 backdrop-blur-sm hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
