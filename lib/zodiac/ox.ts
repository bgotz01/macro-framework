import { ZodiacData } from './types';

export const oxData: ZodiacData = {
    emoji: '🐂',
    name: 'Ox',
    title: 'Structural Build-Out',
    cyclePosition: 2,
    function: 'Make the reconfigured system usable at scale',
    coreStatement: [
        'Ox years take what Rat made possible and turn it into something durable.',
        'No heroics. No spectacle. Just work.'
    ],
    coreTheme: {
        title: 'From emergency to structure',
        previousSays: 'This must exist.',
        currentSays: 'Then it must be built properly.'
    },
    pillars: [
        {
            title: '1. Institutionalization',
            points: [
                'Temporary measures become permanent',
                'Ad-hoc tools get rules, forms, and owners',
                'The system acquires procedures'
            ],
            quote: 'We need standards.'
        },
        {
            title: '2. Infrastructure & Capacity',
            points: [
                'Balance sheets, pipes, platforms, rails',
                'Boring but necessary expansion',
                'Scaling for load, not speed'
            ],
            quote: 'Make it handle real usage.'
        },
        {
            title: '3. Normalization',
            points: [
                'Shock fades into routine',
                'What felt radical becomes background',
                'People stop arguing whether — and start arguing how'
            ],
            quote: 'This is just how things work now.'
        },
        {
            title: '4. Discipline & Constraint',
            points: [
                'Guardrails appear',
                'Risk is controlled, not eliminated',
                'Excess is quietly discouraged'
            ],
            quote: 'Slow and steady.'
        },
        {
            title: '5. Foundation for Risk-Taking',
            points: [
                'Ox does not create upside',
                'It creates the conditions under which upside is later possible'
            ],
            quote: 'The floor matters more than the ceiling.'
        }
    ],
    whyFollows: {
        title: 'Why Ox Must Follow Rat',
        relationship: 'Rat creates possibility. Ox creates reliability.',
        withoutCurrent: [
            "Tiger's risk blows up the system",
            "Dragon's excess collapses instantly",
            'Nothing compounds'
        ],
        conclusion: 'Ox is the unsung hero of the cycle.'
    },
    canonicalDefinition: {
        title: 'Ox Year — Structural Build-Out',
        description: 'A phase where emergency systems are institutionalized, infrastructure is built, and the foundation for future risk-taking is established through discipline and capacity.',
        explains: [
            'Why systems become durable',
            'Why boring work matters',
            'Why the floor matters more than the ceiling'
        ]
    },
    colorScheme: {
        border: 'border-green-500/30',
        bg: 'from-green-50 to-green-100 dark:from-green-950 dark:to-green-900'
    }
};
