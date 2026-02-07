import { ZodiacData } from './types';
import { ratData } from './rat';
import { oxData } from './ox';
import { tigerData } from './tiger';
import { rabbitData } from './rabbit';
import { dragonData } from './dragon';
import { snakeData } from './snake';
import { horseData } from './horse';
import { goatData } from './goat';
import { monkeyData } from './monkey';
import { roosterData } from './rooster';
import { dogData } from './dog';
import { pigData } from './pig';

export const zodiacData: Record<string, ZodiacData> = {
    rat: ratData,
    ox: oxData,
    tiger: tigerData,
    rabbit: rabbitData,
    dragon: dragonData,
    snake: snakeData,
    horse: horseData,
    goat: goatData,
    monkey: monkeyData,
    rooster: roosterData,
    dog: dogData,
    pig: pigData,
};

// Central source of truth for zodiac animals with navigation info
export const zodiacAnimals = [
    { emoji: '🐀', name: 'Rat', path: '/chinese/rat', theme: 'System Reconfiguration' },
    { emoji: '🐂', name: 'Ox', path: '/chinese/ox', theme: 'Structural Build-Out' },
    { emoji: '🐅', name: 'Tiger', path: '/chinese/tiger', theme: 'Aggressive Testing' },
    { emoji: '🐇', name: 'Rabbit', path: '/chinese/rabbit', theme: 'Narrative Stabilization' },
    { emoji: '🐉', name: 'Dragon', path: '/chinese/dragon', theme: 'Power & Myth' },
    { emoji: '🐍', name: 'Snake', path: '/chinese/snake', theme: 'Strategic Optimization' },
    { emoji: '🐎', name: 'Horse', path: '/chinese/horse', theme: 'Wild Moves' },
    { emoji: '🐐', name: 'Goat', path: '/chinese/goat', theme: 'Strategic Pullback' },
    { emoji: '🐒', name: 'Monkey', path: '/chinese/monkey', theme: 'Narrative Chaos' },
    { emoji: '🐓', name: 'Rooster', path: '/chinese/rooster', theme: 'Clarity & Realignment' },
    { emoji: '🐕', name: 'Dog', path: '/chinese/dog', theme: 'Trust Rebuild' },
    { emoji: '🐖', name: 'Pig', path: '/chinese/pig', theme: 'Complacency' },
];

export * from './types';
