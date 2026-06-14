# Trading Cheat Sheet: 20-Day ATR & SMA Distance

This guide maps out exactly what to do when the labels turn **Green** or **Red**, and the key numbers to focus on.

---

## 1. Quick Reference: What to do when Green vs. Red

By default, the indicator has been updated to use **Dynamic** coloring (Green/Red) for the labels, rather than static Gray, to provide immediate visual feedback.

| Label / Indicator | Color State | Market Condition | What Action to Take |
| :--- | :--- | :--- | :--- |
| **Today** (Daily Change) | 🟢 **Green** | Price is up from yesterday's close. | **Hold or Buy Breakouts**: Confirm if the move is supported by high volume. Do not chase if it's already extended. |
| **Today** (Daily Change) | 🔴 **Red** | Price is down from yesterday's close. | **Hold or Wait**: Look for support levels. Avoid panic-selling unless key support breaks. |
| **ATRs From 50SMA** | 🟢 **Green (Positive)** | Price is trading *above* the 50 SMA. | **Bullish Trend**: Look for pullback buying opportunities closer to the SMA (0x to 1.5x). If > 3x, **scale out (take profit)**. |
| **ATRs From 50SMA** | 🔴 **Red (Negative)** | Price is trading *below* the 50 SMA. | **Bearish Trend**: Avoid buying long. Look to short pullbacks to the SMA. If < -3x, expect a **mean-reversion bounce** (do not short the bottom). |

---

## 2. Key Values to Focus On

Focus on these critical thresholds to make execution decisions:

### A. The 3.0x ATR Threshold (Extension Risk)
* **Value**: `ATRs From 50SMA` is **greater than 3.0x** (or **less than -3.0x**).
* **The Rule**: **The Stretch Rule**. When a stock moves more than 3 standard daily ranges (ATRs) away from its 50-day average, it is statistically overstretched.
* **Action**: 
  * If **> 3.0x**: **Stop buying.** Take partial profits on longs, or move trailing stop-losses up.
  * If **< -3.0x**: **Stop selling/shorting.** The stock is exhausted to the downside and a sharp bounce (mean reversion) is likely.

### B. The 0x to 1.5x ATR Threshold (Buy Zone)
* **Value**: `ATRs From 50SMA` is **between 0x and 1.5x**.
* **The Rule**: **The Mean Reversion/Pullback Rule**. This is the optimal risk-to-reward entry window for a trending stock.
* **Action**:
  * If the stock is in a strong uptrend, buy pullbacks when the price dips back into this zone near the 50-day SMA. Your stop-loss can be placed just below the 50 SMA.

### C. Comparing Today % vs. 20D ATR % (Outlier Identification)
* **Value**: `Today %` is **greater than** the `20D ATR %`.
* **The Rule**: **The Volatility Breakout Rule**. The current day's move is larger than the average entire day's volatility over the past month.
* **Action**:
  * This represents an institutional momentum shift. If it happens on a breakout from a chart pattern, it is a high-conviction signal to **trade in the direction of the breakout**.
