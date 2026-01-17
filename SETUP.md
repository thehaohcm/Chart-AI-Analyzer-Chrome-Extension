# 🚀 Quick Setup Guide

## Immediate Next Steps

### 1. Create Extension Icons (REQUIRED)

The extension needs icons to load in Chrome. Choose one of these methods:

#### Option A: Use Online Generator (Fastest)
1. Go to https://www.favicon-generator.org/ or https://www.websiteplanet.com/webtools/favicon-generator/
2. Upload or create a simple chart icon (📊 emoji works!)
3. Download the generated icons
4. Rename and place:
   - `favicon-16x16.png` → `assets/icons/icon16.png`
   - `favicon-48x48.png` → `assets/icons/icon48.png` (you may need to generate this separately)
   - `android-chrome-192x192.png` (resized to 128x128) → `assets/icons/icon128.png`

#### Option B: Use Any Image Editor
1. Create a 128x128 pixel PNG with any design
2. Resize copies to 48x48 and 16x16
3. Save as: `icon128.png`, `icon48.png`, `icon16.png`
4. Place in `assets/icons/` folder

#### Option C: Temporary Placeholder (Development Only)
Create simple colored squares:
```bash
# If you have ImageMagick installed:
cd assets/icons/
convert -size 16x16 xc:#667eea icon16.png
convert -size 48x48 xc:#667eea icon48.png
convert -size 128x128 xc:#667eea icon128.png
```

---

### 2. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. **Important:** Add billing information (required for API access)
   - Go to https://platform.openai.com/account/billing
   - Add payment method
   - Set usage limit (recommended: $10/month for testing)

**Cost Estimate:**
- GPT-4o Vision: ~$0.01-0.03 per chart analysis
- 100 analyses ≈ $1-3

---

### 3. Load Extension in Chrome

1. Open Chrome
2. Navigate to: `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right)
4. Click **"Load unpacked"**
5. Select the folder: `/Users/thehaohcm/Desktop/Projects/chart-ai-assistant`
6. Extension should now appear in toolbar

---

### 4. Configure Extension

1. Click the extension icon in Chrome toolbar
2. Enter your OpenAI API key when prompted
3. Click "Save API Key"

---

### 5. Test the Extension

1. Open TradingView: https://www.tradingview.com/chart/
2. Load any chart (BTC/USD, AAPL, etc.)
3. Click the extension icon
4. (Optional) Enter asset and timeframe
5. Click **"📸 Capture & Analyze Chart"**
6. Wait for AI analysis (~5-10 seconds)
7. Review the results

---

## Troubleshooting First Run

### "Extension manifest is invalid"
- **Cause:** Missing icon files
- **Fix:** Complete Step 1 above (create icons)

### "Failed to capture screenshot"
- **Cause:** Trying to capture on restricted pages
- **Fix:** Go to a regular website (not chrome://, file://, or extension pages)

### "OpenAI API error (401)"
- **Cause:** Invalid API key or billing not set up
- **Fix:** 
  1. Verify API key starts with `sk-`
  2. Check billing is configured: https://platform.openai.com/account/billing
  3. Re-enter API key in extension settings

### "OpenAI API error (429)"
- **Cause:** Rate limit or quota exceeded
- **Fix:**
  1. Check usage: https://platform.openai.com/usage
  2. Wait a moment and retry
  3. Add more credits if needed

---

## Testing Checklist

- [ ] Icons created and extension loads
- [ ] API key saved successfully
- [ ] Screenshot captures correctly
- [ ] AI analysis returns results
- [ ] Trade logging works (log a test Win)
- [ ] View stats displays correctly

---

## Development Workflow

### Making Changes

1. Edit source files in your code editor
2. Save changes
3. Go to `chrome://extensions/`
4. Click **Reload** button on "Chart AI Assistant"
5. Test in popup

### Debugging

**Popup Console:**
- Right-click popup → "Inspect"
- Check Console tab for errors

**Background Service Worker:**
- Go to `chrome://extensions/`
- Under Chart AI Assistant, click "service worker"
- Check Console for background errors

**Storage Inspection:**
- Right-click popup → "Inspect"
- Go to Application tab → Storage → Local Storage
- Or: Application → Storage → Extension Storage

---

## File Structure Reference

```
chart-ai-assistant/
├── manifest.json                 # Extension configuration
├── background/
│   └── service-worker.js        # Screenshot capture logic
├── popup/
│   ├── popup.html               # UI structure
│   ├── popup.js                 # UI controller
│   └── popup.css                # Styling
├── scripts/
│   ├── ai.js                    # OpenAI Vision API integration
│   ├── memory.js                # Trading memory storage
│   └── config.js                # Settings management
├── assets/
│   └── icons/                   # Extension icons (YOU NEED TO CREATE)
│       ├── icon16.png          # 16x16 toolbar icon
│       ├── icon48.png          # 48x48 management icon
│       └── icon128.png         # 128x128 store icon
└── README.md                    # Full documentation
```

---

## Key Design Decisions Explained

### Why Chrome Storage (not IndexedDB)?
- Simpler API for MVP
- Built-in sync capabilities (if needed later)
- Sufficient for current data volume
- Easy to migrate to backend later

### Why Service Worker (not Background Page)?
- Manifest V3 requirement
- More efficient (wakes up on demand)
- Better security model

### Why Direct OpenAI API Calls (not backend proxy)?
- MVP simplicity (no backend needed)
- Personal use only
- Can easily add proxy layer later

### Why Setup Type Classification?
- Enables personalized warnings
- Helps organize trading journal
- Foundation for future pattern recognition

---

## Next Steps After Testing

1. **Use it regularly** - Log trades to build memory
2. **Review statistics** - See which setups work for you
3. **Refine prompts** - Customize analysis focus in `ai.js`
4. **Add features** - Ideas in README roadmap section

---

## Security Reminders

- ⚠️ API key stored unencrypted in Chrome Storage
- ⚠️ For personal use only (don't share extension with key inside)
- ⚠️ Monitor OpenAI usage dashboard for unexpected costs
- ⚠️ Set billing limits on OpenAI account

---

## Support Resources

- Chrome Extension Docs: https://developer.chrome.com/docs/extensions/
- OpenAI API Docs: https://platform.openai.com/docs/
- OpenAI Vision Guide: https://platform.openai.com/docs/guides/vision

---

**You're all set!** Complete steps 1-4 above and start analyzing charts. 🚀📊
