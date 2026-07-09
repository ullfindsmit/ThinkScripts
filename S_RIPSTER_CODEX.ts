# EMA Cloud Trend System Pro
# Professional ThinkOrSwim EMA cloud trend study with confidence scoring,
# pullback tracking, filtered entry arrows, labels, background states, and alerts.

declare upper;

# ==========================================
# INPUTS
# ==========================================
# Master display controls.
input showClouds = yes;
input showArrows = yes;
input showLabels = yes;
input showBackground = no;
input showPullbacks = yes;

# Filter enable controls.
input useVWAPFilter = yes;
input useVolumeFilter = yes;
input useADXFilter = yes;
input useATRFilter = yes;

# Alert enable control.
input useAlerts = yes;

# Indicator settings.
input adxLength = 14;
input adxThreshold = 22;
input atrLength = 14;
input volumeAverageLength = 20;
input volumeMultiplier = 1.25;

# Pullback settings. A pullback touches the selected EMA area, then confirms
# when price breaks back in the direction of the active trend.
input pullbackEMALength = 13;

# ==========================================
# INDICATORS
# ==========================================
# All EMA values are calculated once and reused by clouds, trend logic, scoring,
# pullback logic, and signal filters.
def ema5 = ExpAverage(close, 5);
def ema8 = ExpAverage(close, 8);
def ema9 = ExpAverage(close, 9);
def ema13 = ExpAverage(close, 13);
def ema20 = ExpAverage(close, 20);
def ema21 = ExpAverage(close, 21);
def ema34 = ExpAverage(close, 34);
def ema50 = ExpAverage(close, 50);
def pullbackEMA = ExpAverage(close, pullbackEMALength);

# Core trend/quality indicators.
def adxValue = ADX(adxLength);
def atrValue = ATR(atrLength);
def atrAverage = Average(atrValue, 20);
def atrExpanding = atrValue > atrAverage;
def averageVolume = Average(volume, volumeAverageLength);
def vwapLine = VWAP();

# Cloud colors are brightest for near-term momentum and darker for longer-term
# structure so each channel is easier to distinguish on a busy chart.
DefineGlobalColor("FastBullCloud", CreateColor(0, 255, 90));
DefineGlobalColor("FastBearCloud", CreateColor(255, 70, 70));
DefineGlobalColor("TriggerBullCloud", CreateColor(80, 220, 255));
DefineGlobalColor("TriggerBearCloud", CreateColor(255, 120, 40));
DefineGlobalColor("MidBullCloud", CreateColor(0, 150, 60));
DefineGlobalColor("MidBearCloud", CreateColor(170, 40, 40));
DefineGlobalColor("LongBullCloud", CreateColor(0, 85, 35));
DefineGlobalColor("LongBearCloud", CreateColor(95, 15, 15));

# Slope checks use only prior bars and therefore do not repaint.
def ema5Rising = ema5 > ema5[1];
def ema13Rising = ema13 > ema13[1];
def ema20Rising = ema20 > ema20[1];
def ema50Rising = ema50 > ema50[1];
def ema5Falling = ema5 < ema5[1];
def ema13Falling = ema13 < ema13[1];
def ema20Falling = ema20 < ema20[1];
def ema50Falling = ema50 < ema50[1];

# ==========================================
# TREND ENGINE
# ==========================================
# Cloud-by-cloud alignment.
def cloudBull_5_13 = ema5 > ema13;
def cloudBull_8_9 = ema8 > ema9;
def cloudBull_20_21 = ema20 > ema21;
def cloudBull_34_50 = ema34 > ema50;

def cloudBear_5_13 = ema5 < ema13;
def cloudBear_8_9 = ema8 < ema9;
def cloudBear_20_21 = ema20 < ema21;
def cloudBear_34_50 = ema34 < ema50;

