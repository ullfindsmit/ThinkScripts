declare upper;

#
# ============================================================
# 1-YEAR INSTITUTIONAL FAIR VALUE (ANCHORED VWAP APPROXIMATION)
# ============================================================
#
# WHAT THIS STUDY DOES:
# - Builds a "fair value" line using volume-weighted price
# - Uses last ~252 trading days (≈ 1 year)
# - Acts like a simplified institutional VWAP
#
# HOW INSTITUTIONS THINK ABOUT THIS:
# - Price above = buyers are in profit (bullish regime)
# - Price below = sellers are in control (bearish regime)
# - Price near = equilibrium / fair value zone
#
# WHY THIS WORKS:
# - High-volume prices matter more than low-volume noise
# - Uses HLC3 (average price of each candle)
# - Accumulates price * volume over time
#

input lookbackBars = 252;  # ~1 trading year

def bn = BarNumber();

# Defines the starting point of the 1-year window
def start = HighestAll(bn) - lookbackBars;

# Only calculate values inside the rolling 1-year window
def isActive = bn >= start;

# Volume used only within the lookback window
def vol = if isActive then volume else 0;

# Price-weighted volume (HLC3 is more accurate than close)
def priceVol = if isActive then hlc3 * volume else 0;

#
# CUMULATIVE VOLUME
# Adds up all volume in the lookback window
#
rec cumVol =
    if isActive and !isActive[1] then vol
    else if isActive then cumVol[1] + vol
    else cumVol[1];

#
# CUMULATIVE PRICE * VOLUME
# Adds weighted price contribution over time
#
rec cumPV =
    if isActive and !isActive[1] then priceVol
    else if isActive then cumPV[1] + priceVol
    else cumPV[1];

#
# FINAL FAIR VALUE CALCULATION
# This is essentially a 1-year Anchored VWAP approximation:
#   VWAP = Σ(price * volume) / Σ(volume)
#
plot InstitutionalFairValue = cumPV / cumVol;

InstitutionalFairValue.SetDefaultColor(Color.CYAN);
InstitutionalFairValue.SetLineWeight(3);
InstitutionalFairValue.SetPaintingStrategy(PaintingStrategy.HORIZONTAL);

#
# LABEL FOR QUICK REFERENCE
#
AddLabel(
    yes,
    "1Y Institutional Fair Value (VWAP Approx): " + AsPrice(InstitutionalFairValue),
    Color.CYAN
);

#
# HOW TO USE THIS LEVEL:
# - Above line → bullish regime (institutional support)
# - Below line → bearish regime (institutional resistance)
# - Around line → equilibrium / rotation zone
#
# BEST USED WITH:
# - Supply & demand zones
# - Swing highs/lows
# - Multi-timeframe POCs
#