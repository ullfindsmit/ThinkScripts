input fastEMALength = 9;
input slowEMALength = 21;
input trendSMALength = 50;

input openTime = 0930;
input rangeMinutes = 15;

def fastEMA = ExpAverage(close, fastEMALength);
def slowEMA = ExpAverage(close, slowEMALength);
def trendSMA = Average(close, trendSMALength);
def vwapLine = VWAP();

# Opening range
def start = SecondsFromTime(openTime) >= 0;
def endRange = SecondsFromTime(openTime + rangeMinutes) <= 0;
def inRange = start and endRange;

rec ORHigh =
    if GetDay() <> GetDay()[1] then high
    else if inRange then Max(high, ORHigh[1])
    else ORHigh[1];

rec ORLow =
    if GetDay() <> GetDay()[1] then low
    else if inRange then Min(low, ORLow[1])
    else ORLow[1];

# Conditions
def bullishTrend =
    close > trendSMA and
    fastEMA > slowEMA and
    close > vwapLine;

def bearishTrend =
    close < trendSMA and
    fastEMA < slowEMA and
    close < vwapLine;

def breakoutLong =
    close > ORHigh and
    volume > Average(volume, 20);

def breakoutShort =
    close < ORLow and
    volume > Average(volume, 20);

def failedBullBreakout =
    high > ORHigh and
    close < ORHigh;

def failedBearBreakdown =
    low < ORLow and
    close > ORLow;

plot scan =
    bullishTrend and breakoutLong
    or bearishTrend and breakoutShort
    or failedBullBreakout
    or failedBearBreakdown;