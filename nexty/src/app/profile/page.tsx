"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type UserProfile = {
  username: string;
  email: string;
  isAdmin: boolean;
  amount: number;
  cibilScore: number;
  upi: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cibilScore, setCibilScore] = useState<string>("");
  const [savingCibil, setSavingCibil] = useState(false);
  const [savingUpi, setSavingUpi] = useState(false);
  const [Upi, setUpi] = useState("");

  

  async function fetchProfileData() {
    try {
      const res = await fetch("/api/users/me");
      const data = await res.json();

      if (data.error) {
        router.push("/login");
        return;
      }

      const user: UserProfile = {
        username: data.user.username,
        email: data.user.email,
        isAdmin: data.user.isAdmin ?? false,
        amount: data.user.Amount ?? data.user.amount ?? 0,
        cibilScore: data.user.cibilScore ,
        upi: data.user.upi,
      };

      setProfile(user);
      setCibilScore(String(user.cibilScore));
      setUpi(String(user.upi))
    } catch (err) {
      console.error("Error fetching profile ", err);
    }
  }

  async function updateCibilScore() {
    if (!profile) return;
    const numeric = Number(cibilScore);
    if (!Number.isFinite(numeric) || numeric < 0) return;

    try {
      setSavingCibil(true);
      const res1 = await fetch("/api/users/me");
      const data1 = await res1.json();
      const res = await fetch("/api/users/savecibil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({id:data1.user._id, cibilScore: numeric }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to update CIBIL score.");
        return;
      }
      toast.success("CIBIL score updated successfully.");
      setProfile({ ...profile, cibilScore: numeric });
    } catch (err) {
      console.error("Error updating CIBIL score:", err);
    } finally {
      setSavingCibil(false);
    }
  }

  async function updateUpiId(){
    if(!profile) return;
    const upi = Upi;
    if(upi.length<0) return;

    try {
      setSavingUpi(true);
      const res1= await fetch("api/users/me");
      const data1= await res1.json();
      const res = await fetch("api/users/saveupi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({id:data1.user._id, upi: upi }),
      })
      const data= await res.json();
      
      if (!res.ok) {
        toast.error(data.message || "Failed to update UPI ID");
        return;
      }
      toast.success("UPI ID updated successfully.");
      setProfile({ ...profile, upi: upi });
      
    } catch (error) {

      console.error("Error Updating UPI ID", error);
      
    } finally {
      setSavingUpi(false);
    }

  }

  useEffect(() => {
    fetchProfileData();
  }, []);

  return (
  <div className="relative min-h-screen bg-gradient-to-br from-emerald-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
    {/* Top welcome text reused style */}
    <div className="absolute top-30 left-0 w-full flex justify-center">
      <h1 className="text-4xl md:text-5xl font-black text-emerald-100 drop-shadow-lg text-center mb-50">
        Hello{profile ? ` ${profile.username}!` : ""}
      </h1>
    </div>

    {/* Logout / nav buttons */}
    {/* <div className="absolute top-6 right-8 flex gap-3">
      <button
        className="px-4 py-1.5 rounded-full text-xs font-semibold border border-emerald-300/70 text-emerald-50 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:text-emerald-50 transition-colors duration-300"
        onClick={() => router.push("/central")}
      >
        Home
      </button>
      <button
        className="px-4 py-1.5 rounded-full text-xs font-semibold border border-emerald-300/70 text-emerald-50 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:text-emerald-50 transition-colors duration-300"
        onClick={() => router.push("/forgotpassword")}
      >
        Forgot password
      </button>
      <button
        className="px-4 py-1.5 rounded-full text-xs font-semibold border border-red-400/80 text-red-50 bg-red-500/80 backdrop-blur-sm hover:bg-red-600 transition-colors duration-300"
        onClick={async () => {
          await fetch("/api/users/logout", { method: "GET" });
          router.push("/login");
        }}
      >
        Logout
      </button>
    </div> */}

    {/* Glass card */}
    <div className="w-full max-w-xl mt-50 backdrop-blur-xl bg-white/5 border border-white/20 rounded-3xl p-8 shadow-2xl text-emerald-50">
      <p className="text-sm text-gray-200 mb-8">
        Your Loanverse account details and credit profile.
      </p>

      {profile ? (
        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
              Name
            </label>
            <input
              type="text"
              value={profile.username}
              readOnly
              className="w-full px-4 py-2.5 rounded-2xl bg-white/10 border border-emerald-500/30 text-sm text-emerald-50 cursor-default focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              readOnly
              className="w-full px-4 py-2.5 rounded-2xl bg-white/10 border border-emerald-500/30 text-sm text-emerald-50 cursor-default focus:outline-none"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
              Role
            </label>
            <input
              type="text"
              value={profile.isAdmin ? "Admin" : "User"}
              readOnly
              className="w-full px-4 py-2.5 rounded-2xl bg-white/10 border border-emerald-500/30 text-sm text-emerald-50 cursor-default focus:outline-none"
            />
          </div>

          {/* Amount requested */}
          <div>
            <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
              Amount requested
            </label>
            <div className="w-full px-4 py-2.5 rounded-2xl bg-white/10 border border-emerald-500/30 text-sm text-emerald-50 cursor-default">
              ₹ {profile.amount}
            </div>
          </div>

          {/* CIBIL + UPI */}
          <div className="space-y-4">
            {/* CIBIL score (editable) */}
            <div>
              <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                CIBIL score
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  min={0}
                  max={900}
                  value={cibilScore || ""}
                  onChange={(e) => setCibilScore(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-white/10 border border-emerald-500/70 text-sm text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                  placeholder="Enter your CIBIL score"
                />
                <button
                  type="button"
                  onClick={updateCibilScore}
                  disabled={savingCibil}
                  className={`px-4 py-2.5 rounded-2xl text-sm font-semibold text-white transition-colors duration-300 ${
                    savingCibil
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                  }`}
                >
                  {savingCibil ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            {/* UPI ID */}
            <div>
              <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                UPI ID
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={Upi || ""}
                  onChange={(e) => setUpi(String(e.target.value))}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-white/10 border border-emerald-500/70 text-sm text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                  placeholder="Enter your UPI ID"
                />
                <button
                  type="button"
                  onClick={updateUpiId}
                  disabled={savingUpi}
                  className={`px-4 py-2.5 rounded-2xl text-sm font-semibold text-white transition-colors duration-300 ${
                    savingUpi
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                  }`}
                >
                  {savingUpi ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-sm text-emerald-100/80">
          Loading profile…
        </p>
      )}

      <p className="mt-8 text-xs text-gray-300 text-center">
        Manage your presence in Loanverse and keep your credit profile up to date.
      </p>
    </div>
  </div>

);
}