input fastEMALength = 9;
input slowEMALength = 21;
input trendSMALength = 50;

def fastEMA = ExpAverage(close, fastEMALength);
def slowEMA = ExpAverage(close, slowEMALength);
def trendSMA = Average(close, trendSMALength);
def vwapLine = VWAP();

def bullishTrend =
    close > trendSMA and
    fastEMA > slowEMA and
    close > vwapLine;

def bearishTrend =
    close < trendSMA and
    fastEMA < slowEMA and
    close < vwapLine;

plot Signal =
    if bullishTrend then 1
    else if bearishTrend then -1
    else 0;

AssignBackgroundColor(
    if bullishTrend then Color.GREEN
    else if bearishTrend then Color.RED
    else Color.GRAY
);

AddLabel(
    yes,
    if bullishTrend then "CALL"
    else if bearishTrend then "PUT"
    else "CHOP",
    Color.WHITE
);