// src/app/paymoney/[upi]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";

export default function PayMoneyPage() {
  const params = useParams<{ upi: string }>();
  const id = params.upi;

  const [senderName, setSenderName] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [senderUpi, setSenderUpi] = useState("");
  const [receiverUpi, setReceiverUpi] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [receiverId, setReceiverId] = useState("")

  const [showSuccess, setShowSuccess] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const router = useRouter();

  const fetchData = async () => {
    const resRecv = await fetch("/api/users/receiver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const dataRecv = await resRecv.json();
    setReceiverName(dataRecv.user.username);
    setReceiverUpi(dataRecv.user.upi);

    const amtNumber = Number(dataRecv.user.Amount ?? 0);
    setAmount(amtNumber.toLocaleString("en-IN"));

    const resSend = await fetch("/api/users/me");
    const dataSend = await resSend.json();
    setSenderName(dataSend.user.username);
    setSenderUpi(dataSend.user.upi);
    setReceiverId(dataSend.user._id);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
  }, []);

  const handlePayClick = async () => {
    try {
      const response = await fetch('/api/users/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: receiverId,
          receiverId: id,
        }),
      });

      if (!response.ok) throw new Error('Payment failed');

      setShowSuccess(true);
      
      // Wait for animation to complete, THEN redirect
      setTimeout(() => {
        setShowSuccess(false);
        router.push('/central');
      }, 2500);
      
    } catch (error) {
      console.error('Payment error:', error);
    }
  };


  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4 py-10">
      {/* Confetti across screen on success */}
      {showSuccess && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={260}
          gravity={0.4}
          recycle={false}
        />
      )}
      {/* Card */}
      <div className="w-full max-w-2xl rounded-3xl border border-white/15 bg-white/10 backdrop-blur-2xl shadow-2xl px-8 py-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-emerald-50 text-center drop-shadow mb-2">
          Payment Window
        </h1>
        <p className="text-sm md:text-base text-emerald-100/80 text-center mb-8">
          Review the sender and receiver details before proceeding with the payment.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sender block */}
          <div>
            <p className="text-m font-semibold uppercase tracking-wide text-emerald-200 mb-3">
              Sender
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-emerald-100/80 mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={senderName}
                  readOnly
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/10 border border-emerald-500/40 text-sm md:text-base text-emerald-50 cursor-default focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-emerald-100/80 mb-1.5">
                  UPI ID
                </label>
                <input
                  type="text"
                  defaultValue={senderUpi}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/10 border border-emerald-500/70 text-sm md:text-base text-emerald-50 placeholder-emerald-100/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
                  placeholder="Enter your UPI ID"
                />
              </div>

              {/* Amount to pay (read-only, formatted) */}
              <div>
                <label className="block text-xs font-semibold text-emerald-100/80 mb-1.5">
                  Amount to pay
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm md:text-base text-emerald-100">₹</span>
                  <input
                    type="text"
                    value={amount}
                    readOnly
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/10 border border-emerald-500/40 text-sm md:text-base text-emerald-50 cursor-default focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Receiver block */}
          <div>
            <p className="text-m font-semibold uppercase tracking-wide text-emerald-200 mb-3">
              Receiver
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-emerald-100/80 mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={receiverName}
                  readOnly
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/10 border border-emerald-500/40 text-sm md:text-base text-emerald-50 cursor-default focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-emerald-100/80 mb-1.5">
                  UPI ID
                </label>
                <input
                  type="text"
                  value={receiverUpi}
                  readOnly
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/10 border border-emerald-500/40 text-sm md:text-base text-emerald-50 cursor-default focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pay button */}
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={handlePayClick}
            className="px-10 py-3.5 rounded-2xl text-sm md:text-base font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg shadow-emerald-900/40 transition-transform duration-200 hover:-translate-y-0.5"
          >
            Pay
          </button>
        </div>
      </div>

      {/* Success overlay */}
      {showSuccess && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="bg-emerald-900/80 border border-emerald-300/40 rounded-3xl px-10 py-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex items-center justify-center">
              <span className="relative inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
                <span className="absolute inline-flex h-20 w-20 rounded-full border-2 border-emerald-400 animate-ping" />
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
              Your payment has been processed successfully.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
