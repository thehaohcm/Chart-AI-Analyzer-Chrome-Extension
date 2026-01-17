/**
 * Example Prompts and AI Responses
 * 
 * This file documents example prompts sent to OpenAI Vision API
 * and expected response formats.
 */

// ============================================
// EXAMPLE 1: Basic Chart Analysis (No History)
// ============================================

const EXAMPLE_1_PROMPT = `
You are an expert technical analyst helping a trader analyze charts.

**CRITICAL INSTRUCTIONS:**
1. First, identify and classify the chart setup into ONE short label (e.g., "Bull Flag", "Head & Shoulders", "Support Bounce", "Breakout", etc.)
2. Start your response with: "SETUP_TYPE: [your classification]"
3. Then provide your technical analysis

**Chart Context:**
- Asset: BTC/USD
- Timeframe: 1 Hour
- Source: TradingView - Bitcoin / TetherUS

**Your Task:**
Analyze this chart and provide:

1. **Setup Classification** (required)
   - Identify the primary chart pattern or setup
   - Use a short, descriptive label (2-4 words max)

2. **Technical Analysis**
   - Current trend direction and strength
   - Key support and resistance levels
   - Price action patterns
   - Volume analysis (if visible)
   - Momentum indicators (if visible)

3. **Risk Assessment**
   - Potential entry zones
   - Suggested stop-loss areas
   - Risk/reward ratio
   - Market structure quality

4. **Trade Considerations**
   - What to watch for confirmation
   - Potential invalidation scenarios
   - Alternative scenarios

**Reminders:**
- This is for EDUCATIONAL purposes only, NOT financial advice
- The trader makes their own decisions
- Be objective and highlight both opportunities and risks

Please analyze the chart now.
`;

const EXAMPLE_1_RESPONSE = `
SETUP_TYPE: Ascending Triangle Breakout

**Technical Analysis**

Trend: The chart shows a strong uptrend with higher lows forming an ascending support line. Price is currently testing horizontal resistance around $42,500, creating a classic ascending triangle pattern.

Key Levels:
- Resistance: $42,500 (tested 3 times)
- Support: Rising trendline currently at $41,200
- Previous support turned resistance: $40,800

Price Action: Price has been consolidating in a tightening range, with each low getting higher while highs remain relatively equal. This compression typically precedes a breakout. Volume appears to be declining during consolidation, which is bullish for an upside breakout.

Momentum: The market structure shows strength with higher lows. If resistance breaks, target projection would be around $44,000 (measured move from triangle base).

**Risk Assessment**

Entry Zones:
- Aggressive: On breakout above $42,500 with volume
- Conservative: On retest of $42,500 as new support after breakout

Stop Loss:
- Below the ascending trendline (~$41,000)
- Or below recent swing low at $41,200

Risk/Reward: Approximately 1:2.5 if entering at $42,500 with stop at $41,200 and target at $44,000.

**Trade Considerations**

Watch for:
- Volume increase on breakout (confirming strength)
- Clean break and close above $42,500
- Retest of breakout level as support

Invalidation:
- Break below ascending trendline
- Multiple failed breakout attempts leading to exhaustion

Alternative Scenario:
If price fails to break resistance, watch for potential breakdown below the trendline, which could target the $40,000 support zone.

Remember: Wait for confirmation before entering. False breakouts are common at these decision points.
`;

// ============================================
// EXAMPLE 2: With Trading History (Warning Case)
// ============================================

