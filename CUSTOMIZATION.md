# 🎛️ Customization Guide

Quick reference for common modifications to personalize your Chart AI Assistant.

---

## 🤖 AI Prompt Customization

### Change Analysis Focus

**File:** `scripts/ai.js` → `buildPrompt()` function

#### Add Indicator Focus
```javascript
// After "Your Task:" section, add:

**Special Instructions:**
Pay close attention to:
- RSI levels (if visible) - note overbought/oversold
- MACD crossovers (if visible) - bullish/bearish signals
- Volume profile (if visible) - accumulation/distribution

Include these in your analysis.
```

#### Emphasize Risk Management
```javascript
// In the prompt, add:

**Risk Priority:**
This trader prioritizes capital preservation.
For every setup, explicitly state:
1. Maximum risk per trade (% of account)
2. Worst-case scenario
3. Why NOT to take this trade

Be conservative and cautious in your recommendations.
```

#### Add Trading Style Context
```javascript
// Add before "Your Task:" section:

**Trading Style:**
- Timeframe: ${tradingStyle.timeframe || 'Intraday'}
- Position size: ${tradingStyle.positionSize || 'Small (1-2% risk)'}
- Holding period: ${tradingStyle.holdingPeriod || '1-3 days'}

Analyze from this perspective.
```

---

## 📊 Trading Memory Customization

### Change Warning Threshold

**File:** `scripts/memory.js` → Line with threshold check

**Current:** Warns if win rate < 40% and total trades >= 3

```javascript
// Find this section:
if (total >= 3 && winRate < 40) {
  warning = `You have a poor track record...`;
}

// Customize thresholds:

// More sensitive (warns earlier):
if (total >= 2 && winRate < 50) {
  warning = `Caution: Only ${winRate.toFixed(1)}% win rate...`;
}

// Less sensitive (warns only with strong evidence):
if (total >= 5 && winRate < 30) {
  warning = `Strong warning: ${winRate.toFixed(1)}% win rate...`;
}
```

### Add Custom Mistake Patterns

**File:** `scripts/memory.js` → `updateCommonMistakes()` function

```javascript
// Add to the patterns array:

const patterns = [
  // Existing patterns...
  
  // Your custom patterns:
  { regex: /too\s+big\s+position/i, mistake: 'Position size too large' },
  { regex: /didn'?t\s+wait/i, mistake: 'Impatience' },
  { regex: /ignored\s+news/i, mistake: 'Ignored fundamentals' },
  { regex: /chased\s+price/i, mistake: 'Chasing entry' },
  { regex: /held\s+too\s+long/i, mistake: 'Held past target' }
];
```

### Add Trade Tags/Categories

```javascript
// In logTrade() function, extend the trade object:

stats[normalizedSetup].trades.push({
  outcome,
  note: note || '',
  timestamp,
  // Add custom fields:
  tags: extractTags(note), // e.g., ['earnings', 'breakout']
  timeOfDay: new Date(timestamp).getHours(), // Track performance by hour
  confidence: extractConfidence(note) // e.g., 'high', 'medium', 'low'
});

// Helper function to extract tags:
function extractTags(note) {
  const tags = [];
  if (/earnings/i.test(note)) tags.push('earnings');
  if (/news/i.test(note)) tags.push('news');
  if (/breakout/i.test(note)) tags.push('breakout');
  return tags;
}
```

---

## 🎨 UI Customization

### Change Color Scheme

**File:** `popup/popup.css`

#### Dark Mode
```css
/* Replace body and .container styles: */

body {
  background: #1a1a1a;
  color: #e5e5e5;
}

.container {
  background: #2d2d2d;
}

.header {
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
}

.result-box {
  background: #1a1a1a;
  border: 1px solid #4a5568;
  color: #e5e5e5;
}

.input-field {
  background: #1a1a1a;
  border: 1px solid #4a5568;
  color: #e5e5e5;
}
```

#### Custom Brand Colors
```css
/* Change primary color throughout: */

/* From purple to blue: */
.header {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.setup-badge {
  background: #3b82f6;
}

/* Or green theme: */
.header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}
```

