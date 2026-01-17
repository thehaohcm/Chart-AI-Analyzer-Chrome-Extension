# 🤖 Multi-Provider AI Guide

## Overview

The Chart AI Assistant now supports multiple AI providers, giving you flexibility to choose the best model for your needs based on cost, performance, and availability.

## Supported Providers

### 1. OpenAI (Default)
- **Models:**
  - **GPT-4o** (Recommended) - Best vision understanding, high quality analysis
  - **GPT-4o Mini** - Cheaper alternative, good for frequent analysis
  - **GPT-4 Turbo** - Previous generation, still very capable
  - **ChatGPT-4o Latest** - Latest ChatGPT model with vision

- **API Key:** Get at https://platform.openai.com/api-keys
- **Format:** Starts with `sk-`
- **Cost:** ~$0.01-0.03 per analysis
- **Best For:** Highest quality analysis, complex chart patterns

### 2. Google Gemini
- **Models:**
  - **Gemini 1.5 Pro** (Recommended) - Excellent vision, large context window
  - **Gemini 1.5 Flash** - Faster responses, lower cost
  - **Gemini Pro Vision** - Previous generation

- **API Key:** Get at https://aistudio.google.com/app/apikey
- **Format:** Starts with `AI`
- **Cost:** ~$0.001-0.01 per analysis (much cheaper!)
- **Best For:** Cost-effective, fast analysis, high volume usage

### 3. Anthropic Claude
- **Models:**
  - **Claude 3 Opus** - Highest quality, most detailed analysis
  - **Claude 3 Sonnet** - Balanced performance and cost
  - **Claude 3 Haiku** - Fastest, most affordable

- **API Key:** Get at https://console.anthropic.com/
- **Format:** Starts with `sk-ant-`
- **Cost:** ~$0.015-0.075 per analysis
- **Best For:** Detailed analysis, strong reasoning, safety focus

---

## How to Configure

### Initial Setup

1. **Open Extension**
   - Click the Chart AI Assistant icon in Chrome toolbar

2. **Select Provider**
   - Choose from: OpenAI, Google Gemini, or Anthropic Claude
   - Provider dropdown will update available models

3. **Select Model**
   - Choose the model that fits your needs
   - Recommended models are marked

4. **Enter API Key**
   - Paste your API key for the selected provider
   - Each provider has different key format

5. **Save Configuration**
   - Click "Save Configuration"
   - Settings are stored locally

### Switching Providers

1. **Open Settings**
   - Click "⚙️ Settings" button in the popup

2. **Change Provider/Model**
   - Select different provider from dropdown
   - Choose new model
   - Enter API key if different

3. **Save**
   - Click "Save Configuration"
   - New provider will be used for next analysis

---

## Cost Comparison

### Per Analysis (1000 tokens output, high-detail image)

| Provider | Model | Cost | Speed | Quality |
|----------|-------|------|-------|---------|
| OpenAI | GPT-4o | $0.025 | Medium | Excellent |
| OpenAI | GPT-4o Mini | $0.005 | Fast | Very Good |
| Gemini | 1.5 Pro | $0.008 | Fast | Excellent |
| Gemini | 1.5 Flash | $0.002 | Very Fast | Good |
| Claude | 3 Opus | $0.075 | Slow | Excellent |
| Claude | 3 Sonnet | $0.015 | Medium | Very Good |
| Claude | 3 Haiku | $0.005 | Fast | Good |

### Monthly Cost Estimates (100 analyses)

- **OpenAI GPT-4o:** $2.50/month
- **OpenAI GPT-4o Mini:** $0.50/month
- **Gemini 1.5 Pro:** $0.80/month
- **Gemini 1.5 Flash:** $0.20/month ⭐ Best value
- **Claude 3 Opus:** $7.50/month
- **Claude 3 Sonnet:** $1.50/month
- **Claude 3 Haiku:** $0.50/month

---

## Provider Strengths

### OpenAI GPT-4o
✅ **Strengths:**
- Best overall vision understanding
- Excellent at complex chart patterns
- Consistent output format
- Wide community support

❌ **Weaknesses:**
- Higher cost
- Rate limits on free tier
- Requires billing setup

**Best Use Cases:**
- Professional traders
- Complex technical analysis
- When quality matters most

---

### Google Gemini
✅ **Strengths:**
- Very cost-effective
- Large context window (up to 1M tokens)
- Fast response times
- Generous free tier
- Good vision capabilities

❌ **Weaknesses:**
- Newer, less proven in finance
- Sometimes verbose output
- API may have regional restrictions

**Best Use Cases:**
- High-volume analysis
- Budget-conscious traders
- Beginners learning patterns
- Testing and development

---

### Anthropic Claude
✅ **Strengths:**
- Excellent reasoning
- Very detailed analysis
- Strong safety features
- Good at nuance

❌ **Weaknesses:**
- Higher cost (except Haiku)
- Slower response
- Smaller context window

**Best Use Cases:**
- Complex decision-making
- When you need detailed explanations
- Risk assessment focus
- Professional institutional use

---

## Recommendations by Use Case

### 1. **Beginner Trader (Learning)**
**Recommended:** Gemini 1.5 Flash
- Cost-effective for frequent use
- Good quality for learning
- Fast feedback loop
- ~$0.20/month for 100 analyses

### 2. **Active Day Trader**
**Recommended:** Gemini 1.5 Pro or GPT-4o Mini
- Balance of cost and quality
- Fast enough for quick decisions
- Reliable analysis
- ~$0.50-0.80/month

### 3. **Professional Trader**
**Recommended:** GPT-4o or Claude 3 Sonnet
- Highest quality analysis
- Worth the cost for serious trading
- Proven track record
- ~$1.50-2.50/month

