declare upper;

# ================================================================
# S_LEVELS
# Institutional support and resistance levels for ThinkOrSwim.
# ================================================================

# ================================================================
# SETTINGS
# ================================================================

input showDailyLevels = yes;
input showPreviousDailyHigh = yes;
input showPreviousDailyLow = yes;
input showPreviousDailyOpen = yes;
input showPreviousDailyClose = yes;
input showPreviousDailyMid = yes;
input showCurrentDailyOpen = yes;
input showCurrentDailyHigh = yes;
input showCurrentDailyLow = yes;

input showWeeklyLevels = yes;
input showPreviousWeeklyHigh = yes;
input showPreviousWeeklyLow = yes;
input showPreviousWeeklyMid = yes;
input showPreviousWeeklyOpen = yes;
input showCurrentWeeklyOpen = yes;

input showMonthlyLevels = yes;
input showPreviousMonthlyHigh = yes;
input showPreviousMonthlyLow = yes;
input showPreviousMonthlyMid = yes;
input showPreviousMonthlyOpen = yes;
input showCurrentMonthlyOpen = yes;

input showQuarterlyLevels = yes;
input showCurrentQuarterOpen = yes;
input showPreviousQuarterHigh = yes;
input showPreviousQuarterLow = yes;
input showPreviousQuarterMid = yes;

input showYearlyLevels = yes;
input showCurrentYearOpen = yes;
input showPreviousYearHigh = yes;
input showPreviousYearLow = yes;
input showPreviousYearMid = yes;

input showGapLevels = yes;
input showOpenGapsOnly = yes;
input showGapMid = yes;

input showOpeningRange = yes;
input openingRangeMinutes = {default Fifteen, Five, Thirty, Sixty};
input showOpeningRangeMid = yes;
input showOpeningRangeExtensions = yes;
input openingRangeExtensionMultiplier = 1.0;

input showInitialBalance = yes;
input initialBalanceMinutes = {default Sixty, Thirty};
input showInitialBalanceMid = yes;
input showInitialBalanceExtensions = yes;

input showOvernightLevels = yes;
input showOvernightOpen = yes;
input showOvernightHigh = yes;
input showOvernightLow = yes;
input showOvernightMid = yes;

input showRTHLevels = yes;
input showRTHOpen = yes;
input showRTHHigh = yes;
input showRTHLow = yes;
input showRTHMid = yes;

input showVWAPLevels = yes;
input showCurrentVWAP = yes;
input showPreviousSessionVWAP = yes;
input showWeeklyVWAP = yes;
input showMonthlyVWAP = yes;

input showVolumeProfiles = yes;
input showDailyProfileLevels = yes;
input showWeeklyProfileLevels = yes;
input showMonthlyProfileLevels = yes;
input valueAreaPercent = 70;

input showNakedLevels = yes;
input showNakedDailyProfileLevels = yes;
input showNakedWeeklyProfileLevels = yes;
input showNakedMonthlyProfileLevels = yes;

input enableAlerts = no;
input alertDailyHighLow = yes;
input alertWeeklyHighLow = yes;
input alertMonthlyHighLow = yes;
input alertProfileLevels = yes;
input alertGapLevels = yes;
input alertInitialBalance = yes;

input showLabels = yes;
input labelMode = {default Both, Name, Price};
input labelBubbles = yes;
input labelSpacingTicks = 4;
# How many of the drawn levels get a name+price bubble at the right edge.
#   Minimal  = prev day/week/month H/L, gap, initial balance
#   Standard = + current-day O/H/L, prev open/close/mid, overnight, RTH, opening range, session VWAP, daily profile
#   Full     = every level that is currently being drawn
input bubbleDetail = {Minimal, default Standard, Full};
# Break each level into a clean horizontal segment per period instead of
# connecting the jumps between days/weeks/months across the whole chart.
input cleanMultiDay = yes;

input levelLineStyle = {default Solid, Dash, Dot};
input profileLineStyle = {default Dash, Solid, Dot};
input vwapLineStyle = {default Solid, Dash, Dot};
input gapLineStyle = {default Dash, Solid, Dot};
input levelLineWeight = 1;
input majorLineWeight = 2;
input profileLineWeight = 1;
input extensionLengthBars = 0;

input regularSessionStart = 0930;
input regularSessionEnd = 1600;

# ================================================================
# COLOR DEFINITIONS
# ================================================================

DefineGlobalColor("Daily", CreateColor(0, 190, 255));
DefineGlobalColor("Weekly", CreateColor(255, 210, 0));
DefineGlobalColor("Monthly", CreateColor(210, 95, 255));
DefineGlobalColor("Quarterly", CreateColor(255, 145, 0));
DefineGlobalColor("Yearly", CreateColor(245, 245, 245));
DefineGlobalColor("Profile", CreateColor(175, 110, 210));
DefineGlobalColor("VWAP", CreateColor(70, 130, 255));
DefineGlobalColor("Gap", CreateColor(255, 105, 180));
DefineGlobalColor("InitialBalance", CreateColor(120, 220, 120));
DefineGlobalColor("OpeningRange", CreateColor(255, 165, 60));
DefineGlobalColor("Overnight", CreateColor(150, 150, 150));
DefineGlobalColor("RTH", CreateColor(80, 200, 80));
DefineGlobalColor("Support", CreateColor(0, 140, 70));
DefineGlobalColor("Resistance", CreateColor(190, 45, 45));

# ================================================================
# UTILITY SCRIPTS
# ================================================================

script LevelMid {
    input upperLevel = 0.0;
    input lowerLevel = 0.0;
    plot mid = (upperLevel + lowerLevel) / 2;
}

script FirstTouch {
    input level = 0.0;
    input active = no;
    def validLevel = !IsNaN(level);
    plot touched = active and validLevel and high >= level and low <= level;
}

script TextPrice {
    input level = 0.0;
    plot roundedLevel = Round(level, 2);
}

# ================================================================
# SESSION ENGINE
# ================================================================

def bn = BarNumber();
def tickSize = TickSize();
def na = Double.NaN;
def lastBar = !IsNaN(close) and IsNaN(close[-1]);

def tradingDay = GetYYYYMMDD();
def newDay = tradingDay <> tradingDay[1];
def newWeek = GetWeek() <> GetWeek()[1] or GetYear() <> GetYear()[1];
def newMonth = GetMonth() <> GetMonth()[1] or GetYear() <> GetYear()[1];
def currentQuarter = Floor((GetMonth() - 1) / 3) + 1;
def priorQuarter = currentQuarter[1];
def newQuarter = currentQuarter <> priorQuarter or GetYear() <> GetYear()[1];
def newYear = GetYear() <> GetYear()[1];

def secondsFromRTHOpen = SecondsFromTime(regularSessionStart);
def secondsTillRTHClose = SecondsTillTime(regularSessionEnd);
def inRTH = secondsFromRTHOpen >= 0 and secondsTillRTHClose > 0;
def rthStart = inRTH and !inRTH[1];
def rthEnd = !inRTH and inRTH[1];
def inOvernight = !inRTH;
def overnightStart = inOvernight and !inOvernight[1];

def openingRangeSeconds =
    if openingRangeMinutes == openingRangeMinutes.Five then 300
    else if openingRangeMinutes == openingRangeMinutes.Fifteen then 900
    else if openingRangeMinutes == openingRangeMinutes.Thirty then 1800
    else 3600;
def initialBalanceSeconds =
    if initialBalanceMinutes == initialBalanceMinutes.Thirty then 1800
    else 3600;

def inOpeningRange = inRTH and secondsFromRTHOpen < openingRangeSeconds;
def openingRangeComplete = !inOpeningRange and inOpeningRange[1];
def inInitialBalance = inRTH and secondsFromRTHOpen < initialBalanceSeconds;
def initialBalanceComplete = !inInitialBalance and inInitialBalance[1];

def extensionActive =
    extensionLengthBars <= 0 or
    bn >= HighestAll(if lastBar then bn else 0) - extensionLengthBars;

# ================================================================
# DAILY ENGINE
# ================================================================

def currentDayOpen = CompoundValue(1, if newDay then open else currentDayOpen[1], open);
def currentDayHigh = CompoundValue(1, if newDay then high else Max(currentDayHigh[1], high), high);
def currentDayLow = CompoundValue(1, if newDay then low else Min(currentDayLow[1], low), low);

def previousDayOpen = CompoundValue(1, if newDay then currentDayOpen[1] else previousDayOpen[1], open);
def previousDayHigh = CompoundValue(1, if newDay then currentDayHigh[1] else previousDayHigh[1], high);
def previousDayLow = CompoundValue(1, if newDay then currentDayLow[1] else previousDayLow[1], low);
def previousDayClose = CompoundValue(1, if newDay then close[1] else previousDayClose[1], close);
def previousDayMid = LevelMid(previousDayHigh, previousDayLow);

