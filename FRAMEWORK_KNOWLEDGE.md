# Macro Framework Knowledge Base

This document consolidates the entire macro analysis framework used in this application. It serves as the knowledge context for the AI chat assistant.

---

## 1. PHILOSOPHY & PURPOSE

This is a systematic macro-equity analysis framework designed to:
- Define market regimes based on inflation, growth, and monetary policy
- Detect structural signals that drive asset allocation
- Understand cycles (12-year, 80-year, debt, credit, business)
- Map how macro shocks transmit into company-level outcomes
- Provide actionable guidance on where to look for opportunities

The framework synthesizes approaches from three macro investing paradigms:
- **Bridgewater** — Historical macro study (debt cycles, policy responses, structural forces)
- **RenCap** — Structured market regimes (growth/inflation classification)
- **Duquesne** — Asymmetric macro bets (inflection points, concentrated positions)

The result is the **OS Paradigm**: Signal → Swing → Story.

---

## 2. CORE METRICS

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

### Date Convention
All monthly data uses **month-end dates** (e.g., 2025-01-31 for January 2025, not 2025-01-01). FRED data arrives as first-of-month and is converted to end-of-month during preprocessing. Daily data (equities, bonds) is averaged into monthly values using month-end dates. This ensures consistent alignment across all series for regime calculations and percentile analysis.

### Data Sources & Providers

**Yahoo Finance** (via yfinance Python library):
- Equity indexes: S&P 500 (^GSPC), NASDAQ (^IXIC), Dow Jones (^DJI), Russell 2000 (^RUT), FTSE 100, DAX, Nikkei 225, Hang Seng, S&P/TSX, BIST 100, MERVAL
- Bond yields: 10Y Treasury (^TNX), 5Y Treasury (^FVX), 3M Treasury (^IRX), 30Y Treasury (^TYX), 2Y Treasury
- Commodities: Gold (GC=F), Crude Oil (CL=F), Silver (SI=F)
- FX: EUR/USD, GBP/USD, USD/JPY, USD/TRY, USD/ARS, USD/CAD
- Crypto: Bitcoin (BTC-USD), Ethereum (ETH-USD)
- Volatility: VIX

**FRED (Federal Reserve Economic Data)** — manually downloaded CSVs from fred.stlouisfed.org:
- CPI: CPIAUCSL (Consumer Price Index, nominal level → converted to YoY % change)
- Fed Funds Rate: FEDFUNDS
- Money Supply: M1SL (M1), M2SL (M2)
- GDP, PCE (Personal Consumption), DPI (Disposable Personal Income)
- Debt: GFDEBTN (Total Public Debt), GFDEGDQ188S (Debt % GDP), CMDEBT (Household Debt), BCNSDODNS (Corporate Debt), FYGFD (Gross Federal Debt)
- Fiscal: FYFSD (Federal Surplus/Deficit), FYFSGDA188S (Deficit % GDP), W006RC1Q027SBEA (Tax Receipts), A091RC1Q027SBEA (Interest Payments)
- Foreign: FDHBFIN (Federal Debt Held by Foreign Investors)
- Financial: MMMFFAQ027S (Money Market Funds), BOGZ1LM654090000Q (Mutual Fund Assets), BOGZ1FL594090005Q (Pension Fund Assets), BOGZ1FL153064486Q (Corporate Equities % of Assets)

**Robert Shiller's Data**:
- Shiller P/E (CAPE) — Cyclically Adjusted P/E using 10-year rolling earnings

**Multpl.com / GuruFocus / YCharts**:
- S&P 500 EPS (Earnings Per Share, trailing 12 months and historical)

### Derived Series (auto-calculated from source data)
- Real-10Y = TNX-Monthly − CPI
- Real-3M = IRX-Monthly − CPI
- Real-Earnings-Yield-5yr = Earnings Yield (5yr) − CPI
- Earnings-Yield-Premium-5yr = Earnings Yield (5yr) − IRX-Monthly
- Yield-Curve-10Y-3M = TNX-Monthly − IRX-Monthly
- PE-5yr = SP500-Price / SP500-EPS-5yr
- Earnings-Yield-5yr = (1 / PE-5yr) × 100
- CPI YoY = Year-over-year % change from CPIAUCSL
- M1-YoY, M2-YoY = Year-over-year % change from M1SL, M2SL
- Real-M2-YoY = M2 YoY − CPI YoY
- Monthly bond yields (TNX-Monthly, IRX-Monthly) = Monthly averages of daily yields, stored at month-end dates

