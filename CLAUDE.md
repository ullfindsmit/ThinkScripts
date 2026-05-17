# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A collection of ThinkScript studies, indicators, and scans for the **thinkorswim** platform (Charles Schwab). Files use the `.ts` extension — these are **ThinkScript**, not TypeScript.

There is no build system, package manager, or test runner. Scripts are copy-pasted directly into thinkorswim's Script Editor.

## File naming conventions

| Prefix | Origin | Purpose |
|--------|--------|---------|
| `S_MWF_` | Owner's custom scripts | Chart studies, MarketWatch columns, Stock Hacker scans |
| `ankit_` | Third-party developer (Ankit) | Reversal/S&R indicators |
| `TI_` | TOS Indicators (tosindicators.com) | External indicator (Supply Demand Edge) |

## ThinkScript language patterns

- `input` — user-configurable parameter exposed in thinkorswim UI
- `def` — computed value (bar-by-bar, not persistent)
- `rec` — recursive/stateful value that carries forward bar-to-bar
- `plot` — draws a line or signal on the chart
- `AddLabel()` — adds a text label (used in MarketWatch columns)
- `AddChartBubble()` — adds a price-anchored bubble annotation
- `AddCloud()` — fills the area between two plots
- `AssignBackgroundColor()` — colors the MarketWatch cell background
- `Double.NaN` — ThinkScript's way to hide/blank a plot for a given bar
- `CompoundValue(1, expr, seed)` — initializes a recursive value with a seed on bar 1
- `HighestAll()` / `LowestAll()` — looks across the entire chart history

## Architecture: the S_MWF system

These scripts form a coherent trading system around the **Opening Range Breakout (ORB)** methodology:

### Shared ORB calculation pattern
`S_MWF_Opening_Range.ts`, `S_MWF_Breakout.ts`, and `S_MWF_Trading_SCAN_STOCK_HACKER.ts` all independently implement the same opening range logic:
```
rec ORHigh = if GetDay() <> GetDay()[1] then high
             else if inRange then Max(high, ORHigh[1])
             else ORHigh[1];
```
This is by design — ThinkScript studies can't share variables across scripts, so each script that needs OR levels must re-compute them.

### Shared trend stack
`S_MWF_SigStatus.ts` and `S_MWF_Trading_SCAN_STOCK_HACKER.ts` use the same EMA/SMA/VWAP trend filter:
- **fastEMA** = EMA(9), **slowEMA** = EMA(21), **trendSMA** = SMA(50), **vwapLine** = VWAP()
- Bullish: `close > trendSMA AND fastEMA > slowEMA AND close > vwapLine`
- Bearish: inverse of above

### Script roles
| File | Where it loads | Output |
|------|---------------|--------|
| `S_MWF_Opening_Range.ts` | Chart study | OR High/Low lines |
| `S_MWF_Prev_Day_Levels.ts` | Chart study | Prev day H/L/C lines |
| `S_MWF_SupplyDemand_STABLE.ts` | Chart study | Supply/demand zone clouds (ATR-scaled) |
| `S_MWF_SigStatus.ts` | MarketWatch column | CALL / PUT / CHOP label + background color |
| `S_MWF_Breakout.ts` | MarketWatch column | ORB LONG / ORB SHORT / TRAP label |
| `S_MWF_Trading_SCAN_STOCK_HACKER.ts` | Stock Hacker scan | Boolean `scan` plot |
| `TI_SupplyDemandEdgeSTUDY.ts` | Chart study | $TICK / $ADSPD divergence arrows at HOD/LOD |
| `ankit_Reversal_Indicator.ts` | Chart study | ZigZag-based reversal arrows, fib extensions |
| `ankit_SupportResistanceIndicator.ts` | Chart study | Dynamic S/R trendlines from projection pivots |

### Supply/demand zone sizing (`S_MWF_SupplyDemand_STABLE.ts`)
Zones are sized using ATR: `zoneWidth = ATR(14) * zoneAtrMultiplier (default 0.75)`. The pivot detection uses a symmetric left/right bar lookback (`pivotLeftBars` = `pivotRightBars` = 6), computed over a higher aggregation period (default: 4-hour bars).

## Session and time handling
- Regular session defined as `secondsFromTime(0930) > 0 && secondsTillTime(1600) > 0`
- Opening range: first `rangeMinutes` (default 15) minutes after `openTime` (default 0930)
- Day boundary detected via `GetDay() <> GetDay()[1]`

## Memory
Session notes are stored in `.claude/memory/`. Check there for context from prior conversations.