# ================================================================
# WEEKLY ENGINE
# ================================================================

def currentWeekOpen = CompoundValue(1, if newWeek then open else currentWeekOpen[1], open);
def currentWeekHigh = CompoundValue(1, if newWeek then high else Max(currentWeekHigh[1], high), high);
def currentWeekLow = CompoundValue(1, if newWeek then low else Min(currentWeekLow[1], low), low);

def previousWeekOpen = CompoundValue(1, if newWeek then currentWeekOpen[1] else previousWeekOpen[1], open);
def previousWeekHigh = CompoundValue(1, if newWeek then currentWeekHigh[1] else previousWeekHigh[1], high);
def previousWeekLow = CompoundValue(1, if newWeek then currentWeekLow[1] else previousWeekLow[1], low);
def previousWeekMid = LevelMid(previousWeekHigh, previousWeekLow);

# ================================================================
# MONTHLY ENGINE
# ================================================================

def currentMonthOpen = CompoundValue(1, if newMonth then open else currentMonthOpen[1], open);
def currentMonthHigh = CompoundValue(1, if newMonth then high else Max(currentMonthHigh[1], high), high);
def currentMonthLow = CompoundValue(1, if newMonth then low else Min(currentMonthLow[1], low), low);

def previousMonthOpen = CompoundValue(1, if newMonth then currentMonthOpen[1] else previousMonthOpen[1], open);
def previousMonthHigh = CompoundValue(1, if newMonth then currentMonthHigh[1] else previousMonthHigh[1], high);
def previousMonthLow = CompoundValue(1, if newMonth then currentMonthLow[1] else previousMonthLow[1], low);
def previousMonthMid = LevelMid(previousMonthHigh, previousMonthLow);

# ================================================================
# QUARTERLY ENGINE
# ================================================================

def currentQuarterOpenValue = CompoundValue(1, if newQuarter then open else currentQuarterOpenValue[1], open);
def currentQuarterHigh = CompoundValue(1, if newQuarter then high else Max(currentQuarterHigh[1], high), high);
def currentQuarterLow = CompoundValue(1, if newQuarter then low else Min(currentQuarterLow[1], low), low);

def previousQuarterHigh = CompoundValue(1, if newQuarter then currentQuarterHigh[1] else previousQuarterHigh[1], high);
def previousQuarterLow = CompoundValue(1, if newQuarter then currentQuarterLow[1] else previousQuarterLow[1], low);
def previousQuarterMid = LevelMid(previousQuarterHigh, previousQuarterLow);

# ================================================================
# YEARLY ENGINE
# ================================================================

def currentYearOpenValue = CompoundValue(1, if newYear then open else currentYearOpenValue[1], open);
def currentYearHigh = CompoundValue(1, if newYear then high else Max(currentYearHigh[1], high), high);
def currentYearLow = CompoundValue(1, if newYear then low else Min(currentYearLow[1], low), low);

def previousYearHigh = CompoundValue(1, if newYear then currentYearHigh[1] else previousYearHigh[1], high);
def previousYearLow = CompoundValue(1, if newYear then currentYearLow[1] else previousYearLow[1], low);
def previousYearMid = LevelMid(previousYearHigh, previousYearLow);

# ================================================================
# OVERNIGHT ENGINE
# ================================================================

def overnightOpen = CompoundValue(1, if overnightStart then open else overnightOpen[1], open);
def overnightHigh = CompoundValue(1,
    if overnightStart then high
    else if inOvernight then Max(overnightHigh[1], high)
    else overnightHigh[1],
    high);
def overnightLow = CompoundValue(1,
    if overnightStart then low
    else if inOvernight then Min(overnightLow[1], low)
    else overnightLow[1],
    low);
def overnightMid = LevelMid(overnightHigh, overnightLow);

# ================================================================
# RTH ENGINE
# ================================================================

def rthOpen = CompoundValue(1, if rthStart then open else rthOpen[1], open);
def rthHigh = CompoundValue(1,
    if rthStart then high
    else if inRTH then Max(rthHigh[1], high)
    else rthHigh[1],
    high);
def rthLow = CompoundValue(1,
    if rthStart then low
    else if inRTH then Min(rthLow[1], low)
    else rthLow[1],
    low);
def rthMid = LevelMid(rthHigh, rthLow);

# ================================================================
# GAP ENGINE
# ================================================================

def gapUpToday = rthStart and rthOpen > previousDayHigh;
def gapDownToday = rthStart and rthOpen < previousDayLow;
def newGap = gapUpToday or gapDownToday;

def activeGapTop = CompoundValue(1,
    if gapUpToday then rthOpen
    else if gapDownToday then previousDayLow
    else activeGapTop[1],
    na);
def activeGapBottom = CompoundValue(1,
    if gapUpToday then previousDayHigh
    else if gapDownToday then rthOpen
    else activeGapBottom[1],
    na);
def gapDirection = CompoundValue(1,
    if gapUpToday then 1
    else if gapDownToday then -1
    else gapDirection[1],
    0);
def gapFilledNow =
    (gapDirection == 1 and low <= activeGapBottom) or
    (gapDirection == -1 and high >= activeGapTop);
def gapIsOpen = CompoundValue(1,
    if newGap then yes
    else if gapFilledNow then no
    else gapIsOpen[1],
    no);
def activeGapMid = LevelMid(activeGapTop, activeGapBottom);
def plotGap = showGapLevels and extensionActive and !IsNaN(activeGapTop) and (!showOpenGapsOnly or gapIsOpen);

# ================================================================
# OPENING RANGE ENGINE
# ================================================================

def openingRangeHighBuilding = CompoundValue(1,
    if rthStart then high
    else if inOpeningRange then Max(openingRangeHighBuilding[1], high)
    else openingRangeHighBuilding[1],
    high);
def openingRangeLowBuilding = CompoundValue(1,
    if rthStart then low
    else if inOpeningRange then Min(openingRangeLowBuilding[1], low)
    else openingRangeLowBuilding[1],
    low);
def openingRangeHigh = openingRangeHighBuilding;
def openingRangeLow = openingRangeLowBuilding;
def openingRangeMid = LevelMid(openingRangeHigh, openingRangeLow);
def openingRangeSize = openingRangeHigh - openingRangeLow;
def openingRangeUpperExtension = openingRangeHigh + (openingRangeSize * openingRangeExtensionMultiplier);
def openingRangeLowerExtension = openingRangeLow - (openingRangeSize * openingRangeExtensionMultiplier);
def openingRangeReady = secondsFromRTHOpen >= openingRangeSeconds;

# ================================================================
# INITIAL BALANCE ENGINE
# ================================================================

def initialBalanceHighBuilding = CompoundValue(1,
    if rthStart then high
    else if inInitialBalance then Max(initialBalanceHighBuilding[1], high)
    else initialBalanceHighBuilding[1],
    high);
def initialBalanceLowBuilding = CompoundValue(1,
    if rthStart then low
    else if inInitialBalance then Min(initialBalanceLowBuilding[1], low)
    else initialBalanceLowBuilding[1],
    low);
def initialBalanceHigh = initialBalanceHighBuilding;
def initialBalanceLow = initialBalanceLowBuilding;
def initialBalanceMid = LevelMid(initialBalanceHigh, initialBalanceLow);
def initialBalanceRange = initialBalanceHigh - initialBalanceLow;
def initialBalanceReady = secondsFromRTHOpen >= initialBalanceSeconds;

def ibUpperHalf = initialBalanceHigh + initialBalanceRange * 0.5;
def ibUpperOne = initialBalanceHigh + initialBalanceRange;
def ibUpperOneHalf = initialBalanceHigh + initialBalanceRange * 1.5;
def ibUpperTwo = initialBalanceHigh + initialBalanceRange * 2.0;
def ibLowerHalf = initialBalanceLow - initialBalanceRange * 0.5;
def ibLowerOne = initialBalanceLow - initialBalanceRange;
def ibLowerOneHalf = initialBalanceLow - initialBalanceRange * 1.5;
def ibLowerTwo = initialBalanceLow - initialBalanceRange * 2.0;

# ================================================================
# VWAP ENGINE
# ================================================================

def typicalPrice = (high + low + close) / 3;
def sessionTypicalVolume = typicalPrice * volume;
def dayVolumeSum = CompoundValue(1, if newDay then volume else dayVolumeSum[1] + volume, volume);
def dayPriceVolumeSum = CompoundValue(1, if newDay then sessionTypicalVolume else dayPriceVolumeSum[1] + sessionTypicalVolume, sessionTypicalVolume);
def currentSessionVWAP = if dayVolumeSum <> 0 then dayPriceVolumeSum / dayVolumeSum else na;
def previousSessionVWAP = CompoundValue(1, if newDay then currentSessionVWAP[1] else previousSessionVWAP[1], currentSessionVWAP);

