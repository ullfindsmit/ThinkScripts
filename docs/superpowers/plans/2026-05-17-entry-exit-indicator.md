# S_Entry_Exit_Indicator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a clean ThinkScript reversal indicator for daily stock charts that shows a confirmed swing entry signal with defined entry, stop, and profit target levels.

**Architecture:** Symmetric pivot detection (N bars each side) identifies confirmed swing highs/lows without future-painting. When a pivot confirms and the bar closes in the reversal direction, the script latches entry/stop/target levels as persistent horizontal lines until the next signal. Stop is anchored to the actual swing bar with a small ATR buffer; target is a 1.618 Fibonacci extension of the prior opposite-pivot swing range.

**Tech Stack:** ThinkScript (thinkorswim platform). No build system. Paste into thinkorswim Script Editor to load.

---

### Task 1: Scaffold inputs and ATR

**Files:**
- Create: `S_Entry_Exit_Indicator.ts`

- [ ] **Step 1: Create the file with inputs and ATR**

Write the following to `S_Entry_Exit_Indicator.ts`:

```thinkscript
declare upper;

input pivotBars   = 5;
input atrLength   = 14;
input atrBuffer   = 0.25;
input fibTarget   = 1.618;
input showLabels  = yes;
input showStop    = yes;
input showTarget  = yes;

def atr = Average(TrueRange(high, close, low), atrLength);
```

- [ ] **Step 2: Commit**

```
git add S_Entry_Exit_Indicator.ts
git commit -m "feat: scaffold S_Entry_Exit_Indicator inputs and ATR"
```

---

### Task 2: Pivot detection

**Files:**
- Modify: `S_Entry_Exit_Indicator.ts`

Symmetric pivot detection: the bar `pivotBars` ago must be the highest/lowest in a window of `2 * pivotBars + 1` bars, AND must strictly exceed all bars between it and the current bar (prevents tie-matching the current bar as a false confirmation).

- [ ] **Step 1: Add pivot detection and last-pivot tracking**

Append to `S_Entry_Exit_Indicator.ts`:

```thinkscript
# Symmetric pivot: pivot bar must be highest/lowest in the full window
# AND strictly exceed the pivotBars bars that follow it (right-side confirmation)
def isPivotHigh = high[pivotBars] == Highest(high, pivotBars * 2 + 1)
                  and high[pivotBars] > Highest(high, pivotBars);
def isPivotLow  = low[pivotBars]  == Lowest(low,  pivotBars * 2 + 1)
                  and low[pivotBars]  < Lowest(low,  pivotBars);

# Track the most recent confirmed pivot of each type (for swing range calculation)
rec lastPivotHigh = if isPivotHigh then high[pivotBars] else lastPivotHigh[1];
rec lastPivotLow  = if isPivotLow  then low[pivotBars]  else lastPivotLow[1];
```

- [ ] **Step 2: Visual sanity check in thinkorswim**

Load the script on a daily chart of any liquid stock (e.g. AAPL, SPY). Add temporary debug plots to confirm pivots fire at visible swing points:

```thinkscript
# Temporary — remove after verifying
plot debugHigh = if isPivotHigh then high[pivotBars] else Double.NaN;
debugHigh.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_DOWN);
debugHigh.SetDefaultColor(Color.CYAN);

plot debugLow = if isPivotLow then low[pivotBars] else Double.NaN;
debugLow.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
debugLow.SetDefaultColor(Color.YELLOW);
```

Expected: arrows appear at visible swing highs and lows on the daily chart, offset `pivotBars` bars to the right of the actual swing bar (because the pivot is confirmed N bars later).

- [ ] **Step 3: Remove debug plots**

Delete the two debug plot blocks added in Step 2.

- [ ] **Step 4: Commit**

```
git add S_Entry_Exit_Indicator.ts
git commit -m "feat: add symmetric pivot detection and last-pivot tracking"
```

---

