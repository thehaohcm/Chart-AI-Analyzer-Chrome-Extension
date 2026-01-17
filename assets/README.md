# 📊 Chart AI Assistant

A personal Chrome Extension (Manifest V3) that captures chart screenshots, analyzes them using OpenAI Vision API (GPT-4o), and maintains a personal trading memory to improve decision-making over time.

## 🎯 Purpose

**Educational tool for personal use only.** This extension helps traders:
- Get objective technical analysis of charts
- Learn from past trading patterns
- Receive warnings about setups with poor personal win rates
- Track trading performance by setup type

**Important:** This is NOT a trading bot, financial advisor, or signal provider. All trading decisions remain manual and user-controlled.

---

## ✨ Features

### 1. Chart Capture & Analysis
- Screenshot the active tab (TradingView or any chart)
- **Multi-Provider AI Support:**
  - **OpenAI** (GPT-4o, GPT-4o Mini, GPT-4 Turbo)
  - **Google Gemini** (Gemini 3.0 Flash, 2.5 Flash, 2.5 Pro, 2.5 Flash-Lite)
  - **Anthropic Claude** (Claude 3 Opus, Sonnet, Haiku)
- Receive detailed technical analysis including:
  - Setup classification (e.g., "Bull Flag", "Support Bounce")
  - Trend analysis and price action
  - Support/resistance levels
  - Risk assessment and trade considerations

### 2. Personal Trading Memory
- Store trading outcomes per setup type
- Track wins, losses, and break-even trades
- Record common mistakes for each setup
- Get personalized warnings when encountering historically poor setups
  - Example: *"You have lost 3 times with this setup before (25% win rate)"*

### 3. Clean UI
- Minimal popup interface
- Optional asset/timeframe input
- Screenshot preview
- Trade outcome logging (Win/Loss/BE + notes)
- Statistics view

---

## 📁 Project Structure

```
chart-ai-assistant/
├── manifest.json                 # Manifest V3 configuration
├── background/
│   └── service-worker.js        # Background service worker (screenshot capture)
├── popup/
│   ├── popup.html               # Popup UI
│   ├── popup.js                 # Popup controller
│   └── popup.css                # Styles
├── scripts/
│   ├── ai.js                    # OpenAI Vision API integration
│   ├── memory.js                # Trading memory storage
│   └── config.js                # Configuration management
├── assets/
│   └── icons/                   # Extension icons (16, 48, 128)
└── README.md                    # This file
```

---

## 🚀 Installation