# Full alignment requires every cloud to agree.
def allCloudsBull = cloudBull_5_13 and cloudBull_8_9 and cloudBull_20_21 and cloudBull_34_50;
def allCloudsBear = cloudBear_5_13 and cloudBear_8_9 and cloudBear_20_21 and cloudBear_34_50;

# Strong alignment adds wide-stack ordering and slope confirmation.
def bullStack = ema5 > ema8 and ema8 > ema9 and ema9 > ema13 and ema13 > ema20 and ema20 > ema21 and ema21 > ema34 and ema34 > ema50;
def bearStack = ema5 < ema8 and ema8 < ema9 and ema9 < ema13 and ema13 < ema20 and ema20 < ema21 and ema21 < ema34 and ema34 < ema50;
def bullSlopes = ema5Rising and ema13Rising and ema20Rising and ema50Rising;
def bearSlopes = ema5Falling and ema13Falling and ema20Falling and ema50Falling;

def strongBull = bullStack and bullSlopes and adxValue >= adxThreshold and atrExpanding;
def strongBear = bearStack and bearSlopes and adxValue >= adxThreshold and atrExpanding;
def bullTrend = allCloudsBull and (ema5Rising or ema13Rising or ema20Rising);
def bearTrend = allCloudsBear and (ema5Falling or ema13Falling or ema20Falling);
def neutralTrend = !bullTrend and !bearTrend;

# Direction is held as state so pullback counts reset only on trend changes.
def rawTrendDirection =
    if bullTrend then 1
    else if bearTrend then -1
    else 0;

rec trendDirection = CompoundValue(1, rawTrendDirection, 0);
def trendReversal = trendDirection <> trendDirection[1] and trendDirection <> 0;

# ==========================================
# SCORING
# ==========================================
# Each component contributes to a 0-100 confidence score. Directional filters
# score the currently active trend; neutral bars receive no directional credit.
def alignmentScore =
    if strongBull or strongBear then 40
    else if allCloudsBull or allCloudsBear then 30
    else if bullTrend or bearTrend then 20
    else 0;

def adxScore = if adxValue >= adxThreshold then 20 else 0;

def volumeConfirmed =
    if trendDirection == 1 then close > open and volume > averageVolume * volumeMultiplier
    else if trendDirection == -1 then close < open and volume > averageVolume * volumeMultiplier
    else volume > averageVolume * volumeMultiplier;
def volumeScore = if volumeConfirmed then 10 else 0;

def vwapAligned =
    if trendDirection == 1 then close > vwapLine
    else if trendDirection == -1 then close < vwapLine
    else no;
def vwapScore = if vwapAligned then 10 else 0;

def slopeAligned =
    if trendDirection == 1 then bullSlopes
    else if trendDirection == -1 then bearSlopes
    else no;
def slopeScore = if slopeAligned then 10 else 0;

def atrScore = if atrExpanding then 10 else 0;

def confidenceScore = alignmentScore + adxScore + volumeScore + vwapScore + slopeScore + atrScore;

# EMA spread measures the percent distance between the 5, 20, and 50 EMAs.
def spreadHigh = Max(ema5, Max(ema20, ema50));
def spreadLow = Min(ema5, Min(ema20, ema50));
def emaSpreadPercent = if close != 0 then (spreadHigh - spreadLow) / close * 100 else 0;

# ==========================================
# FILTERS
# ==========================================
# Disabled filters pass automatically so users can isolate specific components.
def adxPass = !useADXFilter or adxValue >= adxThreshold;
def atrPass = !useATRFilter or atrExpanding;
def volumePass = !useVolumeFilter or volume > averageVolume * volumeMultiplier;
def vwapLongPass = !useVWAPFilter or close > vwapLine;
def vwapShortPass = !useVWAPFilter or close < vwapLine;

def longFiltersPass = allCloudsBull and adxPass and atrPass and volumePass and vwapLongPass;
def shortFiltersPass = allCloudsBear and adxPass and atrPass and volumePass and vwapShortPass;