### 4. **High-Volume Screener**
**Recommended:** Gemini 1.5 Flash
- Lowest cost per analysis
- Fast processing
- Good enough for initial filtering
- Scale to 1000s of analyses

### 5. **Risk-Focused Institution**
**Recommended:** Claude 3 Opus or Sonnet
- Detailed risk assessment
- Strong reasoning
- Safety-focused
- ~$1.50-7.50/month

---

## API Key Setup Guides

### OpenAI
1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy key (starts with `sk-`)
5. **Important:** Add billing at https://platform.openai.com/account/billing
6. Set usage limit ($10/month recommended for testing)

### Google Gemini
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy key (starts with `AI`)
5. **Free tier:** 60 requests per minute
6. No billing required for free tier

### Anthropic Claude
1. Go to https://console.anthropic.com/
2. Sign up for account
3. Go to API Keys section
4. Create new key
5. Copy key (starts with `sk-ant-`)
6. Add payment method
7. Set budget limits

---

## Technical Implementation

### How It Works

```javascript
// Config stores provider and model
{
  provider: 'gemini',
  model: 'gemini-1.5-pro-latest',
  apiKey: 'AI...'
}

// AI service detects provider and routes to correct API
AIService.analyzeChart() 
  → callVisionAPI()
    → callGeminiVisionAPI() // or OpenAI or Anthropic
      → formats request for that provider
      → sends to provider API
      → parses response
      → returns standardized result
```

### Provider-Specific Formats

**OpenAI:**
```javascript
POST https://api.openai.com/v1/chat/completions
Authorization: Bearer sk-...
{
  "model": "gpt-4o",
  "messages": [{ 
    "role": "user",
    "content": [
      { "type": "text", "text": "..." },
      { "type": "image_url", "image_url": { "url": "data:image/png;base64,..." }}
    ]
  }]
}
```

**Gemini:**
```javascript
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=AI...
{
  "contents": [{
    "parts": [
      { "text": "..." },
      { "inline_data": { "mime_type": "image/png", "data": "..." }}
    ]
  }]
}
```

**Anthropic:**
```javascript
POST https://api.anthropic.com/v1/messages
x-api-key: sk-ant-...
{
  "model": "claude-3-opus-20240229",
  "messages": [{
    "role": "user",
    "content": [
      { "type": "image", "source": { "type": "base64", "data": "..." }},
      { "type": "text", "text": "..." }
    ]
  }]
}
```

---

## Troubleshooting

### "API error (401): Invalid authentication"
- **Cause:** Wrong API key or expired
- **Fix:** 
  - Verify key format matches provider
  - OpenAI: `sk-...`
  - Gemini: `AI...`
  - Anthropic: `sk-ant-...`
  - Regenerate key if needed

### "API error (429): Rate limit exceeded"
- **Cause:** Too many requests
- **Fix:**
  - Wait a moment and retry
  - Upgrade to paid tier
  - Switch to different provider temporarily

### "API error (400): Invalid model"
- **Cause:** Model not available or wrong name
- **Fix:**
  - Check model is available in your region
  - Select different model from dropdown
  - Some models require special access

### "Gemini: API not available in your region"
- **Cause:** Gemini has regional restrictions
- **Fix:**
  - Use VPN to supported region
  - Or switch to OpenAI/Anthropic
  - Check https://ai.google.dev/available_regions

### Analysis quality seems lower
- **Cause:** Using cheaper/faster model
- **Fix:**
  - Upgrade to recommended model
  - GPT-4o, Gemini Pro, or Claude Opus
  - May need to adjust maxTokens in settings

---

## Best Practices

### 1. **Start with Free Tier**
- Test with Gemini 1.5 Flash (free tier available)
- Validate the extension works for you
- Then upgrade to paid providers if needed

### 2. **Set Budget Limits**
- All providers allow usage limits
- Set alerts for spending
- Monitor your usage regularly

### 3. **Match Provider to Task**
- Quick screening → Gemini Flash
- Important trades → GPT-4o or Claude Opus
- Learning patterns → Gemini Pro
- High volume → Gemini Flash

### 4. **Keep Multiple Keys**
- Have backup providers configured
- If one hits rate limit, switch to another
- Different providers for different accounts

### 5. **Monitor Quality**
- Track which provider gives best warnings
- Compare analysis quality for your style
- Adjust based on results

---

## Future Enhancements

Planned support for:
- [ ] Local models (Ollama, LM Studio)
- [ ] Azure OpenAI
- [ ] AWS Bedrock
- [ ] Cohere Vision
- [ ] Custom endpoint support

---

## FAQ

**Q: Can I use multiple providers at once?**
A: Not simultaneously, but you can quickly switch between them in settings.

**Q: Will my trading history work with all providers?**
A: Yes! Trading memory is independent of AI provider.

**Q: Which provider do you recommend?**
A: For beginners: Gemini 1.5 Flash (cheapest). For serious trading: GPT-4o (best quality).

**Q: Can I use free tiers?**
A: Gemini has a generous free tier. OpenAI and Anthropic require billing setup.

**Q: Do different providers give different analysis?**
A: Yes, slightly. Each has different strengths. Test to see which you prefer.

**Q: Is my API key safe?**
A: It's stored locally in Chrome Storage. For production use, consider a backend proxy.

**Q: Can I switch providers mid-session?**
A: Yes! Just go to Settings and change provider/model anytime.

---

## Support

For provider-specific issues:
- **OpenAI:** https://platform.openai.com/docs
- **Gemini:** https://ai.google.dev/docs
- **Anthropic:** https://docs.anthropic.com/

For extension issues: Check README.md and TROUBLESHOOTING sections.

---

**Happy Trading with Multi-Provider AI!** 🚀📊
