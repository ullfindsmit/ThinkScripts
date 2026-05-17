#ProjectionPivots_v03_JQ
#03.04.2019
#Original Code and Concept by Mobius:
# V01.08.2012 Projection Pivots
# mobius

# Notes:
# 03.04.2019 added linits on extensions
# 03.05.2019 adjusted limits on extensions by adding user input upper and lower extenion percent limits

#declare Once_Per_Bar;
#Inputs
input n = 21;
input showLines = yes;
input showValues = no;
input showBarNumbers = no;
input ExtensionLengthBars = 20; # added to control length of Entension
input UpperExtensionPercentLimit = 5;
input LowerExtensionPercentLimit = 5;
input DisplayLabel = yes;    #JQ 7.8.2018 added
AddLabel (DisplayLabel, "Projection Pivots n:" + n + " " , Color.WHITE);    #JQ 7.8.2018 added

 
# Universal Header _v030429019 _JQ
#     code from various sources including Mobius, NoLongerNube and others
# Comment out unnecessary portions to preserve tos memory and enhance speed

# Universal Definitions using Padawan variable naming convention (JQ) v03.04.2019
# iData Definitions
def vHigh = high;  # creates the variable vHigh.  Use of the variable reduce data calls to tos iData server
#    def initHigh =  CompoundValue(1, high, high);  # creates and initialized variable for High
def vLow = low;
#    def initLow = CompoundValue(1, low, low);
def vOpen = open;
#    def initOpen = CompoundValue(1, open, open);
def vClose = close;
#    def initClose = CompoundValue(1, close, close);
def vVolume = volume;
#    def initVolume = CompoundValue(1, volume, volume);
def nan = Double.NaN;
# Bar Time & Date
def bn = BarNumber();
def currentBar = HighestAll(if !IsNaN(vHigh) then bn else nan);
#    def Today = GetDay() ==GetLastDay();
#    def time = GetTime();
#    def GlobeX = GetTime() < RegularTradingStart(GetYYYYMMDD());
    # def globeX_v2 = if time crosses below RegularTradingEnd(GetYYYYMMDD()) then bn else GlobeX[1];
#    def RTS  = RegularTradingStart(GetYYYYMMDD());
#    def RTE  = RegularTradingEnd(GetYYYYMMDD());
#    def RTH = GetTime() > RegularTradingStart(GetYYYYMMDD());
#    def RTH_v2 = if time crosses above RegularTradingStart(GetYYYYMMDD()) then bn else RTH[1];

# bars that start and end the sessions  #(borrowed from nube)
#    def rthStartBar    = CompoundValue(1,
#                         if   !IsNaN(vClose)
#                         &&   time crosses above RegularTradingStart(GetYYYYMMDD())
#                         then bn
#                         else rthStartBar[1], 0);
#    def rthEndBar      = CompoundValue(1,
#                         if   !IsNaN(vClose)
#                         &&   time crosses above RegularTradingEnd(GetYYYYMMDD())
#                         then bn
#                         else rthEndBar[1], 1);
#    def globexStartBar = CompoundValue(1,
#                         if   !IsNaN(vClose)
#                         &&   time crosses below RegularTradingEnd(GetYYYYMMDD())
#                         then bn
#                         else globexStartBar[1], 1);
#    def rthSession = if   bn crosses above rthStartBar #+ barsExtendedBeyondSession
#                     then 1
#                     else if   bn crosses above rthEndBar #+ barsExtendedBeyondSession
#                          then 0
#                     else rthSession[1];

# Bubble Locations
def x_AxisLastExpansionBar = BarNumber() == HighestAll(BarNumber());  #corrected 11.12.2018 (JQ)
        # syntax: addChartBubble(x_AxisLastExpansionBar, y-axis coordinate," text", Color.LIME); #verified 12.25.2018 (JQ)

def PH;
def PL;
def hh = fold i = 1 to n + 1
            with p = 1
            while p
            do vHigh > GetValue(vHigh, -i);
PH = if (bn > n and
                vHigh == Highest(vHigh, n) and
                hh)
            then vHigh
            else Double.NaN;
def ll = fold j = 1 to n + 1
            with q = 1
            while q
            do vLow < GetValue(low, -j);
PL = if (bn > n and
                vLow == Lowest(vLow, n) and
                ll)
            then vLow
            else Double.NaN;
def PHBar = if !IsNaN(PH)
               then bn
               else PHBar[1];
def PLBar = if !IsNaN(PL)
               then bn
               else PLBar[1];
def PHL = if !IsNaN(PH)
             then PH
             else PHL[1];
def priorPHBar = if PHL != PHL[1]
                    then PHBar[1]
                    else priorPHBar[1];
def PLL = if !IsNaN(PL)
             then PL
             else PLL[1];
def priorPLBar = if PLL != PLL[1]
                    then PLBar[1]
                    else priorPLBar[1];