### Database
All data is stored in a SQLite database (`data/macro-data.db`) with tables:
- `time_series` — all raw and derived time series data
- `percentile_analysis` — expanding-window percentile ranks for each series
- `series_metadata` — display names, descriptions, units
- `sp500_constituents` — current S&P 500 members
- `sp500_changes` — historical additions/removals
- `regime_timeline` — persistent regime state machine history

### Asset Classes in Database
- `economic` — CPI, Fed Funds, M1, M2, GDP, debt, fiscal data
- `bonds` — Treasury yields (daily and monthly averages)
- `equities` — Stock indexes (daily)
- `valuations` — Shiller-PE, PE-5yr, Earnings Yield, SP500-Price, SP500-EPS, P/S ratios
- `derived` — Real yields, yield curves, earnings yield premium, real earnings yield
- `commodities` — Gold, Oil, Silver
- `fx` — Currency pairs
- `volatility` — VIX
- `crypto` — Bitcoin, Ethereum

### PE-5yr vs Shiller CAPE
- PE-5yr uses 5-year rolling average earnings (more responsive, more current data)
- Shiller CAPE uses 10-year rolling average (smoother but lags)
- Both currently show extreme valuations (97-98th percentile)

---

## 3. MARKET SIGNALS (Hierarchical Priority System)

Signals are evaluated in priority order. The highest-priority active signal determines the market environment.

### Risk-Off / Defensive Signals

**Signal 1: System Stress** (Highest Priority)
- Trigger: Real 10Y < −0.5%
- Meaning: Financial system unanchored; bonds fail to preserve purchasing power
- Rotation: Gold / Real Assets
- Historical: 1970s stagflation, 2021-2022 inflation surge

**Signal 2: Negative Real Earnings Yield** (Multi-Level)
- Level 1 — Warning: Real EY < +0.5% → Reduce equity aggressiveness
- Level 2 — Sell Zone: Real EY < −1% → SELL / underweight equities
- Level 3 — Value Breakdown: Real EY < −2% → EXIT equities aggressively
- Sub-rotation: If Real 10Y > 0% → Bonds; If Real 10Y ≤ 0% → Gold/Real Assets

**Signal 3: Equity Danger**
- Trigger: EYP < −1% AND Yield Curve < 0%
- Prerequisites: Real 10Y ≥ 0%, Real EY ≥ 0%
- Meaning: Expensive equities + inverted curve = broken liquidity transmission
- Sub-rotation: If Real 10Y > 0% → Bonds; If Real 10Y ≤ 0% → Gold/Real Assets
- Historical: 1969, 1973, 1979, 2000, 2007, 2023

### Risk-On / Constructive Signals

**Signal 4: Growth Signal**
- Trigger: EYP < −1% AND Yield Curve > 0%
- Prerequisites: Real 10Y ≥ 0%, Real EY ≥ 0%
- Meaning: Positive yield curve enables financing of duration; growth compensates for weak carry
- Rotation: Growth equities / long-duration equities
- Note: NOT a bond-favored signal despite negative EYP
- Historical: 1994-1999 (tech boom), 2017-2018 (FAANG dominance)

**Signal 5: Equity Value Window**
- Good Value: Real EY ≥ +3.0% → BUY equities (broad exposure)
- Extreme Value: Real EY ≥ +5.0% → STRONG BUY (rare, crisis-level opportunity)
- This is a permission signal, not a timing signal
- Historical: 2009 (post-GFC), 1982 (end of stagflation), 2020 March (COVID)

**Signal 6: Normal**
- Trigger: No stress signals active (Real 10Y ≥ 0%, Real EY ≥ 0%, EYP ≥ −1% or no fork, Real EY ≤ +3%)
- Meaning: Financial system functioning normally
- Rotation: Balanced portfolio, standard asset allocation

