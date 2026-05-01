# Regime Reference Guide

This is the primary reference for the macro regime framework — metrics, signals, the state machine, cycles, and glossary. Used as the AI assistant's knowledge context.

---

## Core Metrics

### Primary Metrics
| Metric | Formula | Purpose |
|--------|---------|---------|
| Real 10Y | 10Y Treasury (TNX-Monthly) − CPI | System anchor health |
| Real 3M | 3M Treasury (IRX-Monthly) − CPI | Cash pressure |
| Real Earnings Yield (5yr) | Earnings Yield (5yr) − CPI | Equity real return |
| Earnings Yield Premium (5yr) | Earnings Yield (5yr) − 3M Treasury | Equity vs bond preference |
| Yield Curve (10Y−3M) | 10Y Treasury − 3M Treasury | Liquidity transmission |
| PE-5yr | S&P 500 Price / 5-year rolling EPS | Equity valuation (more current than CAPE) |
| Earnings Yield (5yr) | (1 / PE-5yr) × 100 | Inverse of 5-year P/E |

### PE-5yr vs Shiller CAPE
- PE-5yr uses 5-year rolling average earnings (more responsive, more current data)
- Shiller CAPE uses 10-year rolling average (smoother but lags)
- Both currently show extreme valuations (97-98th percentile)

---

## Market Signals (Conceptual Reference)

These signals describe the underlying logic that drives regime transitions. The actual active regime is determined by the state machine below.

### Core Signal Logic

**Real Earnings Yield (REY) signals:**
- REY ≥ 3% → Broad Growth territory — equities are genuinely cheap vs inflation
- REY 0–3% → Neutral / Long Duration territory
- REY < −0.5% → Overvaluation territory — equities cannot clear inflation

**Earnings Yield Premium (EYP) signals:**
- EYP ≤ 0% AND Real 10Y ≥ 1% → Long Duration — bonds are real-return positive, equities yield less than cash
- EYP ≤ −2.5% → Overvaluation extreme — equities deeply below risk-free rate

**Real Rate signals:**
- Real 10Y ≤ −0.5% AND Real 3M ≤ −1% → Bond Stress — financial repression across the curve
- Real 10Y ≤ −1% AND Real M2 ≤ 5% → Crisis — repression plus tight money

**Money supply signals:**
- Real M2 ≥ 10% → Liquidity Shock — massive liquidity injection overrides other signals

### Rotation Logic by Regime
- **Broad Growth**: Lean into quality growth equities
- **Long Duration**: Duration/growth equities; bonds unattractive vs equities on risk-premium basis
- **Overvaluation**: Rotate to bonds (if Real 10Y > 0%) or gold (if Real 10Y < 0%)
- **Bond Stress**: Gold / real assets — bonds fail to preserve purchasing power
- **Crisis**: Defensive — real rates negative, money tight
- **Liquidity Shock**: Speculative assets, risk-on — liquidity overwhelms fundamentals

---

## Regime State Machine (Active System)

The state machine is the **only active regime model** in the application. It implements sticky regimes that only change on outlier triggers — not on every monthly recalculation.

### 6 Regime Families

| Regime | Color | Description |
|--------|-------|-------------|
| **Broad Growth** | Green | Strong real earnings environment — healthy equity expansion |
| **Long Duration** | Blue | Equities overvalued relative to bonds — investors buying duration/growth |
| **Overvaluation** | Yellow | Extreme equity unattractiveness — equities far below risk-free rate |
| **Crisis** | Dark Red | Financial repression with low money growth — crisis conditions |
| **Bond Stress** | Orange-Red | Real rates deeply negative across the curve — financial repression |
| **Liquidity Shock** | Purple | Financial repression with high money growth — speculative assets thrive |
| **None** | Gray | Balanced conditions — no extreme triggers active |

### Entry & Exit Triggers

| Regime | Entry | Exit |
|--------|-------|------|
| **Broad Growth** | REY ≥ 3% | REY < 1% |
| **Long Duration** | EYP ≤ 0% AND Real 10Y ≥ 1% AND REY ≥ 0% | EYP ≥ 0% OR EYP ≤ −2.5% OR REY < −0.5% |
| **Overvaluation** | EYP ≤ −2.5% OR REY ≤ −0.5% | EYP ≥ 0% AND REY ≥ 0.5% |
| **Crisis** | Real 10Y ≤ −1% AND Real M2 ≤ 5% | Real 10Y ≥ 0.5% OR Real M2 ≥ 7% |
| **Bond Stress** | Real 10Y ≤ −0.5% AND Real 3M ≤ −1% | Real 10Y ≥ 0.25% |
| **Liquidity Shock** | Real M2 ≥ 10% | Real M2 ≤ 8% |

