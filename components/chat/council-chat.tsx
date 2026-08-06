'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { AGENTS, getAgentForPath, type Agent } from '@/lib/agents/agent-config';
import { MessageSquare, X, ChevronRight, Trash2, ChevronDown } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ConversationMap {
    [agentId: string]: Message[];
}

// ─── Agent Avatar ─────────────────────────────────────────────────────────────

function AgentAvatar({ agent, size = 'md' }: { agent: Agent; size?: 'sm' | 'md' }) {
    const sizeClass = size === 'sm' ? 'h-6 w-6 text-[10px]' : 'h-8 w-8 text-xs';
    return (
        <div
            className={`${sizeClass} ${agent.avatarColor} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
        >
            {agent.name[0]}
        </div>
    );
}

// ─── Agent Selector Dropdown ──────────────────────────────────────────────────

function AgentSelector({
    activeAgent,
    autoAgent,
    onSelect,
}: {
    activeAgent: Agent;
    autoAgent: Agent;
    onSelect: (agent: Agent) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-white/[0.06] w-full"
            >
                <AgentAvatar agent={activeAgent} size="sm" />
                <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white/90 truncate">{activeAgent.name}</span>
                        {activeAgent.id === autoAgent.id && (
                            <span className="text-[9px] px-1 py-0.5 rounded bg-white/[0.08] text-white/40 uppercase tracking-wider flex-shrink-0">
                                auto
                            </span>
                        )}
                    </div>
                    <span className="text-[10px] text-white/35 truncate block">{activeAgent.title}</span>
                </div>
                <ChevronDown className={`h-3 w-3 text-white/30 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border border-white/[0.08] bg-[#0a0a0f] shadow-2xl overflow-hidden">
                    {AGENTS.map(agent => (
                        <button
                            key={agent.id}
                            onClick={() => { onSelect(agent); setOpen(false); }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 transition text-left hover:bg-white/[0.05] ${agent.id === activeAgent.id ? 'bg-white/[0.06]' : ''
                                }`}
                        >
                            <AgentAvatar agent={agent} size="sm" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-medium text-white/80">{agent.name}</span>
                                    {agent.id === autoAgent.id && (
                                        <span className="text-[9px] px-1 py-0.5 rounded bg-white/[0.08] text-white/40 uppercase tracking-wider">
                                            auto
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] text-white/35 truncate block">{agent.description}</span>
                            </div>
                            {agent.id === activeAgent.id && (
                                <div className="h-1.5 w-1.5 rounded-full bg-white/40 flex-shrink-0" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CouncilChat() {
    const pathname = usePathname();
    const autoAgent = getAgentForPath(pathname ?? '/');

    const [isOpen, setIsOpen] = useState(false);
    const [manualAgent, setManualAgent] = useState<Agent | null>(null);
    const [conversations, setConversations] = useState<ConversationMap>({});
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const activeAgent = manualAgent ?? autoAgent;
    const messages: Message[] = conversations[activeAgent.id] ?? [];

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const userScrolledUp = useRef(false);

    // Auto-switch to page agent when navigating (only if user hasn't manually picked one)
    useEffect(() => {
        setManualAgent(null);
    }, [pathname]);

    const scrollToBottom = useCallback((force = false) => {
        if (force || !userScrolledUp.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    const handleScroll = useCallback(() => {
        const container = messagesContainerRef.current;
        if (!container) return;
        const distanceFromBottom =
            container.scrollHeight - container.scrollTop - container.clientHeight;
        userScrolledUp.current = distanceFromBottom > 60;
    }, []);

    useEffect(() => {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg?.role === 'user') {
            userScrolledUp.current = false;
            scrollToBottom(true);
        } else {
            scrollToBottom(false);
        }
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen, activeAgent.id]);

    const setMessages = useCallback(
        (updater: Message[] | ((prev: Message[]) => Message[])) => {
            setConversations(prev => {
                const current = prev[activeAgent.id] ?? [];
                const next = typeof updater === 'function' ? updater(current) : updater;
                return { ...prev, [activeAgent.id]: next };
            });
        },
        [activeAgent.id]
    );

    const sendMessage = async () => {
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;

        const userMessage: Message = { role: 'user', content: trimmed };
        const currentMessages = conversations[activeAgent.id] ?? [];
        const newMessages = [...currentMessages, userMessage];

        setConversations(prev => ({ ...prev, [activeAgent.id]: newMessages }));
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/council-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages,
                    agentId: activeAgent.id,
                    pathname,
                }),
            });

            if (!res.ok) throw new Error('Failed to get response');

            const reader = res.body?.getReader();
            if (!reader) throw new Error('No reader');

            const decoder = new TextDecoder();
            let assistantContent = '';

            // Add empty assistant message to stream into
            setConversations(prev => ({
                ...prev,
                [activeAgent.id]: [...(prev[activeAgent.id] ?? []), { role: 'assistant', content: '' }],
            }));

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                assistantContent += chunk;
                const snapshot = assistantContent;

                await new Promise<void>(resolve =>
                    requestAnimationFrame(() => {
                        setConversations(prev => {
                            const msgs = prev[activeAgent.id] ?? [];
                            return {
                                ...prev,
                                [activeAgent.id]: [
                                    ...msgs.slice(0, -1),
                                    { role: 'assistant', content: snapshot },
                                ],
                            };
                        });
                        resolve();
                    })
                );
            }
        } catch {
            setConversations(prev => ({
                ...prev,
                [activeAgent.id]: [
                    ...(prev[activeAgent.id] ?? []),
                    { role: 'assistant', content: 'Something went wrong. Please try again.' },
                ],
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearConversation = () => {
        setConversations(prev => ({ ...prev, [activeAgent.id]: [] }));
    };

    // Starter prompts per agent
    const starterPrompts: Record<string, string[]> = {
        atlas: [
            'What is the current macro regime?',
            'What would trigger a regime change?',
            'Explain Long Duration in plain terms',
        ],
        sigma: [
            'What is the current trend stage?',
            'What does Mania risk mean?',
            'How do I read the signal matrix?',
        ],
        chronicle: [
            'How does today compare to 2008?',
            'What happened in the 1970s inflation trap?',
            'Explain the 1996 cycle',
        ],
        nexus: [
            'How does the O1/O2/O3 framework work?',
            'How should I use this framework day to day?',
            'What is Capital Physics?',
        ],
        oracle: [
            'How is Real Earnings Yield calculated?',
            'Explain percentile analysis',
            'What is PE-5yr vs CAPE?',
        ],
    };

    const prompts = starterPrompts[activeAgent.id] ?? starterPrompts.atlas;

    return (
        <>
            {/* Toggle button — visible when sidebar is closed */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center gap-2 rounded-l-xl border border-r-0 border-white/[0.08] bg-[#0a0a0f]/95 backdrop-blur px-3 py-4 text-white/50 shadow-xl transition hover:text-white/80 hover:bg-white/[0.06]"
                    aria-label="Open council chat"
                >
                    <ChevronRight className="h-3.5 w-3.5" />
                    <MessageSquare className="h-4 w-4" />
                </button>
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-16 right-0 z-40 h-[calc(100vh-4rem)]
          border-l border-white/[0.06] bg-[#050507]/98 backdrop-blur-xl
          flex flex-col
          transition-all duration-300 ease-out
          ${isOpen ? 'w-[380px] translate-x-0' : 'w-0 translate-x-full'}
          overflow-hidden
        `}
            >
                <div className="flex h-full flex-col w-[380px]">
                    {/* Header */}
                    <div className="flex-shrink-0 border-b border-white/[0.06] px-4 py-3">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.06] border border-white/[0.08]">
                                    <MessageSquare className="h-3 w-3 text-white/50" />
                                </div>
                                <span className="text-xs font-semibold tracking-wider text-white/50 uppercase">
                                    Council
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                {messages.length > 0 && (
                                    <button
                                        onClick={clearConversation}
                                        className="flex h-7 w-7 items-center justify-center rounded-lg text-white/25 transition hover:bg-white/[0.06] hover:text-white/60"
                                        aria-label="Clear conversation"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg text-white/25 transition hover:bg-white/[0.06] hover:text-white/60"
                                    aria-label="Close council chat"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Agent selector */}
                        <AgentSelector
                            activeAgent={activeAgent}
                            autoAgent={autoAgent}
                            onSelect={agent => {
                                setManualAgent(agent.id === autoAgent.id ? null : agent);
                            }}
                        />

                        {/* Page context badge */}
                        <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05] px-2.5 py-1.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400/60 flex-shrink-0" />
                            <span className="text-[10px] text-white/30 truncate">
                                {pathname ?? '/'}
                            </span>
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        ref={messagesContainerRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin"
                        style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(255,255,255,0.08) transparent',
                        }}
                    >
                        {messages.length === 0 && (
                            <div className="py-6 text-center space-y-4">
                                <AgentAvatar agent={activeAgent} size="md" />
                                <div>
                                    <p className="text-sm font-medium text-white/60 mb-0.5">{activeAgent.name}</p>
                                    <p className="text-xs text-white/30">{activeAgent.description}</p>
                                </div>
                                <div className="space-y-1.5 text-left">
                                    {prompts.map(q => (
                                        <button
                                            key={q}
                                            onClick={() => { setInput(q); inputRef.current?.focus(); }}
                                            className="block w-full text-left text-xs px-3 py-2 rounded-lg border border-white/[0.06] text-white/40 hover:bg-white/[0.04] hover:text-white/70 transition-colors"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'assistant' && <AgentAvatar agent={activeAgent} size="sm" />}
                                <div
                                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-white/[0.09] text-white/85 rounded-br-md'
                                            : 'bg-white/[0.04] text-white/75 rounded-bl-md border border-white/[0.05]'
                                        }`}
                                >
                                    {msg.role === 'user' ? (
                                        <div className="whitespace-pre-wrap text-xs">{msg.content}</div>
                                    ) : (
                                        <div className="prose prose-sm dark:prose-invert max-w-none text-xs [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:text-white/75 [&_strong]:text-white/90 [&_li]:text-white/70 [&_h1]:text-white/90 [&_h2]:text-white/90 [&_h3]:text-white/85">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                            <div className="flex gap-2.5 justify-start">
                                <AgentAvatar agent={activeAgent} size="sm" />
                                <div className="bg-white/[0.04] border border-white/[0.05] rounded-2xl rounded-bl-md px-3.5 py-2.5">
                                    <div className="flex space-x-1.5">
                                        {[0, 150, 300].map(delay => (
                                            <div
                                                key={delay}
                                                className="w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce"
                                                style={{ animationDelay: `${delay}ms` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="flex-shrink-0 border-t border-white/[0.06] p-3">
                        <div className="flex items-end gap-2">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={`Ask ${activeAgent.name}...`}
                                rows={1}
                                className="flex-1 resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-white/80 placeholder:text-white/25 focus:outline-none focus:border-white/[0.15] focus:bg-white/[0.06] transition max-h-[100px]"
                                style={{ minHeight: '36px' }}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || isLoading}
                                className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-opacity disabled:opacity-25 hover:opacity-90"
                                style={{ backgroundColor: activeAgent.color }}
                                aria-label="Send message"
                            >
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="22" y1="2" x2="11" y2="13" />
                                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
