declare upper;

input pivotBars   = 5;
input atrLength   = 14;
input atrBuffer   = 0.25;
input fibTarget   = 1.618;
input showLabels  = yes;
input showStop    = yes;
input showTarget  = yes;

def atr = Average(TrueRange(high, close, low), atrLength);
