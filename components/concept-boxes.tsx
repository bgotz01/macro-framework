import { Fragment } from 'react'

export default function ConceptBoxes() {
    const concepts = ['Leverage', 'Speed', 'Concentration', 'Trust decay']

    return (
        <div className="my-8 flex flex-wrap items-center justify-center gap-3">
            {concepts.map((concept, idx) => (
                <Fragment key={concept}>
                    <div className="px-6 py-4 rounded-lg bg-blue-600 dark:bg-blue-700 text-white shadow-lg font-semibold text-center min-w-[140px]">
                        {concept}
                    </div>
                    {idx < concepts.length - 1 && (
                        <div className="text-3xl font-bold text-gray-400 dark:text-gray-500">
                            +
                        </div>
                    )}
                </Fragment>
            ))}
        </div>
    )
}