### Task 3: Signal logic and level calculation

**Files:**
- Modify: `S_Entry_Exit_Indicator.ts`

- [ ] **Step 1: Add signal conditions**

Append to `S_Entry_Exit_Indicator.ts`:

```thinkscript
# Long: pivot low confirmed AND confirmation bar closes above the swing low
# Short: pivot high confirmed AND confirmation bar closes below the swing high
def longSignal  = isPivotLow  and close > low[pivotBars];
def shortSignal = isPivotHigh and close < high[pivotBars];

def swingLow  = low[pivotBars];
def swingHigh = high[pivotBars];
```

- [ ] **Step 2: Calculate swing ranges for targets**

Append to `S_Entry_Exit_Indicator.ts`:

```thinkscript
# Swing range = distance from the most recent opposite pivot to the current pivot
# Used to project the 1.618 Fibonacci extension target
# Guard lastPivotHigh/Low > 0 to skip the very first signal before any opposite pivot exists
def longRange  = if longSignal  and lastPivotHigh > 0
                 then AbsValue(lastPivotHigh - swingLow)
                 else 0;
def shortRange = if shortSignal and lastPivotLow  > 0
                 then AbsValue(swingHigh - lastPivotLow)
                 else 0;
```

- [ ] **Step 3: Persist levels across bars**

Append to `S_Entry_Exit_Indicator.ts`:

```thinkscript
# Latch the most recent signal direction and its three levels
# Levels hold until the next signal fires (either direction)
rec lastSignal = if longSignal  then  1
                 else if shortSignal then -1
                 else lastSignal[1];

rec entryLevel = if longSignal or shortSignal then close
                 else entryLevel[1];

rec stopLevel  = if longSignal  then swingLow  - atrBuffer * atr
                 else if shortSignal then swingHigh + atrBuffer * atr
                 else stopLevel[1];

rec targetLevel = if longSignal  and longRange  > 0 then swingLow  + longRange  * fibTarget
                  else if shortSignal and shortRange > 0 then swingHigh - shortRange * fibTarget
                  else targetLevel[1];
```

- [ ] **Step 4: Commit**

```
git add S_Entry_Exit_Indicator.ts
git commit -m "feat: add signal logic and entry/stop/target level calculation"
```

---

### Task 4: Visual output — arrows, lines, labels

**Files:**
- Modify: `S_Entry_Exit_Indicator.ts`

- [ ] **Step 1: Add arrows at signal bars**

Append to `S_Entry_Exit_Indicator.ts`:

```thinkscript
plot LongArrow  = longSignal;
LongArrow.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
LongArrow.SetDefaultColor(Color.GREEN);
LongArrow.SetLineWeight(3);

plot ShortArrow = shortSignal;
ShortArrow.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_DOWN);
ShortArrow.SetDefaultColor(Color.RED);
ShortArrow.SetLineWeight(3);
```

- [ ] **Step 2: Add horizontal dashed lines**

Append to `S_Entry_Exit_Indicator.ts`:

```thinkscript
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
```

- [ ] **Step 3: Add right-edge price labels and status label**

Append to `S_Entry_Exit_Indicator.ts`:

```thinkscript
def rightEdge = BarNumber() == HighestAll(BarNumber());

AddChartBubble(showLabels and rightEdge and active,
    entryLevel,  "Entry "  + entryLevel,  Color.WHITE, yes);
AddChartBubble(showLabels and showStop   and rightEdge and active,
    stopLevel,   "Stop "   + stopLevel,   Color.RED,   no);
AddChartBubble(showLabels and showTarget and rightEdge and active and targetLevel > 0,
    targetLevel, "Target " + targetLevel, Color.GREEN, yes);

AddLabel(yes,
    if lastSignal ==  1 then "LONG SIGNAL"
    else if lastSignal == -1 then "SHORT SIGNAL"
    else "WAITING",
    if lastSignal ==  1 then Color.GREEN
    else if lastSignal == -1 then Color.RED
    else Color.GRAY);
```

