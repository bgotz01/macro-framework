# Regime Triggers Configuration

## Overview

All regime triggers are configured in one place at the top of `lib/regime-state-machine.ts`.

## Current Configuration

```typescript
const REGIME_TRIGGERS = {
    'Reset': {
        entry: { metric: 'rey', condition: (rey: number) => rey > 6 },
        exit: { metric: 'rey', condition: (rey: number) => rey < 4 }
    },
    'Growth': {
        entry: { metric: 'rey', condition: (rey: number) => rey > 4 },
        exit: { metric: 'rey', condition: (rey: number) => rey < 1 }
    },
    'Contraction': {
        entry: { metric: 'rey', condition: (rey: number) => rey < 0 },
        exit: { metric: 'rey', condition: (rey: number) => rey > 2 }
    },
    'Long Duration': {
        entry: { metric: 'eyp', condition: (eyp: number) => eyp > -2.5 && eyp < 0 },
        exit: { metric: 'eyp', condition: (eyp: number) => eyp <= -2.5 || eyp >= 0 }
    },
    'Mania': {
        entry: { metric: 'eyp', condition: (eyp: number) => eyp <= -2.5 },
        exit: { metric: 'eyp', condition: (eyp: number) => eyp > 0 }
    },
    'System Stress': {
        entry: { metric: 'real10Y', condition: (real10Y: number) => real10Y < 0 },
        exit: { metric: 'real10Y', condition: (real10Y: number) => real10Y > 1 }
    }
};
```

## How to Change Triggers

### Example 1: Change Reset Entry Threshold

To make Reset trigger at REY > 5% instead of 6%:

```typescript
'Reset': {
    entry: { metric: 'rey', condition: (rey: number) => rey > 5 },  // Changed from 6
    exit: { metric: 'rey', condition: (rey: number) => rey < 4 }
},
```

### Example 2: Change Mania Thresholds

To make Mania trigger at EYP ≤ -3% and exit at EYP > -1%:

```typescript
'Mania': {
    entry: { metric: 'eyp', condition: (eyp: number) => eyp <= -3 },  // Changed from -2.5
    exit: { metric: 'eyp', condition: (eyp: number) => eyp > -1 }     // Changed from 0
},
```

### Example 3: Change System Stress Exit

To make System Stress exit at Real10Y > 0.5% instead of 1%:

```typescript
'System Stress': {
    entry: { metric: 'real10Y', condition: (real10Y: number) => real10Y < 0 },
    exit: { metric: 'real10Y', condition: (real10Y: number) => real10Y > 0.5 }  // Changed from 1
},
```

## Available Metrics

- `rey` - Real Earnings Yield (5-year)
- `eyp` - Earnings Yield Premium (5-year)
- `real10Y` - Real 10-Year Treasury Yield

## Regime Precedence

When multiple regimes could trigger, they are checked in this order:

1. **System Stress** (highest priority)
2. **Mania**
3. **Contraction**
4. **Reset**
5. **Growth**
6. **Long Duration** (lowest priority)

To change precedence, edit the `regimePrecedence` array in the `determineNextRegime` function.

## After Changing Triggers

1. Save the file
2. Run: `npm run build-regime-timeline`
3. This rebuilds the historical timeline with your new thresholds

## Current Trigger Summary

| Regime | Entry Condition | Exit Condition |
|--------|----------------|----------------|
| Reset | REY > 6% | REY < 4% |
| Growth | REY > 4% | REY < 1% |
| Contraction | REY < 0% | REY > 2% |
| Long Duration | -2.5% < EYP < 0% | EYP ≤ -2.5% OR EYP ≥ 0% |
| Mania | EYP ≤ -2.5% | EYP > 0% |
| System Stress | Real10Y < 0% | Real10Y > 1% |

## Tips

- **Entry triggers** activate a regime
- **Exit triggers** deactivate a regime (allowing another to take over)
- Use **hysteresis** (different entry/exit thresholds) to prevent regime flip-flopping
- Higher precedence regimes override lower ones when multiple triggers fire
- A regime persists until its exit trigger fires, even if conditions change
