#TOS Indicators
#Home of the Volatility Box
#More info regarding this indicator here: tosindicators.com/supply-demand-edge
#Code written in 2019 
#Full Youtube Tutorial here: https://youtu.be/RNtsjfHYWfs
#Credit to Ron Wikso for catching $TICK copy/paste error on lines 18 & 19
#Credit to Brent Wilderman for adding code that enables study to work w/ extended hours on and off


declare upper;
declare hide_on_daily;

input showTicks = yes;
input showAD = yes;

def regularSession = secondsFromTime(0930) > 0 && secondsTillTime(1600) > 0;

def hod = if regularSession then if (high > hod[1]) then high else hod[1] else high;
def lod = if regularSession then if (low < lod[1]) then low else lod[1] else low;

def highAD = if regularSession then if (high(symbol="$ADSPD") > highAD[1]) then high(symbol="$ADSPD") else highAD[1] else high(symbol="$ADSPD");
def lowAD = if regularSession then if (low(symbol="$ADSPD") < lowAD[1]) then low(symbol="$ADSPD") else lowAD[1] else low(symbol="$ADSPD");

def highTick = if regularSession then if (high(symbol="$TICK") > highTick[1]) then high(symbol="$TICK") else highTick[1] else high(symbol="$TICK");
def lowTick = if regularSession then if (low(symbol="$TICK") < lowTick[1]) then low(symbol="$TICK") else lowTick[1] else low(symbol="$TICK");

def currentHighAD = high(symbol="$ADSPD");
def currentLowAD = low(symbol="$ADSPD");
def currentHighTick = high(symbol="$TICK");
def currentLowTick = low(symbol="$TICK");

plot ADShortSignal = showAD && high == hod && currentHighAD < highAD;
ADShortSignal.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_DOWN);
ADShortSignal.SetDefaultColor(Color.WHITE);
ADShortSignal.SetLineWeight(1);

plot ADLongSignal = showAD && low == lod && currentLowAD > LowAD;
ADLongSignal.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
ADLongSignal.SetDefaultColor(Color.WHITE);
ADLongSignal.SetLineWeight(1);

plot TickShortSignal = showTicks && high == hod && currentHighTick < highTick;
TickShortSignal.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_DOWN);
TickShortSignal.SetDefaultColor(Color.RED);
TickShortSignal.SetLineWeight(2);

plot TickLongSignal = showTicks && low == lod && currentLowTick > lowTick;
TickLongSignal.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
TickLongSignal.SetDefaultColor(Color.LIGHT_GREEN);
TickLongSignal.SetLineWeight(2);


