interface PageHeaderProps {
    title: string;
    subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
    return (
        <div className="text-center mb-8">
            <h1 className="page-title text-3xl mb-1">{title}</h1>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
            <div className="mt-3 h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
        </div>
    );
}
