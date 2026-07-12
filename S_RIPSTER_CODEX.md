# S_RIPSTER_CODEX

## EMA Cloud Trend System Pro

`S_RIPSTER_CODEX.ts` is an upper-chart thinkorswim study built around Ripster-style EMA clouds, trend quality scoring, pullback tracking, and filtered buy/sell arrows.

It is designed to help answer three questions:

1. Is price trending or chopping?
2. Is the trend strong enough to care about?
3. Is the current move a first pullback continuation setup?

## Visual Components

Start by reading the chart visually from left to right. The study is built so the main information appears directly on the price chart.

| Visual | What It Means | How To Use It |
|---|---|---|
| Green EMA clouds | Bullish EMA pair alignment | Look for long setups when most or all clouds are green and rising |
| Red EMA clouds | Bearish EMA pair alignment | Look for short setups when most or all clouds are red and falling |
| Mixed/tangled clouds | Neutral or choppy structure | Be cautious; signals are lower quality when clouds overlap and flip often |
| `CS:` label | Confidence Score from 0-100 | Higher scores mean stronger trend confirmation |
| Trend label | Current regime: `STRONG BULL`, `BULL`, `NEUTRAL`, `BEAR`, or `STRONG BEAR` | Use it as the main directional filter |
| `ES:` label | EMA Spread between the 5, 20, and 50 EMAs | Wider spread usually means stronger trend expansion |
| `PB1` bubble | First confirmed pullback in the current trend | Most important pullback label; this is the only pullback that can trigger arrows |
| `PB2` bubble | Second confirmed pullback in the same trend | Still useful, but later than PB1 |
| `PB3` bubble | Third or later confirmed pullback in the same trend | Treat as mature-trend information, not a fresh-trend setup |
| Green up arrow | Fully filtered bullish PB1 breakout | Potential long continuation signal |
| Red down arrow | Fully filtered bearish PB1 breakout | Potential short continuation signal |
| Cloud legend labels | Shows the EMA pair color map | Confirms which channel each line/cloud color represents |
| Dark green background | Optional high-confidence strong bull regime | Background is off by default to keep charts readable |
| Dark red background | Optional high-confidence strong bear regime | Background is off by default to keep charts readable |
| Dark gray background | Optional low-confidence neutral regime | Marks weak/choppy structure when enabled |

Quick read:

- Clean green cloud stack + `BULL` or `STRONG BULL` + high `CS` = bullish trend environment.
- Clean red cloud stack + `BEAR` or `STRONG BEAR` + high `CS` = bearish trend environment.
- Mixed clouds + low `CS` + `NEUTRAL` = avoid forcing trend trades.
- `PB1` is the first continuation pullback after a trend starts.
- Arrows are intentionally rare because they require PB1 plus all enabled filters.

## How To Add It

1. Open thinkorswim.
2. Go to `Charts`.
3. Click `Studies`.
4. Choose `Edit Studies`.
5. Click `Create`.
6. Copy the contents of `S_RIPSTER_CODEX.ts` into the editor.
7. Save the study.
8. Add it to your chart.

The study is intended for charts from 1 minute through monthly. Intraday charts are usually the most useful for pullback and arrow signals.

## EMA Clouds

The study plots four EMA cloud pairs:

| Cloud | Colors | Purpose |
|---|---|---|
| 5 / 13 EMA | Cyan / pink | Fast momentum cloud, thickest near-term lines |
| 8 / 9 EMA | Bright lime / orange | Very short-term trigger cloud |
| 20 / 21 EMA | Medium green / red | Intermediate trend cloud |
| 34 / 50 EMA | Dark green / dark red | Larger trend structure cloud |

The study also adds legend labels at the top of the chart:

- `5/13: cyan / pink`
- `8/9: lime / orange`
- `20/21: med green / red`
- `34/50: dark green / dark red`

For each cloud pair, the first color represents the faster EMA side of that channel and the second color represents the slower EMA side.

## High-Level Cloud Usage

When all clouds are green and stacked upward, the chart is in a bullish trend structure. In this condition, pullbacks into the shorter EMAs can be treated as possible continuation areas.

When all clouds are red and stacked downward, the chart is in a bearish trend structure. In this condition, rallies into the shorter EMAs can be treated as possible short continuation areas.

When clouds are mixed, flat, or repeatedly crossing, the chart is likely neutral or choppy. Signals are less meaningful in this environment because there is no clean trend stack.

Simple read:

- Best bullish structure: price above rising green clouds.
- Best bearish structure: price below falling red clouds.
- Caution: price inside tangled clouds.
- Avoid forcing signals when the 20/21 and 34/50 clouds are flat or mixed.

## Trend Label

The trend label shows one of five states:

| Label | Meaning |
|---|---|
| `STRONG BULL` | EMAs are fully bullish, stacked, rising, and supported by ADX/ATR strength |
| `BULL` | Clouds are bullish and short/intermediate slopes support the move |
| `NEUTRAL` | Trend conditions are mixed or weak |
| `BEAR` | Clouds are bearish and short/intermediate slopes support downside |
| `STRONG BEAR` | EMAs are fully bearish, stacked, falling, and supported by ADX/ATR strength |