### Prerequisites
- Google Chrome or Chromium-based browser
- AI API key from one of:
  - **OpenAI** ([Get here](https://platform.openai.com/api-keys)) - ~$0.01-0.03/analysis
  - **Google Gemini** ([Get here](https://aistudio.google.com/app/apikey)) - ~$0.001-0.01/analysis ⭐ Cheapest
  - **Anthropic** ([Get here](https://console.anthropic.com/)) - ~$0.015-0.075/analysis

### Steps

1. **Clone or download this repository**
   ```bash
   cd ~/Desktop/Projects
   # (repository already exists at chart-ai-assistant)
   ```

2. **Add extension icons** (required for loading)
   - Create 16x16, 48x48, and 128x128 PNG icons
   - Place them in `assets/icons/` folder
   - Name them: `icon16.png`, `icon48.png`, `icon128.png`
   - Or use placeholder icons temporarily

3. **Load extension in Chrome**
   - Open Chrome
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `chart-ai-assistant` folder

4. **Configure API Key**
   - Click the extension icon in Chrome toolbar
   - Select your preferred AI provider (OpenAI, Gemini, or Claude)
   - Choose the model you want to use
   - Enter your API key when prompted
   - Key is stored locally in Chrome Storage (see security note below)

**💡 Recommended for beginners:** Google Gemini (cheapest, generous free tier)
**💡 Recommended for professionals:** OpenAI GPT-4o (best quality)

---

## 🔧 Usage

### Basic Workflow

1. **Navigate to a chart**
   - Open TradingView or any chart webpage
   
2. **Open the extension**
   - Click the extension icon in Chrome toolbar
   
3. **Capture & Analyze**
   - (Optional) Enter asset symbol and timeframe
   - Click "📸 Capture & Analyze Chart"
   - Wait for AI analysis (~5-10 seconds)

4. **Review Analysis**
   - Read the AI's technical analysis
   - Note the setup classification
   - Check for warnings based on your trading history

5. **Log Trade Outcome** (after the trade)
   - Select Win / Loss / Break Even
   - Add optional notes (especially for losses)
   - Click to log the outcome

6. **View Statistics**
   - Click "📊 View Trading Stats"
   - See win rates per setup type
   - Review overall performance

---

## 🧠 How It Works

### 1. Screenshot Capture
- Background service worker uses `chrome.tabs.captureVisibleTab`
- Captures current tab as PNG (high quality)
- Sends base64-encoded image to popup

### 2. AI Analysis
**Prompt Structure:**
- Chart context (asset, timeframe, source)
- Technical analysis instructions
- **Trading memory injection** (your historical stats)
- Explicit instruction to warn about poor setups

**Supported AI Providers:**
- **OpenAI:** GPT-4o, GPT-4o Mini, GPT-4 Turbo
- **Google Gemini:** Gemini 3.0 Flash, 2.5 Flash, 2.5 Flash-Lite, 2.5 Pro
- **Anthropic:** Claude 3 Opus, Sonnet, Haiku

Each provider has different strengths:
- **OpenAI GPT-4o:** Best overall quality, proven in finance
- **Gemini 2.5 Flash:** Stable & fast, excellent value, great for high volume
- **Claude 3 Opus:** Most detailed analysis, strong reasoning

**See [MULTI_PROVIDER_GUIDE.md](MULTI_PROVIDER_GUIDE.md) for detailed comparison**

**Example API Call:**
```javascript
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "user",
      "content": [
        {"type": "text", "text": "Analyze this chart..."},
        {"type": "image_url", "image_url": {"url": "data:image/png;base64,..."}}
      ]
    }
  ],
  "max_tokens": 1000
}
```

### 3. Trading Memory
**Storage:**
- Uses Chrome Storage API (`chrome.storage.local`)
- Structure:
  ```javascript
  {
    "Bull Flag": {
      wins: 5,
      losses: 3,
      breakEven: 1,
      trades: [...],
      commonMistakes: ["Entered too early", "Stop too tight"]
    }
  }
  ```

**Warning Logic:**
- If setup type matches historical data
- And win rate < 40%
- And total trades >= 3
- Then: Display explicit warning

---

## 🔐 Security Considerations

### API Key Storage
- **Current:** Stored in `chrome.storage.local` (unencrypted)
- **Risk:** Accessible by other extensions with storage permissions
- **For MVP:** Acceptable for personal use
- **For production:**
  - Use OAuth with backend proxy
  - Or prompt for API key per session
  - Or use Chrome Identity API

### Data Privacy
- All data stored locally (no external database)
- No analytics or tracking
- API calls go directly to OpenAI (subject to their privacy policy)

---

## 🎨 Customization

### Change AI Model
Edit `scripts/config.js` defaults or use settings in popup:
```javascript
model: 'gpt-4o'  // or 'gpt-4-turbo', 'gpt-4o-mini'
```

### Adjust Analysis Depth
Change `maxTokens` for longer/shorter responses:
```javascript
maxTokens: 1000  // 500-2000 recommended
```

### Customize Prompt
Edit `scripts/ai.js` → `buildPrompt()` function to modify:
- Analysis focus (e.g., more emphasis on volume)
- Output format
- Warning thresholds

---

## 🐛 Troubleshooting

### "Failed to capture screenshot"
- **Cause:** Tab permissions or browser security
- **Fix:** Ensure you're on a regular webpage (not chrome://, file://, or extension pages)

### "OpenAI API error (401)"
- **Cause:** Invalid or expired API key
- **Fix:** Go to Settings and enter a new API key

### "Analysis takes too long"
- **Cause:** Large image or slow connection
- **Fix:** 
  - Check internet connection
  - Try smaller browser window (less pixels to process)
  - Reduce `maxTokens` in config

### "Warning not showing despite poor win rate"
- **Cause:** Setup type name mismatch
- **Fix:** AI must classify setup with exact same name as historical data
  - This improves over time as you log more trades

---

## 📊 Trading Memory Design

### Normalization
- Setup types are normalized (capitalized, trimmed)
- Example: "bull flag" → "Bull Flag"

### Mistake Extraction
- Automatically detects patterns in loss notes:
  - "entered too early"
  - "stop loss too tight"
  - "FOMO"
  - "revenge trading"
- Stores top 5 most common mistakes per setup

### Future Migration to Backend
Current implementation can be replaced with API calls:

```javascript
// memory.js - Replace chrome.storage calls with:
async getAllStats() {
  const response = await fetch('https://your-api.com/stats', {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  return response.json();
}
```

---

## 📝 Example Prompts Sent to Vision LLM

### Basic Prompt (No Trading History)
```
You are an expert technical analyst helping a trader analyze charts.

**Chart Context:**
- Asset: BTC/USD
- Timeframe: 1 Hour
- Source: TradingView

**Your Task:**
Analyze this chart and provide:
1. Setup Classification (e.g., "Bull Flag")
2. Technical Analysis (trend, S/R, patterns)
3. Risk Assessment (entry, stop, R/R)
4. Trade Considerations (confirmation, invalidation)

Start your response with: "SETUP_TYPE: [classification]"
```

### Prompt With Trading History
```
[Same as above, plus:]

**IMPORTANT - Your Personal Trading History:**
Based on your past trades:
- Bull Flag: 5W / 3L (62.5% win rate)
- Head and Shoulders: 1W / 4L (20% win rate)
  Common mistakes: Entered too early, Stop too tight

**CRITICAL:** If the current setup matches "Head and Shoulders",
you MUST warn the trader: "⚠️ WARNING: You have a poor track record
with Head and Shoulders - 1 win vs 4 losses (20% win rate).
Proceed with extra caution or consider skipping this trade."
```

---

## 🛠️ Development

### Testing
1. Make changes to source files
2. Go to `chrome://extensions/`
3. Click "Reload" button on Chart AI Assistant
4. Test in popup

### Debugging
- **Popup:** Right-click popup → Inspect
- **Background:** Click "Service worker" link in extensions page
- **Console logs:** Check both popup and background consoles

### Adding Features
- New UI elements: Edit `popup/popup.html` and `popup/popup.css`
- New analysis logic: Edit `scripts/ai.js`
- New storage features: Edit `scripts/memory.js`

---

## ⚠️ Disclaimers

### Not Financial Advice
- This tool provides educational analysis only
- All trading decisions are your responsibility
- Past performance does not guarantee future results

### No Guarantees
- AI analysis may be inaccurate or incomplete
- Trading memory is based on your logged data (garbage in, garbage out)
- Market conditions change; historical patterns may not repeat

### API Costs
- OpenAI Vision API calls cost money
- Estimate: ~$0.01-0.03 per analysis (depending on image size and model)
- Monitor your OpenAI usage dashboard

### Risk Warning
Trading cryptocurrencies and financial markets involves substantial risk of loss. Only trade with capital you can afford to lose.

---

## 📄 License

This is personal software provided as-is without warranty. Use at your own risk.

---

## 🤝 Contributing

This is a personal MVP project. If you fork it:
- Keep the educational purpose clear
- Do NOT add auto-trading features
- Do NOT claim it provides financial advice
- Consider adding backend proxy for API key security

---

## 📧 Support

This is a personal project without official support. For issues:
1. Check the Troubleshooting section
2. Review Chrome Extension documentation
3. Check OpenAI API status

---

## 🗺️ Roadmap (Future Enhancements)

- [ ] Backend API for trading memory (sync across devices)
- [ ] Export/import trading journal as CSV
- [ ] More detailed statistics (by timeframe, asset, date range)
- [ ] Integration with trading journals (EdgeWonk, TraderSync)
- [ ] Support for multiple AI providers (Anthropic Claude, Google Gemini)
- [ ] Advanced chart annotation (draw on screenshot)
- [ ] Voice note recording for trade logs
- [ ] Custom setup type templates

---

**Happy Trading! 📈**

Remember: This tool helps you learn and reflect, but YOU make the trading decisions. Stay disciplined! 💪
