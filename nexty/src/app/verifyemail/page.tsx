"use client";

import Link from "next/link"
import React, {useEffect, useState} from "react";


export default function VerifyEmail() {

    const [token, setToken] = useState("");
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState(false);


    const verifyUserEmail = async () => {
        try {
            const response = await fetch("/api/users/verifyemail", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ token })
            });
            console.log("Verification response status:", response.status);
            setVerified(true);
            
        } catch (error) {
            setError(true);
        }
    };
    useEffect(() => {
        const tokenFromUrl = window.location.search.split("=")[1] || "";
        setToken(tokenFromUrl);
    }, []);
    useEffect(() => {
        if(token.length > 0){
            verifyUserEmail();
        }
    }, [token]);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8">Verify Your Email</h1>
      {verified && (
        <div className="bg-green-100 text-green-800 p-4 rounded mb-4">
          Your email has been successfully verified! You can now <Link href="/login" className="text-blue-500 underline">login</Link>.
        </div>
      )}
      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded mb-4">
          There was an error verifying your email. Please try again.
        </div>
      )}
      {!verified && !error && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded mb-4">
          Verifying your email, please wait...
        </div>
      )}
    </div>
  );
}               