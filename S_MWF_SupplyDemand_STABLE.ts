input zoneAggregation = AggregationPeriod.FOUR_HOURS;
input pivotLeftBars = 6;
input pivotRightBars = 6;
input atrLength = 14;
input zoneAtrMultiplier = 0.75;
input showLabels = yes;
input showCloud = yes;

def h = high(period = zoneAggregation);
def l = low(period = zoneAggregation);
def c = close(period = zoneAggregation);

def atr = Average(TrueRange(h, c, l), atrLength);

def pivotHigh =
    h[pivotRightBars] == Highest(h, pivotLeftBars + pivotRightBars + 1);

def pivotLow =
    l[pivotRightBars] == Lowest(l, pivotLeftBars + pivotRightBars + 1);

def latestSupply =
    if pivotHigh then h[pivotRightBars] else Double.NaN;

def latestDemand =
    if pivotLow then l[pivotRightBars] else Double.NaN;

def supplyTop = HighestAll(latestSupply);
def supplyBottom =
    if !IsNaN(supplyTop)
    then supplyTop - (atr * zoneAtrMultiplier)
    else Double.NaN;

def demandBottom = LowestAll(latestDemand);
def demandTop =
    if !IsNaN(demandBottom)
    then demandBottom + (atr * zoneAtrMultiplier)
    else Double.NaN;

plot SupplyTopPlot =
    if supplyTop > 0 then supplyTop else Double.NaN;

plot SupplyBottomPlot =
    if supplyBottom > 0 then supplyBottom else Double.NaN;

plot DemandTopPlot =
    if demandTop > 0 then demandTop else Double.NaN;

plot DemandBottomPlot =
    if demandBottom > 0 then demandBottom else Double.NaN;

SupplyTopPlot.SetDefaultColor(Color.RED);
SupplyTopPlot.SetLineWeight(2);

SupplyBottomPlot.SetDefaultColor(Color.RED);
SupplyBottomPlot.SetStyle(Curve.SHORT_DASH);

DemandTopPlot.SetDefaultColor(Color.GREEN);
DemandTopPlot.SetLineWeight(2);

DemandBottomPlot.SetDefaultColor(Color.GREEN);
DemandBottomPlot.SetStyle(Curve.SHORT_DASH);

AddCloud(
    if showCloud then SupplyTopPlot else Double.NaN,
    if showCloud then SupplyBottomPlot else Double.NaN,
    Color.DARK_RED
);

AddCloud(
    if showCloud then DemandTopPlot else Double.NaN,
    if showCloud then DemandBottomPlot else Double.NaN,
    Color.DARK_GREEN
);

def rightEdge = BarNumber() == HighestAll(BarNumber());

AddChartBubble(
    showLabels and rightEdge and !IsNaN(SupplyTopPlot),
    SupplyTopPlot,
    "Supply Top",
    Color.RED,
    yes
);

AddChartBubble(
    showLabels and rightEdge and !IsNaN(SupplyBottomPlot),
    SupplyBottomPlot,
    "Supply Bottom",
    Color.RED,
    no
);

AddChartBubble(
    showLabels and rightEdge and !IsNaN(DemandTopPlot),
    DemandTopPlot,
    "Demand Top",
    Color.GREEN,
    yes
);

AddChartBubble(
    showLabels and rightEdge and !IsNaN(DemandBottomPlot),
    DemandBottomPlot,
    "Demand Bottom",
    Color.GREEN,
    no
);

AddLabel(showLabels and !IsNaN(SupplyTopPlot), "SUPPLY ZONE", Color.RED);
AddLabel(showLabels and !IsNaN(DemandBottomPlot), "DEMAND ZONE", Color.GREEN);