const EXAMPLE_2_PROMPT = `
You are an expert technical analyst helping a trader analyze charts.

**CRITICAL INSTRUCTIONS:**
1. First, identify and classify the chart setup into ONE short label (e.g., "Bull Flag", "Head & Shoulders", "Support Bounce", "Breakout", etc.)
2. Start your response with: "SETUP_TYPE: [your classification]"
3. Then provide your technical analysis

**Chart Context:**
- Asset: AAPL
- Timeframe: 4 Hours
- Source: TradingView - Apple Inc.

**Your Task:**
Analyze this chart and provide:

1. **Setup Classification** (required)
   - Identify the primary chart pattern or setup
   - Use a short, descriptive label (2-4 words max)

2. **Technical Analysis**
   - Current trend direction and strength
   - Key support and resistance levels
   - Price action patterns
   - Volume analysis (if visible)
   - Momentum indicators (if visible)

3. **Risk Assessment**
   - Potential entry zones
   - Suggested stop-loss areas
   - Risk/reward ratio
   - Market structure quality

4. **Trade Considerations**
   - What to watch for confirmation
   - Potential invalidation scenarios
   - Alternative scenarios

**IMPORTANT - Your Personal Trading History:**
Based on your past trades, here's your track record:

- Bull Flag: 5W / 2L (71.4% win rate)
- Head And Shoulders: 1W / 4L (20.0% win rate)
  Common mistakes: Entered too early, Stop loss too tight
- Support Bounce: 3W / 3L (50.0% win rate)

**CRITICAL:** If the current setup matches any of your poor-performing setups (win rate < 40%), you MUST explicitly warn the trader with a clear message like:
"⚠️ WARNING: You have a poor track record with [setup type] - [X] wins vs [Y] losses ([Z]% win rate). Proceed with extra caution or consider skipping this trade."

**Reminders:**
- This is for EDUCATIONAL purposes only, NOT financial advice
- The trader makes their own decisions
- Be objective and highlight both opportunities and risks
- If the setup matches a poor historical pattern, BE EXPLICIT about the warning

Please analyze the chart now.
`;

const EXAMPLE_2_RESPONSE = `
SETUP_TYPE: Head And Shoulders

⚠️ **WARNING: You have a poor track record with Head And Shoulders setups - 1 win vs 4 losses (20% win rate). Proceed with extra caution or consider skipping this trade.**

**Technical Analysis**

Pattern: A classic head and shoulders reversal pattern has formed after an uptrend. The left shoulder formed at $185, head at $192, and right shoulder appears to be completing around $186.

Key Levels:
- Neckline: $178 (critical support)
- Left Shoulder: $185
- Head: $192
- Right Shoulder (forming): ~$186
- Target (if breakdown): $164 (measured move)

Price Action: The chart shows clear momentum exhaustion with each peak getting weaker. Volume declined on the formation of the right shoulder, suggesting weakening buying pressure.

**Risk Assessment**

Entry Zones:
- Aggressive: On break below neckline ($178)
- Conservative: On retest of broken neckline from below

Stop Loss:
- Above right shoulder (~$188)
- Or above recent swing high at $189

Risk/Reward: If entering at $177, stop at $188, target $164 = 1:1.2 ratio (not ideal)

**Trade Considerations - Given Your History**

⚠️ **Important Context:** Your past losses with this pattern suggest you may have been:
1. Entering too early (before neckline confirmation)
2. Using stops that were too tight (getting stopped out before pattern plays out)

Watch for:
- Clean break AND close below $178 neckline
- Ideally with increased volume on breakdown
- Wait for retest to confirm reversal (addresses your "entered too early" issue)

Invalidation:
- Price reclaiming neckline and holding above $178
- Strong move back above right shoulder high

**Recommendation:**
Given your 20% win rate with this setup, consider:
- Skipping this trade entirely and waiting for your higher-probability Bull Flag setups (71% win rate)
- Or, if you must trade it, wait for FULL confirmation with retest, and use a wider stop (~$190) to avoid premature stop-outs
- Paper trade this one to practice pattern recognition without risk

Remember: Your track record shows this isn't your best setup. Preserving capital by skipping low-probability trades is also a valid strategy.
`;

// ============================================
// EXAMPLE 3: Positive Historical Pattern
// ============================================

const EXAMPLE_3_PROMPT = `
[Similar structure but with Bull Flag in trading history]

**IMPORTANT - Your Personal Trading History:**
Based on your past trades:
- Bull Flag: 7W / 3L (70.0% win rate)
- Double Bottom: 2W / 5L (28.6% win rate)
`;

