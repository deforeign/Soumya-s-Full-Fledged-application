// src/app/paymoney/[upi]/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";

type TimeLeft = {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export default function PayMoneyPage() {
  const [receiverName, setReceiverName] = useState("");
  const [receiverUpi, setReceiverUpi] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [receiverId, setReceiverId] = useState("");
  const [senderId, setSenderId] = useState("");

  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentTime, setPaymentTime] = useState<Date | null>(null);

  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  const [paid, setPaid] = useState<boolean>(false); // you already have this flag in DB
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
  }, []);

  const getRepaymentMs = (amt: number): number => {
    if (amt <= 50000) return 15 * 24 * 60 * 60 * 1000;
    if (amt > 50000 && amt < 100000) return 3 * 24 * 60 * 60 * 1000;
    if (amt >= 100000 && amt <= 300000) return 60 * 24 * 60 * 60 * 1000;
    if (amt > 300000 && amt <= 500000) return 90 * 24 * 60 * 60 * 1000;
    return 0;
  };

  const calculateTimeLeft = (deadline: Date): TimeLeft => {
    const now = new Date().getTime();
    const diff = deadline.getTime() - now;
    const totalMs = diff > 0 ? diff : 0;

    const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (totalMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((totalMs % (1000 * 60)) / 1000);

    return { totalMs, days, hours, minutes, seconds };
  };

  const fetchProfile = async () => {
    try {
      const resSend = await fetch("/api/users/me");
      const dataSend = await resSend.json();

      setPaid(Boolean(dataSend.user.paid));              // use existing flag
      setAmount(String(dataSend.user.Amount));
      setReceiverId(dataSend.user.sender);
      setSenderId(dataSend.user._id);

      const ptRaw = dataSend.user.paymentTime;
      const pt =
        ptRaw instanceof Date ? ptRaw : ptRaw ? new Date(ptRaw) : null;
      setPaymentTime(pt);

      // Only fetch receiver details when there is a repayment
      if (dataSend.user.paid) {
        const response = await fetch("/api/users/receiver", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: dataSend.user.sender }),
        });

        const data = await response.json();
        setReceiverName(data.user.username);
        setReceiverUpi(data.user.upi);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // countdown
  useEffect(() => {
    if (!paymentTime || !amount || !paid) {
      setTimeLeft(null);
      return;
    }

    const amtNumber = Number(amount);
    const repaymentMs = getRepaymentMs(amtNumber);
    if (repaymentMs <= 0) {
      setTimeLeft(null);
      return;
    }

    const deadline = new Date(paymentTime.getTime() + repaymentMs);

    setTimeLeft(calculateTimeLeft(deadline));

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(deadline));
    }, 1000);

    return () => clearInterval(interval);
  }, [paymentTime, amount, paid]);

  const handlePayClick = async () => {
    try {
      const response = await fetch("/api/users/repay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId }),
      });

      if (!response.ok) throw new Error("Payment failed");
      
      setShowSuccess(true);
      
      // Wait for animation to complete, THEN redirect
      setTimeout(() => {
        setShowSuccess(false);
        router.push('/central');
      }, 2500);
      
    } catch (error) {
      console.error("Payment error:", error);
    }
  };


  const d = timeLeft?.days ?? 0;
  const h = timeLeft?.hours ?? 0;
  const m = timeLeft?.minutes ?? 0;
  const s = timeLeft?.seconds ?? 0;

  const countdownVariant =
    timeLeft && timeLeft.totalMs > 0 && timeLeft.days <= 1
      ? "from-rose-500/30 via-rose-500/20 to-rose-500/10 border-rose-400/80"
      : "from-emerald-500/30 via-emerald-500/20 to-emerald-500/10 border-emerald-300/80";

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4 py-10">
      {showSuccess && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={260}
          gravity={0.4}
          recycle={false}
        />
      )}

      {loading ? (
        <div className="text-emerald-100 text-sm">Loading your data...</div>
      ) : !paid ? (
        // NO REPAYMENTS VIEW
        <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-white/10 backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.7)] px-8 py-10 text-center space-y-5">
          <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-50 drop-shadow">
            No repayments due
          </h1>
          <p className="text-sm md:text-base text-emerald-100/85">
            You currently have no active repayments in Loanverse.
          </p>
          <button
            type="button"
            onClick={() => router.push("/central")}
            className="mt-2 px-8 py-3 rounded-2xl text-sm md:text-base font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg shadow-emerald-900/40 transition-transform duration-200 hover:-translate-y-0.5"
          >
            Back to dashboard
          </button>
        </div>
      ) : (
        // REPAYMENT VIEW (your main UI)
        <div className="w-full max-w-3xl rounded-[26px] border border-white/12 bg-gradient-to-br from-white/14 via-white/8 to-white/5 backdrop-blur-2xl shadow-[0_20px_70px_rgba(0,0,0,0.75)] px-6 sm:px-10 py-9 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-200/85">
                Loanverse
              </p>
              <h1 className="mt-1 text-3xl sm:text-4xl md:text-5xl font-extrabold text-emerald-50 drop-shadow">
                Repayment Window
              </h1>
              <p className="mt-2 text-xs md:text-sm text-emerald-100/85 max-w-md">
                Repay the amount you lent before the deadline to keep your
                Loanverse profile healthy.
              </p>
            </div>

            {/* main timer pill */}
            <div className="flex flex-col items-end gap-2">
              <span className="text-[10px] uppercase tracking-[0.18em] text-emerald-200/80">
                Time left to repay
              </span>
              <div
                className={`inline-flex items-center gap-3 rounded-full border bg-gradient-to-r px-4 py-2 shadow-lg ${countdownVariant}`}
              >
                <span className="relative flex items-center justify-center h-2 w-2">
                  <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300/70 blur-[1px]" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-100" />
                </span>
                {timeLeft && timeLeft.totalMs > 0 ? (
                  <span className="text-xs md:text-sm font-semibold text-emerald-50">
                    {d}d : {h.toString().padStart(2, "0")}h :{" "}
                    {m.toString().padStart(2, "0")}m :{" "}
                    {s.toString().padStart(2, "0")}s
                  </span>
                ) : (
                  <span className="text-xs md:text-sm font-semibold text-rose-50">
                    Repayment window over
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Amount + timer details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-emerald-100/80 uppercase tracking-[0.2em]">
                Amount to repay
              </p>
              <div className="flex items-center gap-2 rounded-2xl bg-black/25 border border-emerald-500/45 px-4 py-3">
                <span className="text-sm md:text-base text-emerald-100">₹</span>
                <input
                  type="text"
                  value={amount}
                  readOnly
                  className="w-full bg-transparent text-sm md:text-base text-emerald-50 cursor-default focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-emerald-100/80 uppercase tracking-[0.2em]">
                Countdown
              </p>
              <div className="rounded-2xl bg-black/30 border border-emerald-400/35 px-4 py-3 flex items-center justify-between gap-4">
                {timeLeft && timeLeft.totalMs > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-2 text-[11px] text-emerald-100/85">
                      <div className="px-3 py-1 rounded-full bg-white/5 border border-emerald-400/40">
                        <span className="font-semibold">{d}</span> days
                      </div>
                      <div className="px-3 py-1 rounded-full bg-white/5 border border-emerald-400/40">
                        <span className="font-semibold">
                          {h.toString().padStart(2, "0")}
                        </span>{" "}
                        hrs
                      </div>
                      <div className="px-3 py-1 rounded-full bg-white/5 border border-emerald-400/40">
                        <span className="font-semibold">
                          {m.toString().padStart(2, "0")}
                        </span>{" "}
                        mins
                      </div>
                      <div className="px-3 py-1 rounded-full bg-white/5 border border-emerald-400/40">
                        <span className="font-semibold">
                          {s.toString().padStart(2, "0")}
                        </span>{" "}
                        secs
                      </div>
                    </div>
                    <p className="hidden md:block text-[11px] text-emerald-100/75 text-right">
                      Repay before the timer hits zero to avoid penalties.
                    </p>
                  </>
                ) : (
                  <p className="text-[11px] text-rose-100">
                    The repayment window for this loan has ended.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Receiver block */}
          <div className="rounded-2xl bg-black/25 border border-emerald-500/25 px-4 sm:px-6 py-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
                Receiver details
              </p>
              <span className="rounded-full bg-emerald-500/15 border border-emerald-400/60 px-3 py-1 text-[11px] text-emerald-100 font-medium">
                Secured via UPI
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-emerald-100/80 uppercase tracking-[0.16em]">
                  Name
                </label>
                <input
                  type="text"
                  value={receiverName}
                  readOnly
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-emerald-500/35 text-sm md:text-base text-emerald-50 cursor-default focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-emerald-100/80 uppercase tracking-[0.16em]">
                  UPI ID
                </label>
                <input
                  type="text"
                  value={receiverUpi}
                  readOnly
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-emerald-500/35 text-sm md:text-base text-emerald-50 cursor-default focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            <button
              type="button"
              onClick={() => router.push("/central")}
              className="order-2 sm:order-1 text-xs md:text-sm text-emerald-100/80 hover:text-emerald-50 underline underline-offset-4 decoration-emerald-400/70"
            >
              Back to dashboard
            </button>

            <button
              type="button"
              onClick={handlePayClick}
              className="order-1 sm:order-2 px-10 py-3.5 rounded-2xl text-sm md:text-base font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg shadow-emerald-900/40 transition-transform duration-200 hover:-translate-y-0.5"
            >
              Pay now
            </button>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="bg-emerald-950/90 border border-emerald-300/40 rounded-3xl px-10 py-8 text-center shadow-2xl max-w-md w-full mx-4">
            <div className="mx-auto mb-4 flex items-center justify-center">
              <span className="relative inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15">
                <span className="absolute inline-flex h-20 w-20 rounded-full border-2 border-emerald-400/80 animate-ping" />
                <svg
                  className="relative z-10 h-12 w-12 text-emerald-300 animate-[bounce_0.9s_ease-out]"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.4}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-emerald-50 mb-1">
              Payment successful
            </h2>
            <p className="text-sm md:text-base text-emerald-100/80 mb-4">
              Your repayment has been recorded. Thank you for using Loanverse.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