def weekVolumeSum = CompoundValue(1, if newWeek then volume else weekVolumeSum[1] + volume, volume);
def weekPriceVolumeSum = CompoundValue(1, if newWeek then sessionTypicalVolume else weekPriceVolumeSum[1] + sessionTypicalVolume, sessionTypicalVolume);
def weeklyVWAP = if weekVolumeSum <> 0 then weekPriceVolumeSum / weekVolumeSum else na;

def monthVolumeSum = CompoundValue(1, if newMonth then volume else monthVolumeSum[1] + volume, volume);
def monthPriceVolumeSum = CompoundValue(1, if newMonth then sessionTypicalVolume else monthPriceVolumeSum[1] + sessionTypicalVolume, sessionTypicalVolume);
def monthlyVWAP = if monthVolumeSum <> 0 then monthPriceVolumeSum / monthVolumeSum else na;

# ================================================================
# VOLUME PROFILE ENGINE
# ================================================================

profile dailyProfile = VolumeProfile(
    "startNewProfile" = newDay,
    "onExpansion" = no,
    "numberOfProfiles" = 1000,
    "pricePerRow" = PricePerRow.AUTOMATIC,
    "value area percent" = valueAreaPercent
);
def dailyPOC = dailyProfile.GetPointOfControl();
def dailyVAH = dailyProfile.GetHighestValueArea();
def dailyVAL = dailyProfile.GetLowestValueArea();
def previousDailyPOC = CompoundValue(1, if newDay then dailyPOC[1] else previousDailyPOC[1], dailyPOC);
def previousDailyVAH = CompoundValue(1, if newDay then dailyVAH[1] else previousDailyVAH[1], dailyVAH);
def previousDailyVAL = CompoundValue(1, if newDay then dailyVAL[1] else previousDailyVAL[1], dailyVAL);

profile weeklyProfile = VolumeProfile(
    "startNewProfile" = newWeek,
    "onExpansion" = no,
    "numberOfProfiles" = 260,
    "pricePerRow" = PricePerRow.AUTOMATIC,
    "value area percent" = valueAreaPercent
);
def weeklyPOC = weeklyProfile.GetPointOfControl();
def weeklyVAH = weeklyProfile.GetHighestValueArea();
def weeklyVAL = weeklyProfile.GetLowestValueArea();
def previousWeeklyPOC = CompoundValue(1, if newWeek then weeklyPOC[1] else previousWeeklyPOC[1], weeklyPOC);
def previousWeeklyVAH = CompoundValue(1, if newWeek then weeklyVAH[1] else previousWeeklyVAH[1], weeklyVAH);
def previousWeeklyVAL = CompoundValue(1, if newWeek then weeklyVAL[1] else previousWeeklyVAL[1], weeklyVAL);

profile monthlyProfile = VolumeProfile(
    "startNewProfile" = newMonth,
    "onExpansion" = no,
    "numberOfProfiles" = 120,
    "pricePerRow" = PricePerRow.AUTOMATIC,
    "value area percent" = valueAreaPercent
);
def monthlyPOC = monthlyProfile.GetPointOfControl();
def monthlyVAH = monthlyProfile.GetHighestValueArea();
def monthlyVAL = monthlyProfile.GetLowestValueArea();
def previousMonthlyPOC = CompoundValue(1, if newMonth then monthlyPOC[1] else previousMonthlyPOC[1], monthlyPOC);
def previousMonthlyVAH = CompoundValue(1, if newMonth then monthlyVAH[1] else previousMonthlyVAH[1], monthlyVAH);
def previousMonthlyVAL = CompoundValue(1, if newMonth then monthlyVAL[1] else previousMonthlyVAL[1], monthlyVAL);

# ================================================================
# NAKED LEVEL ENGINE
# ================================================================

def nakedDailyPOCTouched = CompoundValue(1,
    if newDay then no
    else if FirstTouch(previousDailyPOC, showNakedLevels) then yes
    else nakedDailyPOCTouched[1],
    no);
def nakedDailyVAHTouched = CompoundValue(1,
    if newDay then no
    else if FirstTouch(previousDailyVAH, showNakedLevels) then yes
    else nakedDailyVAHTouched[1],
    no);
def nakedDailyVALTouched = CompoundValue(1,
    if newDay then no
    else if FirstTouch(previousDailyVAL, showNakedLevels) then yes
    else nakedDailyVALTouched[1],
    no);

def nakedWeeklyPOCTouched = CompoundValue(1,
    if newWeek then no
    else if FirstTouch(previousWeeklyPOC, showNakedLevels) then yes
    else nakedWeeklyPOCTouched[1],
    no);
def nakedWeeklyVAHTouched = CompoundValue(1,
    if newWeek then no
    else if FirstTouch(previousWeeklyVAH, showNakedLevels) then yes
    else nakedWeeklyVAHTouched[1],
    no);
def nakedWeeklyVALTouched = CompoundValue(1,
    if newWeek then no
    else if FirstTouch(previousWeeklyVAL, showNakedLevels) then yes
    else nakedWeeklyVALTouched[1],
    no);

def nakedMonthlyPOCTouched = CompoundValue(1,
    if newMonth then no
    else if FirstTouch(previousMonthlyPOC, showNakedLevels) then yes
    else nakedMonthlyPOCTouched[1],
    no);
def nakedMonthlyVAHTouched = CompoundValue(1,
    if newMonth then no
    else if FirstTouch(previousMonthlyVAH, showNakedLevels) then yes
    else nakedMonthlyVAHTouched[1],
    no);
def nakedMonthlyVALTouched = CompoundValue(1,
    if newMonth then no
    else if FirstTouch(previousMonthlyVAL, showNakedLevels) then yes
    else nakedMonthlyVALTouched[1],
    no);

# ================================================================
# MULTI-DAY LINE BREAKS
# ================================================================
# When cleanMultiDay is on, blank the single bar at each period boundary
# so thinkorswim does not draw a diagonal connector between one period's
# level and the next. Each period then renders as its own flat segment.

def keepDay = !cleanMultiDay or !newDay;
def keepWeek = !cleanMultiDay or !newWeek;
def keepMonth = !cleanMultiDay or !newMonth;
def keepQuarter = !cleanMultiDay or !newQuarter;
def keepYear = !cleanMultiDay or !newYear;
def keepSession = !cleanMultiDay or !rthStart;
def keepOvernight = !cleanMultiDay or !overnightStart;
def keepGap = !cleanMultiDay or !newGap;

# ================================================================
# DRAWING ENGINE
# ================================================================

plot PDH = if showDailyLevels and showPreviousDailyHigh and extensionActive and keepDay then previousDayHigh else na;
plot PDL = if showDailyLevels and showPreviousDailyLow and extensionActive and keepDay then previousDayLow else na;
plot PDO = if showDailyLevels and showPreviousDailyOpen and extensionActive and keepDay then previousDayOpen else na;
plot PDC = if showDailyLevels and showPreviousDailyClose and extensionActive and keepDay then previousDayClose else na;
plot PDM = if showDailyLevels and showPreviousDailyMid and extensionActive and keepDay then previousDayMid else na;
plot CDO = if showDailyLevels and showCurrentDailyOpen and extensionActive and keepDay then currentDayOpen else na;
plot CDH = if showDailyLevels and showCurrentDailyHigh and extensionActive and keepDay then currentDayHigh else na;
plot CDL = if showDailyLevels and showCurrentDailyLow and extensionActive and keepDay then currentDayLow else na;

plot PWH = if showWeeklyLevels and showPreviousWeeklyHigh and extensionActive and keepWeek then previousWeekHigh else na;
plot PWL = if showWeeklyLevels and showPreviousWeeklyLow and extensionActive and keepWeek then previousWeekLow else na;
plot PWM = if showWeeklyLevels and showPreviousWeeklyMid and extensionActive and keepWeek then previousWeekMid else na;
plot PWO = if showWeeklyLevels and showPreviousWeeklyOpen and extensionActive and keepWeek then previousWeekOpen else na;
plot CWO = if showWeeklyLevels and showCurrentWeeklyOpen and extensionActive and keepWeek then currentWeekOpen else na;

plot PMH = if showMonthlyLevels and showPreviousMonthlyHigh and extensionActive and keepMonth then previousMonthHigh else na;
plot PML = if showMonthlyLevels and showPreviousMonthlyLow and extensionActive and keepMonth then previousMonthLow else na;
plot PMM = if showMonthlyLevels and showPreviousMonthlyMid and extensionActive and keepMonth then previousMonthMid else na;
plot PMO = if showMonthlyLevels and showPreviousMonthlyOpen and extensionActive and keepMonth then previousMonthOpen else na;
plot CMO = if showMonthlyLevels and showCurrentMonthlyOpen and extensionActive and keepMonth then currentMonthOpen else na;

