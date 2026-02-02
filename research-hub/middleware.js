import { NextResponse } from 'next/server';

const SESSION_COOKIE = 'research_hub_session';
const PROTECTED_PATHS = ['/dashboard', '/projects', '/tasks', '/notes', '/manage-papers'];

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Check if path is protected
    const isProtected = PROTECTED_PATHS.some(path => pathname.startsWith(path));

    if (isProtected) {
        const session = request.cookies.get(SESSION_COOKIE);

        if (!session || session.value !== 'authenticated') {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('from', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Redirect /login to dashboard if already authenticated
    if (pathname === '/login') {
        const session = request.cookies.get(SESSION_COOKIE);
        if (session && session.value === 'authenticated') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/projects/:path*', '/tasks/:path*', '/notes/:path*', '/manage-papers/:path*', '/login'],
};