---

## 4. REGIME MODEL (Hierarchical Detection)

Regimes are evaluated in priority order:

### 4a. System Stress Regime
- Trigger: Real 10Y < 0%
- All financial assets lose their anchor
- Rotation: Gold / Real Assets

### 4b. Equities Adverse Regime
- Trigger: Real EY < 0% AND Real 10Y ≥ 0%
- Equities structurally broken, cannot clear inflation
- Rotation: Bonds (if Real 10Y > 0%) or Gold (if Real 10Y ≤ 0%)

### 4c. Growth vs Equity Danger Fork
Prerequisites: Real 10Y ≥ 0%, Real EY ≥ 0%, EYP < −1%

- **Growth Regime**: EYP < −1% AND Yield Curve > 0% → Growth Equities
- **Equity Danger**: EYP < −1% AND Yield Curve < 0% → Bonds or Gold

### 4d. Normal Regime
- All metrics healthy → Balanced allocation

### Decision Tree
```
Real 10Y < 0%? → YES → System Stress → Gold/Real Assets
                → NO  → Real EY < 0%? → YES → Equities Adverse
                                        → NO  → EYP < −1%? → YES → Yield Curve > 0%? → Growth
                                                                                        → Equity Danger
                                                             → NO  → Normal
```

---

## 5. REGIME STATE MACHINE (Persistent Trigger System)

Unlike the hierarchical model above, the state machine implements sticky regimes that only change on outlier triggers (not monthly recalculation).

### 9 Regime Families

| Regime | Entry Trigger | Exit Trigger | Key Metric |
|--------|--------------|--------------|------------|
| Deep Value | REY ≥ 6% | REY < 4% | REY |
| Broad Growth | REY ≥ 4% | REY < 1% | REY |
| Fragile | REY ≤ 0% AND Real 10Y ≤ 0% AND Real M2 ≤ 10% | Real 10Y ≥ 1% | Multi |
| Contraction | REY ≤ 0% AND EYP ≤ 0% AND Real 10Y ≤ 0% | REY ≥ 2% | Multi |
| Long Duration | EYP ≤ 0% AND Real 10Y ≥ 1% | EYP ≥ 0% OR EYP ≤ −2.5% | EYP |
| Overvaluation | EYP ≤ −2.5% | EYP ≥ 0% | EYP |
| Crisis | Real 10Y ≤ −1% AND Real M2 ≤ 5% | Real 10Y ≥ 0.5% OR Real M2 ≥ 7% | Multi |
| Bond Stress | Real 10Y ≤ −0.5% AND Real 3M ≤ −1% | Real 10Y ≥ 0.25% | Multi |
| Liquidity Shock | Real M2 ≥ 10% | Real M2 ≤ 8% | Real M2 |

**Precedence**: Liquidity Shock > Crisis > Bond Stress > Contraction > Overvaluation > Fragile > Deep Value > Broad Growth > Long Duration

### Key Design Principles
- Regimes are **sticky** — they persist through normal fluctuations
- Changes only on **outlier triggers** (decisive conditions)
- **Hysteresis** — different entry/exit thresholds prevent flip-flopping
- **Path-dependent** — considers prior regime (transition map restricts illogical jumps)
- Each transition has a clear **trigger reason** for interpretability

### Historical Timeline (1960-2026)
| Regime | Months |
|--------|--------|
| Normal | 265 |
| Growth | 230 |
| Long Duration | 170 |
| Mania | 58 |
| Crisis | 53 |
| Liquidity Shock | 17 |

---

## 6. LIQUIDITY CLASSIFICATION SYSTEM

5-band centered scoring (−2 to +2) based on four variables:

### Scoring Bands

**Real 3M**: < −1% = +2, −1% to 0% = +1, 0% to 1.5% = 0, 1.5% to 3% = −1, > 3% = −2
**Real 10Y**: < 0% = +2, 0% to 1% = +1, 1% to 2.5% = 0, 2.5% to 4% = −1, > 4% = −2
**Yield Curve**: > 1.75% = +2, 0.75% to 1.75% = +1, 0.25% to 0.75% = 0, −0.25% to 0.25% = −1, < −0.25% = −2
**Real M2**: > 5% = +2, 1% to 5% = +1, −1% to 1% = 0, −5% to −1% = −1, < −5% = −2