plot CQO = if showQuarterlyLevels and showCurrentQuarterOpen and extensionActive and keepQuarter then currentQuarterOpenValue else na;
plot PQH = if showQuarterlyLevels and showPreviousQuarterHigh and extensionActive and keepQuarter then previousQuarterHigh else na;
plot PQL = if showQuarterlyLevels and showPreviousQuarterLow and extensionActive and keepQuarter then previousQuarterLow else na;
plot PQM = if showQuarterlyLevels and showPreviousQuarterMid and extensionActive and keepQuarter then previousQuarterMid else na;

plot CYO = if showYearlyLevels and showCurrentYearOpen and extensionActive and keepYear then currentYearOpenValue else na;
plot PYH = if showYearlyLevels and showPreviousYearHigh and extensionActive and keepYear then previousYearHigh else na;
plot PYL = if showYearlyLevels and showPreviousYearLow and extensionActive and keepYear then previousYearLow else na;
plot PYM = if showYearlyLevels and showPreviousYearMid and extensionActive and keepYear then previousYearMid else na;

plot ONO = if showOvernightLevels and showOvernightOpen and extensionActive and keepOvernight then overnightOpen else na;
plot ONH = if showOvernightLevels and showOvernightHigh and extensionActive and keepOvernight then overnightHigh else na;
plot ONL = if showOvernightLevels and showOvernightLow and extensionActive and keepOvernight then overnightLow else na;
plot ONM = if showOvernightLevels and showOvernightMid and extensionActive and keepOvernight then overnightMid else na;

plot RTHO = if showRTHLevels and showRTHOpen and extensionActive and keepSession then rthOpen else na;
plot RTHH = if showRTHLevels and showRTHHigh and extensionActive and keepSession then rthHigh else na;
plot RTHL = if showRTHLevels and showRTHLow and extensionActive and keepSession then rthLow else na;
plot RTHM = if showRTHLevels and showRTHMid and extensionActive and keepSession then rthMid else na;

plot GapTop = if plotGap and keepGap then activeGapTop else na;
plot GapBottom = if plotGap and keepGap then activeGapBottom else na;
plot GapMid = if plotGap and showGapMid and keepGap then activeGapMid else na;

plot ORH = if showOpeningRange and openingRangeReady and extensionActive and keepSession then openingRangeHigh else na;
plot ORL = if showOpeningRange and openingRangeReady and extensionActive and keepSession then openingRangeLow else na;
plot ORM = if showOpeningRange and showOpeningRangeMid and openingRangeReady and extensionActive and keepSession then openingRangeMid else na;
plot ORExtHigh = if showOpeningRange and showOpeningRangeExtensions and openingRangeReady and extensionActive and keepSession then openingRangeUpperExtension else na;
plot ORExtLow = if showOpeningRange and showOpeningRangeExtensions and openingRangeReady and extensionActive and keepSession then openingRangeLowerExtension else na;

plot IBH = if showInitialBalance and initialBalanceReady and extensionActive and keepSession then initialBalanceHigh else na;
plot IBL = if showInitialBalance and initialBalanceReady and extensionActive and keepSession then initialBalanceLow else na;
plot IBM = if showInitialBalance and showInitialBalanceMid and initialBalanceReady and extensionActive and keepSession then initialBalanceMid else na;
plot IBH05 = if showInitialBalance and showInitialBalanceExtensions and initialBalanceReady and extensionActive and keepSession then ibUpperHalf else na;
plot IBH10 = if showInitialBalance and showInitialBalanceExtensions and initialBalanceReady and extensionActive and keepSession then ibUpperOne else na;
plot IBH15 = if showInitialBalance and showInitialBalanceExtensions and initialBalanceReady and extensionActive and keepSession then ibUpperOneHalf else na;
plot IBH20 = if showInitialBalance and showInitialBalanceExtensions and initialBalanceReady and extensionActive and keepSession then ibUpperTwo else na;
plot IBL05 = if showInitialBalance and showInitialBalanceExtensions and initialBalanceReady and extensionActive and keepSession then ibLowerHalf else na;
plot IBL10 = if showInitialBalance and showInitialBalanceExtensions and initialBalanceReady and extensionActive and keepSession then ibLowerOne else na;
plot IBL15 = if showInitialBalance and showInitialBalanceExtensions and initialBalanceReady and extensionActive and keepSession then ibLowerOneHalf else na;
plot IBL20 = if showInitialBalance and showInitialBalanceExtensions and initialBalanceReady and extensionActive and keepSession then ibLowerTwo else na;

plot VWAPCurrent = if showVWAPLevels and showCurrentVWAP and extensionActive and keepDay then currentSessionVWAP else na;
plot VWAPPrevious = if showVWAPLevels and showPreviousSessionVWAP and extensionActive and keepDay then previousSessionVWAP else na;
plot VWAPWeekly = if showVWAPLevels and showWeeklyVWAP and extensionActive and keepWeek then weeklyVWAP else na;
plot VWAPMonthly = if showVWAPLevels and showMonthlyVWAP and extensionActive and keepMonth then monthlyVWAP else na;

plot DPOC = if showVolumeProfiles and showDailyProfileLevels and extensionActive and keepDay then previousDailyPOC else na;
plot DVAH = if showVolumeProfiles and showDailyProfileLevels and extensionActive and keepDay then previousDailyVAH else na;
plot DVAL = if showVolumeProfiles and showDailyProfileLevels and extensionActive and keepDay then previousDailyVAL else na;
plot WPOC = if showVolumeProfiles and showWeeklyProfileLevels and extensionActive and keepWeek then previousWeeklyPOC else na;
plot WVAH = if showVolumeProfiles and showWeeklyProfileLevels and extensionActive and keepWeek then previousWeeklyVAH else na;
plot WVAL = if showVolumeProfiles and showWeeklyProfileLevels and extensionActive and keepWeek then previousWeeklyVAL else na;
plot MPOC = if showVolumeProfiles and showMonthlyProfileLevels and extensionActive and keepMonth then previousMonthlyPOC else na;
plot MVAH = if showVolumeProfiles and showMonthlyProfileLevels and extensionActive and keepMonth then previousMonthlyVAH else na;
plot MVAL = if showVolumeProfiles and showMonthlyProfileLevels and extensionActive and keepMonth then previousMonthlyVAL else na;

plot NakedDPOC = if showNakedLevels and showNakedDailyProfileLevels and !nakedDailyPOCTouched and extensionActive and keepDay then previousDailyPOC else na;
plot NakedDVAH = if showNakedLevels and showNakedDailyProfileLevels and !nakedDailyVAHTouched and extensionActive and keepDay then previousDailyVAH else na;
plot NakedDVAL = if showNakedLevels and showNakedDailyProfileLevels and !nakedDailyVALTouched and extensionActive and keepDay then previousDailyVAL else na;
plot NakedWPOC = if showNakedLevels and showNakedWeeklyProfileLevels and !nakedWeeklyPOCTouched and extensionActive and keepWeek then previousWeeklyPOC else na;
plot NakedWVAH = if showNakedLevels and showNakedWeeklyProfileLevels and !nakedWeeklyVAHTouched and extensionActive and keepWeek then previousWeeklyVAH else na;
plot NakedWVAL = if showNakedLevels and showNakedWeeklyProfileLevels and !nakedWeeklyVALTouched and extensionActive and keepWeek then previousWeeklyVAL else na;
plot NakedMPOC = if showNakedLevels and showNakedMonthlyProfileLevels and !nakedMonthlyPOCTouched and extensionActive and keepMonth then previousMonthlyPOC else na;
plot NakedMVAH = if showNakedLevels and showNakedMonthlyProfileLevels and !nakedMonthlyVAHTouched and extensionActive and keepMonth then previousMonthlyVAH else na;
plot NakedMVAL = if showNakedLevels and showNakedMonthlyProfileLevels and !nakedMonthlyVALTouched and extensionActive and keepMonth then previousMonthlyVAL else na;

PDH.SetDefaultColor(GlobalColor("Resistance"));
PDL.SetDefaultColor(GlobalColor("Support"));
PDO.SetDefaultColor(GlobalColor("Daily"));
PDC.SetDefaultColor(GlobalColor("Daily"));
PDM.SetDefaultColor(GlobalColor("Daily"));
CDO.SetDefaultColor(GlobalColor("Daily"));
CDH.SetDefaultColor(GlobalColor("Resistance"));
CDL.SetDefaultColor(GlobalColor("Support"));

PWH.SetDefaultColor(GlobalColor("Weekly"));
PWL.SetDefaultColor(GlobalColor("Weekly"));
PWM.SetDefaultColor(GlobalColor("Weekly"));
PWO.SetDefaultColor(GlobalColor("Weekly"));
CWO.SetDefaultColor(GlobalColor("Weekly"));