Use the trend label as the broad regime filter. Long ideas are cleaner in `BULL` or `STRONG BULL`. Short ideas are cleaner in `BEAR` or `STRONG BEAR`.

## Confidence Score Label

The `CS:` label is the Confidence Score.

It ranges from `0` to `100`.

The score is built from:

| Component | Points |
|---|---:|
| EMA alignment | 40 |
| ADX strength | 20 |
| Volume confirmation | 10 |
| VWAP alignment | 10 |
| EMA slope | 10 |
| ATR expansion | 10 |

Score colors:

| Score | Color | Meaning |
|---:|---|---|
| 90-100 | Bright green | Very strong trend quality |
| 80-89 | Green | Strong trend quality |
| 70-79 | Yellow | Tradable but not ideal |
| 60-69 | Orange | Weak or developing |
| Below 60 | Red | Low confidence |

General usage:

- `CS >= 80`: trend has useful confirmation.
- `CS >= 90`: strongest environment.
- `CS < 70`: be selective.
- `CS < 60`: usually chop, weak trend, or poor confirmation.

## EMA Spread Label

The `ES:` label shows EMA Spread.

It measures the percentage distance between:

- 5 EMA
- 20 EMA
- 50 EMA

Higher spread means the EMAs are more separated, which often reflects stronger trend expansion. Very low spread means compression, chop, or a developing trend.

Use `ES` as a trend quality metric, not as a standalone buy/sell signal.

## Pullbacks

The study tracks pullbacks after a trend has been established.

Pullbacks are based on price touching the selected pullback EMA area, then breaking back in the direction of the trend.

Default pullback EMA:

| Input | Default |
|---|---:|
| `pullbackEMALength` | 13 |

In an uptrend:

1. Price pulls back toward the pullback EMA.
2. Price holds above the broader trend area.
3. Price breaks back upward.
4. A pullback label appears.

In a downtrend:

1. Price rallies back toward the pullback EMA.
2. Price stays below the broader trend area.
3. Price breaks back downward.
4. A pullback label appears.

## PB Labels

| Label | Meaning | Color |
|---|---|---|
| `PB1` | First confirmed pullback after a new trend starts | Cyan |
| `PB2` | Second confirmed pullback in the same trend | Yellow |
| `PB3` | Third or later confirmed pullback in the same trend | Gray |

Important behavior:

- `PB1` can only occur once per trend.
- The pullback count resets when the trend direction changes.
- `PB3` means PB3 or greater, not only the exact third pullback.
- PB labels are not predictions. They mark confirmed pullback breakouts after the fact.

## Buy And Sell Arrows

Buy arrows are stricter than PB labels.

A buy arrow requires:

- All EMA clouds bullish.
- ADX filter passes, if enabled.
- ATR filter passes, if enabled.
- Volume filter passes, if enabled.
- VWAP filter passes, if enabled.
- `PB1` is confirmed.
- Price breaks out from the pullback.

Sell arrows use the reverse logic.

This means arrows are intentionally rare. They are designed to highlight first-pullback continuation setups, not every possible entry.

## Filters

The study includes optional filters:

| Input | Purpose |
|---|---|
| `useVWAPFilter` | Requires longs above VWAP and shorts below VWAP |
| `useVolumeFilter` | Requires volume above average volume times multiplier |
| `useADXFilter` | Requires ADX above threshold |
| `useATRFilter` | Requires ATR expansion |

Defaults:

| Input | Default |
|---|---:|
| `adxLength` | 14 |
| `adxThreshold` | 22 |
| `atrLength` | 14 |
| `volumeMultiplier` | 1.25 |

If the study feels too restrictive, turn filters off one at a time to see which condition is blocking signals.

## Background Color

Background coloring is off by default.

This is intentional. thinkorswim paints every qualifying historical bar, so background coloring can overwhelm the chart.

If enabled:

| Background | Meaning |
|---|---|
| Dark green | High-confidence strong bull regime |
| Dark red | High-confidence strong bear regime |
| Dark gray | Low-confidence neutral regime |

## Practical Workflow

For bullish setups:

1. Look for all or most clouds turning green.
2. Prefer price above the 20/21 and 34/50 clouds.
3. Check that the trend label is `BULL` or `STRONG BULL`.
4. Prefer `CS` above `80`.
5. Wait for `PB1` or a buy arrow.
6. Use the clouds as dynamic support areas.

For bearish setups:

1. Look for all or most clouds turning red.
2. Prefer price below the 20/21 and 34/50 clouds.
3. Check that the trend label is `BEAR` or `STRONG BEAR`.
4. Prefer `CS` above `80`.
5. Wait for `PB1` or a sell arrow.
6. Use the clouds as dynamic resistance areas.

## Notes

This study is a trend and pullback decision aid. It does not replace risk management, position sizing, higher-timeframe context, or support/resistance analysis.

The best signals usually occur when:

- The cloud stack is clean.
- VWAP agrees with direction.
- Volume expands.
- ATR is expanding.
- Pullback happens after a fresh trend shift.
- Price respects the cloud instead of slicing through it repeatedly.
