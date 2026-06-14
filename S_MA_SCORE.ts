# ==========================================
# WATCHLIST COLUMN V1 (FIXED)
# ==========================================

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

# ==========================
# 1 HOUR
# ==========================
def c1h = close(period = AggregationPeriod.HOUR);

def ema1h_21 = ExpAverage(c1h, 21);
def sma1h_50 = Average(c1h, 50);

def bull1h =
    c1h > ema1h_21 and
    ema1h_21 > sma1h_50;

# ==========================
# DAILY
# ==========================
def cd = close(period = AggregationPeriod.DAY);

def emaD_21 = ExpAverage(cd, 21);
def smaD_50 = Average(cd, 50);
def smaD_200 = Average(cd, 200);

def bullD =
    cd > emaD_21 and
    emaD_21 > smaD_50 and
    smaD_50 > smaD_200;

# ==========================
# ATR
# ==========================
def atrNow = ATR(14);
def atrAvg = Average(atrNow, 20);

def atrExpanding = atrNow > atrAvg;

# ==========================
# VOLUME
# ==========================
def avgVol = Average(v5, 20);

def bullVol =
    c5 > o5 and
    v5 > avgVol;

# ==========================
# RS vs SPY
# ==========================
def stockROC = ((close / close[20]) - 1) * 100;

def spy = close("SPY");
def spyROC = ((spy / spy[20]) - 1) * 100;

def rsSpy = stockROC > spyROC;

# ==========================
# SCORE
# ==========================
def score =
    (if bull5 then 20 else 0) +
    (if bull1h then 25 else 0) +
    (if bullD then 25 else 0) +
    (if atrExpanding then 10 else 0) +
    (if bullVol then 10 else 0) +
    (if rsSpy then 10 else 0);

plot TrendScore = score;

TrendScore.AssignValueColor(
    if score >= 90 then Color.WHITE
    else if score >= 80 then Color.WHITE
    else if score >= 70 then Color.BLACK
    else if score >= 60 then Color.WHITE
    else Color.WHITE
);

AssignBackgroundColor(
    if score >= 90 then Color.DARK_GREEN
    else if score >= 80 then Color.GREEN
    else if score >= 70 then Color.YELLOW
    else if score >= 60 then Color.ORANGE
    else Color.RED
);