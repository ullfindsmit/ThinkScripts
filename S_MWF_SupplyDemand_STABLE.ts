input zoneAggregation = AggregationPeriod.FOUR_HOURS;
input pivotLeftBars = 6;
input pivotRightBars = 6;
input atrLength = 14;
input zoneAtrMultiplier = 0.75;
input showLabels = yes;

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
def supplyBottom = supplyTop - (atr * zoneAtrMultiplier);

def demandBottom = LowestAll(latestDemand);
def demandTop = demandBottom + (atr * zoneAtrMultiplier);

plot SupplyTopPlot =
    if !IsNaN(supplyTop) and supplyTop > 0 then supplyTop else Double.NaN;

plot SupplyBottomPlot =
    if !IsNaN(supplyBottom) and supplyBottom > 0 then supplyBottom else Double.NaN;

plot DemandTopPlot =
    if !IsNaN(demandTop) and demandTop > 0 then demandTop else Double.NaN;

plot DemandBottomPlot =
    if !IsNaN(demandBottom) and demandBottom > 0 then demandBottom else Double.NaN;

SupplyTopPlot.SetDefaultColor(Color.RED);
SupplyTopPlot.SetLineWeight(2);

SupplyBottomPlot.SetDefaultColor(Color.RED);
SupplyBottomPlot.SetStyle(Curve.SHORT_DASH);

DemandTopPlot.SetDefaultColor(Color.GREEN);
DemandTopPlot.SetLineWeight(2);

DemandBottomPlot.SetDefaultColor(Color.GREEN);
DemandBottomPlot.SetStyle(Curve.SHORT_DASH);

AddCloud(SupplyTopPlot, SupplyBottomPlot, Color.DARK_RED);
AddCloud(DemandTopPlot, DemandBottomPlot, Color.DARK_GREEN);

AddLabel(showLabels and !IsNaN(supplyTop), "Supply Zone", Color.RED);
AddLabel(showLabels and !IsNaN(demandBottom), "Demand Zone", Color.GREEN);