PMH.SetDefaultColor(GlobalColor("Monthly"));
PML.SetDefaultColor(GlobalColor("Monthly"));
PMM.SetDefaultColor(GlobalColor("Monthly"));
PMO.SetDefaultColor(GlobalColor("Monthly"));
CMO.SetDefaultColor(GlobalColor("Monthly"));

CQO.SetDefaultColor(GlobalColor("Quarterly"));
PQH.SetDefaultColor(GlobalColor("Quarterly"));
PQL.SetDefaultColor(GlobalColor("Quarterly"));
PQM.SetDefaultColor(GlobalColor("Quarterly"));

CYO.SetDefaultColor(GlobalColor("Yearly"));
PYH.SetDefaultColor(GlobalColor("Yearly"));
PYL.SetDefaultColor(GlobalColor("Yearly"));
PYM.SetDefaultColor(GlobalColor("Yearly"));

ONO.SetDefaultColor(GlobalColor("Overnight"));
ONH.SetDefaultColor(GlobalColor("Overnight"));
ONL.SetDefaultColor(GlobalColor("Overnight"));
ONM.SetDefaultColor(GlobalColor("Overnight"));

RTHO.SetDefaultColor(GlobalColor("RTH"));
RTHH.SetDefaultColor(GlobalColor("RTH"));
RTHL.SetDefaultColor(GlobalColor("RTH"));
RTHM.SetDefaultColor(GlobalColor("RTH"));

GapTop.SetDefaultColor(GlobalColor("Gap"));
GapBottom.SetDefaultColor(GlobalColor("Gap"));
GapMid.SetDefaultColor(GlobalColor("Gap"));

ORH.SetDefaultColor(GlobalColor("OpeningRange"));
ORL.SetDefaultColor(GlobalColor("OpeningRange"));
ORM.SetDefaultColor(GlobalColor("OpeningRange"));
ORExtHigh.SetDefaultColor(GlobalColor("OpeningRange"));
ORExtLow.SetDefaultColor(GlobalColor("OpeningRange"));

IBH.SetDefaultColor(GlobalColor("InitialBalance"));
IBL.SetDefaultColor(GlobalColor("InitialBalance"));
IBM.SetDefaultColor(GlobalColor("InitialBalance"));
IBH05.SetDefaultColor(GlobalColor("InitialBalance"));
IBH10.SetDefaultColor(GlobalColor("InitialBalance"));
IBH15.SetDefaultColor(GlobalColor("InitialBalance"));
IBH20.SetDefaultColor(GlobalColor("InitialBalance"));
IBL05.SetDefaultColor(GlobalColor("InitialBalance"));
IBL10.SetDefaultColor(GlobalColor("InitialBalance"));
IBL15.SetDefaultColor(GlobalColor("InitialBalance"));
IBL20.SetDefaultColor(GlobalColor("InitialBalance"));

VWAPCurrent.SetDefaultColor(GlobalColor("VWAP"));
VWAPPrevious.SetDefaultColor(GlobalColor("VWAP"));
VWAPWeekly.SetDefaultColor(GlobalColor("VWAP"));
VWAPMonthly.SetDefaultColor(GlobalColor("VWAP"));

DPOC.SetDefaultColor(GlobalColor("Profile"));
DVAH.SetDefaultColor(GlobalColor("Profile"));
DVAL.SetDefaultColor(GlobalColor("Profile"));
WPOC.SetDefaultColor(GlobalColor("Profile"));
WVAH.SetDefaultColor(GlobalColor("Profile"));
WVAL.SetDefaultColor(GlobalColor("Profile"));
MPOC.SetDefaultColor(GlobalColor("Profile"));
MVAH.SetDefaultColor(GlobalColor("Profile"));
MVAL.SetDefaultColor(GlobalColor("Profile"));
NakedDPOC.SetDefaultColor(GlobalColor("Profile"));
NakedDVAH.SetDefaultColor(GlobalColor("Profile"));
NakedDVAL.SetDefaultColor(GlobalColor("Profile"));
NakedWPOC.SetDefaultColor(GlobalColor("Profile"));
NakedWVAH.SetDefaultColor(GlobalColor("Profile"));
NakedWVAL.SetDefaultColor(GlobalColor("Profile"));
NakedMPOC.SetDefaultColor(GlobalColor("Profile"));
NakedMVAH.SetDefaultColor(GlobalColor("Profile"));
NakedMVAL.SetDefaultColor(GlobalColor("Profile"));

PDH.SetLineWeight(majorLineWeight);
PDL.SetLineWeight(majorLineWeight);
PWH.SetLineWeight(majorLineWeight);
PWL.SetLineWeight(majorLineWeight);
PMH.SetLineWeight(majorLineWeight);
PML.SetLineWeight(majorLineWeight);
IBH.SetLineWeight(majorLineWeight);
IBL.SetLineWeight(majorLineWeight);

PDO.SetLineWeight(levelLineWeight);
PDC.SetLineWeight(levelLineWeight);
PDM.SetLineWeight(levelLineWeight);
CDO.SetLineWeight(levelLineWeight);
CDH.SetLineWeight(levelLineWeight);
CDL.SetLineWeight(levelLineWeight);
PWM.SetLineWeight(levelLineWeight);
PWO.SetLineWeight(levelLineWeight);
CWO.SetLineWeight(levelLineWeight);
PMM.SetLineWeight(levelLineWeight);
PMO.SetLineWeight(levelLineWeight);
CMO.SetLineWeight(levelLineWeight);
CQO.SetLineWeight(levelLineWeight);
PQH.SetLineWeight(levelLineWeight);
PQL.SetLineWeight(levelLineWeight);
PQM.SetLineWeight(levelLineWeight);
CYO.SetLineWeight(levelLineWeight);
PYH.SetLineWeight(levelLineWeight);
PYL.SetLineWeight(levelLineWeight);
PYM.SetLineWeight(levelLineWeight);
ONO.SetLineWeight(levelLineWeight);
ONH.SetLineWeight(levelLineWeight);
ONL.SetLineWeight(levelLineWeight);
ONM.SetLineWeight(levelLineWeight);
RTHO.SetLineWeight(levelLineWeight);
RTHH.SetLineWeight(levelLineWeight);
RTHL.SetLineWeight(levelLineWeight);
RTHM.SetLineWeight(levelLineWeight);
ORH.SetLineWeight(levelLineWeight);
ORL.SetLineWeight(levelLineWeight);
ORM.SetLineWeight(levelLineWeight);
ORExtHigh.SetLineWeight(levelLineWeight);
ORExtLow.SetLineWeight(levelLineWeight);
IBM.SetLineWeight(levelLineWeight);
IBH05.SetLineWeight(levelLineWeight);
IBH10.SetLineWeight(levelLineWeight);
IBH15.SetLineWeight(levelLineWeight);
IBH20.SetLineWeight(levelLineWeight);
IBL05.SetLineWeight(levelLineWeight);
IBL10.SetLineWeight(levelLineWeight);
IBL15.SetLineWeight(levelLineWeight);
IBL20.SetLineWeight(levelLineWeight);

VWAPCurrent.SetLineWeight(majorLineWeight);
VWAPPrevious.SetLineWeight(levelLineWeight);
VWAPWeekly.SetLineWeight(majorLineWeight);
VWAPMonthly.SetLineWeight(majorLineWeight);

DPOC.SetLineWeight(profileLineWeight);
DVAH.SetLineWeight(profileLineWeight);
DVAL.SetLineWeight(profileLineWeight);
WPOC.SetLineWeight(profileLineWeight);
WVAH.SetLineWeight(profileLineWeight);
WVAL.SetLineWeight(profileLineWeight);
MPOC.SetLineWeight(profileLineWeight);
MVAH.SetLineWeight(profileLineWeight);
MVAL.SetLineWeight(profileLineWeight);
NakedDPOC.SetLineWeight(profileLineWeight);
NakedDVAH.SetLineWeight(profileLineWeight);
NakedDVAL.SetLineWeight(profileLineWeight);
NakedWPOC.SetLineWeight(profileLineWeight);
NakedWVAH.SetLineWeight(profileLineWeight);
NakedWVAL.SetLineWeight(profileLineWeight);
NakedMPOC.SetLineWeight(profileLineWeight);
NakedMVAH.SetLineWeight(profileLineWeight);
NakedMVAL.SetLineWeight(profileLineWeight);

