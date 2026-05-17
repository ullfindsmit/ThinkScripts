# S_Entry_Exit_Indicator v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the v1 single-filter signal logic with three stacked filters (larger pivot window + strong reversal candle + minimum swing depth) so only high-conviction BUY / SELL SHORT signals fire.

**Architecture:** Full rewrite of `S_Entry_Exit_Indicator.ts` — the file is 110 lines so surgical edits are more error-prone than replacing the whole file cleanly. Signal logic changes (`pivotBars`, `minSwingATR`, `bullishCandle`/`bearishCandle`, `swingDepthLong`/`swingDepthShort`) are tightly coupled, so they land in one commit. Visual output changes (arrows → bubbles, label text) land in a second commit.

**Tech Stack:** ThinkScript (thinkorswim platform). No build system. Paste into thinkorswim Script Editor to verify.

---

### Task 1: Rewrite signal logic

**Files:**
- Modify: `S_Entry_Exit_Indicator.ts`

Changes from v1:
- `pivotBars` default: 5 → **10**
- New input: `minSwingATR = 2.0`
- New `def bullishCandle` and `def bearishCandle` helpers (after ATR line)
- `swingLow`/`swingHigh` moved above signal conditions (were below in v1)
- `longRange`/`shortRange` replaced by `swingDepthLong`/`swingDepthShort` — computed **before** signal conditions with explicit `> 0` guard (avoids circular dependency and spurious large numbers before first opposite pivot)
- `longSignal`/`shortSignal` rewritten with all three filters
- `targetLevel` updated to reference `swingDepthLong`/`swingDepthShort`
- Visual output section (lines 58–110) left **unchanged** in this task

- [ ] **Step 1: Replace lines 1–56 of `S_Entry_Exit_Indicator.ts`**

The file currently has 110 lines. Replace only the signal logic section (lines 1–56) with:

```thinkscript
declare upper;

input pivotBars   = 10;
input atrLength   = 14;
input atrBuffer   = 0.25;
input fibTarget   = 1.618;
input minSwingATR = 2.0;
input showLabels  = yes;
input showStop    = yes;
input showTarget  = yes;

def atr = Average(TrueRange(high, close, low), atrLength);

def bullishCandle = close > open and close >= low + (high - low) * 0.70;
def bearishCandle = close < open and close <= low + (high - low) * 0.30;

# Symmetric pivot: pivot bar must be highest/lowest in the full window
# AND strictly exceed the pivotBars bars that follow it (right-side confirmation)
def isPivotHigh = high[pivotBars] == Highest(high, pivotBars * 2 + 1)
                  and high[pivotBars] > Highest(high, pivotBars);
def isPivotLow  = low[pivotBars]  == Lowest(low,  pivotBars * 2 + 1)
                  and low[pivotBars]  < Lowest(low,  pivotBars);

rec lastPivotHigh = if isPivotHigh then high[pivotBars] else lastPivotHigh[1];
rec lastPivotLow  = if isPivotLow  then low[pivotBars]  else lastPivotLow[1];

def swingLow  = low[pivotBars];
def swingHigh = high[pivotBars];

# Swing depth computed before signal to avoid circular dependency.
# Guard > 0 required: without it, before any opposite pivot exists,
# depth = AbsValue(0 - swing) = a spurious large number that passes the filter.
def swingDepthLong  = if lastPivotHigh > 0 then AbsValue(lastPivotHigh - swingLow)  else 0;
def swingDepthShort = if lastPivotLow  > 0 then AbsValue(swingHigh - lastPivotLow)  else 0;

# Three-filter signal: dominant pivot + strong reversal candle + minimum swing depth
def longSignal  = isPivotLow
                  and close > swingLow
                  and bullishCandle
                  and swingDepthLong  >= minSwingATR * atr;

def shortSignal = isPivotHigh
                  and close < swingHigh
                  and bearishCandle
                  and swingDepthShort >= minSwingATR * atr;

rec lastSignal = if longSignal  then  1
                 else if shortSignal then -1
                 else lastSignal[1];

rec entryLevel = if longSignal or shortSignal then close
                 else entryLevel[1];

rec stopLevel  = if longSignal  then swingLow  - atrBuffer * atr
                 else if shortSignal then swingHigh + atrBuffer * atr
                 else stopLevel[1];

rec targetLevel = if longSignal  and swingDepthLong  > 0 then close + swingDepthLong  * fibTarget
                  else if shortSignal and swingDepthShort > 0 then close - swingDepthShort * fibTarget
                  else targetLevel[1];
```

Lines 57–110 (visual output section) remain exactly as they are.

- [ ] **Step 2: Verify the file is coherent**

Read `S_Entry_Exit_Indicator.ts` and confirm:
- File has exactly 9 inputs (pivotBars, atrLength, atrBuffer, fibTarget, minSwingATR, showLabels, showStop, showTarget)
- `bullishCandle` and `bearishCandle` appear before `isPivotHigh`/`isPivotLow`
- `swingDepthLong`/`swingDepthShort` appear before `longSignal`/`shortSignal`
- `longRange` and `shortRange` are **gone** (replaced)
- The old `longSignal = isPivotLow and close > low[pivotBars]` line is **gone**
- `targetLevel` references `swingDepthLong`/`swingDepthShort` (not `longRange`/`shortRange`)
- Visual output section (plot LongArrow, plot ShortArrow, plot EntryLine, etc.) is still intact below

- [ ] **Step 3: Commit**

```
git add S_Entry_Exit_Indicator.ts
git commit -m "feat: v2 signal logic — 3-filter BUY/SELL SHORT (pivotBars=10, candle strength, min swing depth)"
```

