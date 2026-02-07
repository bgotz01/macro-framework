import { ZodiacData } from './types';

export const ratData: ZodiacData = {
    emoji: '🐀',
    name: 'Rat',
    title: 'System Reconfiguration',
    cyclePosition: 1,
    function: 'Rewire the system so it can continue to exist under new constraints',
    coreStatement: [
        'A Rat year rewires the system so it can continue to exist under new constraints.',
        'Not optimization. Not growth. Reconfiguration.',
        'The Rat initiates a new operating environment.'
    ],
    coreTheme: {
        title: 'Survival → Rewiring → Continuity',
        previousSays: '',
        currentSays: 'The Rat year ensures the system survives — even if everything else must change.'
    },
    pillars: [
        {
            title: '1. System Preservation',
            points: [
                'Whatever is existentially threatened is protected',
                'Rules are bent or rewritten',
                'Moral hazard is accepted as the price of survival'
            ],
            quote: 'The system must not fail.'
        },
        {
            title: '2. Emergency Adaptation',
            points: [
                'New tools appear suddenly',
                'Old taboos vanish',
                'Temporary measures become permanent'
            ],
            quote: "We'll fix the consequences later."
        },
        {
            title: '3. Liquidity Genesis',
            points: [
                'Resources are created or unlocked, not optimized',
                'Capital flows toward plumbing, not performance',
                'Survival beats efficiency'
            ],
            quote: 'Make it work first.'
        },
        {
            title: '4. Continuity Over Fairness',
            points: [
                'Some actors are saved, others are not',
                'Outcomes feel unjust or asymmetric',
                'The goal is continuity, not equity'
            ],
            quote: 'Who matters is redefined.'
        },
        {
            title: '5. New Baselines Are Set',
            points: [
                'What was unthinkable becomes normal',
                'Balance sheets, debt, valuations, risk tolerance reset',
                'The next animals inherit this new reality'
            ],
            quote: 'This is the new starting line.'
        }
    ],
    whyFollows: {
        title: 'The Invariant',
        relationship: 'Rat years do three things:',
        withoutCurrent: [
            'Invalidate prior assumptions',
            'Introduce emergency alternatives',
            'Set the baseline for the next 12 years'
        ],
        conclusion: 'All Rat artifacts.'
    },
    canonicalDefinition: {
        title: 'Rat Year — System Reconfiguration',
        description: 'A phase where the system is fundamentally rewired to survive under new constraints, creating new baselines and tools that define the next cycle.',
        explains: [
            'Why certain things become permanently accepted',
            'Why emergency measures become structural',
            'Why the next 12 years inherit new assumptions'
        ]
    },
    colorScheme: {
        border: 'border-blue-500/30',
        bg: 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900'
    }
};
