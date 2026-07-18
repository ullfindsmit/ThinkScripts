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
input showLastEventLabel = yes;
input showBackground = no;
input showPullbacks = yes;
input showTrendEndBubbles = yes;

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

# Pullback settings.A pullback touches the selected EMA area, then confirms
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

# Core trend / quality indicators.
def adxValue = ADX(adxLength);
def atrValue = ATR(atrLength);
def atrAverage = Average(atrValue, 20);
def atrExpanding = atrValue > atrAverage;
def averageVolume = Average(volume, volumeAverageLength);
def vwapLine = VWAP();

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
# Cloud - by - cloud alignment.
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

# Strong alignment adds wide - stack ordering and slope confirmation.
def bullStack = ema5 > ema8 and ema8 > ema9 and ema9 > ema13 and ema13 > ema20 and ema20 > ema21 and ema21 > ema34 and ema34 > ema50;
def bearStack = ema5 < ema8 and ema8 < ema9 and ema9 < ema13 and ema13 < ema20 and ema20 < ema21 and ema21 < ema34 and ema34 < ema50;
def bullSlopes = ema5Rising and ema13Rising and ema20Rising and ema50Rising;
def bearSlopes = ema5Falling and ema13Falling and ema20Falling and ema50Falling;

def strongBull = bullStack and bullSlopes and adxValue >= adxThreshold and atrExpanding;
def strongBear = bearStack and bearSlopes and adxValue >= adxThreshold and atrExpanding;
def bullTrend = allCloudsBull and(ema5Rising or ema13Rising or ema20Rising);
def bearTrend = allCloudsBear and(ema5Falling or ema13Falling or ema20Falling);
def neutralTrend = !bullTrend and!bearTrend;

# Direction is held as state so pullback counts reset only on trend changes.
def rawTrendDirection =
    if bullTrend then 1
    else if bearTrend then - 1
else 0;

rec trendDirection = CompoundValue(1, rawTrendDirection, 0);
def trendReversal = trendDirection <> trendDirection[1] and trendDirection <> 0;
def longTrendEnded = trendDirection[1] == 1 and trendDirection == 0;
def shortTrendEnded = trendDirection[1] == -1 and trendDirection == 0;

# ==========================================
# SCORING
# ==========================================
# Each component contributes to a 0 - 100 confidence score.Directional filters
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
def emaSpreadPercent = if close != 0 then(spreadHigh - spreadLow) / close * 100 else 0;

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
# Pullback touches are tracked after a trend exists.Confirmations fire only
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

# Alert-worthy event tracking stores the most recent signal as a numeric code.
# This keeps the label stateful without relying on recursive strings.
def buyEvent = buySignal;
def sellEvent = sellSignal;
def pb1LongEvent = pb1 and trendDirection == 1;
def pb1ShortEvent = pb1 and trendDirection == -1;
def reversalLongEvent = trendReversal and trendDirection == 1;
def reversalShortEvent = trendReversal and trendDirection == -1;
def longTrendEndEvent = longTrendEnded;
def shortTrendEndEvent = shortTrendEnded;
def strengthLongEvent = trendStrengthIncrease and trendDirection == 1;
def strengthShortEvent = trendStrengthIncrease and trendDirection == -1;
def weakeningLongEvent = trendWeakening and trendDirection == 1;
def weakeningShortEvent = trendWeakening and trendDirection == -1;

def currentEventCode =
    if buyEvent then 1
    else if sellEvent then 2
    else if pb1LongEvent then 3
    else if pb1ShortEvent then 4
    else if reversalLongEvent then 5
    else if reversalShortEvent then 6
    else if longTrendEndEvent then 7
    else if shortTrendEndEvent then 8
    else if strengthLongEvent then 9
    else if strengthShortEvent then 10
    else if weakeningLongEvent then 11
    else if weakeningShortEvent then 12
    else 0;

def hasCurrentEvent = currentEventCode <> 0;

rec lastEventCode = CompoundValue(1,
    if hasCurrentEvent then currentEventCode else lastEventCode[1],
    0);

rec lastEventDate = CompoundValue(1,
    if hasCurrentEvent then GetYYYYMMDD() else lastEventDate[1],
    0);

rec lastEventSeconds = CompoundValue(1,
    if hasCurrentEvent then SecondsFromTime(0) else lastEventSeconds[1],
    0);

