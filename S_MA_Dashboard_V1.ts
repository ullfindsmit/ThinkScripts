declare upper;

input showDistances = yes;

# =========================
# 5 MIN
# =========================
def c5 = close(period = AggregationPeriod.FIVE_MIN);
def o5 = open(period = AggregationPeriod.FIVE_MIN);
def v5 = volume(period = AggregationPeriod.FIVE_MIN);

def ema5_9 = ExpAverage(c5, 9);
def ema5_20 = ExpAverage(c5, 20);
def vwapDay = VWAP();

def bull5 =
    c5 > ema5_9 and
    ema5_9 > ema5_20 and
    ema5_20 > vwapDay;

def bear5 =
    c5 < ema5_9 and
    ema5_9 < ema5_20 and
    ema5_20 < vwapDay;

# =========================
# 1 HOUR
# =========================
def c1h = close(period = AggregationPeriod.HOUR);

def ema1h_21 = ExpAverage(c1h, 21);
def sma1h_50 = Average(c1h, 50);

def bull1h =
    c1h > ema1h_21 and
    ema1h_21 > sma1h_50;

def bear1h =
    c1h < ema1h_21 and
    ema1h_21 < sma1h_50;

# =========================
# DAILY
# =========================
def cd = close(period = AggregationPeriod.DAY);

def emaD_21 = ExpAverage(cd, 21);
def smaD_50 = Average(cd, 50);
def smaD_200 = Average(cd, 200);

def bullD =
    cd > emaD_21 and
    emaD_21 > smaD_50 and
    smaD_50 > smaD_200;

def bearD =
    cd < emaD_21 and
    emaD_21 < smaD_50 and
    smaD_50 < smaD_200;

# =========================
# WEEKLY
# =========================
def cw = close(period = AggregationPeriod.WEEK);

def emaW_10 = ExpAverage(cw, 10);
def emaW_21 = ExpAverage(cw, 21);
def smaW_50 = Average(cw, 50);

def bullW =
    cw > emaW_10 and
    emaW_10 > emaW_21 and
    emaW_21 > smaW_50;

def bearW =
    cw < emaW_10 and
    emaW_10 < emaW_21 and
    emaW_21 < smaW_50;

# =========================
# ATR
# =========================
def atrNow = ATR(14);
def atrAvg = Average(atrNow, 20);

def atrExpanding = atrNow > atrAvg;

# =========================
# VOLUME
# =========================
def avgVol = Average(v5, 20);

def bullVol =
    c5 > o5 and
    v5 > avgVol;

def bearVol =
    c5 < o5 and
    v5 > avgVol;

def volConfirmed = bullVol or bearVol;

# =========================
# RELATIVE STRENGTH
# =========================
def stockROC = ((close / close[20]) - 1) * 100;

def spy = close("SPY");
def qqq = close("QQQ");

def spyROC = ((spy / spy[20]) - 1) * 100;
def qqqROC = ((qqq / qqq[20]) - 1) * 100;

def rsSpy = stockROC > spyROC;
def rsQqq = stockROC > qqqROC;

# =========================
# SQUEEZE (1H)
# =========================
def atr1h = ATR(length = 20);

def bbMid = Average(c1h, 20);
def bbDev = StDev(c1h, 20);

def bbUpper = bbMid + (2 * bbDev);
def bbLower = bbMid - (2 * bbDev);

def kcUpper = bbMid + (1.5 * atr1h);
def kcLower = bbMid - (1.5 * atr1h);

def squeezeOn =
    bbLower > kcLower and
    bbUpper < kcUpper;

def squeezeFiring =
    squeezeOn[1] and !squeezeOn;

# =========================
# SCORE
# =========================
def score =
    (if bull5 then 10 else 0) +
    (if bull1h then 15 else 0) +
    (if bullD then 20 else 0) +
    (if bullW then 20 else 0) +
    (if atrExpanding then 10 else 0) +
    (if volConfirmed then 10 else 0) +
    (if rsSpy then 5 else 0) +
    (if rsQqq then 5 else 0) +
    (if squeezeFiring then 5 else 0);

# =========================
# LABELS
# =========================
AddLabel(
    yes,
    "SETUP " + score +
    " " +
    (if score >= 90 then "A+"
     else if score >= 80 then "A"
     else if score >= 70 then "B"
     else if score >= 60 then "C"
     else "WEAK"),
    if score >= 80 then Color.GREEN
    else if score >= 60 then Color.YELLOW
    else Color.RED
);

AddLabel(yes, "5M",
    if bull5 then Color.GREEN
    else if bear5 then Color.RED
    else Color.YELLOW);

AddLabel(yes, "1H",
    if bull1h then Color.GREEN
    else if bear1h then Color.RED
    else Color.YELLOW);

AddLabel(yes, "DAY",
    if bullD then Color.GREEN
    else if bearD then Color.RED
    else Color.YELLOW);

AddLabel(yes, "WEEK",
    if bullW then Color.GREEN
    else if bearW then Color.RED
    else Color.YELLOW);

AddLabel(yes, "ATR",
    if atrExpanding then Color.GREEN else Color.RED);

AddLabel(yes, "VOL",
    if volConfirmed then Color.GREEN else Color.RED);

AddLabel(yes, "RS SPY",
    if rsSpy then Color.GREEN else Color.RED);

AddLabel(yes, "RS QQQ",
    if rsQqq then Color.GREEN else Color.RED);

AddLabel(
    yes,
    if squeezeOn then "SQ ON"
    else if squeezeFiring then "SQ FIRE"
    else "SQ OFF",
    if squeezeFiring then Color.GREEN
    else if squeezeOn then Color.YELLOW
    else Color.GRAY
);

# =========================
# DISTANCES
# =========================
def dist5 = ((c5 - ema5_20) / ema5_20) * 100;
def dist1h = ((c1h - sma1h_50) / sma1h_50) * 100;
def distD = ((cd - smaD_50) / smaD_50) * 100;
def distW = ((cw - emaW_21) / emaW_21) * 100;

AddLabel(showDistances, "5M " + Round(dist5, 1) + "%", Color.CYAN);
AddLabel(showDistances, "1H " + Round(dist1h, 1) + "%", Color.CYAN);
AddLabel(showDistances, "D " + Round(distD, 1) + "%", Color.CYAN);
AddLabel(showDistances, "W " + Round(distW, 1) + "%", Color.CYAN);

plot spacer = Double.NaN;