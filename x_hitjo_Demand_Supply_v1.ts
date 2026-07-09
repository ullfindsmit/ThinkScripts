input zoneAggregationPeriod = AggregationPeriod.FOUR_HOURS;
input pivotLeftBars = 10;
input pivotRightBars = 10;
input atrLength = 14;
input zoneAtrMultiplier = 1.0;
input showClouds = yes;
input showLabels = yes;
input showBubbles = yes;
input enableAlerts = yes;

def htfHigh = high(period = zoneAggregationPeriod);
def htfLow = low(period = zoneAggregationPeriod);
def htfClose = close(period = zoneAggregationPeriod);

def htfATR = Average(TrueRange(htfHigh, htfClose, htfLow), atrLength);
def pivotWindow = pivotLeftBars + pivotRightBars + 1;

def confirmedSwingHigh =
    htfHigh[pivotRightBars] == Highest(htfHigh, pivotWindow);

def confirmedSwingLow =
    htfLow[pivotRightBars] == Lowest(htfLow, pivotWindow);

def newSupplyTop = htfHigh[pivotRightBars];
def newSupplyBottom = newSupplyTop - (htfATR[pivotRightBars] * zoneAtrMultiplier);

def newDemandBottom = htfLow[pivotRightBars];
def newDemandTop = newDemandBottom + (htfATR[pivotRightBars] * zoneAtrMultiplier);

rec currentSupplyTop =
    if BarNumber() == 1 then Double.NaN
    else if confirmedSwingHigh then newSupplyTop
    else currentSupplyTop[1];

rec currentSupplyBottom =
    if BarNumber() == 1 then Double.NaN
    else if confirmedSwingHigh then newSupplyBottom
    else currentSupplyBottom[1];

rec currentDemandBottom =
    if BarNumber() == 1 then Double.NaN
    else if confirmedSwingLow then newDemandBottom
    else currentDemandBottom[1];

rec currentDemandTop =
    if BarNumber() == 1 then Double.NaN
    else if confirmedSwingLow then newDemandTop
    else currentDemandTop[1];

plot SupplyTop = currentSupplyTop;
plot SupplyBottom = currentSupplyBottom;
plot DemandTop = currentDemandTop;
plot DemandBottom = currentDemandBottom;

SupplyTop.SetDefaultColor(Color.RED);
SupplyTop.SetLineWeight(2);
SupplyTop.SetPaintingStrategy(PaintingStrategy.HORIZONTAL);

SupplyBottom.SetDefaultColor(Color.RED);
SupplyBottom.SetStyle(Curve.SHORT_DASH);
SupplyBottom.SetPaintingStrategy(PaintingStrategy.HORIZONTAL);

DemandTop.SetDefaultColor(Color.GREEN);
DemandTop.SetStyle(Curve.SHORT_DASH);
DemandTop.SetPaintingStrategy(PaintingStrategy.HORIZONTAL);

DemandBottom.SetDefaultColor(Color.GREEN);
DemandBottom.SetLineWeight(2);
DemandBottom.SetPaintingStrategy(PaintingStrategy.HORIZONTAL);

AddCloud(
    if showClouds then SupplyTop else Double.NaN,
    if showClouds then SupplyBottom else Double.NaN,
    Color.DARK_RED,
    Color.DARK_RED
);

AddCloud(
    if showClouds then DemandTop else Double.NaN,
    if showClouds then DemandBottom else Double.NaN,
    Color.DARK_GREEN,
    Color.DARK_GREEN
);

def hasSupplyZone = !IsNaN(currentSupplyTop) and !IsNaN(currentSupplyBottom);
def hasDemandZone = !IsNaN(currentDemandTop) and !IsNaN(currentDemandBottom);

def insideSupply =
    hasSupplyZone and close <= currentSupplyTop and close >= currentSupplyBottom;

def insideDemand =
    hasDemandZone and close >= currentDemandBottom and close <= currentDemandTop;

def enterSupply = insideSupply and !insideSupply[1];
def enterDemand = insideDemand and !insideDemand[1];

AddLabel(
    showLabels and hasSupplyZone,
    "SUPPLY " + AsPrice(currentSupplyBottom) + " - " + AsPrice(currentSupplyTop),
    Color.RED
);

AddLabel(
    showLabels and hasDemandZone,
    "DEMAND " + AsPrice(currentDemandBottom) + " - " + AsPrice(currentDemandTop),
    Color.GREEN
);

AddChartBubble(
    showBubbles and enterSupply,
    high,
    "SUPPLY",
    Color.RED,
    yes
);

AddChartBubble(
    showBubbles and enterDemand,
    low,
    "DEMAND",
    Color.GREEN,
    no
);

Alert(
    enableAlerts and enterSupply,
    "Price entering SUPPLY zone",
    Alert.BAR,
    Sound.Ding
);

Alert(
    enableAlerts and enterDemand,
    "Price entering DEMAND zone",
    Alert.BAR,
    Sound.Ding
);