def HighPivots = bn >= HighestAll(priorPHBar);
def LowPivots = bn >= HighestAll(priorPLBar);
def FirstRpoint = if HighPivots
                     then bn - PHBar
                     else 0;
def PriorRpoint = if HighPivots
                     then bn - priorPHBar
                     else 0;
def RSlope = (GetValue(PH, FirstRpoint) - GetValue(PH, PriorRpoint))
                       / (PHBar - priorPHBar);
def FirstSpoint = if LowPivots
                     then bn - PLBar
                     else 0;
def PriorSpoint = if LowPivots
                     then bn - priorPLBar
                     else 0;
def SSlope = (GetValue(PL, FirstSpoint) - GetValue(PL, PriorSpoint))
                   / (PLBar - priorPLBar);
def RExtend = if bn == HighestAll(PHBar)
                 then 1
                 else RExtend[1];
def SExtend = if bn == HighestAll(PLBar)
                 then 1
                 else SExtend[1];

plot pivotHigh = if HighPivots
                   then PH
                   else Double.NaN;
pivotHigh.SetDefaultColor(GetColor(1));
pivotHigh.SetPaintingStrategy(PaintingStrategy.VALUES_ABOVE);
pivotHigh.SetHiding(!showValues);

plot pivotHighLine = if PHL > 0 and
                          HighPivots
                       then PHL
                       else Double.NaN;
pivotHighLine.SetPaintingStrategy(PaintingStrategy.DASHES);  # Mobius original was DASHES
pivotHighLine.SetDefaultColor(Color.UPTICK);    #JQ 7.8.2018 added
pivotHighLine.SetHiding(!showLines);

plot RLine = pivotHigh;
RLine.EnableApproximation();
RLine.SetDefaultColor(Color.LIGHT_GRAY);
RLine.SetStyle(Curve.SHORT_DASH);

# Added code to limit resistance estension line (JQ 03.04.2019)
def calc_ResistanceExtension = if RExtend
                    then (bn - PHBar) * RSlope + PHL
                    else Double.NaN;
plot line_ResistanceExtension = if bn <= (currentBar + ExtensionLengthBars)
                                   and calc_ResistanceExtension[1] >=  (LowestAll(vLow) * (1 - (LowerExtensionPercentLimit / 100)))
                                   and calc_ResistanceExtension[1] <= (HighestAll(vHigh) * (1 + (UpperExtensionPercentLimit / 100)))
                               then calc_ResistanceExtension else Double.NaN;
line_ResistanceExtension.SetStyle(Curve.SHORT_DASH);
line_ResistanceExtension.SetDefaultColor(Color.LIGHT_GRAY); #was 7
line_ResistanceExtension.SetLineWeight(1);

# Low Plots
plot pivotLow = if LowPivots
                  then PL
                  else Double.NaN;
pivotLow.SetDefaultColor(GetColor(4));
pivotLow.SetPaintingStrategy(PaintingStrategy.VALUES_BELOW);
pivotLow.SetHiding(!showValues);

plot pivotLowLine = if PLL > 0 and
                         LowPivots
                      then PLL
                      else Double.NaN;
pivotLowLine.SetPaintingStrategy(PaintingStrategy.DASHES);  # Mobius original was DASHES
pivotLowLine.SetDefaultColor(Color.DOWNTICK);#  #  JQ 7.8.2018 added
pivotLowLine.SetHiding(!showLines);

plot SupportLine = pivotLow;
SupportLine.EnableApproximation();
SupportLine.SetDefaultColor(Color.LIGHT_GRAY);
SupportLine.SetStyle(Curve.SHORT_DASH);

# Added code to limit support estension line (JQ 03.04.2019)
def calc_SupportExtension = if SExtend
                          then (bn - PLBar) * SSlope + PLL
                          else Double.NaN;
plot line_SupportExtension = if bn <= (currentBar + ExtensionLengthBars)
                                   and calc_SupportExtension[1] >= (LowestAll(vLow) * (1 - (LowerExtensionPercentLimit / 100)))
                                   and calc_SupportExtension[1] <= (HighestAll(vHigh) * (1 + (UpperExtensionPercentLimit / 100)))
                               then calc_SupportExtension else Double.NaN;
line_SupportExtension.SetDefaultColor(Color.LIGHT_GRAY); #was 7
line_SupportExtension.SetStyle(Curve.SHORT_DASH);
line_SupportExtension.SetLineWeight(1);

plot BarNumbersBelow = bn;
BarNumbersBelow.SetDefaultColor(GetColor(0));
BarNumbersBelow.SetHiding(!showBarNumbers);
BarNumbersBelow.SetPaintingStrategy(PaintingStrategy.VALUES_BELOW);

plot PivotDot = if !IsNaN(pivotHigh)
                  then pivotHigh
                  else if !IsNaN(pivotLow)
                  then pivotLow
                  else Double.NaN;
PivotDot.SetDefaultColor(GetColor(7));
PivotDot.SetPaintingStrategy(PaintingStrategy.POINTS);
PivotDot.SetLineWeight(3);

# End Code