'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Particles from '@/components/Particles';

function LoginForm() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-bg to-accent-glow relative overflow-hidden">
            <Particles />
            <div className="bg-white rounded-2xl p-10 shadow-2xl w-full max-w-sm relative z-10 border border-border">
                <h1 className="text-2xl font-bold text-center mb-2 text-text">Welcome back</h1>
                <p className="text-center text-text-secondary mb-8 text-sm">Enter your password to access the dashboard.</p>

                <form action="/api/auth" method="POST">
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium mb-2 text-text-secondary">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-white text-text transition-all focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent-glow"
                            autoFocus
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full flex items-center justify-center px-4 py-2.5 rounded-lg font-medium text-sm text-white transition-all shadow-glow hover:-translate-y-0.5 hover:shadow-glow-lg bg-gradient-primary mt-6 cursor-pointer border-none"
                    >
                        Sign in
                    </button>

                    {error === 'invalid' && (
                        <p className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mt-4 text-sm text-center border border-red-200">
                            Invalid password. Please try again.
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center p-8 bg-bg">
                <p className="text-text-muted">Loading...</p>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