GapTop.SetStyle(Curve.SHORT_DASH);
GapBottom.SetStyle(Curve.SHORT_DASH);
GapMid.SetStyle(Curve.POINTS);
VWAPPrevious.SetStyle(Curve.SHORT_DASH);
VWAPWeekly.SetStyle(Curve.LONG_DASH);
VWAPMonthly.SetStyle(Curve.FIRM);
DPOC.SetStyle(Curve.SHORT_DASH);
DVAH.SetStyle(Curve.SHORT_DASH);
DVAL.SetStyle(Curve.SHORT_DASH);
WPOC.SetStyle(Curve.LONG_DASH);
WVAH.SetStyle(Curve.LONG_DASH);
WVAL.SetStyle(Curve.LONG_DASH);
MPOC.SetStyle(Curve.POINTS);
MVAH.SetStyle(Curve.POINTS);
MVAL.SetStyle(Curve.POINTS);
NakedDPOC.SetStyle(Curve.SHORT_DASH);
NakedDVAH.SetStyle(Curve.SHORT_DASH);
NakedDVAL.SetStyle(Curve.SHORT_DASH);
NakedWPOC.SetStyle(Curve.LONG_DASH);
NakedWVAH.SetStyle(Curve.LONG_DASH);
NakedWVAL.SetStyle(Curve.LONG_DASH);
NakedMPOC.SetStyle(Curve.POINTS);
NakedMVAH.SetStyle(Curve.POINTS);
NakedMVAL.SetStyle(Curve.POINTS);

# ================================================================
# LABEL ENGINE
# ================================================================

def bubbleBar = labelBubbles and lastBar;
def labelOffset = tickSize * labelSpacingTicks;
def labelPriceOnly = labelMode == labelMode.Price;
def labelNameOnly = labelMode == labelMode.Name;

AddLabel(showLabels, "S_LEVELS", Color.DARK_GRAY);
AddLabel(showLabels and showDailyLevels,
    "D: H " + Round(previousDayHigh, 2) + " L " + Round(previousDayLow, 2),
    GlobalColor("Daily"));
AddLabel(showLabels and showWeeklyLevels,
    "W: H " + Round(previousWeekHigh, 2) + " L " + Round(previousWeekLow, 2),
    GlobalColor("Weekly"));
AddLabel(showLabels and showMonthlyLevels,
    "M: H " + Round(previousMonthHigh, 2) + " L " + Round(previousMonthLow, 2),
    GlobalColor("Monthly"));
AddLabel(showLabels and showGapLevels and gapIsOpen,
    "GAP " + Round(activeGapBottom, 2) + " - " + Round(activeGapTop, 2),
    GlobalColor("Gap"));
AddLabel(showLabels and showVWAPLevels,
    "VWAP " + Round(currentSessionVWAP, 2),
    GlobalColor("VWAP"));

# Which detail tier a bubble belongs to. Minimal bubbles always draw (when
# their level is shown); Standard/Full add progressively more.
def tierStd = bubbleDetail == bubbleDetail.Standard or bubbleDetail == bubbleDetail.Full;
def tierFull = bubbleDetail == bubbleDetail.Full;

# Each bubble fires only on the right edge (bubbleBar), only when its own
# level is actually being drawn, and only at/above its detail tier. The text
# honors labelMode: name only, price only, or "NAME price".

# ---- Daily ----
AddChartBubble(bubbleBar and showLabels and showDailyLevels and showPreviousDailyHigh, previousDayHigh,
    if labelPriceOnly then "" + Round(previousDayHigh, 2) else if labelNameOnly then "PDH" else "PDH " + Round(previousDayHigh, 2),
    GlobalColor("Resistance"), yes);
AddChartBubble(bubbleBar and showLabels and showDailyLevels and showPreviousDailyLow, previousDayLow,
    if labelPriceOnly then "" + Round(previousDayLow, 2) else if labelNameOnly then "PDL" else "PDL " + Round(previousDayLow, 2),
    GlobalColor("Support"), no);
AddChartBubble(bubbleBar and showLabels and showDailyLevels and showPreviousDailyOpen and tierStd, previousDayOpen,
    if labelPriceOnly then "" + Round(previousDayOpen, 2) else if labelNameOnly then "PDO" else "PDO " + Round(previousDayOpen, 2),
    GlobalColor("Daily"), yes);
AddChartBubble(bubbleBar and showLabels and showDailyLevels and showPreviousDailyClose and tierStd, previousDayClose,
    if labelPriceOnly then "" + Round(previousDayClose, 2) else if labelNameOnly then "PDC" else "PDC " + Round(previousDayClose, 2),
    GlobalColor("Daily"), yes);
AddChartBubble(bubbleBar and showLabels and showDailyLevels and showPreviousDailyMid and tierStd, previousDayMid,
    if labelPriceOnly then "" + Round(previousDayMid, 2) else if labelNameOnly then "PDM" else "PDM " + Round(previousDayMid, 2),
    GlobalColor("Daily"), yes);
AddChartBubble(bubbleBar and showLabels and showDailyLevels and showCurrentDailyOpen and tierStd, currentDayOpen,
    if labelPriceOnly then "" + Round(currentDayOpen, 2) else if labelNameOnly then "CDO" else "CDO " + Round(currentDayOpen, 2),
    GlobalColor("Daily"), yes);
AddChartBubble(bubbleBar and showLabels and showDailyLevels and showCurrentDailyHigh and tierStd, currentDayHigh,
    if labelPriceOnly then "" + Round(currentDayHigh, 2) else if labelNameOnly then "CDH" else "CDH " + Round(currentDayHigh, 2),
    GlobalColor("Resistance"), yes);
AddChartBubble(bubbleBar and showLabels and showDailyLevels and showCurrentDailyLow and tierStd, currentDayLow,
    if labelPriceOnly then "" + Round(currentDayLow, 2) else if labelNameOnly then "CDL" else "CDL " + Round(currentDayLow, 2),
    GlobalColor("Support"), no);

# ---- Weekly ----
AddChartBubble(bubbleBar and showLabels and showWeeklyLevels and showPreviousWeeklyHigh, previousWeekHigh,
    if labelPriceOnly then "" + Round(previousWeekHigh, 2) else if labelNameOnly then "PWH" else "PWH " + Round(previousWeekHigh, 2),
    GlobalColor("Weekly"), yes);
AddChartBubble(bubbleBar and showLabels and showWeeklyLevels and showPreviousWeeklyLow, previousWeekLow,
    if labelPriceOnly then "" + Round(previousWeekLow, 2) else if labelNameOnly then "PWL" else "PWL " + Round(previousWeekLow, 2),
    GlobalColor("Weekly"), no);
AddChartBubble(bubbleBar and showLabels and showWeeklyLevels and showPreviousWeeklyMid and tierStd, previousWeekMid,
    if labelPriceOnly then "" + Round(previousWeekMid, 2) else if labelNameOnly then "PWM" else "PWM " + Round(previousWeekMid, 2),
    GlobalColor("Weekly"), yes);
AddChartBubble(bubbleBar and showLabels and showWeeklyLevels and showPreviousWeeklyOpen and tierStd, previousWeekOpen,
    if labelPriceOnly then "" + Round(previousWeekOpen, 2) else if labelNameOnly then "PWO" else "PWO " + Round(previousWeekOpen, 2),
    GlobalColor("Weekly"), yes);
AddChartBubble(bubbleBar and showLabels and showWeeklyLevels and showCurrentWeeklyOpen and tierStd, currentWeekOpen,
    if labelPriceOnly then "" + Round(currentWeekOpen, 2) else if labelNameOnly then "CWO" else "CWO " + Round(currentWeekOpen, 2),
    GlobalColor("Weekly"), yes);

# ---- Monthly ----
AddChartBubble(bubbleBar and showLabels and showMonthlyLevels and showPreviousMonthlyHigh, previousMonthHigh,
    if labelPriceOnly then "" + Round(previousMonthHigh, 2) else if labelNameOnly then "PMH" else "PMH " + Round(previousMonthHigh, 2),
    GlobalColor("Monthly"), yes);
AddChartBubble(bubbleBar and showLabels and showMonthlyLevels and showPreviousMonthlyLow, previousMonthLow,
    if labelPriceOnly then "" + Round(previousMonthLow, 2) else if labelNameOnly then "PML" else "PML " + Round(previousMonthLow, 2),
    GlobalColor("Monthly"), no);
AddChartBubble(bubbleBar and showLabels and showMonthlyLevels and showPreviousMonthlyMid and tierStd, previousMonthMid,
    if labelPriceOnly then "" + Round(previousMonthMid, 2) else if labelNameOnly then "PMM" else "PMM " + Round(previousMonthMid, 2),
    GlobalColor("Monthly"), yes);
AddChartBubble(bubbleBar and showLabels and showMonthlyLevels and showPreviousMonthlyOpen and tierStd, previousMonthOpen,
    if labelPriceOnly then "" + Round(previousMonthOpen, 2) else if labelNameOnly then "PMO" else "PMO " + Round(previousMonthOpen, 2),
    GlobalColor("Monthly"), yes);