const EXAMPLE_3_RESPONSE = `
SETUP_TYPE: Bull Flag

✅ **Historical Note:** This setup (Bull Flag) matches one of your better-performing patterns - 7 wins vs 3 losses (70% win rate). Good pattern recognition!

**Technical Analysis**
[... detailed analysis ...]

**Risk Assessment**
[... detailed risk analysis ...]

**Trade Considerations**
Based on your successful history with this pattern, you likely already know the key success factors. Continue applying your proven strategy while remaining disciplined with risk management.

[... rest of analysis ...]
`;

// ============================================
// EXAMPLE 4: Unknown Setup (No Match)
// ============================================

const EXAMPLE_4_RESPONSE = `
SETUP_TYPE: Range Bound Consolidation

**Technical Analysis**

Trend: The market is in a clear sideways range with defined boundaries. Price has been oscillating between $1,850 (support) and $1,900 (resistance) for the past two weeks.

[... rest of analysis ...]

**Trade Considerations**

Note: This setup doesn't match your historical trading patterns. Consider whether range-bound trading fits your strategy before taking action. Many traders perform better with trending setups versus ranging markets.

[... rest of analysis ...]
`;

// ============================================
// Response Parsing Examples
// ============================================

// Successful parse
const parseExample1 = {
  setupType: "Ascending Triangle Breakout",
  fullAnalysis: "**Technical Analysis**\n\nTrend: The chart shows...",
  warning: null,
  timestamp: "2026-01-17T10:30:00Z"
};

// Parse with warning
const parseExample2 = {
  setupType: "Head And Shoulders",
  fullAnalysis: "⚠️ **WARNING: You have a poor track record...",
  warning: "You have a poor track record with \"Head And Shoulders\" setups: 1 wins vs 4 losses (20.0% win rate). Consider extra caution or skipping this trade.",
  timestamp: "2026-01-17T10:35:00Z"
};

// ============================================
// Edge Cases
// ============================================

// No setup type found
const EDGE_CASE_1_RESPONSE = `
Based on the chart, I see a complex multi-timeframe structure...
[analysis without SETUP_TYPE line]
`;

const EDGE_CASE_1_PARSED = {
  setupType: "Unknown",
  fullAnalysis: "Based on the chart, I see a complex...",
  warning: null,
  timestamp: "2026-01-17T10:40:00Z"
};

// Multiple setup types mentioned
const EDGE_CASE_2_RESPONSE = `
SETUP_TYPE: Bull Flag Continuation

This could also be interpreted as a Rising Wedge...
`;

const EDGE_CASE_2_PARSED = {
  setupType: "Bull Flag Continuation",
  fullAnalysis: "This could also be interpreted as...",
  warning: null,
  timestamp: "2026-01-17T10:45:00Z"
};

// ============================================
// Customization Examples
// ============================================

// Focus on specific indicators
const CUSTOM_PROMPT_INDICATORS = `
[... standard prompt ...]

**Additional Instructions:**
Pay special attention to:
- RSI levels (if visible)
- MACD crossovers (if visible)
- 50 and 200 moving averages (if visible)

Include these in your analysis if present on the chart.
`;

// Conservative risk profile
const CUSTOM_PROMPT_CONSERVATIVE = `
[... standard prompt ...]

**Risk Profile:**
The trader prefers conservative entries with:
- Strong confirmation signals
- 1:3 or better risk/reward ratios
- Clear invalidation levels

Emphasize high-probability setups only.
`;

// Scalping focus
const CUSTOM_PROMPT_SCALPING = `
[... standard prompt ...]

**Trading Style:**
The trader focuses on scalping (short-term trades, 5-30 minutes).
Analyze from this perspective:
- Quick entry/exit levels
- Tight stops
- Momentum shifts
- Volume spikes
`;

console.log('Example prompts documented');
console.log('Modify ai.js buildPrompt() to customize behavior');
