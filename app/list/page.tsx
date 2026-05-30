import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export default async function WaitlistPage() {
    const entries = await prisma.waitlist.findMany({
        orderBy: { created_at: 'desc' },
    });

    return (
        <main className="min-h-screen bg-[#050507] px-6 py-12 text-white">
            <div className="mx-auto max-w-2xl">
                <div className="mb-8 flex items-baseline justify-between">
                    <h1 className="text-xl font-semibold">Waitlist</h1>
                    <span className="text-sm text-white/40">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</span>
                </div>

                {entries.length === 0 ? (
                    <p className="text-sm text-white/40">No entries yet.</p>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-white/10">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs text-white/40">
                                    <th className="px-4 py-3 font-medium">Name</th>
                                    <th className="px-4 py-3 font-medium">Email</th>
                                    <th className="px-4 py-3 font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((entry, i) => (
                                    <tr
                                        key={entry.id}
                                        className={`border-b border-white/[0.06] last:border-0 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}
                                    >
                                        <td className="px-4 py-3 text-white/80">{entry.name}</td>
                                        <td className="px-4 py-3 text-white/60">{entry.email}</td>
                                        <td className="px-4 py-3 text-white/35">
                                            {entry.created_at.toLocaleDateString('en-GB', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}
