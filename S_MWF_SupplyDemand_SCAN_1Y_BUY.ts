# Stock Hacker custom filter: 1-year / daily demand (buy) zone.
# A match means the current daily close is inside the demand zone.

input pivotLeftBars = 6;
input pivotRightBars = 6;
input atrLength = 14;
input zoneAtrMultiplier = 0.75;
input lookbackBars = 252;

def h = high(period = AggregationPeriod.DAY);
def l = low(period = AggregationPeriod.DAY);
def c = close(period = AggregationPeriod.DAY);
def atr = Average(TrueRange(h, c, l), atrLength);

def lastBar = HighestAll(BarNumber());
def inLookback = BarNumber() > lastBar - lookbackBars;

def pivotLow =
    l[pivotRightBars] == Lowest(l, pivotLeftBars + pivotRightBars + 1);
def latestDemand =
    if inLookback and pivotLow then l[pivotRightBars] else Double.NaN;

def demandBottom = LowestAll(latestDemand);
def demandTop = demandBottom + (atr * zoneAtrMultiplier);

plot scan =
    !IsNaN(demandBottom) and c >= demandBottom and c <= demandTop;