AddChartBubble(bubbleBar and showLabels and showMonthlyLevels and showCurrentMonthlyOpen and tierStd, currentMonthOpen,
    if labelPriceOnly then "" + Round(currentMonthOpen, 2) else if labelNameOnly then "CMO" else "CMO " + Round(currentMonthOpen, 2),
    GlobalColor("Monthly"), yes);

# ---- Quarterly (Full) ----
AddChartBubble(bubbleBar and showLabels and showQuarterlyLevels and showCurrentQuarterOpen and tierFull, currentQuarterOpenValue,
    if labelPriceOnly then "" + Round(currentQuarterOpenValue, 2) else if labelNameOnly then "CQO" else "CQO " + Round(currentQuarterOpenValue, 2),
    GlobalColor("Quarterly"), yes);
AddChartBubble(bubbleBar and showLabels and showQuarterlyLevels and showPreviousQuarterHigh and tierFull, previousQuarterHigh,
    if labelPriceOnly then "" + Round(previousQuarterHigh, 2) else if labelNameOnly then "PQH" else "PQH " + Round(previousQuarterHigh, 2),
    GlobalColor("Quarterly"), yes);
AddChartBubble(bubbleBar and showLabels and showQuarterlyLevels and showPreviousQuarterLow and tierFull, previousQuarterLow,
    if labelPriceOnly then "" + Round(previousQuarterLow, 2) else if labelNameOnly then "PQL" else "PQL " + Round(previousQuarterLow, 2),
    GlobalColor("Quarterly"), no);
AddChartBubble(bubbleBar and showLabels and showQuarterlyLevels and showPreviousQuarterMid and tierFull, previousQuarterMid,
    if labelPriceOnly then "" + Round(previousQuarterMid, 2) else if labelNameOnly then "PQM" else "PQM " + Round(previousQuarterMid, 2),
    GlobalColor("Quarterly"), yes);

# ---- Yearly (Full) ----
AddChartBubble(bubbleBar and showLabels and showYearlyLevels and showCurrentYearOpen and tierFull, currentYearOpenValue,
    if labelPriceOnly then "" + Round(currentYearOpenValue, 2) else if labelNameOnly then "CYO" else "CYO " + Round(currentYearOpenValue, 2),
    GlobalColor("Yearly"), yes);
AddChartBubble(bubbleBar and showLabels and showYearlyLevels and showPreviousYearHigh and tierFull, previousYearHigh,
    if labelPriceOnly then "" + Round(previousYearHigh, 2) else if labelNameOnly then "PYH" else "PYH " + Round(previousYearHigh, 2),
    GlobalColor("Yearly"), yes);
AddChartBubble(bubbleBar and showLabels and showYearlyLevels and showPreviousYearLow and tierFull, previousYearLow,
    if labelPriceOnly then "" + Round(previousYearLow, 2) else if labelNameOnly then "PYL" else "PYL " + Round(previousYearLow, 2),
    GlobalColor("Yearly"), no);
AddChartBubble(bubbleBar and showLabels and showYearlyLevels and showPreviousYearMid and tierFull, previousYearMid,
    if labelPriceOnly then "" + Round(previousYearMid, 2) else if labelNameOnly then "PYM" else "PYM " + Round(previousYearMid, 2),
    GlobalColor("Yearly"), yes);

# ---- Overnight (Standard) ----
AddChartBubble(bubbleBar and showLabels and showOvernightLevels and showOvernightHigh and tierStd, overnightHigh,
    if labelPriceOnly then "" + Round(overnightHigh, 2) else if labelNameOnly then "ONH" else "ONH " + Round(overnightHigh, 2),
    GlobalColor("Overnight"), yes);
AddChartBubble(bubbleBar and showLabels and showOvernightLevels and showOvernightLow and tierStd, overnightLow,
    if labelPriceOnly then "" + Round(overnightLow, 2) else if labelNameOnly then "ONL" else "ONL " + Round(overnightLow, 2),
    GlobalColor("Overnight"), no);
AddChartBubble(bubbleBar and showLabels and showOvernightLevels and showOvernightOpen and tierStd, overnightOpen,
    if labelPriceOnly then "" + Round(overnightOpen, 2) else if labelNameOnly then "ONO" else "ONO " + Round(overnightOpen, 2),
    GlobalColor("Overnight"), yes);
AddChartBubble(bubbleBar and showLabels and showOvernightLevels and showOvernightMid and tierStd, overnightMid,
    if labelPriceOnly then "" + Round(overnightMid, 2) else if labelNameOnly then "ONM" else "ONM " + Round(overnightMid, 2),
    GlobalColor("Overnight"), yes);

# ---- RTH (Standard) ----
AddChartBubble(bubbleBar and showLabels and showRTHLevels and showRTHHigh and tierStd, rthHigh,
    if labelPriceOnly then "" + Round(rthHigh, 2) else if labelNameOnly then "RTHH" else "RTHH " + Round(rthHigh, 2),
    GlobalColor("RTH"), yes);
AddChartBubble(bubbleBar and showLabels and showRTHLevels and showRTHLow and tierStd, rthLow,
    if labelPriceOnly then "" + Round(rthLow, 2) else if labelNameOnly then "RTHL" else "RTHL " + Round(rthLow, 2),
    GlobalColor("RTH"), no);
AddChartBubble(bubbleBar and showLabels and showRTHLevels and showRTHOpen and tierStd, rthOpen,
    if labelPriceOnly then "" + Round(rthOpen, 2) else if labelNameOnly then "RTHO" else "RTHO " + Round(rthOpen, 2),
    GlobalColor("RTH"), yes);
AddChartBubble(bubbleBar and showLabels and showRTHLevels and showRTHMid and tierStd, rthMid,
    if labelPriceOnly then "" + Round(rthMid, 2) else if labelNameOnly then "RTHM" else "RTHM " + Round(rthMid, 2),
    GlobalColor("RTH"), yes);

# ---- Gap (Minimal) ----
AddChartBubble(bubbleBar and showLabels and plotGap, activeGapMid,
    if labelPriceOnly then "" + Round(activeGapBottom, 2) + "-" + Round(activeGapTop, 2) else if labelNameOnly then "GAP" else "GAP " + Round(activeGapBottom, 2) + "-" + Round(activeGapTop, 2),
    GlobalColor("Gap"), yes);

# ---- Opening Range (Standard / extensions Full) ----
AddChartBubble(bubbleBar and showLabels and showOpeningRange and openingRangeReady and tierStd, openingRangeHigh,
    if labelPriceOnly then "" + Round(openingRangeHigh, 2) else if labelNameOnly then "ORH" else "ORH " + Round(openingRangeHigh, 2),
    GlobalColor("OpeningRange"), yes);
AddChartBubble(bubbleBar and showLabels and showOpeningRange and openingRangeReady and tierStd, openingRangeLow,
    if labelPriceOnly then "" + Round(openingRangeLow, 2) else if labelNameOnly then "ORL" else "ORL " + Round(openingRangeLow, 2),
    GlobalColor("OpeningRange"), no);
AddChartBubble(bubbleBar and showLabels and showOpeningRange and showOpeningRangeMid and openingRangeReady and tierStd, openingRangeMid,
    if labelPriceOnly then "" + Round(openingRangeMid, 2) else if labelNameOnly then "ORM" else "ORM " + Round(openingRangeMid, 2),
    GlobalColor("OpeningRange"), yes);
AddChartBubble(bubbleBar and showLabels and showOpeningRange and showOpeningRangeExtensions and openingRangeReady and tierFull, openingRangeUpperExtension,
    if labelPriceOnly then "" + Round(openingRangeUpperExtension, 2) else if labelNameOnly then "OR+" else "OR+ " + Round(openingRangeUpperExtension, 2),
    GlobalColor("OpeningRange"), yes);
AddChartBubble(bubbleBar and showLabels and showOpeningRange and showOpeningRangeExtensions and openingRangeReady and tierFull, openingRangeLowerExtension,
    if labelPriceOnly then "" + Round(openingRangeLowerExtension, 2) else if labelNameOnly then "OR-" else "OR- " + Round(openingRangeLowerExtension, 2),
    GlobalColor("OpeningRange"), no);

# ---- Initial Balance (Minimal H/L, mid Standard, extensions Full) ----
AddChartBubble(bubbleBar and showLabels and showInitialBalance and initialBalanceReady, initialBalanceHigh,
    if labelPriceOnly then "" + Round(initialBalanceHigh, 2) else if labelNameOnly then "IBH" else "IBH " + Round(initialBalanceHigh, 2),
    GlobalColor("InitialBalance"), yes);
AddChartBubble(bubbleBar and showLabels and showInitialBalance and initialBalanceReady, initialBalanceLow,
    if labelPriceOnly then "" + Round(initialBalanceLow, 2) else if labelNameOnly then "IBL" else "IBL " + Round(initialBalanceLow, 2),
    GlobalColor("InitialBalance"), no);
