input openTime = 0930;
input rangeMinutes = 15;
input showMid = yes;

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

plot OpeningRangeHigh = ORHigh;
OpeningRangeHigh.SetDefaultColor(Color.GREEN);
OpeningRangeHigh.SetLineWeight(2);

plot OpeningRangeLow = ORLow;
OpeningRangeLow.SetDefaultColor(Color.RED);
OpeningRangeLow.SetLineWeight(2);

plot MidPoint =
    if showMid then (ORHigh + ORLow) / 2
    else Double.NaN;

MidPoint.SetDefaultColor(Color.YELLOW);
MidPoint.SetStyle(Curve.SHORT_DASH);