# ==========================================
# PULLBACKS
# ==========================================
# Pullback touches are tracked after a trend exists. Confirmations fire only
# when price breaks out of the pullback in the same trend direction.
def bullPullbackTouch = trendDirection == 1 and low <= pullbackEMA and close >= ema20;
def bearPullbackTouch = trendDirection == -1 and high >= pullbackEMA and close <= ema20;

rec inPullback = CompoundValue(1,
    if trendDirection == 0 or trendDirection <> trendDirection[1] then 0
    else if bullPullbackTouch or bearPullbackTouch then 1
    else if (trendDirection == 1 and close > high[1] and close > ema5) or
            (trendDirection == -1 and close < low[1] and close < ema5) then 0
    else inPullback[1],
    0);

def pullbackBreakout =
    inPullback[1] and
    ((trendDirection == 1 and close > high[1] and close > ema5) or
     (trendDirection == -1 and close < low[1] and close < ema5));

rec pullbackCount = CompoundValue(1,
    if trendDirection == 0 or trendDirection <> trendDirection[1] then 0
    else if pullbackBreakout then pullbackCount[1] + 1
    else pullbackCount[1],
    0);

def pb1 = pullbackBreakout and pullbackCount[1] == 0;
def pb2 = pullbackBreakout and pullbackCount[1] == 1;
def pb3Plus = pullbackBreakout and pullbackCount[1] >= 2;
def pb1Confirmed = pb1;

# ==========================================
# SIGNALS
# ==========================================
# Entry arrows require full alignment, every enabled filter, PB1 confirmation,
# and breakout from the pullback.
def buySignal = longFiltersPass and pb1Confirmed and trendDirection == 1;
def sellSignal = shortFiltersPass and pb1Confirmed and trendDirection == -1;

def trendStrengthIncrease = confidenceScore > confidenceScore[1] and confidenceScore >= 70;
def trendWeakening = confidenceScore < confidenceScore[1] and confidenceScore[1] >= 70;

# ==========================================
# PLOTS
# ==========================================
# Cloud plots are hidden when the master cloud input is off.
plot EMA5Cloud = if showClouds then ema5 else Double.NaN;
plot EMA13Cloud = if showClouds then ema13 else Double.NaN;
EMA5Cloud.SetDefaultColor(Color.GREEN);
EMA13Cloud.SetDefaultColor(Color.RED);
EMA5Cloud.HideBubble();
EMA13Cloud.HideBubble();

plot EMA8Cloud = if showClouds then ema8 else Double.NaN;
plot EMA9Cloud = if showClouds then ema9 else Double.NaN;
EMA8Cloud.SetDefaultColor(Color.GREEN);
EMA9Cloud.SetDefaultColor(Color.RED);
EMA8Cloud.HideBubble();
EMA9Cloud.HideBubble();

plot EMA20Cloud = if showClouds then ema20 else Double.NaN;
plot EMA21Cloud = if showClouds then ema21 else Double.NaN;
EMA20Cloud.SetDefaultColor(Color.GREEN);
EMA21Cloud.SetDefaultColor(Color.RED);
EMA20Cloud.HideBubble();
EMA21Cloud.HideBubble();

plot EMA34Cloud = if showClouds then ema34 else Double.NaN;
plot EMA50Cloud = if showClouds then ema50 else Double.NaN;
EMA34Cloud.SetDefaultColor(Color.GREEN);
EMA50Cloud.SetDefaultColor(Color.RED);
EMA34Cloud.HideBubble();
EMA50Cloud.HideBubble();

AddCloud(EMA5Cloud, EMA13Cloud, GlobalColor("FastBullCloud"), GlobalColor("FastBearCloud"));
AddCloud(EMA8Cloud, EMA9Cloud, GlobalColor("TriggerBullCloud"), GlobalColor("TriggerBearCloud"));
AddCloud(EMA20Cloud, EMA21Cloud, GlobalColor("MidBullCloud"), GlobalColor("MidBearCloud"));
AddCloud(EMA34Cloud, EMA50Cloud, GlobalColor("LongBullCloud"), GlobalColor("LongBearCloud"));

