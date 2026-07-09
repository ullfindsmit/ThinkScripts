#Multiple EMA Cloud 

input ema1low = 5;
input ema1high = 13;
input ema2low = 8;
input ema2high = 9;
input ema3low = 34;
input ema3high = 50;
input ema6low = 20;
input ema6high = 21;



def ema5 = ExpAverage(hl2, ema1low);
def ema13 = ExpAverage(hl2, ema1high);
AddCloud(ema5, ema13, CreateColor(76, 175, 80), CreateColor(244, 67, 54));
def ema8 = ExpAverage(hl2, ema2low);
def ema9 = ExpAverage(hl2, ema2high);
AddCloud(ema8, ema9, CreateColor(3, 97, 30), CreateColor(136, 14, 79));
def ema34 = ExpAverage(hl2, ema3low);
def ema50 = ExpAverage(hl2, ema3high);
AddCloud(ema34, ema50, CreateColor(33, 150, 243), CreateColor(255, 183, 77));
def ema20 = ExpAverage(hl2, ema6low);
def ema21 = ExpAverage(hl2, ema6high);
AddCloud(ema20, ema21, CreateColor(107, 205, 117), CreateColor(230, 61, 19));


