# Stock Hacker custom filter: 3-month / 4-hour supply (sell) zone.
# A match means the current 4-hour close is inside the supply zone.

input pivotLeftBars = 6;
input pivotRightBars = 6;
input atrLength = 14;
input zoneAtrMultiplier = 0.75;
input lookbackBars = 130;

def h = high(period = AggregationPeriod.FOUR_HOURS);
def l = low(period = AggregationPeriod.FOUR_HOURS);
def c = close(period = AggregationPeriod.FOUR_HOURS);
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
