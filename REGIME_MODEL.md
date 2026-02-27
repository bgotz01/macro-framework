# Regime Model Documentation

## Overview

The Regime Model is a hierarchical framework for detecting market conditions and determining optimal asset allocation. It evaluates metrics in a specific order, with each regime taking precedence over those below it.

---

## Detection Order

Regimes are evaluated in the following priority order:

1. **System Stress Regime** (highest priority)
2. **Equities Adverse Regime**
3. **Growth vs Equity Danger Fork**
4. **Normal Regime** (default)

---

## 1️⃣ System Stress Regime

### Trigger Condition
```
Real 10Y < 0%
```

### Metric Definition
- **Real 10Y** = 10-Year Treasury Yield - CPI Inflation

### Mapping
**System Stress** - All financial assets lose their anchor

### Rotation
**Gold / Real Assets** - Commodities, real estate, inflation hedges

### Characteristics
- The long-term risk-free rate fails in real terms
- Financial assets lose a stable valuation anchor
- Bonds no longer preserve purchasing power
- Capital seeks protection in real assets

### Why This Dominates
This regime overrides all others because when the risk-free rate fails to provide real returns, the entire financial system's pricing mechanism breaks down. No financial asset can be reliably valued when the baseline anchor is negative in real terms.

### Historical Examples
- 1970s stagflation
- 2021-2022 inflation surge

---

## 2️⃣ Equities Adverse Regime

### Trigger Condition
```
Real EY < 0%
AND Real 10Y ≥ 0% (System Stress not active)
```

### Metric Definition
- **Real EY** = Earnings Yield (5yr) - CPI Inflation
- **Earnings Yield** = 1 / P/E Ratio

### Mapping
**Equities Adverse** - High equity risk, structurally weak returns

### Rotation Logic

#### If Real 10Y > 0%:
**Rotate to Bonds**
- Bonds offer positive real yield
- Lower risk than equities
- Preserve capital in real terms
- Duration provides stability

#### If Real 10Y ≤ 0%:
**Rotate to Gold / Real Assets**
- Both equities and bonds fail in real terms
- Real assets preserve purchasing power
- Gold acts as monetary alternative
- Commodities benefit from inflation

### Characteristics
- Equities fail to clear inflation
- Equity risk is underpaid
- Long-term equity returns structurally weak
- Capital should prefer defensive assets

### Why This Takes Priority
When equities cannot generate real returns above inflation, they fail their fundamental purpose as productive capital. This structural failure takes precedence over spread-based signals.

### Historical Examples
- Late 1970s (high inflation, low real earnings)
- 2000-2002 (negative real earnings during recession)

---

## 3️⃣ Growth vs Equity Danger Fork

### Prerequisites
```
Real 10Y ≥ 0% (no System Stress)
AND Real EY ≥ 0% (equities not structurally broken)
AND EYP < -1% (equity carry inferior to bonds)
```

This fork only applies when the financial system is functioning (Real 10Y positive) and equities can generate real returns (Real EY positive), but equity valuations are expensive relative to bonds.

### Metric Definitions
- **EYP (Earnings Yield Premium)** = Earnings Yield (5yr) - 3-Month Treasury
- **Yield Curve** = 10-Year Treasury - 3-Month Treasury

---

### 3a) Growth Regime

#### Trigger Condition
```
EYP < -1%
AND Yield Curve > 0%
```

#### Mapping
**Growth Regime** - Duration can be financed, growth compensates

#### Rotation
**Growth Equities** - High-growth / long-duration equities

#### Characteristics
- Equity cash-flow carry is inferior to bonds
- But liquidity transmission is healthy
- Duration can be financed and carried
- Growth compensates for weak near-term earnings

#### Why This Works
A positive yield curve indicates healthy liquidity transmission through the financial system. Even though current equity earnings are expensive relative to bonds, the ability to finance duration means growth assets can be carried until their future cash flows materialize.

#### Historical Examples
- 1994-1999 (tech boom with positive curve)
- 2017-2018 (FAANG dominance)

#### Important Note
⚠️ This is NOT a bond-favored regime despite negative EYP. The positive yield curve changes the calculus entirely.

---

### 3b) Equity Danger Regime

#### Trigger Condition
```
EYP < -1%
AND Yield Curve < 0%
```

#### Mapping
**Equity Danger** - Poor carry + broken liquidity transmission

#### Rotation Logic

##### If Real 10Y > 0%:
**Rotate to Bonds**
- Bonds offer positive real yield
- Lower risk than equities
- Inverted curve signals stress
- 2000 / 2006 / 2022 setup

##### If Real 10Y ≤ 0%:
**Rotate to Gold / Real Assets**
- Both equities and bonds under stress
- Real assets preserve purchasing power
- Gold acts as monetary alternative

#### Characteristics
- Equity carry is inferior to bonds
- Liquidity transmission is broken
- Growth cannot be financed
- Equity risk is poorly compensated

