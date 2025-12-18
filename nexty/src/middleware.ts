import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

export function middleware(request: NextRequest) {
    console.log("Middleware executed");
    const token = request.cookies.get("token")?.value;

    const {pathname} = request.nextUrl;

    // If the user is not logged in and trying to access a protected route
    if (!token && (pathname.startsWith('/profile') || pathname === '/')) {
        const url = request.nextUrl.clone();
        url.pathname = '/signup';
        return NextResponse.redirect(url);
    }

    // If the user is logged in and trying to access login or signup page
    if (token && (pathname === '/login' || pathname === '/signup')) {
        const url = request.nextUrl.clone();
        url.pathname = '/profile';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/',
        '/profile',
        '/profile/:path*',
        '/login',
        '/signup',
        '/verifyemail',
    ],
};  