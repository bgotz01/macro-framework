'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Pause, Play } from 'lucide-react';
import Navbar from '@/components/navbar';

const videos = [
    {
        id: 'long-duration',
        src: '/videos/ai-chat.mp4',
        label: 'Long Duration',
        color: '#3b82f6',
        badgeClass: 'border-blue-300/20 bg-blue-300/10 text-blue-100',
        dotClass: 'bg-blue-400',
        description:
            'Regime chat identifies a Long Duration environment — equities favored over bonds, growth and momentum leading.',
    },
    {
        id: 'overvaluation',
        src: '/videos/ai-chat-overvaluation.mp4',
        label: 'Overvaluation',
        color: '#eab308',
        badgeClass: 'border-yellow-300/20 bg-yellow-300/10 text-yellow-100',
        dotClass: 'bg-yellow-400',
        description:
            'Regime chat flags Overvaluation — equities far below risk-free rate, rotation toward bonds or gold warranted.',
    },
];

export default function Landing3Page() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [paused, setPaused] = useState(false);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => setIsVisible(entry.isIntersecting),
            { threshold: 0.3 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        videoRefs.current.forEach((video, i) => {
            if (!video) return;
            if (i === activeIndex && isVisible && !paused) {
                video.play();
            } else {
                video.pause();
                if (i !== activeIndex) video.currentTime = 0;
            }
        });
    }, [activeIndex, isVisible, paused]);

    const togglePause = () => setPaused((p) => !p);

    return (
        <main className="min-h-screen bg-[#050507] text-white">
            <Navbar />

            {/* Hero with video */}
            <section className="relative z-10 mx-auto max-w-7xl px-6 pt-12 pb-20">
                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8 flex justify-center"
                >
                    <div className="group relative">
                        <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 opacity-0 blur-xl transition duration-500 group-hover:opacity-100" />
                        <div className="relative flex items-center gap-3 rounded-2xl border border-blue-300/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 px-6 py-3 shadow-lg backdrop-blur-sm">
                            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400 shadow-lg shadow-blue-400/50" />
                            <span className="bg-gradient-to-r from-blue-100 to-cyan-100 bg-clip-text text-sm font-semibold tracking-[0.2em] text-transparent">
                                INTERACTIVE CHAT
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="mb-6 flex justify-center gap-3">
                    {videos.map((video, i) => (
                        <button
                            key={video.id}
                            onClick={() => setActiveIndex(i)}
                            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs transition ${activeIndex === i
                                ? video.badgeClass + ' border-opacity-100'
                                : 'border-white/10 bg-white/[0.04] text-white/50 hover:bg-white/[0.08]'
                                }`}
                        >
                            <span
                                className={`h-2 w-2 rounded-full ${activeIndex === i ? video.dotClass : 'bg-white/30'
                                    }`}
                            />
                            {video.label}
                        </button>
                    ))}
                </div>

                {/* Video container */}
                <motion.div
                    ref={containerRef}
                    initial={{ opacity: 0, y: 24, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="relative mx-auto max-w-5xl"
                >
                    <div className="absolute -inset-6 rounded-[3rem] bg-blue-500/8 blur-3xl" />
                    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#090A0F]/90 shadow-2xl shadow-black/50 backdrop-blur-xl">
                        <div className="relative aspect-video w-full overflow-hidden">
                            {videos.map((video, i) => (
                                <div
                                    key={video.id}
                                    className="absolute inset-0 transition-opacity duration-300"
                                    style={{ opacity: i === activeIndex ? 1 : 0, pointerEvents: i === activeIndex ? 'auto' : 'none' }}
                                >
                                    <video
                                        ref={(el) => { videoRefs.current[i] = el; }}
                                        muted
                                        playsInline
                                        className="h-full w-full cursor-pointer object-cover"
                                        src={video.src}
                                        onClick={togglePause}
                                        onEnded={() => setActiveIndex((i + 1) % videos.length)}
                                    />
                                </div>
                            ))}
                            {/* Paused overlay */}
                            {paused && (
                                <div
                                    className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30"
                                    onClick={togglePause}
                                >
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-black/50 backdrop-blur-sm">
                                        <Play className="h-6 w-6 translate-x-0.5 text-white" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Caption bar */}
                        <div className="border-t border-white/10 px-6 py-4">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={videos[activeIndex].id}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.25 }}
                                    className="flex items-center gap-4"
                                >
                                    <button
                                        onClick={togglePause}
                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/60 transition hover:bg-white/[0.12] hover:text-white"
                                    >
                                        {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                                    </button>
                                    <div
                                        className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-xs ${videos[activeIndex].badgeClass}`}
                                    >
                                        <span
                                            className={`h-2 w-2 rounded-full ${videos[activeIndex].dotClass}`}
                                        />
                                        {videos[activeIndex].label}
                                    </div>
                                    <p className="text-sm leading-6 text-white/50">
                                        {videos[activeIndex].description}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>

                {/* CTA */}
                <div className="mt-10 flex justify-center">
                    <button className="group inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-blue-100">
                        Explore the system
                        <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
                    </button>
                </div>
            </section>

            {/* Regime Proximity section */}
            <RegimeProximityVideos />
        </main>
    );
}

const proximityVideos = [
    {
        id: 'dotcom-bubble',
        src: '/videos/dotcom-bubble.mp4',
        label: 'Dot-com Bubble',
        badgeClass: 'border-yellow-300/20 bg-yellow-300/10 text-yellow-100',
        dotClass: 'bg-yellow-400',
        description:
            'Regime proximity chart shows Overvaluation building through 1999 before the regime triggers and the market corrects.',
    },
    {
        id: 'liquidity-shock',
        src: '/videos/liquidity-shock.mp4',
        label: 'Liquidity Shock',
        badgeClass: 'border-purple-300/20 bg-purple-300/10 text-purple-100',
        dotClass: 'bg-purple-400',
        description:
            'Massive monetary expansion triggers the Liquidity Shock regime — speculative assets surge as M2 growth explodes.',
    },
    {
        id: 'covid',
        src: '/videos/covid.mp4',
        label: 'COVID Crash',
        badgeClass: 'border-red-300/20 bg-red-300/10 text-red-100',
        dotClass: 'bg-red-400',
        description:
            'Regime proximity captures the rapid shift from growth into crisis as COVID hits — then the snap into Liquidity Shock.',
    },
];

function RegimeProximityVideos() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [paused, setPaused] = useState(false);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => setIsVisible(entry.isIntersecting),
            { threshold: 0.3 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        videoRefs.current.forEach((video, i) => {
            if (!video) return;
            if (i === activeIndex && isVisible && !paused) {
                video.play();
            } else {
                video.pause();
                if (i !== activeIndex) video.currentTime = 0;
            }
        });
    }, [activeIndex, isVisible, paused]);

    const togglePause = () => setPaused((p) => !p);

    return (
        <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
            <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="mb-8 flex justify-center"
            >
                <div className="group relative">
                    <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 opacity-0 blur-xl transition duration-500 group-hover:opacity-100" />
                    <div className="relative flex items-center gap-3 rounded-2xl border border-blue-300/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 px-6 py-3 shadow-lg backdrop-blur-sm">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400 shadow-lg shadow-blue-400/50" />
                        <span className="bg-gradient-to-r from-blue-100 to-cyan-100 bg-clip-text text-sm font-semibold tracking-[0.2em] text-transparent">
                            REGIME PROXIMITY
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="mb-6 flex justify-center gap-3">
                {proximityVideos.map((video, i) => (
                    <button
                        key={video.id}
                        onClick={() => setActiveIndex(i)}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs transition ${activeIndex === i
                            ? video.badgeClass + ' border-opacity-100'
                            : 'border-white/10 bg-white/[0.04] text-white/50 hover:bg-white/[0.08]'
                            }`}
                    >
                        <span
                            className={`h-2 w-2 rounded-full ${activeIndex === i ? video.dotClass : 'bg-white/30'
                                }`}
                        />
                        {video.label}
                    </button>
                ))}
            </div>

            {/* Video container */}
            <motion.div
                ref={containerRef}
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative mx-auto max-w-5xl"
            >
                <div className="absolute -inset-6 rounded-[3rem] bg-purple-500/8 blur-3xl" />
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#090A0F]/90 shadow-2xl shadow-black/50 backdrop-blur-xl">
                    <div className="relative aspect-video w-full overflow-hidden">
                        {proximityVideos.map((video, i) => (
                            <div
                                key={video.id}
                                className="absolute inset-0 transition-opacity duration-300"
                                style={{ opacity: i === activeIndex ? 1 : 0, pointerEvents: i === activeIndex ? 'auto' : 'none' }}
                            >
                                <video
                                    ref={(el) => { videoRefs.current[i] = el; }}
                                    muted
                                    playsInline
                                    className="h-full w-full cursor-pointer object-cover"
                                    src={video.src}
                                    onClick={togglePause}
                                    onEnded={() => setActiveIndex((i + 1) % proximityVideos.length)}
                                />
                            </div>
                        ))}
                        {/* Paused overlay */}
                        {paused && (
                            <div
                                className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30"
                                onClick={togglePause}
                            >
                                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-black/50 backdrop-blur-sm">
                                    <Play className="h-6 w-6 translate-x-0.5 text-white" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Caption bar */}
                    <div className="border-t border-white/10 px-6 py-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={proximityVideos[activeIndex].id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.25 }}
                                className="flex items-center gap-4"
                            >
                                <button
                                    onClick={togglePause}
                                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/60 transition hover:bg-white/[0.12] hover:text-white"
                                >
                                    {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                                </button>
                                <div
                                    className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-xs ${proximityVideos[activeIndex].badgeClass}`}
                                >
                                    <span
                                        className={`h-2 w-2 rounded-full ${proximityVideos[activeIndex].dotClass}`}
                                    />
                                    {proximityVideos[activeIndex].label}
                                </div>
                                <p className="text-sm leading-6 text-white/50">
                                    {proximityVideos[activeIndex].description}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
