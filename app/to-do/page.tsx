'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/page-header';

export default function ToDoPage() {
    const [todos, setTodos] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);

    // Load todos from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('todos');
        if (saved) {
            setTodos(JSON.parse(saved));
        }
        setIsLoaded(true);
    }, []);

    // Save todos to localStorage whenever they change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('todos', JSON.stringify(todos));
        }
    }, [todos, isLoaded]);

    const addTodo = () => {
        if (input.trim()) {
            setTodos([...todos, input.trim()]);
            setInput('');
        }
    };

    const removeTodo = (index: number) => {
        setTodos(todos.filter((_, i) => i !== index));
    };

    if (!isLoaded) {
        return null;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <PageHeader title="To-Do List" subtitle="Saved locally in your browser" />

            <div className="p-8 rounded-3xl border border-border/50 bg-card">
                <div className="flex gap-3 mb-6">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                        placeholder="Add a new task..."
                        className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                        onClick={addTodo}
                        className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                    >
                        Add
                    </button>
                </div>

                <div className="space-y-2">
                    {todos.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No tasks yet. Add one above!</p>
                    ) : (
                        todos.map((todo, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/30"
                            >
                                <span className="text-card-foreground">{todo}</span>
                                <button
                                    onClick={() => removeTodo(index)}
                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
