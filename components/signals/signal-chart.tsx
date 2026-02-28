import Image from 'next/image';

interface SignalChartProps {
    imagePath: string;
    altText: string;
    title?: string;
}

export default function SignalChart({ imagePath, altText, title = 'Historical Chart' }: SignalChartProps) {
    return (
        <section>
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            <div className="bg-muted/30 border border-border rounded-lg p-4">
                <Image
                    src={imagePath}
                    alt={altText}
                    width={1200}
                    height={600}
                    className="w-full h-auto rounded"
                />
            </div>
        </section>
    );
}
