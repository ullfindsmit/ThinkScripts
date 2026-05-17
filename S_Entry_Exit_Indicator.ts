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