def lastEventHour = Floor(lastEventSeconds / 3600);
def lastEventMinute = Floor((lastEventSeconds - lastEventHour * 3600) / 60);

# ==========================================
# PLOTS
# ==========================================
# Cloud plots are hidden when the master cloud input is off.
plot EMA5Cloud = if showClouds then ema5 else Double.NaN;
plot EMA13Cloud = if showClouds then ema13 else Double.NaN;
EMA5Cloud.SetDefaultColor(CreateColor(0, 255, 255));
EMA13Cloud.SetDefaultColor(CreateColor(255, 80, 180));
EMA5Cloud.AssignValueColor(CreateColor(0, 255, 255));
EMA13Cloud.AssignValueColor(CreateColor(255, 80, 180));
EMA5Cloud.SetLineWeight(3);
EMA13Cloud.SetLineWeight(3);
EMA5Cloud.HideBubble();
EMA13Cloud.HideBubble();

plot EMA8Cloud = if showClouds then ema8 else Double.NaN;
plot EMA9Cloud = if showClouds then ema9 else Double.NaN;
EMA8Cloud.SetDefaultColor(CreateColor(0, 255, 90));
EMA9Cloud.SetDefaultColor(CreateColor(255, 160, 0));
EMA8Cloud.AssignValueColor(CreateColor(0, 255, 90));
EMA9Cloud.AssignValueColor(CreateColor(255, 160, 0));
EMA8Cloud.SetLineWeight(2);
EMA9Cloud.SetLineWeight(2);
EMA8Cloud.HideBubble();
EMA9Cloud.HideBubble();

plot EMA20Cloud = if showClouds then ema20 else Double.NaN;
plot EMA21Cloud = if showClouds then ema21 else Double.NaN;
EMA20Cloud.SetDefaultColor(CreateColor(0, 150, 60));
EMA21Cloud.SetDefaultColor(CreateColor(170, 40, 40));
EMA20Cloud.AssignValueColor(CreateColor(0, 150, 60));
EMA21Cloud.AssignValueColor(CreateColor(170, 40, 40));
EMA20Cloud.HideBubble();
EMA21Cloud.HideBubble();

plot EMA34Cloud = if showClouds then ema34 else Double.NaN;
plot EMA50Cloud = if showClouds then ema50 else Double.NaN;
EMA34Cloud.SetDefaultColor(CreateColor(0, 85, 35));
EMA50Cloud.SetDefaultColor(CreateColor(95, 15, 15));
EMA34Cloud.AssignValueColor(CreateColor(0, 85, 35));
EMA50Cloud.AssignValueColor(CreateColor(95, 15, 15));
EMA34Cloud.HideBubble();
EMA50Cloud.HideBubble();

# Draw broad structure first and fast channels last so short-term clouds remain visible.
AddCloud(EMA34Cloud, EMA50Cloud, CreateColor(0, 85, 35), CreateColor(95, 15, 15));
AddCloud(EMA20Cloud, EMA21Cloud, CreateColor(0, 150, 60), CreateColor(170, 40, 40));
AddCloud(EMA8Cloud, EMA9Cloud, CreateColor(0, 255, 90), CreateColor(255, 160, 0));
AddCloud(EMA5Cloud, EMA13Cloud, CreateColor(0, 255, 255), CreateColor(255, 80, 180));

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
# The suffix identifies the active trend direction: (L) for long setups and
# (S) for short setups.
AddChartBubble(showPullbacks and pb1, if trendDirection == 1 then low else high, if trendDirection == 1 then "PB1(L)" else "PB1(S)", Color.CYAN, trendDirection == -1);
AddChartBubble(showPullbacks and pb2, if trendDirection == 1 then low else high, if trendDirection == 1 then "PB2(L)" else "PB2(S)", Color.YELLOW, trendDirection == -1);
AddChartBubble(showPullbacks and pb3Plus, if trendDirection == 1 then low else high, if trendDirection == 1 then "PB3(L)" else "PB3(S)", Color.GRAY, trendDirection == -1);

# Trend-end bubbles mark when a long or short regime fades into neutral before
# a confirmed opposite trend appears.
AddChartBubble(showTrendEndBubbles and longTrendEndEvent, high, "LONG END", Color.ORANGE, yes);
AddChartBubble(showTrendEndBubbles and shortTrendEndEvent, low, "SHORT END", Color.ORANGE, no);

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

