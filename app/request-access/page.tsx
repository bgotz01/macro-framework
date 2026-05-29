'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Radar, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

export default function RequestAccessPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (status === 'loading') return;

        setStatus('loading');
        setErrorMsg('');

        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
            } else {
                setStatus('error');
                setErrorMsg(data.error ?? 'Something went wrong.');
            }
        } catch {
            setStatus('error');
            setErrorMsg('Network error. Please try again.');
        }
    };

    return (
        <main className="flex min-h-screen flex-col bg-[#050507] text-white">
            {/* Minimal nav */}
            <nav className="flex h-16 items-center justify-between px-6">
                <Link href="/" className="group flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] shadow-lg shadow-blue-500/10 transition group-hover:bg-white/[0.10]">
                        <Radar className="h-4 w-4 text-blue-200" />
                    </div>
                    <span className="text-sm font-medium tracking-[0.22em] text-white/75 transition group-hover:text-white">
                        CAPITAL PHYSICS
                    </span>
                </Link>

                <Link
                    href="/"
                    className="flex items-center gap-2 text-sm text-white/40 transition hover:text-white/70"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Link>
            </nav>

            {/* Content */}
            <div className="flex flex-1 items-center justify-center px-4 py-16">
                {status === 'success' ? (
                    <div className="flex flex-col items-center gap-5 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-blue-400/20 bg-blue-400/10">
                            <CheckCircle className="h-8 w-8 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-white">You&apos;re on the list</h1>
                            <p className="mt-2 text-sm text-white/45">
                                We&apos;ll reach out when a spot opens up.
                            </p>
                        </div>
                        <Link
                            href="/"
                            className="mt-2 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm text-white/70 transition hover:bg-white/[0.10] hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to home
                        </Link>
                    </div>
                ) : (
                    <div className="w-full max-w-sm">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-semibold text-white">Request access</h1>
                            <p className="mt-2 text-sm text-white/45">
                                Leave your details and we&apos;ll be in touch.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="name" className="text-xs font-medium text-white/50">
                                    Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    required
                                    autoFocus
                                    className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="email" className="text-xs font-medium text-white/50">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30"
                                />
                            </div>

                            {status === 'error' && (
                                <p className="text-xs text-red-400">{errorMsg}</p>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'loading' || !name.trim() || !email.trim()}
                                className="mt-2 flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {status === 'loading' ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                                ) : (
                                    <>
                                        Join waitlist
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </main>
    );
}
