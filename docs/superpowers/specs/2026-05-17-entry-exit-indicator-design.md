# Design: S_Entry_Exit_Indicator.ts

**Date:** 2026-05-17
**Platform:** thinkorswim (ThinkScript)
**Target timeframe:** Daily charts, individual stocks
**Purpose:** Identify swing reversal entry points with defined stop loss and profit target levels

---

## Goal

A clean, standalone reversal indicator for daily stock charts. For every confirmed swing reversal it shows exactly three levels: where to enter, where to exit if wrong (stop), and where to take profit (target). No ambiguity, no layers that contradict each other.

---

## Signal Logic

Uses ThinkScript's `ZigZagHighLow()` to identify confirmed swing pivots via a symmetric bar lookback.

**Long signal fires when:**
- A new swing low pivot is confirmed (price has bounced `pivotBars` bars off the low)
- The signal bar closes *above* the ZigZag low (confirms a bullish close, not still falling)

**Short signal fires when:**
- A new swing high pivot is confirmed
- The signal bar closes *below* the ZigZag high (confirms a bearish close, not still rising)

One signal per confirmed pivot. Does not re-fire while the same swing point remains active.

**Timing note:** ZigZag confirmation requires `pivotBars` bars to pass after the actual swing bar before the pivot is confirmed. The signal therefore fires `pivotBars` bars after the swing low/high occurs — this is intentional and avoids future-painting. Entry is at the close of the *confirmation* bar, not the swing bar itself. Stop is anchored to the actual swing bar's price.

---

## Entry, Stop, Target Calculation

| Level | Long | Short |
|-------|------|-------|
| **Entry** | Close of the signal bar | Close of the signal bar |
| **Stop** | Swing low − (ATR(14) × 0.25) | Swing high + (ATR(14) × 0.25) |
| **Target** | Entry + (prior swing range × 1.618) | Entry − (prior swing range × 1.618) |

**Prior swing range** = absolute distance between the two most recent confirmed ZigZag pivots. This is the measured move that the 1.618 Fibonacci extension projects from.

The ATR buffer on the stop provides a small cushion beyond the exact swing point to avoid being stopped out by normal spread/wick noise.

---

## Visual Output

- **Arrow** at the signal bar: up arrow for long, down arrow for short
- **Three horizontal dashed lines** extending forward from the signal bar:
  - Entry — white
  - Stop — red
  - Target — green
- **Labels** on the right edge of each line showing the price
- **Bar coloring**: green bars while a long signal is active, red while short is active, gray otherwise

Lines persist until a new signal in either direction fires (replacing the prior set).

---

## Inputs

| Input | Default | Description |
|-------|---------|-------------|
| `pivotBars` | 5 | Bars left and right required to confirm a swing point |
| `atrLength` | 14 | ATR period used for stop buffer |
| `atrBuffer` | 0.25 | ATR multiple added beyond the swing point for stop cushion |
| `fibTarget` | 1.618 | Fibonacci extension ratio for profit target |
| `showLabels` | yes | Show price labels on entry/stop/target lines |
| `showStop` | yes | Show stop loss line |
| `showTarget` | yes | Show profit target line |

---

## Intentional Exclusions

- **No EMA ribbon** — trend-following EMAs add lag and are wrong tool for identifying structural reversals
- **No Fibonacci retracement grid** — entry/stop/target already define all actionable levels
- **No volume filter** — volume significance varies too widely across individual stocks to be a reliable universal filter
- **No commented-out dead code** — clean file only

---

## File

`S_Entry_Exit_Indicator.ts` in the repo root alongside other ThinkScript files.
