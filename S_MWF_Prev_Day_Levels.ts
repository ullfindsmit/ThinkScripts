input showClose = yes;
input showLabels = yes;

def prevHigh = high(period = AggregationPeriod.DAY)[1];
def prevLow = low(period = AggregationPeriod.DAY)[1];
def prevClose = close(period = AggregationPeriod.DAY)[1];

plot YesterdayHigh = prevHigh;
YesterdayHigh.SetDefaultColor(Color.CYAN);

plot YesterdayLow = prevLow;
YesterdayLow.SetDefaultColor(Color.MAGENTA);

plot YesterdayClose =
    if showClose then prevClose else Double.NaN;

YesterdayClose.SetDefaultColor(Color.GRAY);

AddChartBubble(
    showLabels and BarNumber() == HighestAll(BarNumber()),
    prevHigh,
    "Prev High",
    Color.CYAN,
    yes
);

AddChartBubble(
    showLabels and BarNumber() == HighestAll(BarNumber()),
    prevLow,
    "Prev Low",
    Color.MAGENTA,
    no
);

AddChartBubble(
    showLabels and showClose and BarNumber() == HighestAll(BarNumber()),
    prevClose,
    "Prev Close",
    Color.GRAY,
    yes
);