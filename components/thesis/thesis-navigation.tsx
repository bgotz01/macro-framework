import Link from 'next/link'

interface ThesisNavigationProps {
    previousHref?: string
    previousTitle?: string
    nextHref?: string
    nextTitle?: string
    parentHref?: string
    parentTitle?: string
}

export default function ThesisNavigation({
    previousHref,
    previousTitle,
    nextHref,
    nextTitle,
    parentHref,
    parentTitle
}: ThesisNavigationProps) {
    return (
        <div className="mt-12 pt-6 border-t border-gray-200">
            {parentHref && (
                <div className="mb-6">
                    <Link
                        href={parentHref}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                        ← Back to {parentTitle}
                    </Link>
                </div>
            )}

            <div className="flex justify-between items-center">
                <div>
                    {previousHref && (
                        <Link
                            href={previousHref}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            ← Previous: {previousTitle}
                        </Link>
                    )}
                </div>

                <div>
                    {nextHref && (
                        <Link
                            href={nextHref}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            Next: {nextTitle} →
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}