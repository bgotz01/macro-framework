import StackedImbalance from '@/thinking/stacked-imbalance.mdx'
import ConceptBoxes from '@/components/concept-boxes'
import RegimeComparisonTable from '@/components/regime-comparison-table'

export default function StackedImbalancePage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <article className="prose prose-slate dark:prose-invert lg:prose-lg prose-ul:list-none prose-ol:list-none prose-li:pl-0">
                <StackedImbalance components={{ ConceptBoxes, RegimeComparisonTable }} />
            </article>
        </div>
    )
}
