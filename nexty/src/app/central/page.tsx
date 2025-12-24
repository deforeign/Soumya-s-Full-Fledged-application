"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

type UserAmount = {
  id: string;
  username: string;
  amount: number;
};

export default function LoanversePoolPage() {
  const router = useRouter();

  const [myAmount, setMyAmount] = useState<string>("");
  const [amountLoading, setAmountLoading] = useState(false);
  const [userAmounts, setUserAmounts] = useState<UserAmount[]>([]);
  const [currentUsername, setCurrentUsername] = useState<string>("");
  const [cibilScore, setCibilScore] = useState(0);
  const [Upi, setUpi] = useState("");
  const [Id, setId] = useState("");
  const [paid, setPaid] = useState<boolean>(false);
  const [sender, setSender] = useState("");
  const [myTotalAmount, setMyTotalAmount] = useState(0);

  const [userLoading, setUserLoading] = useState(true);

  const getAmounts = async () => {
    try {
      const res = await fetch("/api/users/totalamounts", {
        method: "GET",
      });

      if (!res.ok) {
        console.log("Failed to fetch amounts");
        return;
      }

      const data = await res.json();
      console.log("TOTALAMOUNTS users:", data.users);

      const mapped: UserAmount[] = data.users
        // keep only unpaid users; handle old string "False" if present
        .filter((u: any) => u.paid === false || u.paid === "False")
        .map((u: any) => ({
          id: u._id,
          username: u.username,
          amount: u.Amount,
        }));

      setUserAmounts(mapped);
    } catch (error: any) {
      console.log("Error fetching amounts:", error.message);
    }
  };

  const getCurrentUser = async () => {
    try {
      const res = await fetch("/api/users/me");
      if (!res.ok) return;

      const data = await res.json();

      setCurrentUsername(data.user.username);
      setCibilScore(data.user.Cibil);
      setMyTotalAmount(data.user.Amount ?? 0);
      setUpi(data.user.upi ?? "");
      setId(String(data.user._id));

      const paidValue = Boolean(data.user.paid);
      setPaid(paidValue);

      if (paidValue) {
        setSender(data.user.sender);
      }
    } catch (err) {
      console.log("Error fetching current user");
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    getAmounts();
    getCurrentUser();
  }, []);

  const computeMaxAllowed = () => {
    if (cibilScore === 0) return 0;
    if (cibilScore > 0 && cibilScore < 500) return 50000;
    if (cibilScore >= 500 && cibilScore < 900) return 500000;
    return 500000;
  };

  const handlePostAmount = async () => {
    const amountNumber = Number(myAmount);
    if (!amountNumber) return;

    const maxAllowed = computeMaxAllowed();

    if (maxAllowed === 0) {
      toast.error("Your CIBIL score is 0, so you cannot request any amount.");
      return;
    }

    const newTotal = myTotalAmount + amountNumber;
    if (newTotal > maxAllowed) {
      toast.error(
        `Your total requested amount would be ₹${newTotal.toLocaleString()}, ` +
          `but based on your CIBIL score (${cibilScore}) you can request up to ₹${maxAllowed.toLocaleString()}.`
      );
      return;
    }

    try {
      setAmountLoading(true);
      const userRes = await fetch("/api/users/me");
      const userData = await userRes.json();

      const res = await fetch("/api/users/amount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userData.user._id,
          amount: newTotal,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Amount posted successfully.");

        const updatedTotal = myTotalAmount + amountNumber;
        setMyTotalAmount(updatedTotal);

        setUserAmounts((prev) => {
          const exists = prev.some((u) => u.username === currentUsername);
          if (!exists) {
            return [
              ...prev,
              {
                username: currentUsername,
                amount: updatedTotal,
                id: Id,
              },
            ];
          }
          return prev.map((u) =>
            u.username === currentUsername
              ? { ...u, amount: updatedTotal }
              : u
          );
        });

        setMyAmount("");
      } else {
        toast.error(data.message || "Failed to post amount.");
      }
    } catch (err) {
      toast.error("Something went wrong.");
    } finally {
      setAmountLoading(false);
    }
  };

  const maxAllowed = computeMaxAllowed();
  // Updated disable condition to include paid check
  const disablePost =
    amountLoading ||
    !Number(myAmount) ||
    cibilScore === 0 ||
    maxAllowed === 0 ||
    Upi.length === 0 ||
    paid; // Disable if already paid

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Big welcome centered at top */}
      <div className="absolute top-30 left-0 w-full flex justify-center">
        <h1 className="text-4xl md:text-5xl font-black text-emerald-100 drop-shadow-lg text-center">
          Welcome back{currentUsername ? `, ${currentUsername}` : ""}!
        </h1>
      </div>

      {/* MAIN CONTENT: show loader until user is fetched */}
      {userLoading ? (
        <div className="w-full max-w-xl mt-45 flex items-center justify-center text-emerald-100">
          Loading your data...
        </div>
      ) : (
        <div className="w-full max-w-xl mt-45 backdrop-blur-xl bg-white/5 border border-white/20 rounded-3xl p-8 shadow-2xl">
          <p className="text-4xl text-emerald-100 drop-shadow-lg mb-7 text-center font-black">
            Loanverse
          </p>

          <p className="text-sm text-emerald-100 mb-2">
            Your CIBIL score:{" "}
            <span className="font-semibold">{cibilScore}</span>
            {maxAllowed === 0 && " – you cannot request any amount."}
            {maxAllowed === 50000 &&
              " – you can request up to ₹50,000 in total."}
            {maxAllowed === 500000 &&
              " – you can request up to ₹5,00,000 in total."}
          </p>

          <p className="text-sm text-emerald-100 mb-2">
            Your total requested amount so far:{" "}
            <span className="font-semibold">
              ₹ {myTotalAmount.toLocaleString()}
            </span>
          </p>

          {/* NEW: Paid warning message */}
          {paid && (
            <p className="text-sm text-red-300 mb-2 bg-red-500/10 border border-red-400/30 rounded-xl p-3">
              You can only ask for money once you have repaid the previously 
              asked amount. Please complete your repayment first.
            </p>
          )}

          {cibilScore === 0 && !paid && (
            <p className="text-sm text-red-300 mb-2">
              To request an amount, please fill your CIBIL score in your
              profile.
            </p>
          )}

          {Upi.length === 0 && !paid && (
            <p className="text-sm text-red-300 mb-2">
              To request an amount, please add your UPI ID in your profile.
            </p>
          )}

          {/* List of usernames + amounts */}
          <div className="mb-8">
            <p className="text-gray-400 text-m mb-2">
              List of amounts requested
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto text-sm text-emerald-100">
              {userAmounts.length === 0 ? (
                <p className="text-gray-400 text-xs">No requests yet.</p>
              ) : (
                userAmounts
                  .filter((ua) => ua.amount !== 0)
                  .map((ua) => (
                    <div
                      key={ua.id}
                      className="relative bg-white/5 border border-emerald-400/20 rounded-xl px-4 py-2 flex items-center justify-between"
                    >
                      <span>
                        User{" "}
                        <span className="text-emerald-300">
                          {ua.username}
                        </span>{" "}
                        has requested amount{" "}
                        <span className="text-emerald-300">
                          ₹ {ua.amount.toLocaleString()}
                        </span>
                      </span>
                      {String(ua.id) !== Id ? (
                        <button
                          className="px-4 py-0.5 rounded-full text-xs font-semibold border border-emerald-300/70 text-emerald-50 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:text-emerald-50 transition-colors duration-300"
                          onClick={() => {
                            router.push(`/paymoney/${String(ua.id)}`);
                          }}
                        >
                          PAY
                        </button>
                      ) : (
                        <div />
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Input to post amount */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-emerald-100/90">
              Your required amount
            </label>
            <input
              type="number"
              min={0}
              className="w-full px-4 py-3 bg-white/10 border border-emerald-500/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 transition-all duration-300 backdrop-blur-sm hover:border-emerald-400/50"
              placeholder="Enter amount in ₹"
              value={myAmount}
              onChange={(e) => {
                const raw = e.target.value;
                const normalized = raw.replace(/^0+(\d)/, "$1");
                setMyAmount(normalized);
              }}
              disabled={paid} // Also disable input when paid
            />
            <button
              type="button"
              onClick={handlePostAmount}
              disabled={disablePost}
              className={`w-full py-3 rounded-2xl font-semibold text-sm transition-all duration-300 ${
                disablePost
                  ? "bg-gray-700/50 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg"
              }`}
            >
              {amountLoading ? "Posting..." : "Post amount to pool"}
            </button>
          </div>

          <p className="mt-8 text-xs text-gray-400 text-center">
            This pool helps lenders see total demand in Loanverse in real time.
          </p>
        </div>
      )}
    </div>
  );
}
