declare upper;

# ==========================================
# EXECUTION OVERLAY V1
# ==========================================

input showSqueezeDots = yes;
input showFullAlignmentDots = yes;

# ==========================================
# 5 MIN
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

def bear5 =
    c5 < ema5_9 and
    ema5_9 < ema5_20 and
    ema5_20 < vwapDay;

# ==========================================
# 1 HOUR
# ==========================================
def c1h = close(period = AggregationPeriod.HOUR);

def ema1h_21 = ExpAverage(c1h, 21);
def sma1h_50 = Average(c1h, 50);

def bull1h =
    c1h > ema1h_21 and
    ema1h_21 > sma1h_50;

def bear1h =
    c1h < ema1h_21 and
    ema1h_21 < sma1h_50;

# ==========================================
# DAILY
# ==========================================
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

# ==========================================
# WEEKLY
# ==========================================
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

# ==========================================
# ATR
# ==========================================
def atrNow = ATR(14);
def atrAvg = Average(atrNow, 20);

def atrExpanding = atrNow > atrAvg;

# ==========================================
# VOLUME
# ==========================================
def avgVol = Average(v5, 20);

def bullVol =
    c5 > o5 and
    v5 > avgVol;

def bearVol =
    c5 < o5 and
    v5 > avgVol;

# ==========================================
# RELATIVE STRENGTH
# ==========================================
def stockROC = ((close / close[20]) - 1) * 100;

def spy = close("SPY");
def qqq = close("QQQ");

def spyROC = ((spy / spy[20]) - 1) * 100;
def qqqROC = ((qqq / qqq[20]) - 1) * 100;

def rsBull = stockROC > spyROC and stockROC > qqqROC;
def rsBear = stockROC < spyROC and stockROC < qqqROC;

# ==========================================
# 1H SQUEEZE
# ==========================================
def atr1h = ATR(20);

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

# ==========================================
# STRICT EXECUTION SIGNAL
# ==========================================
def bullSignal =
    bull5 and
    bull1h and
    atrExpanding and
    bullVol and
    rsBull;

def bearSignal =
    bear5 and
    bear1h and
    atrExpanding and
    bearVol and
    rsBear;

def bullFlip = bullSignal and !bullSignal[1];
def bearFlip = bearSignal and !bearSignal[1];

# ==========================================
# FULL ALIGNMENT
# ==========================================
def fullBull =
    bull5 and
    bull1h and
    bullD and
    bullW;

# ==========================================
# PLOTS
# ==========================================

plot BullArrow = if bullFlip then low else Double.NaN;
BullArrow.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
BullArrow.SetLineWeight(4);
BullArrow.SetDefaultColor(Color.GREEN);

plot BearArrow = if bearFlip then high else Double.NaN;
BearArrow.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
BearArrow.SetLineWeight(4);
BearArrow.SetDefaultColor(Color.RED);

plot SqueezeDot =
    if showSqueezeDots and squeezeFiring
    then low
    else Double.NaN;
SqueezeDot.SetPaintingStrategy(PaintingStrategy.POINTS);
SqueezeDot.SetLineWeight(4);
SqueezeDot.SetDefaultColor(Color.CYAN);

plot FullAlignDot =
    if showFullAlignmentDots and fullBull
    then high
    else Double.NaN;
FullAlignDot.SetPaintingStrategy(PaintingStrategy.POINTS);
FullAlignDot.SetLineWeight(4);
FullAlignDot.SetDefaultColor(Color.MAGENTA);