# Trend state label shows the five - state trend engine.
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

# Cloud legend labels identify the color mapping for each EMA channel.
AddLabel(showLabels, "5/13: cyan / pink", CreateColor(0, 255, 255));
AddLabel(showLabels, "8/9: lime / orange", CreateColor(0, 255, 90));
AddLabel(showLabels, "20/21: med green / red", CreateColor(0, 150, 60));
AddLabel(showLabels, "34/50: dark green / dark red", CreateColor(0, 85, 35));

# Last event label shows the most recent alert condition and the bar time.
AddLabel(showLabels and showLastEventLabel and lastEventCode <> 0,
    "Last: " +
    (if lastEventCode == 1 then "Buy Long"
    else if lastEventCode == 2 then "Sell Short"
    else if lastEventCode == 3 then "PB1 Long"
    else if lastEventCode == 4 then "PB1 Short"
    else if lastEventCode == 5 then "Trend Reversal Bullish / Long"
    else if lastEventCode == 6 then "Trend Reversal Bearish / Short"
    else if lastEventCode == 7 then "Long Trend Ended / Neutral"
    else if lastEventCode == 8 then "Short Trend Ended / Neutral"
    else if lastEventCode == 9 then "Bullish / Long Strength Increasing"
    else if lastEventCode == 10 then "Bearish / Short Strength Increasing"
    else if lastEventCode == 11 then "Bullish / Long Trend Weakening"
    else "Bearish / Short Trend Weakening") +
    " @ " + AsText(lastEventDate) + " " + AsText(lastEventHour) + ":" +
    (if lastEventMinute < 10 then "0" else "") + AsText(lastEventMinute),
    if lastEventCode == 1 or lastEventCode == 3 or lastEventCode == 5 or lastEventCode == 9 then Color.GREEN
    else if lastEventCode == 2 or lastEventCode == 4 or lastEventCode == 6 or lastEventCode == 10 then Color.RED
    else Color.ORANGE);

# ==========================================
# BACKGROUND
# ==========================================
# Background is off by default because TOS paints the entire historical chart
# for every qualifying bar.When enabled, it marks only high - confidence strong
# regimes so the chart does not become a permanent green / red pane.
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
Alert(useAlerts and buyEvent, "EMA Cloud Trend System Pro: Buy Long", Alert.BAR, Sound.Ding);
Alert(useAlerts and sellEvent, "EMA Cloud Trend System Pro: Sell Short", Alert.BAR, Sound.Bell);
Alert(useAlerts and pb1LongEvent, "EMA Cloud Trend System Pro: PB1 Long", Alert.BAR, Sound.Chimes);
Alert(useAlerts and pb1ShortEvent, "EMA Cloud Trend System Pro: PB1 Short", Alert.BAR, Sound.Chimes);
Alert(useAlerts and reversalLongEvent, "EMA Cloud Trend System Pro: Trend Reversal Bullish / Long", Alert.BAR, Sound.Ring);
Alert(useAlerts and reversalShortEvent, "EMA Cloud Trend System Pro: Trend Reversal Bearish / Short", Alert.BAR, Sound.Ring);
Alert(useAlerts and longTrendEndEvent, "EMA Cloud Trend System Pro: Long Trend Ended / Neutral", Alert.BAR, Sound.Bell);
Alert(useAlerts and shortTrendEndEvent, "EMA Cloud Trend System Pro: Short Trend Ended / Neutral", Alert.BAR, Sound.Bell);
Alert(useAlerts and strengthLongEvent, "EMA Cloud Trend System Pro: Bullish / Long Strength Increasing", Alert.BAR, Sound.Ding);
Alert(useAlerts and strengthShortEvent, "EMA Cloud Trend System Pro: Bearish / Short Strength Increasing", Alert.BAR, Sound.Ding);
Alert(useAlerts and weakeningLongEvent, "EMA Cloud Trend System Pro: Bullish / Long Trend Weakening", Alert.BAR, Sound.Bell);
Alert(useAlerts and weakeningShortEvent, "EMA Cloud Trend System Pro: Bearish / Short Trend Weakening", Alert.BAR, Sound.Bell);