#### Why This Is Dangerous
The combination of expensive equities (negative EYP) and an inverted yield curve (broken liquidity) means:
1. Current equity earnings don't justify valuations
2. Future growth cannot be financed
3. The yield curve inversion signals economic stress ahead

#### Historical Examples
- 2000 (dot-com peak with inverted curve)
- 2006-2007 (pre-financial crisis)
- 2022 (Fed tightening cycle)

---

## 4️⃣ Normal Regime

### Trigger Condition
```
Real 10Y ≥ 0%
AND Real EY ≥ 0%
AND (EYP ≥ -1% OR no clear fork signal)
```

### Mapping
**Normal** - Financial system functioning normally

### Rotation
**Balanced** - Standard asset allocation

### Characteristics
- Financial system functioning normally
- Risk-free rate provides real return
- Equities compensate for inflation
- Standard asset allocation applies

### Asset Allocation
- Diversified portfolio appropriate
- Risk assets can be held
- Normal risk/return tradeoffs apply
- No forced rotation required

---

## Metric Reference

### Core Metrics

| Metric | Formula | Purpose |
|--------|---------|---------|
| Real 10Y | 10Y Treasury - CPI | System anchor health |
| Real 3M | 3M Treasury - CPI | Cash pressure |
| Real EY | Earnings Yield (5yr) - CPI | Equity real return |
| EYP | Earnings Yield (5yr) - 3M Treasury | Equity vs bond preference |
| Yield Curve | 10Y Treasury - 3M Treasury | Liquidity transmission |

### Threshold Summary

| Regime | Primary Threshold | Secondary Threshold |
|--------|------------------|---------------------|
| System Stress | Real 10Y < 0% | - |
| Equities Adverse | Real EY < 0% | Real 10Y ≥ 0% |
| Growth | EYP < -1% | Yield Curve > 0% |
| Equity Danger | EYP < -1% | Yield Curve < 0% |
| Normal | All metrics healthy | - |

---

## Decision Tree

```
START
  │
  ├─ Real 10Y < 0%? 
  │   └─ YES → System Stress → Gold/Real Assets
  │   └─ NO → Continue
  │
  ├─ Real EY < 0%?
  │   └─ YES → Equities Adverse
  │       ├─ Real 10Y > 0%? → Bonds
  │       └─ Real 10Y ≤ 0%? → Gold/Real Assets
  │   └─ NO → Continue
  │
  ├─ EYP < -1%?
  │   └─ YES → Check Yield Curve
  │       ├─ Yield Curve > 0%? → Growth Regime → Growth Equities
  │       └─ Yield Curve < 0%? → Equity Danger
  │           ├─ Real 10Y > 0%? → Bonds
  │           └─ Real 10Y ≤ 0%? → Gold/Real Assets
  │   └─ NO → Normal
  │
  └─ Normal → Balanced Allocation
```

---

## Implementation Notes

### Data Sources
- **10Y Treasury**: US/TNX-Monthly
- **3M Treasury**: US/IRX-Monthly
- **CPI**: Economic series
- **Earnings Yield (5yr)**: Valuations series
- **P/E (5yr)**: Valuations series

### Calculation Frequency
- All metrics calculated monthly
- Percentile rankings based on full historical dataset
- Real-time regime detection on each data update

### Historical Coverage
- Dataset begins: 1960
- Full regime detection available from earliest complete data point

---

## Usage Guidelines

### For Portfolio Management
1. Check regime daily or weekly
2. Implement rotation gradually (not all-or-nothing)
3. Consider transaction costs and tax implications
4. Use regime as overlay on existing strategy

### For Risk Management
1. System Stress = maximum defensive posture
2. Equities Adverse = reduce equity exposure
3. Equity Danger = prepare for volatility
4. Growth = can take duration risk
5. Normal = standard risk budgets apply

### For Tactical Allocation
- Regime shifts are signals, not absolute rules
- Consider regime stability (how long in current regime)
- Watch for metrics near threshold boundaries
- Combine with other analysis frameworks

---

## Limitations

### What This Model Does NOT Do
- Predict exact market timing
- Guarantee returns in any regime
- Account for geopolitical events
- Consider individual security selection
- Replace fundamental analysis

### Known Edge Cases
- Regime transitions can be volatile
- Metrics near thresholds may flip frequently
- Historical patterns may not repeat exactly
- Model assumes liquid, accessible markets

---

## Version History

**v1.0** - Initial implementation
- System Stress Regime
- Equities Adverse Regime
- Growth vs Equity Danger Fork
- Normal Regime

---

## References

### Theoretical Foundation
- Real yield framework (Dalio, Bridgewater)
- Earnings yield premium (Fed Model critique)
- Yield curve as liquidity signal (Estrella-Mishkin)
- Regime-based allocation (Kritzman, Merton)

### Data Sources
- Federal Reserve Economic Data (FRED)
- Robert Shiller's data
- Treasury.gov
- Bureau of Labor Statistics

---

*Last Updated: 2026-02-26*
