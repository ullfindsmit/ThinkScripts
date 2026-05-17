input showClose = yes;

def prevHigh = high(period = AggregationPeriod.DAY)[1];
def prevLow = low(period = AggregationPeriod.DAY)[1];
def prevClose = close(period = AggregationPeriod.DAY)[1];

plot YesterdayHigh = prevHigh;
YesterdayHigh.SetDefaultColor(Color.CYAN);
YesterdayHigh.SetLineWeight(2);

plot YesterdayLow = prevLow;
YesterdayLow.SetDefaultColor(Color.MAGENTA);
YesterdayLow.SetLineWeight(2);

plot YesterdayClose =
    if showClose then prevClose
    else Double.NaN;

YesterdayClose.SetDefaultColor(Color.GRAY);
YesterdayClose.SetStyle(Curve.LONG_DASH);