### Total Score → Liquidity Regime
- ≥ 5 (with Real M2 ≥ 5%) = Highly Expansionary
- 2 to 5 = Expansionary
- −1 to 2 = Neutral
- −4 to −1 = Contractive
- < −4 = Highly Contractive

### Valuation Scoring
**EYP**: > 4% = +2, 2% to 4% = +1, 0% to 2% = 0, −2% to 0% = −1, < −2% = −2
**Real EY**: > 6% = +2, 4% to 6% = +1, 2% to 4% = 0, 0% to 2% = −1, < 0% = −2
**CPI**: < 0% = +2, 0% to 2% = +1, 2% to 3% = 0, 3% to 5% = −1, > 5% = −2

---

## 7. FLOW/TREND ANALYSIS SYSTEM

Four-dimensional trend classification:

### Direction (200MA Slope — Descriptive)
- Strong Uptrend (slope > 0.1), Uptrend (0.03–0.1), Neutral (−0.02–0.03), Downtrend (−0.1 to −0.02), Strong Downtrend (< −0.1)

### Stage (Streak Duration — Trend Age)
- Early (0–50 days), Established (50–150), Mature (150–250), Late (250+)

### Pressure (Divergence from 200MA)
- Low (0–5%), Mid (5–10%), High (10–20%), Extreme (20%+)

### Risk (Stage + Pressure + Side Matrix)
- Continuation: Early/Established + Low/Mid + Upside
- Pullback: Early/Established + High/Extreme
- Distribution: Mature + any pressure
- Rollover: Late + Neutral
- Breakdown: Late + Downside
- Mania: Established/Mature + Extreme + Upside
- Capitulation: Early/Established + Extreme + Downside

---

## 8. THE O3 FRAMEWORK (Three Laws of Market Behavior)

### Law 1: O1 — Signal (The Obvious)
Four criteria for a valid structural signal:
1. **Novelty** — Outside recent cycle memory (5–15 years); if common, already priced
2. **Observability** — Measurable, verifiable (hard data, policy action, market repricing)
3. **Persistence** — Likely persists 12–36 months (regime signal, not headline)
4. **Capital Gravity** — Forces money to move (budgets, capex, risk premia, flows)

O1 is expressed as: Market pain (spreads, yields, drawdowns) and/or Policy action (laws, tariffs, sanctions)

### Law 2: O2 — Swing (The Opposite)
Three criteria for regime inversion:
1. **Direction Flip** — Inverts prior cycle's winning logic
2. **Constraint Reversal** — Binding constraint changes (e.g., liquidity → scarcity)
3. **Relative Rotation** — Opposite factor baskets outperform for sustained window

Examples: ZIRP → positive real rates, Globalization → fragmentation, Growth-at-any-price → profitability

### Law 3: O3 — Story (The Outlier)
Four criteria for new paradigm:
1. **New Capability** — Reduces foundational cost or creates new capability
2. **Institutional Adoption** — Governments/enterprises adopt it
3. **Value Chain Rewrite** — Re-maps who captures margin
4. **Irreversibility** (optional) — Hard to go back

Examples: China joins WTO, QE/ZIRP era, LLMs (marginal cost of cognition collapses), Major security reset

---

## 9. TWO-AXIS REGIME FRAMEWORK (Matrix System)

### Input Layer (8 Constraint Matrices)
Each matrix classifies a metric into 3 levels × 3 trends (falling/stable/rising):

