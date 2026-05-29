'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, CheckCircle } from 'lucide-react';

interface RequestAccessModalProps {
    open: boolean;
    onClose: () => void;
}

export default function RequestAccessModal({ open, onClose }: RequestAccessModalProps) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when modal opens
    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setEmail('');
            setStatus('idle');
            setErrorMsg('');
        }
    }, [open]);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (open) window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (status === 'loading') return;

        setStatus('loading');
        setErrorMsg('');

        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
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

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0c0d12] p-8 shadow-2xl shadow-black/60">
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/[0.06] hover:text-white"
                    aria-label="Close"
                >
                    <X className="h-4 w-4" />
                </button>

                {status === 'success' ? (
                    <div className="flex flex-col items-center gap-4 py-4 text-center">
                        <CheckCircle className="h-10 w-10 text-blue-400" />
                        <h2 className="text-lg font-semibold text-white">You&apos;re on the list</h2>
                        <p className="text-sm text-white/50">
                            We&apos;ll reach out when access is ready.
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-2 rounded-full bg-white/[0.08] px-5 py-2 text-sm text-white/70 transition hover:bg-white/[0.14] hover:text-white"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <h2 id="modal-title" className="mb-1 text-lg font-semibold text-white">
                            Request access
                        </h2>
                        <p className="mb-6 text-sm text-white/45">
                            Enter your email and we&apos;ll get in touch when a spot opens up.
                        </p>

                        <form onSubmit={handleSubmit} noValidate>
                            <label htmlFor="waitlist-email" className="sr-only">
                                Email address
                            </label>
                            <input
                                ref={inputRef}
                                id="waitlist-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30"
                            />

                            {status === 'error' && (
                                <p className="mt-2 text-xs text-red-400">{errorMsg}</p>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'loading' || !email}
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
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
                    </>
                )}
            </div>
        </div>
    );
}
