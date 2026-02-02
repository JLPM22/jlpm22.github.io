import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const AUTH_PASSWORD = process.env.AUTH_PASSWORD || 'demo123';
const SESSION_COOKIE = 'research_hub_session';

export async function POST(request) {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (action === 'logout') {
        const cookieStore = await cookies();
        cookieStore.delete(SESSION_COOKIE);
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Login
    const formData = await request.formData();
    const password = formData.get('password');

    if (password === AUTH_PASSWORD) {
        const response = NextResponse.redirect(new URL('/dashboard', request.url));

        // Set session cookie
        response.cookies.set(SESSION_COOKIE, 'authenticated', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
    }

    // Wrong password - redirect back with error
    return NextResponse.redirect(new URL('/login?error=invalid', request.url));
}