### Add Chart Preview Enhancement

**File:** `popup/popup.css`

```css
/* Make screenshot interactive: */

#screenshotPreview {
  cursor: zoom-in;
  transition: transform 0.3s;
}

#screenshotPreview:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

/* Add click to enlarge: */
#screenshotPreview.zoomed {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1.5);
  z-index: 9999;
  max-width: 90vw;
  max-height: 90vh;
}
```

**File:** `popup/popup.js`

```javascript
// Add in attachEventListeners():

elements.screenshotPreview.addEventListener('click', () => {
  elements.screenshotPreview.classList.toggle('zoomed');
});
```

### Add Keyboard Shortcuts

**File:** `popup/popup.js`

```javascript
// Add in DOMContentLoaded:

document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + Enter = Capture
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    handleCapture();
  }
  
  // Ctrl/Cmd + C = Copy analysis
  if ((e.ctrlKey || e.metaKey) && e.key === 'c' && currentAnalysis) {
    e.preventDefault();
    handleCopyAnalysis();
  }
  
  // W = Log Win
  if (e.key === 'w' && currentSetupType) {
    document.querySelector('[data-outcome="win"]').click();
  }
  
  // L = Log Loss
  if (e.key === 'l' && currentSetupType) {
    document.querySelector('[data-outcome="loss"]').click();
  }
});
```

---

## ⚙️ Configuration Defaults

### Change AI Model

**File:** `scripts/config.js` → `defaults` object

```javascript
defaults: {
  apiKey: '',
  model: 'gpt-4o-mini',  // Cheaper, faster (less accurate)
  // or
  model: 'gpt-4-turbo',  // More expensive (potentially better)
  maxTokens: 1500,        // Longer responses
  temperature: 0.5        // Lower = more focused
}
```

### Add Auto-Save Screenshots

**File:** `popup/popup.js` → `handleCapture()` function

```javascript
// After displaying preview, add:

// Auto-download screenshot
const link = document.createElement('a');
link.href = captureResult.imageData;
link.download = `chart-${asset}-${Date.now()}.png`;
link.click();
```

---

## 📈 Statistics Enhancements

### Add Win Rate by Day of Week

**File:** `scripts/memory.js` → Add new function

```javascript
async getStatsByDayOfWeek() {
  const allStats = await this.getAllStats();
  const dayStats = {
    0: { wins: 0, losses: 0 }, // Sunday
    1: { wins: 0, losses: 0 }, // Monday
    // ... etc
  };
  
  for (const [setupType, data] of Object.entries(allStats)) {
    for (const trade of data.trades) {
      const day = new Date(trade.timestamp).getDay();
      if (trade.outcome === 'win') {
        dayStats[day].wins++;
      } else if (trade.outcome === 'loss') {
        dayStats[day].losses++;
      }
    }
  }
  
  return dayStats;
}
```

### Add Performance Chart

**File:** `popup/popup.html` → Add before stats section

```html
<div class="chart-container">
  <canvas id="performanceChart"></canvas>
</div>
```

**Add Chart.js (in popup.html <head>):**
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

**File:** `popup/popup.js` → Add function

```javascript
async function drawPerformanceChart() {
  const summary = await TradingMemory.getDisplaySummary();
  const ctx = document.getElementById('performanceChart').getContext('2d');
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: summary.setupBreakdown.map(s => s.setupType),
      datasets: [{
        label: 'Wins',
        data: summary.setupBreakdown.map(s => s.wins),
        backgroundColor: '#10b981'
      }, {
        label: 'Losses',
        data: summary.setupBreakdown.map(s => s.losses),
        backgroundColor: '#ef4444'
      }]
    }
  });
}
```

---

## 🔧 Advanced Features

### Add Multiple AI Providers

**File:** `scripts/ai.js` → Add new function

