import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        // Headings
        h1: ({ children }) => (
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-8 text-foreground leading-tight">
                {children}
            </h1>
        ),
        h2: ({ children }) => (
            <h2 className="text-2xl lg:text-3xl font-bold mb-6 mt-12 text-foreground border-b border-border/30 pb-3">
                {children}
            </h2>
        ),
        h3: ({ children }) => (
            <h3 className="text-xl lg:text-2xl font-semibold mb-4 mt-8 text-foreground">
                {children}
            </h3>
        ),
        h4: ({ children }) => (
            <h4 className="text-lg font-semibold mb-3 mt-6 text-foreground">
                {children}
            </h4>
        ),

        // Paragraphs and text
        p: ({ children }) => (
            <p className="mb-6 text-muted-foreground leading-relaxed text-lg">
                {children}
            </p>
        ),

        // Lists
        ul: ({ children }) => (
            <ul className="mb-6 ml-6 space-y-3 text-muted-foreground">
                {children}
            </ul>
        ),
        ol: ({ children }) => (
            <ol className="mb-6 ml-6 list-decimal space-y-3 text-muted-foreground">
                {children}
            </ol>
        ),
        li: ({ children }) => (
            <li className="leading-relaxed text-lg relative">
                <span className="absolute -left-6 top-2 w-2 h-2 rounded-full bg-primary"></span>
                {children}
            </li>
        ),

        // Links
        a: ({ href, children }) => (
            <a
                href={href}
                className="text-primary hover:text-primary/80 underline underline-offset-4 decoration-2 hover:decoration-primary/60 transition-all duration-200 font-medium"
            >
                {children}
            </a>
        ),

        // Code
        code: ({ children }) => (
            <code className="px-3 py-1 bg-muted rounded-lg text-sm font-mono text-foreground border border-border/30">
                {children}
            </code>
        ),
        pre: ({ children }) => (
            <pre className="mb-6 p-6 bg-muted rounded-2xl overflow-x-auto border border-border/30 shadow-sm">
                <code className="text-sm font-mono text-foreground">{children}</code>
            </pre>
        ),

        // Blockquotes
        blockquote: ({ children }) => (
            <blockquote className="mb-6 pl-6 border-l-4 border-primary bg-primary/5 p-6 rounded-r-2xl my-8">
                <div className="text-muted-foreground italic text-lg leading-relaxed">{children}</div>
            </blockquote>
        ),

        // Tables
        table: ({ children }) => (
            <div className="mb-8 overflow-x-auto">
                <table className="w-full border-collapse border border-border/30 rounded-2xl overflow-hidden shadow-sm">
                    {children}
                </table>
            </div>
        ),
        th: ({ children }) => (
            <th className="border border-border/30 bg-muted p-4 text-left font-semibold text-foreground">
                {children}
            </th>
        ),
        td: ({ children }) => (
            <td className="border border-border/30 p-4 text-muted-foreground">
                {children}
            </td>
        ),

        // Horizontal rule
        hr: () => (
            <hr className="my-12 border-border/30" />
        ),

        // Strong and emphasis
        strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
        ),
        em: ({ children }) => (
            <em className="italic text-foreground">{children}</em>
        ),

        ...components,
    };
}