- [ ] **Step 4: Add bar coloring**

Append to `S_Entry_Exit_Indicator.ts`:

```thinkscript
AssignPriceColor(
    if lastSignal ==  1 then Color.GREEN
    else if lastSignal == -1 then Color.RED
    else Color.GRAY
);
```

- [ ] **Step 5: Commit**

```
git add S_Entry_Exit_Indicator.ts
git commit -m "feat: add arrows, dashed level lines, labels, and bar coloring"
```

---

### Task 5: Visual verification in thinkorswim

**Files:** none — verification only

Load the complete `S_Entry_Exit_Indicator.ts` on a daily chart of a liquid individual stock with at least 1 year of history. Verify each item:

- [ ] Green up arrows appear at confirmed swing lows (offset `pivotBars` bars right of the actual low bar)
- [ ] Red down arrows appear at confirmed swing highs (same offset)
- [ ] Three dashed lines appear after each signal — white (entry), red (stop), green (target)
- [ ] Lines update when a new signal fires (prior lines replaced)
- [ ] Stop line is *below* entry on longs, *above* entry on shorts
- [ ] Target line is further from entry than stop (positive R:R — target distance > stop distance)
- [ ] Right-edge bubbles show correct prices for entry, stop, target
- [ ] Status label shows "LONG SIGNAL", "SHORT SIGNAL", or "WAITING" correctly
- [ ] Bar colors: green after a long signal, red after a short signal
- [ ] Toggle `showStop = no` — stop line and label disappear
- [ ] Toggle `showTarget = no` — target line and label disappear
- [ ] Toggle `showLabels = no` — all bubbles disappear
- [ ] Increase `pivotBars` to 10 — fewer, wider signals; arrows shift further right of swing bars
- [ ] Decrease `pivotBars` to 3 — more signals on minor swings

- [ ] **Commit after verification passes**

```
git add S_Entry_Exit_Indicator.ts
git commit -m "feat: S_Entry_Exit_Indicator complete and visually verified"
```

---

### Task 6: Update memory and CLAUDE.md

**Files:**
- Modify: `.claude/memory/MEMORY.md`
- Create: `.claude/memory/session_2026-05-17b.md`

- [ ] **Step 1: Create session memory entry**

Write `.claude/memory/session_2026-05-17b.md`:

```markdown
---
name: session-2026-05-17b
description: Built S_Entry_Exit_Indicator.ts — daily swing reversal indicator with entry/stop/target
metadata:
  type: project
---

**Session date:** 2026-05-17

**What was done:**
- Critiqued ankit_Reversal_Indicator.ts (layered, mostly off-by-default, timing bugs)
- Designed and built S_Entry_Exit_Indicator.ts from scratch as a clean replacement
- New file uses symmetric pivot detection, no EMA ribbon, swing-based stops, 1.618 fib targets

**Key design decisions:**
- Pivot detection: `high[pivotBars] == Highest(high, 2*pivotBars+1) AND high[pivotBars] > Highest(high, pivotBars)` — the second condition prevents tie-matching the current bar
- Entry = close of confirmation bar (pivotBars bars after the actual swing bar)
- Stop = swing bar price ± ATR(14) × 0.25 buffer
- Target = swing low/high ± (prior opposite pivot distance × 1.618)
- Levels persist via `rec` variables until next signal fires
- `targetLevel` guard (`> 0`) prevents a target line showing before any opposite pivot has been seen
```

- [ ] **Step 2: Add to MEMORY.md index**

Append to `.claude/memory/MEMORY.md`:

```
- [2026-05-17b](session_2026-05-17b.md) — Built S_Entry_Exit_Indicator: daily reversal with entry/stop/target
```

- [ ] **Step 3: Commit**

```
git add .claude/memory/
git commit -m "docs: add session memory for S_Entry_Exit_Indicator build"
```