```javascript
async callAIProvider({ provider, apiKey, prompt, base64Image }) {
  switch(provider) {
    case 'openai':
      return await this.callOpenAIVisionAPI({ apiKey, prompt, base64Image });
    
    case 'anthropic':
      return await this.callClaudeAPI({ apiKey, prompt, base64Image });
    
    case 'google':
      return await this.callGeminiAPI({ apiKey, prompt, base64Image });
    
    default:
      throw new Error('Unknown AI provider');
  }
}

// Implement each provider's API call
async callClaudeAPI({ apiKey, prompt, base64Image }) {
  // Anthropic Claude Vision API
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { 
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/png',
              data: base64Image
            }
          }
        ]
      }]
    })
  });
  
  const data = await response.json();
  return data.content[0].text;
}
```

### Add Audio Notifications

**File:** `popup/popup.js`

```javascript
function playSound(type) {
  const audio = new Audio();
  
  if (type === 'success') {
    // Success sound (can be data URL or file)
    audio.src = 'data:audio/wav;base64,...'; // Or './sounds/success.mp3'
  } else if (type === 'warning') {
    audio.src = 'data:audio/wav;base64,...';
  }
  
  audio.play().catch(e => console.log('Audio play failed:', e));
}

// Use in appropriate places:
function displayAnalysis(analysis) {
  // ... existing code ...
  
  if (analysis.warning) {
    playSound('warning');
  } else {
    playSound('success');
  }
}
```

### Add Export to CSV

**File:** `scripts/memory.js` → Add function

```javascript
async exportToCSV() {
  const allStats = await this.getAllStats();
  const rows = [
    ['Setup Type', 'Outcome', 'Note', 'Timestamp']
  ];
  
  for (const [setupType, data] of Object.entries(allStats)) {
    for (const trade of data.trades) {
      rows.push([
        setupType,
        trade.outcome,
        trade.note.replace(/"/g, '""'), // Escape quotes
        trade.timestamp
      ]);
    }
  }
  
  const csv = rows.map(row => 
    row.map(cell => `"${cell}"`).join(',')
  ).join('\n');
  
  return csv;
}
```

**File:** `popup/popup.js` → Add button handler

```javascript
async function handleExportCSV() {
  const csv = await TradingMemory.exportToCSV();
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `trading-journal-${Date.now()}.csv`;
  link.click();
  
  URL.revokeObjectURL(url);
  showSuccess('Journal exported!');
}
```

---

## 🚦 Tips for Customization

### Testing Changes
1. Make changes to source files
2. Go to `chrome://extensions/`
3. Click "Reload" on Chart AI Assistant
4. Test in popup (right-click → Inspect for console)

### Debugging
```javascript
// Add debug logging:
console.log('[DEBUG] Current state:', { 
  setupType: currentSetupType,
  hasMemory: Object.keys(tradingMemory).length
});

// Or use debugger:
debugger; // Will pause execution in DevTools
```

### Version Control
```bash
# Before making changes:
git checkout -b feature/my-customization
git commit -am "Add custom feature"

# If something breaks:
git checkout main  # Return to working version
```

### Performance Tips
- Avoid heavy processing in popup (use service worker)
- Cache repeated API calls
- Lazy load features (don't load everything on popup open)
- Use `chrome.storage.local` over `chrome.storage.sync` for speed

---

## 📝 Common Pitfall Solutions

### Issue: Changes not appearing
**Solution:** Always reload extension after code changes

### Issue: API calls failing in service worker
**Solution:** Service workers have limitations - do API calls in popup context

### Issue: Storage quota exceeded
**Solution:** Implement data cleanup for old trades:
```javascript
// Keep only last 6 months of trades
async cleanupOldTrades() {
  const sixMonthsAgo = Date.now() - (180 * 24 * 60 * 60 * 1000);
  const stats = await this.getAllStats();
  
  for (const [setupType, data] of Object.entries(stats)) {
    data.trades = data.trades.filter(t => 
      new Date(t.timestamp).getTime() > sixMonthsAgo
    );
  }
  
  await this.saveStats(stats);
}
```

### Issue: CSP violations
**Solution:** Don't use inline scripts/styles. All code in separate files.

---

**Happy Customizing! 🎨**

Remember to test thoroughly after each change. Start small and iterate!
