import { ZodiacData } from './types';

export const dogData: ZodiacData = {
    emoji: '🐕',
    name: 'Dog',
    title: 'Trust Rebuild',
    cyclePosition: 11,
    function: 'Make things trustworthy again through consistency, follow-through, and shared norms',
    coreStatement: [
        'Dog years are about making things trustworthy again — through consistency, follow-through, and shared norms — not authority or enforcement.',
        'No systems jargon. No top-down repair crews. Just earned reliability.'
    ],
    coreTheme: {
        title: 'From truth to trust',
        previousSays: "Here's reality.",
        currentSays: "Okay. Now let's make this work again."
    },
    pillars: [
        {
            title: '1. Consistency Returns',
            points: [
                'Fewer surprises',
                'Fewer reversals',
                "People do what they say they'll do"
            ],
            quote: 'At least this behaves the same way every time.'
        },
        {
            title: '2. Follow-Through Matters',
            points: [
                'Promises are kept',
                'Expectations are realistic',
                'Flashy claims lose appeal'
            ],
            quote: "Show me, don't tell me."
        },
        {
            title: '3. Social Confidence Slowly Reforms',
            points: [
                'People re-engage cautiously',
                'Cooperation improves',
                'Friction eases'
            ],
            quote: 'Okay… I can work with this.'
        },
        {
            title: '4. Boundaries Are Respected',
            points: [
                'Not because of force',
                "But because they're understood",
                'And broadly accepted'
            ],
            quote: 'We all know where the lines are.'
        },
        {
            title: '5. Quiet Re-Entry',
            points: [
                'Participation widens again',
                'Without excitement',
                'Without hype'
            ],
            quote: "Let's just get back to normal."
        }
    ],
    whyFollows: {
        title: 'Why Dog Must Follow Rooster',
        relationship: 'Rooster cuts. Dog binds.',
        withoutCurrent: [
            "Rooster's clarity becomes brittle",
            'Cynicism hardens',
            'Pig (abundance) becomes hollow'
        ],
        conclusion: 'Dog restores social glue.'
    },
    contrast: {
        previous: 'Rooster',
        current: 'Dog',
        rows: [
            { previous: 'Enforcement', current: 'Care' },
            { previous: 'Exposure', current: 'Repair' },
            { previous: 'Painful clarity', current: 'Earned trust' },
            { previous: 'Correction', current: 'Commitment' }
        ]
    },
    canonicalDefinition: {
        title: 'Dog Year — Trust Rebuild',
        description: 'A phase where reliability, consistency, and shared expectations are restored, allowing people to re-engage without fear of sudden disruption.',
        explains: [
            'when people start relying on each other again',
            'dependability over innovation',
            'quiet progress without drama'
        ]
    },
    colorScheme: {
        border: 'border-cyan-500/30',
        bg: 'from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900'
    }
};
