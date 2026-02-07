import ZodiacNav from './zodiac-nav';
import { ZodiacData } from '../../lib/zodiac';

interface ZodiacPageProps {
    data: ZodiacData;
}

export default function ZodiacPage({ data }: ZodiacPageProps) {
    const {
        emoji,
        name,
        title,
        cyclePosition,
        function: functionText,
        coreStatement,
        coreTheme,
        pillars,
        whyFollows,
        contrast,
        warning,
        canonicalDefinition,
        colorScheme
    } = data;

    return (
        <>
            <ZodiacNav />
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="text-6xl mb-4">{emoji}</div>
                    <h1 className="text-4xl font-bold mb-3">{name} — {title}</h1>
                    <div className="text-lg text-muted-foreground space-y-2">
                        <p><strong>Cycle position:</strong> Year {cyclePosition}</p>
                        <p><strong>Function:</strong> {functionText}</p>
                    </div>
                </div>

                {/* Core Statement */}
                <div className={`mb-12 p-6 rounded-2xl border-2 ${colorScheme.border} bg-gradient-to-br ${colorScheme.bg}`}>
                    {coreStatement.map((statement, idx) => (
                        <p
                            key={idx}
                            className={`leading-relaxed ${idx === 0
                                ? 'text-lg font-semibold mb-3'
                                : idx === coreStatement.length - 1
                                    ? 'text-base'
                                    : 'text-base mb-3'
                                }`}
                            style={{
                                color: 'inherit',
                                opacity: idx === 0 ? 1 : 0.9
                            }}
                        >
                            {statement}
                        </p>
                    ))}
                </div>

                {/* Core Theme */}
                <div className="mb-12 p-6 rounded-xl bg-muted/50 border-l-4 border-primary">
                    <h2 className="text-xl font-bold mb-4">Core {name} Theme</h2>
                    <p className="text-lg font-semibold mb-4">{coreTheme.title}</p>
                    {coreTheme.previousSays && (
                        <div className="space-y-2 text-base">
                            <p><strong>{contrast?.previous || 'Previous'} says:</strong> "{coreTheme.previousSays}"</p>
                            <p><strong>{name} says:</strong> "{coreTheme.currentSays}"</p>
                        </div>
                    )}
                    {!coreTheme.previousSays && (
                        <p className="text-base italic">{coreTheme.currentSays}</p>
                    )}
                </div>

                {/* The Pillars - Grid Layout */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-2">The {name} Pillars</h2>
                    <p className="text-sm text-muted-foreground mb-6 italic">(themes only)</p>

                    <div className="grid md:grid-cols-2 gap-6">
                        {pillars.map((pillar, idx) => (
                            <div
                                key={idx}
                                className={`p-6 rounded-xl border-2 border-border bg-card ${idx === pillars.length - 1 && pillars.length % 2 !== 0
                                    ? 'md:col-span-2'
                                    : ''
                                    }`}
                            >
                                <h3 className="text-lg font-bold mb-3">{pillar.title}</h3>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    {pillar.points.map((point, pointIdx) => (
                                        <li key={pointIdx}>• {point}</li>
                                    ))}
                                </ul>
                                <p className="mt-3 text-xs italic font-semibold">"{pillar.quote}"</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Why Follows */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">{whyFollows.title}</h2>

                    <div className="space-y-6">
                        <div className="p-6 rounded-xl border-2 border-blue-500/30 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                            <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                                {whyFollows.relationship}
                            </p>
                        </div>

                        {whyFollows.withoutPrevious && (
                            <div className="p-6 rounded-xl border-2 border-red-500/30 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
                                <h3 className="text-lg font-bold mb-3 text-red-900 dark:text-red-100">
                                    Without {contrast?.previous || 'Previous'}:
                                </h3>
                                <ul className="space-y-2 text-red-800 dark:text-red-200">
                                    {whyFollows.withoutPrevious.map((item, idx) => (
                                        <li key={idx}>• {item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {whyFollows.withoutCurrent && (
                            <div className={`p-6 rounded-xl border-2 ${whyFollows.withoutPrevious
                                ? 'border-yellow-500/30 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900'
                                : 'border-red-500/30 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900'
                                }`}>
                                <h3 className={`text-lg font-bold mb-3 ${whyFollows.withoutPrevious
                                    ? 'text-yellow-900 dark:text-yellow-100'
                                    : 'text-red-900 dark:text-red-100'
                                    }`}>
                                    Without {name}:
                                </h3>
                                <ul className={`space-y-2 ${whyFollows.withoutPrevious
                                    ? 'text-yellow-800 dark:text-yellow-200'
                                    : 'text-red-800 dark:text-red-200'
                                    }`}>
                                    {whyFollows.withoutCurrent.map((item, idx) => (
                                        <li key={idx}>• {item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="p-6 rounded-xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
                            <p className="text-lg font-semibold text-amber-900 dark:text-amber-100 text-center">
                                {whyFollows.conclusion}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contrast Table */}
                {contrast && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-6">Contrast with {contrast.previous}</h2>
                        <div className="overflow-x-auto rounded-xl border border-border/50 shadow-lg">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                                        <th className="border border-border p-4 text-left font-bold text-base">
                                            {contrast.previous}
                                        </th>
                                        <th className="border border-border p-4 text-left font-bold text-base">
                                            {contrast.current}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contrast.rows.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                            <td className={`border border-border p-4 text-center ${idx === 0 ? 'font-semibold' : ''
                                                }`}>
                                                {row.previous}
                                            </td>
                                            <td className={`border border-border p-4 text-center ${idx === 0 ? 'font-semibold' : ''
                                                }`}>
                                                {row.current}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Warning */}
                {warning && (
                    <div className="mb-12 p-6 rounded-2xl border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
                        <h2 className="text-xl font-bold mb-4 text-yellow-900 dark:text-yellow-100">
                            {warning.title}
                        </h2>
                        <div className="space-y-4 text-yellow-900 dark:text-yellow-100">
                            {warning.content.length > 0 && (
                                <>
                                    <p className="text-base font-semibold">
                                        {name === 'Rabbit' ? `${name} can:` : `${name} does not cause collapse. It creates:`}
                                    </p>
                                    <ul className="space-y-1 text-yellow-800 dark:text-yellow-200 ml-4">
                                        {warning.content.map((item, idx) => (
                                            <li key={idx}>• {item}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                            {warning.conclusion && (
                                <p className="text-base font-semibold pt-3 border-t border-yellow-500/30">
                                    {warning.conclusion}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Clean Canonical Definition */}
                <div className="mb-12 p-8 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
                    <h2 className="text-2xl font-bold mb-4">Clean Canonical Definition</h2>
                    <div className="mb-4">
                        <h3 className="text-xl font-semibold mb-2">{canonicalDefinition.title}</h3>
                        <p className="text-base text-muted-foreground leading-relaxed">
                            {canonicalDefinition.description}
                        </p>
                    </div>
                    <div className="pt-4 border-t border-border/50">
                        <p className="text-base font-semibold mb-3">
                            This explains why {name} years:
                        </p>
                        <ul className="space-y-2 text-muted-foreground">
                            {canonicalDefinition.explains.map((item, idx) => (
                                <li key={idx}>• {item}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}