### Precedence Order (highest wins)
1. Liquidity Shock
2. Crisis
3. Bond Stress
4. Overvaluation
5. Broad Growth
6. Long Duration
7. None (default)

### Guidance by Regime
- **Broad Growth**: Earnings growing faster than inflation — lean into quality growth
- **Long Duration**: Negative equity risk premium — investors buying duration/growth
- **Overvaluation**: Rotate away from equities: favor bonds if Real 10Y > 0%, favor gold if Real 10Y < 0%
- **Crisis**: Real rates negative but money tight — defensive positioning critical
- **Bond Stress**: Severe financial repression — rotate to gold as bonds are unattractive
- **Liquidity Shock**: Massive liquidity injection — speculative assets thrive
- **None**: Standard market environment — maintain diversified positioning

### Key Design Principles
- Regimes are **sticky** — they persist through normal fluctuations
- Changes only on **outlier triggers** (decisive conditions)
- **Hysteresis** — different entry/exit thresholds prevent flip-flopping
- Each transition has a clear **trigger reason** for interpretability

### Current Regime Context (Apr 2026)
The active regime is **Long Duration** (since Oct 2023). EYP is negative (equities yield less than the risk-free rate) and Real 10Y is positive (bonds are real-return positive). REY is near 0%, sitting at the knife's edge — a stock rally or CPI rise would push toward Overvaluation; a selloff or EPS growth would push toward Broad Growth.

---

## Cycle Theories

### 12-Year Macro Reconfiguration Cycles
Each cycle marks a major regime shift:
- **1948**: Institutional Reconstruction (order rebuilt after collapse)
- **1960**: Institutional Capital & Brand Consolidation (permanence as thesis)
- **1972**: Fiat Regime Price Discovery (monetary freedom meets reality)
- **1984**: Credit Expansion (leverage becomes growth engine)
- **1996**: Digital Infrastructure (information → networked → scalable)
- **2008**: Monetary Intervention Era (liquidity replaces price signals)
- **2020**: Digital Economy (reality goes virtual)

---

## Core Themes for the Next Decade

1. Equity valuations in 99th percentile
2. Marginal cost of intelligence is 0 (AI)
3. Stable bond market & inflation
4. Rising geopolitical tensions (war, tariffs)

---

## S&P 500 Tracking System

- Current constituents (503 companies) with sector, sub-industry, headquarters, date added
- Historical changes (359 records) — additions/removals with reasons
- Point-in-time reconstruction (view index composition at any historical date)
- Sector rotation analysis, turnover metrics, tenure analysis
- 11 GICS sectors tracked

---

## Percentile Analysis

All metrics are ranked using expanding-window percentiles (each date compared to all prior data from 1960 onwards). This provides historical context for current readings.

Key series tracked with percentiles:
- CPI, Fed Funds, 10Y Treasury, 3M Treasury
- PE-5yr, Earnings Yield 5yr
- Real 10Y, Real 3M
- Real Earnings Yield 5yr, Earnings Yield Premium 5yr
- Yield Curve 10Y−3M

---

## Glossary

- **REY**: Real Earnings Yield (5yr) = Earnings Yield (5yr) − CPI
- **EYP**: Earnings Yield Premium (5yr) = Earnings Yield (5yr) − 3M Treasury
- **Real 10Y**: 10Y Treasury − CPI
- **Real 3M**: 3M Treasury − CPI
- **Real M2**: Year-over-year money supply growth, inflation-adjusted
- **Yield Curve**: 10Y Treasury − 3M Treasury (or 10Y − 2Y in some contexts)
- **CAPE / Shiller P/E**: Cyclically Adjusted P/E using 10-year rolling earnings
- **PE-5yr**: P/E using 5-year rolling average earnings
- **Hysteresis**: Different entry/exit thresholds to prevent regime flip-flopping
- **Sticky regime**: A regime that persists until an outlier trigger fires
- **Transmission channel**: Path through which a macro shock affects company outcomes