# Buy and sell arrows appear only on fully filtered PB1 breakouts.
plot BuyArrow = if showArrows and buySignal then low else Double.NaN;
BuyArrow.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
BuyArrow.SetDefaultColor(Color.GREEN);
BuyArrow.SetLineWeight(4);
BuyArrow.HideBubble();

plot SellArrow = if showArrows and sellSignal then high else Double.NaN;
SellArrow.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
SellArrow.SetDefaultColor(Color.RED);
SellArrow.SetLineWeight(4);
SellArrow.HideBubble();

# Pullback labels are price-anchored bubbles colored by pullback number.
AddChartBubble(showPullbacks and pb1, if trendDirection == 1 then low else high, "PB1", Color.CYAN, trendDirection == -1);
AddChartBubble(showPullbacks and pb2, if trendDirection == 1 then low else high, "PB2", Color.YELLOW, trendDirection == -1);
AddChartBubble(showPullbacks and pb3Plus, if trendDirection == 1 then low else high, "PB3", Color.GRAY, trendDirection == -1);

# ==========================================
# LABELS
# ==========================================
# Confidence score label uses the requested color bands.
AddLabel(showLabels,
    "CS: " + AsText(Round(confidenceScore, 0)),
    if confidenceScore >= 90 then CreateColor(0, 255, 0)
    else if confidenceScore >= 80 then Color.GREEN
    else if confidenceScore >= 70 then Color.YELLOW
    else if confidenceScore >= 60 then Color.ORANGE
    else Color.RED);

# Trend state label shows the five-state trend engine.
AddLabel(showLabels,
    if strongBull then "STRONG BULL"
    else if bullTrend then "BULL"
    else if strongBear then "STRONG BEAR"
    else if bearTrend then "BEAR"
    else "NEUTRAL",
    if strongBull then CreateColor(0, 255, 0)
    else if bullTrend then Color.GREEN
    else if strongBear then Color.RED
    else if bearTrend then Color.DARK_RED
    else Color.GRAY);

# EMA spread label gives the percentage distance between EMA 5, 20, and 50.
AddLabel(showLabels,
    "ES: " + AsText(Round(emaSpreadPercent, 2)) + "%",
    if emaSpreadPercent >= emaSpreadPercent[1] then Color.GREEN else Color.GRAY);

# ==========================================
# BACKGROUND
# ==========================================
# Background is off by default because TOS paints the entire historical chart
# for every qualifying bar. When enabled, it marks only high-confidence strong
# regimes so the chart does not become a permanent green/red pane.
AssignBackgroundColor(
    if !showBackground then Color.CURRENT
    else if strongBull and confidenceScore >= 90 then Color.DARK_GREEN
    else if strongBear and confidenceScore >= 90 then Color.DARK_RED
    else if neutralTrend and confidenceScore < 60 then Color.DARK_GRAY
    else Color.CURRENT);

# ==========================================
# ALERTS
# ==========================================
# Alerts are gated by one input and fire once per qualifying bar.
Alert(useAlerts and buySignal, "EMA Cloud Trend System Pro: Buy", Alert.BAR, Sound.Ding);
Alert(useAlerts and sellSignal, "EMA Cloud Trend System Pro: Sell", Alert.BAR, Sound.Bell);
Alert(useAlerts and pb1, "EMA Cloud Trend System Pro: PB1", Alert.BAR, Sound.Chimes);
Alert(useAlerts and trendReversal, "EMA Cloud Trend System Pro: Trend Reversal", Alert.BAR, Sound.Ring);
Alert(useAlerts and trendStrengthIncrease, "EMA Cloud Trend System Pro: Trend Strength Increase", Alert.BAR, Sound.Ding);
Alert(useAlerts and trendWeakening, "EMA Cloud Trend System Pro: Trend Weakening", Alert.BAR, Sound.Bell);
