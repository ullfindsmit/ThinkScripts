input openTime = 0930;
input rangeMinutes = 15;

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

def breakoutLong = close > ORHigh;
def breakoutShort = close < ORLow;

def trapBull =
    high > ORHigh and
    close < ORHigh;

def trapBear =
    low < ORLow and
    close > ORLow;

plot Signal =
    if breakoutLong then 1
    else if breakoutShort then -1
    else 0;

AssignBackgroundColor(
    if trapBull or trapBear then Color.YELLOW
    else if breakoutLong then Color.GREEN
    else if breakoutShort then Color.RED
    else Color.GRAY
);

AddLabel(
    yes,
    if trapBull then "TRAP"
    else if trapBear then "TRAP"
    else if breakoutLong then "ORB LONG"
    else if breakoutShort then "ORB SHORT"
    else "",
    Color.WHITE
);