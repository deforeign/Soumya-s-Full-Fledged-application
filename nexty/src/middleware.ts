import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

export function middleware(request: NextRequest) {
    console.log("Middleware executed for:", request.nextUrl.pathname);
    const token = request.cookies.get("token")?.value;

    const {pathname} = request.nextUrl;

    // If the user is not logged in and trying to access a protected route
    if (!token && (
        pathname.startsWith('/profile') || 
        pathname === '/' || 
        pathname.startsWith('/central') || 
        pathname.startsWith('/verifyemail') || 
        pathname.startsWith('/paymoney') || 
        pathname.startsWith('/repayment')
    )) {
        console.log("🔒 Redirecting to login (no token)");
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // If the user is logged in and trying to access login or signup page
    if (token && (pathname === '/login' || pathname === '/signup')) {
        console.log("✅ Redirecting to profile (has token)");
        const url = request.nextUrl.clone();
        url.pathname = '/profile';
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/profile/:path*',
    '/login',
    '/signup',
    '/verifyemail',
    '/central',
    '/paymoney/:path*',     // ✅ Fixed: single quotes
    '/repayment/:path*'     // ✅ Added: repayment with path params
  ],
};
