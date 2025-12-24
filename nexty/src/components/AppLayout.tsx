"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

const HIDE_NAV_ROUTES = ["/login", "/signup", "/verifyemail", "/resetemail","/forgotpassword"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = HIDE_NAV_ROUTES.includes(pathname);

  return (
    <body className="bg-gradient-to-br from-emerald-900 via-blue-900 to-indigo-900 text-white">

        { hideNav ? (<main >{children}</main>) : 
         (
            <main >
                <Navbar />
                {children}
                
            </main>
         )
        
        }
      
    </body>
  );
}
