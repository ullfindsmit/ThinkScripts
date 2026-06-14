# 20 Day ATR & SMA Distance Labels (Multi-Timeframe / Daily Anchored)
#
# This ThinkScript displays daily-anchored metrics regardless of the chart interval you are viewing:
# 1. 20D ATR: The 20-Day ATR represented as a percentage of the current price (Default color: Green).
# 2. Today: The current day's percent change from the previous day's close (Default color: Dynamic Green/Red).
# 3. ATRs From 50SMA: The distance between the current price and the 50-Day SMA, normalized by the 20-Day ATR (Default color: Dynamic Green/Red).
#
# Author: Antigravity

declare upper;

# Inputs for periods
input atrLength = 20;
input smaLength = 50;

# Fetch Daily Prices
def dailyClose = close(period = AggregationPeriod.DAY);
def dailyHigh = high(period = AggregationPeriod.DAY);
def dailyLow = low(period = AggregationPeriod.DAY);

# Calculate Daily True Range & 20-Day ATR (Wilder's Average of True Range)
def tr = TrueRange(dailyHigh, dailyClose, dailyLow);
def dailyATRVal = WildersAverage(tr, atrLength);
def atrPct = (dailyATRVal / dailyClose) * 100;

# Calculate Today's Change % (Current day's price vs Previous Day's close)
def dailyClosePrev = dailyClose[1];
def todayPct = ((dailyClose - dailyClosePrev) / dailyClosePrev) * 100;

# Calculate 50-Day SMA and distance in terms of 20-Day ATRs
def dailySMAVal = Average(dailyClose, smaLength);
def distFromSMA = dailyClose - dailySMAVal;
def atrsFromSMA = distFromSMA / dailyATRVal;

# --- Label Styling Options ---
input atrLabelColor = {default "Green", "White", "Gray", "Red", "Yellow", "Cyan"};
input todayLabelColor = {default "Dynamic", "Gray", "White", "Green", "Red"};
input smaDistLabelColor = {default "Dynamic", "Gray", "White", "Green", "Red"};

# --- Display Labels ---
# Label 1: 20D ATR
AddLabel(yes, 
    "20D ATR: " + Round(atrPct, 2) + "%", 
    if atrLabelColor == atrLabelColor."Green" then Color.GREEN
    else if atrLabelColor == atrLabelColor."White" then Color.WHITE
    else if atrLabelColor == atrLabelColor."Gray" then Color.GRAY
    else if atrLabelColor == atrLabelColor."Red" then Color.RED
    else if atrLabelColor == atrLabelColor."Yellow" then Color.YELLOW
    else Color.CYAN
);

# Label 2: Today's Percent Change
AddLabel(yes, 
    "Today: " + (if todayPct >= 0 then "+" else "") + Round(todayPct, 2) + "%", 
    if todayLabelColor == todayLabelColor."Gray" then Color.LIGHT_GRAY
    else if todayLabelColor == todayLabelColor."Dynamic" then (if todayPct >= 0 then Color.GREEN else Color.RED)
    else if todayLabelColor == todayLabelColor."White" then Color.WHITE
    else if todayLabelColor == todayLabelColor."Green" then Color.GREEN
    else Color.RED
);

# Label 3: Number of ATRs From 50-Day SMA
AddLabel(yes, 
    "ATRs From " + smaLength + "SMA: " + Round(atrsFromSMA, 2) + "x", 
    if smaDistLabelColor == smaDistLabelColor."Gray" then Color.LIGHT_GRAY
    else if smaDistLabelColor == smaDistLabelColor."Dynamic" then (if atrsFromSMA >= 0 then Color.GREEN else Color.RED)
    else if smaDistLabelColor == smaDistLabelColor."White" then Color.WHITE
    else if smaDistLabelColor == smaDistLabelColor."Green" then Color.GREEN
    else Color.RED
);
