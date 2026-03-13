# Regime State Machine Improvements

## Changes Implemented

### 1. Stricter Crisis Threshold
- **Old**: Real 10Y < 0%
- **New**: Real 10Y < -1%
- **Impact**: Reduced Crisis months from 70 to 53
- **Rationale**: Crisis should represent severe financial repression, not marginal negative real rates

### 2. Stricter Contraction Requirements
- **Old**: REY < 0% AND EYP < 0%
- **New**: REY < 0% AND EYP < 0% AND Real 10Y < 0%
- **Impact**: Contraction regime eliminated from timeline (too strict)
- **Rationale**: Contraction should require financial repression + real earnings collapse + negative risk premium

### 3. Transition Map Implementation
Added `ALLOWED_TRANSITIONS` map to prevent illogical regime transitions:

**Recovery** (only from damaged states):
- Can transition from: Crisis, Contraction, Reset
- Cannot transition from: Normal, Growth, Long Duration, Mania

**Reset** (post-crisis deep value):
- Can transition from: Crisis, Contraction, Liquidity Shock, Mania

**Growth** (healthy expansion):
- Can transition from: Normal, Reset, Recovery

**Long Duration** (overvalued but working):
- Can transition from: Growth, Normal, Recovery

**Mania** (speculative excess):
- Can transition from: Long Duration, Growth, Recovery, Liquidity Shock

**Contraction** (deterioration):
- Can transition from: Normal, Growth, Long Duration, Mania, Recovery, Liquidity Shock

**Crisis** (severe stress):
- Can transition from: Any regime (crisis can emerge anywhere)

**Liquidity Shock** (extreme stimulus):
- Can transition from: Crisis, Recovery, Normal, Growth, Long Duration, Mania

**Normal** (balanced baseline):
- Can transition from: Most regimes (fallback state)

### 4. Results

**Before**:
- Recovery appeared 23 times, including illogical Normal → Recovery transitions
- Crisis appeared 70 times with marginal cases
- Contraction appeared 12 times

**After**:
- Recovery: 0 occurrences (cannot reach from Normal)
- Crisis: 53 occurrences (stricter threshold)
- Contraction: 0 occurrences (very strict requirements)
- Long Duration: 170 occurrences (captures overvalued periods like 2005-2006)

### 5. Key Improvements

1. **Regime Memory**: Recovery now requires prior damage (Crisis/Contraction/Reset)
2. **Logical Transitions**: Prevents nonsensical jumps like Normal → Recovery
3. **Stricter Thresholds**: Crisis and Contraction now represent more severe conditions
4. **Better Classification**: 2005-2006 now correctly shows as Long Duration (overvalued) rather than Contraction

## Remaining Considerations

### Contraction May Be Too Strict
Current requirements: REY < 0% AND EYP < 0% AND Real 10Y < 0%

This combination is very rare. Consider loosening to:
```typescript
c.rey < 0 && (c.eyp < 0 || c.liquidityScore <= -2 || c.risk === 'Breakdown')
```

This would capture broader deterioration while maintaining accuracy.

### Recovery Needs Crisis/Contraction to Exist
Since Contraction is now eliminated and Crisis is stricter, Recovery may never trigger.
Consider:
- Loosening Contraction requirements, OR
- Allowing Recovery from Liquidity Shock → Normal transitions

## Timeline Summary

| Regime | Months | First | Last |
|--------|--------|-------|------|
| Crisis | 53 | 1974-06 | 2023-05 |
| Growth | 230 | 1960-01 | 2018-04 |
| Liquidity Shock | 17 | 2020-07 | 2021-11 |
| Long Duration | 170 | 1968-05 | 2026-01 |
| Mania | 58 | 1973-08 | 2001-05 |
| Normal | 265 | 1970-03 | 2023-06 |

Total: 793 months from 1960-01 to 2026-01
