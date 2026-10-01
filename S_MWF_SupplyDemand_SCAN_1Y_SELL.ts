# Stock Hacker custom filter: 1-year / daily supply (sell) zone.
# A match means the current daily close is inside the supply zone.

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

def pivotHigh =
    h[pivotRightBars] == Highest(h, pivotLeftBars + pivotRightBars + 1);
def latestSupply =
    if inLookback and pivotHigh then h[pivotRightBars] else Double.NaN;

def supplyTop = HighestAll(latestSupply);
def supplyBottom = supplyTop - (atr * zoneAtrMultiplier);

plot scan =
    !IsNaN(supplyTop) and c >= supplyBottom and c <= supplyTop;
