# Design: S_Entry_Exit_Indicator.ts — v2 High-Conviction Signals

**Date:** 2026-05-17
**Platform:** thinkorswim (ThinkScript)
**Target timeframe:** Daily charts, individual stocks
**Purpose:** Rebuild v1's signal logic with three stacked filters so only dominant, momentum-confirmed reversals generate BUY / SELL SHORT signals — not every pivot

---

## Problem with v1

`pivotBars = 5` is too small for daily charts (fires on every 1-week wiggle). The only entry condition was `close > low[pivotBars]` — after 5 bars of any bounce this is almost always true. Result: too many low-quality signals.

---

## Signal Logic — Three Stacked Filters

A signal only fires when ALL THREE pass:

### Filter 1: Dominant pivot window
`pivotBars` default raised from 5 → **10**. The swing bar must be the highest/lowest point in a 21-bar window (10 left + bar + 10 right), dominating ~4 weeks of daily price action. Uses the same two-clause detection from v1:

```
high[pivotBars] == Highest(high, pivotBars * 2 + 1)
AND high[pivotBars] > Highest(high, pivotBars)
```

### Filter 2: Strong reversal candle
The confirmation bar (current bar, `pivotBars` bars after the actual swing) must show real directional momentum:

- **BUY:** `close > open` (bullish body) AND `close >= low + (high - low) * 0.70` (closes in top 30% of range)
- **SELL SHORT:** `close < open` (bearish body) AND `close <= low + (high - low) * 0.30` (closes in bottom 30% of range)

A small, indecisive, or mixed confirmation candle fails this filter — no signal fires.

### Filter 3: Minimum swing depth
The measured move from the most recent opposite pivot to the current swing must be at least `minSwingATR × ATR(atrLength)`:

```
swingDepthLong  = if lastPivotHigh > 0 then AbsValue(lastPivotHigh - swingLow) else 0
swingDepthShort = if lastPivotLow  > 0 then AbsValue(swingHigh - lastPivotLow) else 0
```

The `lastPivotHigh/Low > 0` guard is **required**: without it, before any opposite pivot is seen, `swingDepth = AbsValue(0 - swingLow)` = the swing price itself — a large spurious number that would incorrectly pass the depth filter.

Default `minSwingATR = 2.0`. Shallow wiggles that technically form a pivot but represent less than 2 ATR of price travel are ignored. ATR-normalized so the filter adapts across different stocks and volatility regimes.

**Important:** `swingDepthLong`/`swingDepthShort` must be computed before the signal conditions (no circular dependency). Signal conditions then reference these values directly.

---

## Entry, Stop, Target (unchanged from v1)

| Level | Long (BUY) | Short (SELL SHORT) |
|-------|-----------|-------------------|
| **Entry** | `close` of confirmation bar | `close` of confirmation bar |
| **Stop** | `swingLow - atrBuffer * atr` | `swingHigh + atrBuffer * atr` |
| **Target** | `entry + swingDepth * fibTarget` | `entry - swingDepth * fibTarget` |

`swingDepthLong`/`swingDepthShort` replace v1's `longRange`/`shortRange` — same calculation with explicit `> 0` guard, now computed before the signal check to avoid circular dependency.

---

## Visual Output

- **BUY bubble** (green, below bar) at signal bar — replaces arrow for clarity
- **SELL SHORT bubble** (red, above bar) at signal bar
- Three dashed horizontal lines from signal bar forward: Entry (white), Stop (red), Target (green)
- Right-edge price bubbles: "Entry \$X", "Stop \$X", "Target \$X"
- Corner status label: "BUY SIGNAL" / "SELL SHORT SIGNAL" / "—"
- Bar coloring: green while long signal active, red while short signal active, gray otherwise

---

## Inputs

| Input | Default | Change from v1 |
|-------|---------|---------------|
| `pivotBars` | **10** | Was 5 |
| `atrLength` | 14 | Unchanged |
| `atrBuffer` | 0.25 | Unchanged |
| `fibTarget` | 1.618 | Unchanged |
| `minSwingATR` | **2.0** | New |
| `showLabels` | yes | Unchanged |
| `showStop` | yes | Unchanged |
| `showTarget` | yes | Unchanged |

---

## Implementation Notes

- Replace `longRange`/`shortRange` with `swingDepthLong`/`swingDepthShort` computed before signal conditions (avoids circular dependency, explicit `> 0` guard required)
- `bullishCandle` and `bearishCandle` are `def` helpers computed each bar
- Signal bubbles use `AddChartBubble` at the signal bar; right-edge labels use `AddChartBubble` at `rightEdge`
- All `rec` persistence logic (lastSignal, entryLevel, stopLevel, targetLevel) unchanged from v1
- The `active = lastSignal != 0` and `targetLevel > 0` guards unchanged

---

## File

Modify existing `S_Entry_Exit_Indicator.ts` in repo root. This is an in-place update — no new file.
