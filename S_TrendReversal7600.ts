# used to switch between "zigzag based on high/low of price" and "zigzag based on then high/low of moving averages"
input method = {default average, high_low};

# data for the built-in zigzag indicator which is referenced in the study. To see the ZigZagHighLow() code, look for it in the built-in TOS studies
def bubbleoffset = .0005;
def percentamount = .01;
def revAmount = .05;
def atrreversal = 2.0;
def atrlength = 5;

# data for the moving averages
def pricehigh = high;
def pricelow = low;
def averagelength = 5;
def averagetype = AverageType.EXPONENTIAL;

# here are the moving averages used for the signals - changed to plots and given colors
plot mah = MovingAverage(averagetype, pricehigh, averagelength);
plot mal = MovingAverage(averagetype, pricelow, averagelength);
mah.setdefaultcolor(color.cyan);
mal.setdefaultcolor(color.cyan);

# continues the switch between the two different zigzag data points
def priceh = if method == method.high_low then pricehigh else mah;
def pricel = if method == method.high_low then pricelow else mal;

# references the built-in zigzag indicator
def EI = ZigZagHighLow("price h" = priceh, "price l" = pricel, "percentage reversal" = percentamount, "absolute reversal" = revAmount, "atr length" = atrlength, "atr reversal" = atrreversal);

# not very clear on how this exactly works - but the end result is to plot the zigzag lines
def reversalAmount = if (close * percentamount / 100) > Max(revAmount < atrreversal * reference ATR(atrlength), revAmount) then (close * percentamount / 100) else if revAmount < atrreversal * reference ATR(atrlength) then atrreversal * reference ATR(atrlength) else revAmount;
rec EISave = if !IsNaN(EI) then EI else GetValue(EISave, 1);
def chg = (if EISave == priceh then priceh else pricel) - GetValue(EISave, 1);
def isUp = chg >= 0;
rec isConf = AbsValue(chg) >= reversalAmount or (IsNaN(GetValue(EI, 1)) and GetValue(isConf, 1));
def EId = if isUp then 1 else 0;

# zigzag plot and colors
plot EnhancedLines = if EId <= 1 then EI else Double.NaN;
EnhancedLines.AssignValueColor(if EId == 1 then Color.GREEN else if EId == 0 then Color.RED else Color.DARK_ORANGE);
EnhancedLines.SetStyle(Curve.FIRM);
EnhancedLines.EnableApproximation();
EnhancedLines.HideBubble();

# calculates and plots the arrows
def EIL = if !IsNaN(EI) and !isUp then pricel else GetValue(EIL, 1);
def EIH = if !IsNaN(EI) and isUp then priceh else GetValue(EIH, 1);
def dir = CompoundValue(1, if EIL != EIL[1] or pricel == EIL[1] and pricel == EISave then 1 else if EIH != EIH[1] or priceh == EIH[1] and priceh == EISave then -1 else dir[1], 0);
def signal = CompoundValue(1, if dir > 0 and pricel > EIL then if signal[1] <= 0 then 1 else signal[1] else if dir < 0 and priceh < EIH then if signal[1] >= 0 then -1 else signal[1] else signal[1], 0);
def showarrows = yes;
plot U1 = showarrows and signal > 0 and signal[1] <= 0;
U1.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
U1.SetDefaultColor(Color.GREEN);
U1.SetLineWeight(4);
plot D1 = showarrows and signal < 0 and signal[1] >= 0;
D1.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_DOWN);
D1.SetDefaultColor(Color.RED);
D1.SetLineWeight(4);