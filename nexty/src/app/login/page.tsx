"use client";
import Link from "next/link";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
    const router = useRouter();

    const [user,setUser] = React.useState({
        email:"",
        password:"",
    });

    const [loading,setLoading] = React.useState(false);
    const [buttonDisabled,setButtonDisabled] = React.useState(true);

    useEffect(() => {
        if(user.email.length>0 && user.password.length>0){
            setButtonDisabled(false);
        }else{
            setButtonDisabled(true);
        }

    }, [user]);

    const onLogin = async() => {
      try {
          setLoading(true);
          const response = await fetch('/api/users/login', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(user),
          });

          const data = await response.json();
          console.log(response.status);

          if (response.status === 200) {
              console.log("Login successful");
              console.log(data);
              router.push(`/profile/${data.username}`);

          } else {
              console.log(data.message);
              alert(data.message);
          }
        } 
        catch (error: any) {
        console.log("An unexpected error occurred:", error);
         toast.error("An unexpected error occurred . Please try again.", error.message);
      } finally {
        setLoading(false);
      }

    }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8">
        {loading ? "Logging you in..." : "Login"}
      </h1>
      <hr />
      <label htmlFor="email" className="text-4xl font-bold mb-8">Email</label>
      <input 
            className="p-2 border bg-amber-50 text-black border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            type="text" 
            value={user.email}
            id="email" 
            onChange={(e) => setUser({...user, email: e.target.value})} 
            placeholder="email"
        />
        <hr />
      <label htmlFor="password" className="text-4xl font-bold mb-8">Password</label>
      <input 
            className="p-2 border bg-amber-50 text-black border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            type="text" 
            value={user.password}
            id="password" 
            onChange={(e) => setUser({...user, password: e.target.value})} 
            placeholder="password"
        />
        <button 
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            onClick={onLogin}
        >
            {buttonDisabled ? "Fill all the details" : "Login"}
        </button>
        <Link href="/signup" className="mt-4 text-blue-500 hover:underline">
            Visit Sign Up
        </Link>
    </div>
  );
}   