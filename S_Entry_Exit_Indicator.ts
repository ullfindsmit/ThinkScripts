declare upper;

input pivotBars   = 5;
input atrLength   = 14;
input atrBuffer   = 0.25;
input fibTarget   = 1.618;
input showLabels  = yes;
input showStop    = yes;
input showTarget  = yes;

def atr = Average(TrueRange(high, close, low), atrLength);

# Symmetric pivot: pivot bar must be highest/lowest in the full window
# AND strictly exceed the pivotBars bars that follow it (right-side confirmation)
def isPivotHigh = high[pivotBars] == Highest(high, pivotBars * 2 + 1)
                  and high[pivotBars] > Highest(high, pivotBars);
def isPivotLow  = low[pivotBars]  == Lowest(low,  pivotBars * 2 + 1)
                  and low[pivotBars]  < Lowest(low,  pivotBars);

# Track the most recent confirmed pivot of each type (for swing range calculation)
rec lastPivotHigh = if isPivotHigh then high[pivotBars] else lastPivotHigh[1];
rec lastPivotLow  = if isPivotLow  then low[pivotBars]  else lastPivotLow[1];

# Long: pivot low confirmed AND confirmation bar closes above the swing low
# Short: pivot high confirmed AND confirmation bar closes below the swing high
def longSignal  = isPivotLow  and close > low[pivotBars];
def shortSignal = isPivotHigh and close < high[pivotBars];

def swingLow  = low[pivotBars];
def swingHigh = high[pivotBars];

# Swing range = distance from the most recent opposite pivot to the current pivot
# Guard lastPivotHigh/Low > 0 to skip the very first signal before any opposite pivot exists
def longRange  = if longSignal  and lastPivotHigh > 0
                 then AbsValue(lastPivotHigh - swingLow)
                 else 0;
def shortRange = if shortSignal and lastPivotLow  > 0
                 then AbsValue(swingHigh - lastPivotLow)
                 else 0;

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

rec targetLevel = if longSignal  and longRange  > 0 then close  + longRange  * fibTarget
                  else if shortSignal and shortRange > 0 then close - shortRange * fibTarget
                  else targetLevel[1];

# Step 1: Add arrows at signal bars
plot LongArrow  = longSignal;
LongArrow.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
LongArrow.SetDefaultColor(Color.GREEN);
LongArrow.SetLineWeight(3);

plot ShortArrow = shortSignal;
ShortArrow.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_DOWN);
ShortArrow.SetDefaultColor(Color.RED);
ShortArrow.SetLineWeight(3);

# Step 2: Add horizontal dashed lines
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

# Step 3: Add right-edge price labels and status label
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

# Step 4: Add bar coloring
AssignPriceColor(
    if lastSignal ==  1 then Color.GREEN
    else if lastSignal == -1 then Color.RED
    else Color.GRAY
);
