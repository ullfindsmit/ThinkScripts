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

def bullishCandle = close[pivotBars] > open[pivotBars] and close[pivotBars] >= low[pivotBars] + (high[pivotBars] - low[pivotBars]) * 0.70;
def bearishCandle = close[pivotBars] < open[pivotBars] and close[pivotBars] <= low[pivotBars] + (high[pivotBars] - low[pivotBars]) * 0.30;

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