---

### Task 2: Rewrite visual output

**Files:**
- Modify: `S_Entry_Exit_Indicator.ts`

Changes from v1:
- Remove `plot LongArrow` / `plot ShortArrow` (4 lines each = 8 lines removed)
- Add two `AddChartBubble` calls for BUY / SELL SHORT at signal bar
- Update `AddLabel` text: "LONG SIGNAL" → "BUY SIGNAL", "SHORT SIGNAL" → "SELL SHORT SIGNAL", "WAITING" → "—"
- Remove stale step comments (`# Step 1:`, `# Step 2:`, etc.)

- [ ] **Step 1: Replace the visual output section**

After Task 1, the file ends with the `rec targetLevel` block. Replace everything **after** that block (from the first `plot LongArrow` line through end of file) with:

```thinkscript
AddChartBubble(longSignal,  low,  "BUY",        Color.GREEN, no);
AddChartBubble(shortSignal, high, "SELL SHORT", Color.RED,   yes);

def active = lastSignal != 0;

plot EntryLine  = if active then entryLevel else Double.NaN;
EntryLine.SetDefaultColor(Color.WHITE);
EntryLine.SetStyle(Curve.SHORT_DASH);
EntryLine.SetLineWeight(2);

plot StopLine   = if showStop   and active then stopLevel   else Double.NaN;
StopLine.SetDefaultColor(Color.RED);
StopLine.SetStyle(Curve.SHORT_DASH);
StopLine.SetLineWeight(2);

plot TargetLine = if showTarget and active and targetLevel > 0 then targetLevel else Double.NaN;
TargetLine.SetDefaultColor(Color.GREEN);
TargetLine.SetStyle(Curve.SHORT_DASH);
TargetLine.SetLineWeight(2);

def rightEdge = BarNumber() == HighestAll(BarNumber());

AddChartBubble(showLabels and rightEdge and active,
    entryLevel,  "Entry "  + entryLevel,  Color.WHITE, yes);
AddChartBubble(showLabels and showStop   and rightEdge and active,
    stopLevel,   "Stop "   + stopLevel,   Color.RED,   no);
AddChartBubble(showLabels and showTarget and rightEdge and active and targetLevel > 0,
    targetLevel, "Target " + targetLevel, Color.GREEN, yes);

AddLabel(yes,
    if lastSignal ==  1 then "BUY SIGNAL"
    else if lastSignal == -1 then "SELL SHORT SIGNAL"
    else "—",
    if lastSignal ==  1 then Color.GREEN
    else if lastSignal == -1 then Color.RED
    else Color.GRAY);

AssignPriceColor(
    if lastSignal ==  1 then Color.GREEN
    else if lastSignal == -1 then Color.RED
    else Color.GRAY
);
```

- [ ] **Step 2: Verify the complete file**

Read `S_Entry_Exit_Indicator.ts` and confirm:
- No `plot LongArrow` or `plot ShortArrow` anywhere in the file
- Two signal `AddChartBubble` calls present (BUY at low, SELL SHORT at high)
- `AddLabel` shows "BUY SIGNAL" / "SELL SHORT SIGNAL" / "—" (not "LONG SIGNAL" / "SHORT SIGNAL" / "WAITING")
- Three dashed plot lines (`EntryLine`, `StopLine`, `TargetLine`) still present
- Three right-edge `AddChartBubble` calls still present
- `AssignPriceColor` still present
- No stale `# Step N:` comments

- [ ] **Step 3: Commit**

```
git add S_Entry_Exit_Indicator.ts
git commit -m "feat: v2 visual output — BUY/SELL SHORT bubbles, updated labels"
```

---

### Task 3: Update session memory

**Files:**
- Modify: `.claude/memory/MEMORY.md`
- Create: `.claude/memory/session_2026-05-17c.md`

- [ ] **Step 1: Create session memory entry**

Write `.claude/memory/session_2026-05-17c.md`:

```markdown
---
name: session-2026-05-17c
description: Rebuilt S_Entry_Exit_Indicator to v2 — three-filter high-conviction BUY/SELL SHORT signals
metadata:
  type: project
---

**Session date:** 2026-05-17

**What happened:**
- v1 was too noisy (pivotBars=5, single filter — fired on every minor wiggle)
- Redesigned to v2 with three stacked filters for high-conviction signals only

**v2 signal filters (ALL three must pass):**
1. Dominant pivot: pivotBars=10 (2-week dominant swing, not 1-week)
2. Strong reversal candle: close > open AND close in top 30% of range (long) / bottom 30% (short)
3. Minimum swing depth: prior swing must be >= 2.0 × ATR(14)

**Key implementation notes:**
- `swingDepthLong`/`swingDepthShort` replace `longRange`/`shortRange` — computed BEFORE signal to avoid circular dependency
- `lastPivotHigh > 0` guard is critical: without it, before first opposite pivot, depth = AbsValue(0 - swing) = spurious large pass
- Signal bubbles replace arrow plots: AddChartBubble at low/"BUY"/GREEN and high/"SELL SHORT"/RED
- Label text: "BUY SIGNAL" / "SELL SHORT SIGNAL" / "—"
```

- [ ] **Step 2: Update MEMORY.md index**

Append to `.claude/memory/MEMORY.md`:

```
- [2026-05-17c](session_2026-05-17c.md) — Rebuilt to v2: three-filter high-conviction BUY/SELL SHORT, replaced arrows with bubbles
```

- [ ] **Step 3: Commit**

```
git add .claude/memory/
git commit -m "docs: add session memory for S_Entry_Exit_Indicator v2"
```
