# Regime State Machine

## Overview

The Regime State Machine implements a persistent, trigger-based regime classification system. Unlike traditional approaches that recalculate regime from monthly metrics, this system treats regimes as **sticky states** that only change when significant outlier triggers fire.

## Philosophy

### The Problem with Monthly Recalculation

Traditional regime systems recalculate regime every month based on current metric values. This creates:
- **Excessive noise** - Regimes flip back and forth
- **False signals** - Brief metric changes trigger regime shifts
- **Poor interpretability** - Hard to understand what drives transitions

### The State Machine Solution

A regime should behave like a **state machine**:
1. **Begins** when a meaningful trigger is hit
2. **Persists** through normal market fluctuations
3. **Changes** only when a new outlier trigger overrides it

This creates stable, meaningful regime transitions that reflect actual macro-equity environment shifts.

## Architecture

### Three Layers

```
┌─────────────────────────────────────┐
│   Layer 1: Current Readings         │
│   (Monthly metric updates)           │
│   - Liquidity score                  │
│   - Valuation score                  │
│   - Trend stage/pressure/risk        │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Layer 2: Outlier Triggers          │
│   (Decisive conditions)              │
│   - Mania trigger                    │
│   - Contraction trigger              │
│   - Reset trigger                    │
│   - Growth trigger                   │
│   - Accumulation trigger             │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Layer 3: Active Regime             │
│   (Persistent state)                 │
│   - Regime family                    │
│   - Entry date                       │
│   - Days in regime                   │
│   - Trigger reason                   │
└─────────────────────────────────────┘
```

## The Five Regime Families

### 1. Accumulation
**Question:** Is the market cheap enough to matter?

**Entry Trigger:**
- Valuation score ≥ 1 (Attractive or Deep Value)
- Liquidity score > -4 (Not deeply restrictive)

**Meaning:** Cheapness is the dominant signal. Market priced for pessimism.

**Guidance:** Look for value - build positions in quality assets

### 2. Growth
**Question:** Is the macro backdrop supporting earnings/duration expansion?

**Entry Trigger:**
- Liquidity score ≥ 2 (Expansionary)
- Valuation score ≥ -1 (Fair or Attractive)
- No mania conditions
- Stage not Late

**Meaning:** Supportive macro + reasonable pricing + healthy trend align

**Guidance:** Lean into quality growth and cyclicals

### 3. Mania
**Question:** Has enthusiasm outrun fundamentals?

**Entry Trigger:**
- Valuation score ≤ -2 (Expensive)
- Pressure = High or Extreme
- Stage = Mature or Late

**Meaning:** Excess dominates. Speculation and euphoria present.

**Guidance:** Look for excess - narrowing breadth, speculation, bubble behavior

### 4. Contraction
**Question:** Is macro tightening overwhelming risk appetite?

**Entry Trigger:**
- Liquidity score ≤ -4 (Highly Contractive)
- OR Liquidity score ≤ -2 AND Valuation score ≤ -2

**Meaning:** Restrictive liquidity dominates. Capital preservation matters.

**Guidance:** Preserve capital - defensives, quality balance sheets, cash

### 5. Reset
**Question:** Has enough pain occurred to create a new base?

**Entry Trigger:**
- Valuation score ≥ 1 (Cheap)
- Evidence of damage (Breakdown/Capitulation OR prior Contraction/Mania)
- Washout complete (Low pressure OR restrictive liquidity)

**Meaning:** Damage has created opportunity. Recovery incomplete.

**Guidance:** Look for bottoming processes and early accumulation

## Trigger Precedence

When multiple triggers could fire, precedence order determines the regime:

1. **Mania** - Excess clearly dominates
2. **Contraction** - Restrictive liquidity dominates
3. **Reset** - Damage + cheapness dominate
4. **Growth** - Supportive conditions align
5. **Accumulation** - Cheapness is main signal

If no trigger fires, the current regime **persists**.

## Implementation

