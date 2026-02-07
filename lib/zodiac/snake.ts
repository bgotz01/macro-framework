import { ZodiacData } from './types';

export const snakeData: ZodiacData = {
    emoji: '🐍',
    name: 'Snake',
    title: 'Strategic Optimization',
    cyclePosition: 6,
    function: 'Extract, refine, and quietly reposition within the Dragon-built system',
    coreStatement: [
        'Snake years are about knowing where the real leverage is — and moving without being seen.'
    ],
    coreTheme: {
        title: 'From magnitude to mastery',
        previousSays: 'This is powerful.',
        currentSays: "Then let's use it precisely."
    },
    pillars: [
        {
            title: '1. Quiet Intelligence',
            points: [
                'Information asymmetry increases',
                'True insight separates from narrative',
                'The loud phase ends; analysis begins'
            ],
            quote: 'The story is not the signal.'
        },
        {
            title: '2. Optimization & Extraction',
            points: [
                'Systems are tuned for efficiency',
                'Margins are refined',
                'Value is harvested, not expanded'
            ],
            quote: 'How do we get the most from this?'
        },
        {
            title: '3. Selective Participation',
            points: [
                'Smart capital narrows focus',
                'Broad participation slows',
                'Outsiders still see strength; insiders reposition'
            ],
            quote: 'Not everyone needs to be here anymore.'
        },
        {
            title: '4. Risk Migration',
            points: [
                'Risk is shifted, not reduced',
                'Exposure moves to the edges',
                'Fragility becomes hidden'
            ],
            quote: 'The danger is somewhere else now.'
        },
        {
            title: '5. Preparation Without Alarm',
            points: [
                'No crisis narrative',
                'No urgency felt publicly',
                'Strategic exits are disguised as normal activity'
            ],
            quote: 'Nothing is wrong — yet.'
        }
    ],
    whyFollows: {
        title: 'Why Snake Must Follow Dragon',
        relationship: 'Dragon creates power concentration. Snake exploits information advantage within that concentration.',
        withoutCurrent: [
            'Dragon excess is obvious',
            'Collapse is immediate'
        ],
        conclusion: "Snake delays reckoning — which is why it's misunderstood."
    },
    contrast: {
        previous: 'Dragon',
        current: 'Snake',
        rows: [
            { previous: 'Loud', current: 'Quiet' },
            { previous: 'Expansion', current: 'Refinement' },
            { previous: 'Myth', current: 'Insight' },
            { previous: 'Power displayed', current: 'Power repositioned' }
        ]
    },
    canonicalDefinition: {
        title: 'Snake Year — Strategic Optimization',
        description: 'A phase where power is quietly refined, value is extracted, and informed actors reposition inside a dominant system without disrupting its appearance of strength.',
        explains: [
            'feel calm',
            'feel "smart"',
            'look healthy — until later'
        ]
    },
    colorScheme: {
        border: 'border-purple-500/30',
        bg: 'from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900'
    }
};
