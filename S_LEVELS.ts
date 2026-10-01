declare upper;

def isLastBar = BarNumber() == HighestAll(BarNumber());
def isFirstBar = BarNumber() == 1;

# 9 EMA
def ema9Val = ExpAverage(close, 9);
plot EMA9Level = HighestAll(if isLastBar then ema9Val else Double.NaN);
EMA9Level.SetDefaultColor(Color.GREEN);
EMA9Level.SetLineWeight(1);
EMA9Level.Hide();
AddChartBubble(
    isFirstBar,
    EMA9Level,
    "9 EMA: " + AsPrice(EMA9Level),
    Color.GREEN,
    yes
);

# 21 EMA
def ema21Val = ExpAverage(close, 21);
plot EMA21Level = HighestAll(if isLastBar then ema21Val else Double.NaN);
EMA21Level.SetDefaultColor(Color.YELLOW);
EMA21Level.SetLineWeight(1);
EMA21Level.Hide();
AddChartBubble(
    isFirstBar,
    EMA21Level,
    "21 EMA: " + AsPrice(EMA21Level),
    Color.YELLOW,
    yes
);

# 50 SMA
def sma50Val = Average(close, 50);
plot SMA50Level = HighestAll(if isLastBar then sma50Val else Double.NaN);
SMA50Level.SetDefaultColor(Color.YELLOW);
SMA50Level.SetLineWeight(3);
SMA50Level.Hide();
AddChartBubble(
    isFirstBar,
    SMA50Level,
    "50 SMA: " + AsPrice(SMA50Level),
    Color.YELLOW,
    yes
);

# 200 SMA
def sma200Val = Average(close, 200);
plot SMA200Level = HighestAll(if isLastBar then sma200Val else Double.NaN);
SMA200Level.SetDefaultColor(Color.RED);
SMA200Level.SetLineWeight(3);
SMA200Level.Hide();
AddChartBubble(
    isFirstBar,
    SMA200Level,
    "200 SMA: " + AsPrice(SMA200Level),
    Color.RED,
    yes
);