AddChartBubble(bubbleBar and showLabels and showInitialBalance and showInitialBalanceMid and initialBalanceReady and tierStd, initialBalanceMid,
    if labelPriceOnly then "" + Round(initialBalanceMid, 2) else if labelNameOnly then "IBM" else "IBM " + Round(initialBalanceMid, 2),
    GlobalColor("InitialBalance"), yes);

# ---- VWAP (current Standard, others Full) ----
AddChartBubble(bubbleBar and showLabels and showVWAPLevels and showCurrentVWAP and tierStd, currentSessionVWAP,
    if labelPriceOnly then "" + Round(currentSessionVWAP, 2) else if labelNameOnly then "VWAP" else "VWAP " + Round(currentSessionVWAP, 2),
    GlobalColor("VWAP"), yes);
AddChartBubble(bubbleBar and showLabels and showVWAPLevels and showWeeklyVWAP and tierFull, weeklyVWAP,
    if labelPriceOnly then "" + Round(weeklyVWAP, 2) else if labelNameOnly then "wVWAP" else "wVWAP " + Round(weeklyVWAP, 2),
    GlobalColor("VWAP"), yes);
AddChartBubble(bubbleBar and showLabels and showVWAPLevels and showMonthlyVWAP and tierFull, monthlyVWAP,
    if labelPriceOnly then "" + Round(monthlyVWAP, 2) else if labelNameOnly then "mVWAP" else "mVWAP " + Round(monthlyVWAP, 2),
    GlobalColor("VWAP"), yes);

# ---- Daily volume profile (Standard) ----
AddChartBubble(bubbleBar and showLabels and showVolumeProfiles and showDailyProfileLevels and tierStd, previousDailyPOC,
    if labelPriceOnly then "" + Round(previousDailyPOC, 2) else if labelNameOnly then "dPOC" else "dPOC " + Round(previousDailyPOC, 2),
    GlobalColor("Profile"), yes);
AddChartBubble(bubbleBar and showLabels and showVolumeProfiles and showDailyProfileLevels and tierStd, previousDailyVAH,
    if labelPriceOnly then "" + Round(previousDailyVAH, 2) else if labelNameOnly then "dVAH" else "dVAH " + Round(previousDailyVAH, 2),
    GlobalColor("Profile"), yes);
AddChartBubble(bubbleBar and showLabels and showVolumeProfiles and showDailyProfileLevels and tierStd, previousDailyVAL,
    if labelPriceOnly then "" + Round(previousDailyVAL, 2) else if labelNameOnly then "dVAL" else "dVAL " + Round(previousDailyVAL, 2),
    GlobalColor("Profile"), no);

# ---- Weekly / Monthly volume profile (Full) ----
AddChartBubble(bubbleBar and showLabels and showVolumeProfiles and showWeeklyProfileLevels and tierFull, previousWeeklyPOC,
    if labelPriceOnly then "" + Round(previousWeeklyPOC, 2) else if labelNameOnly then "wPOC" else "wPOC " + Round(previousWeeklyPOC, 2),
    GlobalColor("Profile"), yes);
AddChartBubble(bubbleBar and showLabels and showVolumeProfiles and showWeeklyProfileLevels and tierFull, previousWeeklyVAH,
    if labelPriceOnly then "" + Round(previousWeeklyVAH, 2) else if labelNameOnly then "wVAH" else "wVAH " + Round(previousWeeklyVAH, 2),
    GlobalColor("Profile"), yes);
AddChartBubble(bubbleBar and showLabels and showVolumeProfiles and showWeeklyProfileLevels and tierFull, previousWeeklyVAL,
    if labelPriceOnly then "" + Round(previousWeeklyVAL, 2) else if labelNameOnly then "wVAL" else "wVAL " + Round(previousWeeklyVAL, 2),
    GlobalColor("Profile"), no);
AddChartBubble(bubbleBar and showLabels and showVolumeProfiles and showMonthlyProfileLevels and tierFull, previousMonthlyPOC,
    if labelPriceOnly then "" + Round(previousMonthlyPOC, 2) else if labelNameOnly then "mPOC" else "mPOC " + Round(previousMonthlyPOC, 2),
    GlobalColor("Profile"), yes);
AddChartBubble(bubbleBar and showLabels and showVolumeProfiles and showMonthlyProfileLevels and tierFull, previousMonthlyVAH,
    if labelPriceOnly then "" + Round(previousMonthlyVAH, 2) else if labelNameOnly then "mVAH" else "mVAH " + Round(previousMonthlyVAH, 2),
    GlobalColor("Profile"), yes);
AddChartBubble(bubbleBar and showLabels and showVolumeProfiles and showMonthlyProfileLevels and tierFull, previousMonthlyVAL,
    if labelPriceOnly then "" + Round(previousMonthlyVAL, 2) else if labelNameOnly then "mVAL" else "mVAL " + Round(previousMonthlyVAL, 2),
    GlobalColor("Profile"), no);

# ================================================================
# ALERT ENGINE
# ================================================================

def touchedPreviousDailyHigh = FirstTouch(previousDayHigh, showDailyLevels and showPreviousDailyHigh);
def touchedPreviousDailyLow = FirstTouch(previousDayLow, showDailyLevels and showPreviousDailyLow);
def touchedPreviousWeeklyHigh = FirstTouch(previousWeekHigh, showWeeklyLevels and showPreviousWeeklyHigh);
def touchedPreviousWeeklyLow = FirstTouch(previousWeekLow, showWeeklyLevels and showPreviousWeeklyLow);
def touchedPreviousMonthlyHigh = FirstTouch(previousMonthHigh, showMonthlyLevels and showPreviousMonthlyHigh);
def touchedPreviousMonthlyLow = FirstTouch(previousMonthLow, showMonthlyLevels and showPreviousMonthlyLow);
def touchedAnyProfile =
    FirstTouch(previousDailyPOC, showVolumeProfiles) or
    FirstTouch(previousDailyVAH, showVolumeProfiles) or
    FirstTouch(previousDailyVAL, showVolumeProfiles) or
    FirstTouch(previousWeeklyPOC, showVolumeProfiles) or
    FirstTouch(previousWeeklyVAH, showVolumeProfiles) or
    FirstTouch(previousWeeklyVAL, showVolumeProfiles) or
    FirstTouch(previousMonthlyPOC, showVolumeProfiles) or
    FirstTouch(previousMonthlyVAH, showVolumeProfiles) or
    FirstTouch(previousMonthlyVAL, showVolumeProfiles);
def touchedGap = plotGap and (FirstTouch(activeGapTop, yes) or FirstTouch(activeGapBottom, yes) or FirstTouch(activeGapMid, showGapMid));
def touchedInitialBalance = showInitialBalance and initialBalanceReady and (FirstTouch(initialBalanceHigh, yes) or FirstTouch(initialBalanceLow, yes));

Alert(enableAlerts and alertDailyHighLow and touchedPreviousDailyHigh and !touchedPreviousDailyHigh[1], "S_LEVELS: Previous Daily High touched", Alert.BAR, Sound.Ding);
Alert(enableAlerts and alertDailyHighLow and touchedPreviousDailyLow and !touchedPreviousDailyLow[1], "S_LEVELS: Previous Daily Low touched", Alert.BAR, Sound.Ding);
Alert(enableAlerts and alertWeeklyHighLow and touchedPreviousWeeklyHigh and !touchedPreviousWeeklyHigh[1], "S_LEVELS: Previous Weekly High touched", Alert.BAR, Sound.Bell);
Alert(enableAlerts and alertWeeklyHighLow and touchedPreviousWeeklyLow and !touchedPreviousWeeklyLow[1], "S_LEVELS: Previous Weekly Low touched", Alert.BAR, Sound.Bell);
Alert(enableAlerts and alertMonthlyHighLow and touchedPreviousMonthlyHigh and !touchedPreviousMonthlyHigh[1], "S_LEVELS: Previous Monthly High touched", Alert.BAR, Sound.Ring);
Alert(enableAlerts and alertMonthlyHighLow and touchedPreviousMonthlyLow and !touchedPreviousMonthlyLow[1], "S_LEVELS: Previous Monthly Low touched", Alert.BAR, Sound.Ring);
Alert(enableAlerts and alertProfileLevels and touchedAnyProfile and !touchedAnyProfile[1], "S_LEVELS: Profile level touched", Alert.BAR, Sound.Chimes);
Alert(enableAlerts and alertGapLevels and touchedGap and !touchedGap[1], "S_LEVELS: Gap level touched", Alert.BAR, Sound.Chimes);
Alert(enableAlerts and alertInitialBalance and touchedInitialBalance and !touchedInitialBalance[1], "S_LEVELS: Initial Balance level touched", Alert.BAR, Sound.Ding);