### Database Schema

```sql
CREATE TABLE regime_timeline (
    date TEXT PRIMARY KEY,
    regime TEXT NOT NULL,
    entry_date TEXT NOT NULL,
    trigger_reason TEXT NOT NULL,
    liquidity_score REAL,
    valuation_score REAL,
    stage TEXT,
    pressure TEXT,
    risk TEXT,
    direction TEXT
);
```

### Building the Timeline

Run the script to process all historical data:

```bash
npm run build-regime-timeline
```

This processes every month from 1960 onwards, checking triggers and recording regime transitions.

### API Endpoints

**Get Regime State:**
```
GET /api/regime-state?date=2024-01-01
GET /api/regime-state?date=latest
```

Returns:
```json
{
  "regime": "Growth",
  "entryDate": "2023-06-01",
  "currentDate": "2024-01-01",
  "daysInRegime": 214,
  "triggerReason": "Growth conditions: Supportive liquidity (3), reasonable valuation (0), Established stage",
  "conditions": {
    "liquidityScore": 3,
    "valuationScore": 0,
    "stage": "Established",
    "pressure": "Mid",
    "risk": "Continuation",
    "direction": "Uptrend"
  }
}
```

## Display Components

### Active Regime Display

Shows:
- **Regime name** with color coding
- **Entry date** and days in regime
- **Trigger reason** explaining why regime activated
- **Guidance** on where to look for opportunities
- **Current conditions** (live monthly updates)

### Key Insight

The display separates:
- **Active Regime** (sticky state) - What macro-equity environment we're in
- **Current Conditions** (live diagnostics) - What's happening inside that regime

This allows you to see:
```
Active Regime: Growth
Current Conditions: Late stage, High pressure, Expensive valuation
```

Which tells you: "Still in Growth regime, but Mania trigger may be approaching"

## Advantages

### 1. Stability
Regimes don't flip-flop with every monthly data update. They persist until meaningful conditions change.

### 2. Interpretability
Each regime transition has a clear trigger reason. You can see exactly what caused the shift.

### 3. Path Dependence
The system is path-dependent (considers prior regime), which matches how real macro regimes work.

### 4. Actionable
Each regime answers "where to look" rather than just "bull or bear."

### 5. Monitoring
Current conditions update monthly, showing pressure building inside the active regime.

## Future Enhancements

### Asymmetric Entry/Exit Triggers
Currently, the same logic determines both entry and exit. Could add:
- **Entry trigger:** Conditions to activate regime
- **Exit trigger:** Conditions to deactivate regime

Example:
- Enter Mania: Expensive + High pressure + Late stage
- Exit Mania: Only when Contraction or Reset trigger fires

### Confirmation Requirements
Add persistence requirements:
- Trigger must be true for 2-3 consecutive months
- OR trigger must be extreme enough for instant activation

### Regime Strength Score
Add a 0-100 score showing how strongly current conditions support the active regime.

## Files

### Core Logic
- `lib/regime-state-machine.ts` - State machine logic and trigger detection
- `scripts/build-regime-timeline.ts` - Historical timeline builder

### API
- `app/api/regime-state/route.ts` - Regime state endpoint

### Components
- `components/regime/regime-state-display.tsx` - Active regime display
- `components/regime/regime-parameters.tsx` - Main regime dashboard

### Configuration
- `lib/regime-config.ts` - Liquidity and valuation classification
- `lib/regime-config/flow-trend-config.ts` - Trend pressure classification

## Usage

1. **Build the timeline** (one-time or when data updates):
   ```bash
   npm run build-regime-timeline
   ```

2. **View on dashboard:**
   Navigate to the home page to see the active regime and current conditions

3. **Use timeline slider:**
   Scrub through history to see regime transitions over time

## Maintenance

When new monthly data is added:
1. Run `npm run build-regime-timeline` to update regime timeline
2. The system will process new dates and detect any regime transitions
3. API will automatically serve updated regime state