1. **Inflation** (CPI): Low < 3%, Mid 3–6%, High > 6%
2. **Bond Yield Nominal** (10Y): Low < 2%, Mid 2–5%, High > 5%
3. **Real Yield** (10Y − CPI): Low < 0%, Mid 0–2%, High > 2%
4. **Fed Funds**: Low < 2%, Mid 2–4%, High > 4%
5. **Yield Curve** (10Y − 2Y): Inverted < −0.5%, Flat −0.5 to +0.5%, Steep > +0.5%
6. **Equity Valuation** (Shiller P/E): Cheap < 15x, Fair 15–20x, Expensive > 20x
7. **Earnings Yield Premium** (E/P − 3M): Negative < 0%, Neutral 0–2%, Positive > 2%
8. **Real Earnings Yield** (E/P − CPI): Negative < 0%, Low 0–3%, Positive > 3%

### Output Layer (Actual Prices)
- Equity Indexes (S&P 500, MSCI World)
- Bond Prices (UST total return)
- Credit ETFs (HYG, LQD)
- FX & Commodities

Key insight: Bond yields are to bonds what P/E is to equities. Bond prices are the actual asset.

---

## 10. TRANSMISSION ENGINE (6 Channels)

How macro shocks propagate into company-level outcomes:

### A) Revenue Transmission
- Demand elasticity, pricing power, market access, substitution
- Who gets paid more/less after the shock

### B) Cost Transmission
- Input prices, energy intensity, labor costs, pass-through ability
- Bargaining power determines margin impact

### C) Balance Sheet Transmission
- Discount rate reset, refinancing stress, asset write-downs
- Duration of liabilities matters

### D) Capital & Discount Rate Transmission
- Required return changes even if operations unchanged
- Affects all long-duration assets

### E) FX & Cross-Border Transmission
- Currency competitiveness, translation effects
- Export/import sensitivity

### F) New Industries & Substitution
- Capability shocks (e.g., AI cost collapse)
- Creates new winners, kills old moats

---

## 11. CYCLE THEORIES

### 12-Year Macro Reconfiguration Cycles
Each cycle marks a major regime shift:
- **1948**: Institutional Reconstruction (order rebuilt after collapse)
- **1960**: Institutional Capital & Brand Consolidation (permanence as thesis)
- **1972**: Fiat Regime Price Discovery (monetary freedom meets reality)
- **1984**: Credit Expansion (leverage becomes growth engine)
- **1996**: Digital Infrastructure (information → networked → scalable)
- **2008**: Monetary Intervention Era (liquidity replaces price signals)
- **2020**: Digital Economy (reality goes virtual)

### Chinese Zodiac Market Regime Archetypes
12 archetypal market regimes mapped to zodiac animals. Each represents a distinct phase in the cycle with core theme, behavioral signature, and historical manifestations. Not predictions, but a pattern language for understanding how markets reconfigure across cycles.

### Other Cycles
- **80-Year Cycle**: Long-term generational cycles and major economic shifts
- **Debt Cycle**: Long-term debt accumulation and deleveraging patterns
- **Credit Cycle**: Expansion and contraction of credit availability
- **Business Cycle**: Economic expansion, peak, contraction, and trough phases

---

## 12. CORE THEMES FOR THE NEXT DECADE

1. Equity valuations in 99th percentile
2. Marginal cost of intelligence is 0 (AI)
3. Stable bond market & inflation
4. Rising geopolitical tensions (war, tariffs)

---

## 13. S&P 500 TRACKING SYSTEM

- Current constituents (503 companies) with sector, sub-industry, headquarters, date added
- Historical changes (359 records) — additions/removals with reasons
- Point-in-time reconstruction (view index composition at any historical date)
- Sector rotation analysis, turnover metrics, tenure analysis
- 11 GICS sectors tracked

---

## 14. PERCENTILE ANALYSIS

All metrics are ranked using expanding-window percentiles (each date compared to all prior data from 1960 onwards). This provides historical context for current readings.

Key series tracked with percentiles:
- CPI, Fed Funds, 10Y Treasury, 3M Treasury
- PE-5yr, Earnings Yield 5yr
- Real 10Y, Real 3M
- Real Earnings Yield 5yr, Earnings Yield Premium 5yr
- Yield Curve 10Y−3M

---

## 15. STACKED IMBALANCE (Current Thesis)

The current regime is described as "radically different from prior generations" — a stacked imbalance where multiple structural forces converge simultaneously.

---

## 16. GLOSSARY

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
