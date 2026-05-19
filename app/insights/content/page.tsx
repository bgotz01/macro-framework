'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface ContentIdea {
    id: string;
    title: string;
    subtitle: string;
    done: boolean;
    createdAt: number;
}

async function fetchIdeas(): Promise<ContentIdea[]> {
    const res = await fetch('/api/content-ideas');
    return res.json();
}

async function persistIdeas(ideas: ContentIdea[]) {
    await fetch('/api/content-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ideas),
    });
}

export default function ContentPage() {
    const [ideas, setIdeas] = useState<ContentIdea[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const [newSubtitle, setNewSubtitle] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [editSubtitle, setEditSubtitle] = useState('');
    const [mounted, setMounted] = useState(false);
    const editRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchIdeas().then(data => {
            setIdeas(data);
            setMounted(true);
        });
    }, []);

    const save = useCallback((next: ContentIdea[]) => {
        setIdeas(next);
        persistIdeas(next);
    }, []);

    const addIdea = () => {
        const title = newTitle.trim();
        if (!title) return;
        save([
            { id: crypto.randomUUID(), title, subtitle: newSubtitle.trim(), done: false, createdAt: Date.now() },
            ...ideas,
        ]);
        setNewTitle('');
        setNewSubtitle('');
    };

    const toggleDone = (id: string) => {
        save(ideas.map(i => (i.id === id ? { ...i, done: !i.done } : i)));
    };

    const removeIdea = (id: string) => {
        save(ideas.filter(i => i.id !== id));
    };

    const startEdit = (idea: ContentIdea) => {
        setEditingId(idea.id);
        setEditValue(idea.title);
        setEditSubtitle(idea.subtitle || '');
        setTimeout(() => editRef.current?.focus(), 0);
    };

    const commitEdit = () => {
        if (!editingId) return;
        const trimmed = editValue.trim();
        if (trimmed) {
            save(ideas.map(i => (i.id === editingId ? { ...i, title: trimmed, subtitle: editSubtitle.trim() } : i)));
        }
        setEditingId(null);
        setEditValue('');
        setEditSubtitle('');
    };

    const pending = ideas.filter(i => !i.done);
    const completed = ideas.filter(i => i.done);

    const IdeaRow = ({ idea, dimmed }: { idea: ContentIdea; dimmed?: boolean }) => (
        <div
            className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${dimmed
                ? 'border-border/30 bg-card/50'
                : 'border-border/50 bg-card hover:border-border'
                }`}
        >
            <button
                onClick={() => toggleDone(idea.id)}
                className={`h-5 w-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${idea.done
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/40 hover:border-primary'
                    }`}
                aria-label={`Mark "${idea.title}" as ${idea.done ? 'not done' : 'done'}`}
            >
                {idea.done && (
                    <svg className="h-3 w-3 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </button>

            {editingId === idea.id ? (
                <div className="flex-1 space-y-2">
                    <input
                        ref={editRef}
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') commitEdit();
                            if (e.key === 'Escape') { setEditingId(null); setEditValue(''); setEditSubtitle(''); }
                        }}
                        placeholder="Title"
                        className="w-full px-2 py-1 rounded-lg border border-primary/50 bg-background text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <input
                        value={editSubtitle}
                        onChange={e => setEditSubtitle(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') commitEdit();
                            if (e.key === 'Escape') { setEditingId(null); setEditValue(''); setEditSubtitle(''); }
                        }}
                        onBlur={commitEdit}
                        placeholder="Subtitle (optional)"
                        className="w-full px-2 py-1 rounded-lg border border-border bg-background text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            ) : (
                <div
                    onDoubleClick={() => startEdit(idea)}
                    className="flex-1 cursor-pointer select-none"
                    title="Double-click to edit"
                >
                    <span className={`text-base ${idea.done ? 'text-muted-foreground line-through' : 'text-card-foreground'}`}>
                        {idea.title}
                    </span>
                    {idea.subtitle && (
                        <p className={`text-sm mt-0.5 ${idea.done ? 'text-muted-foreground/60 line-through' : 'text-muted-foreground'}`}>
                            {idea.subtitle}
                        </p>
                    )}
                </div>
            )}

            <button
                onClick={() => startEdit(idea)}
                className="text-muted-foreground/40 hover:text-primary transition-colors text-sm"
                aria-label={`Edit "${idea.title}"`}
            >
                ✎
            </button>
            <button
                onClick={() => removeIdea(idea.id)}
                className="text-muted-foreground/40 hover:text-red-500 transition-colors text-sm"
                aria-label={`Remove "${idea.title}"`}
            >
                ✕
            </button>
        </div>
    );

    return (
        <div className="flex gap-8 max-w-7xl mx-auto">
            {/* Main content area */}
            <div className="flex-1 min-w-0">
                <div className="text-center mb-8">
                    <h1 className="page-title text-3xl mb-1">CONTENT IDEAS</h1>
                    <p className="page-subtitle">
                        Track and manage content ideas
                    </p>
                    <div className="mt-3 h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
                </div>

                {pending.length > 0 && (
                    <div className="mb-10">
                        <h2 className="text-xl font-semibold mb-4 text-card-foreground">
                            Pending ({pending.length})
                        </h2>
                        <div className="space-y-3">
                            {pending.map(idea => <IdeaRow key={idea.id} idea={idea} />)}
                        </div>
                    </div>
                )}

                {completed.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-muted-foreground">
                            Done ({completed.length})
                        </h2>
                        <div className="space-y-3">
                            {completed.map(idea => <IdeaRow key={idea.id} idea={idea} dimmed />)}
                        </div>
                    </div>
                )}

                {ideas.length === 0 && mounted && (
                    <div className="text-center py-16 text-muted-foreground">
                        <p className="text-lg">No content ideas yet.</p>
                        <p className="text-sm mt-1">Add one using the sidebar →</p>
                    </div>
                )}
            </div>

            {/* Right sidebar */}
            <aside className="w-72 flex-shrink-0 hidden md:block">
                <div className="sticky top-8">
                    <div className="p-5 rounded-xl border border-border/50 bg-card">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                            New Idea
                        </h3>
                        <form
                            onSubmit={e => { e.preventDefault(); addIdea(); }}
                            className="space-y-3"
                        >
                            <input
                                type="text"
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                placeholder="Content idea title…"
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <input
                                type="text"
                                value={newSubtitle}
                                onChange={e => setNewSubtitle(e.target.value)}
                                placeholder="Subtitle (optional)"
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <button
                                type="submit"
                                disabled={!newTitle.trim()}
                                className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Add Idea
                            </button>
                        </form>
                    </div>

                    {ideas.length > 0 && (
                        <div className="mt-4 p-5 rounded-xl border border-border/50 bg-card">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                                Progress
                            </h3>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-muted-foreground">Completed</span>
                                <span className="text-card-foreground font-medium">
                                    {completed.length} / {ideas.length}
                                </span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-primary transition-all duration-300"
                                    style={{ width: `${(completed.length / ideas.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
}
