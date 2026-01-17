# 🏗️ Architecture & Design Decisions

## Overview

Chart AI Assistant is built with clean separation of concerns, making it maintainable, testable, and extensible. This document explains key architectural decisions and their rationale.

---

## 📐 Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                  Chrome Browser                      │
│                                                      │
│  ┌────────────────────────────────────────────┐   │
│  │          Active Tab (TradingView)          │   │
│  │              [Chart Display]                │   │
│  └───────────────────┬────────────────────────┘   │
│                      │ captureVisibleTab          │
│                      ▼                             │
│  ┌────────────────────────────────────────────┐   │
│  │      Background Service Worker             │   │
│  │   • Screenshot capture                     │   │
│  │   • Message routing                        │   │
│  │   • Ephemeral (wakes on demand)           │   │
│  └───────────────────┬────────────────────────┘   │
│                      │ Base64 image                │
│                      ▼                             │
│  ┌────────────────────────────────────────────┐   │
│  │            Popup UI                        │   │
│  │   ┌─────────────────────────────────┐    │   │
│  │   │  popup.js (Controller)          │    │   │
│  │   │  • User interaction             │    │   │
│  │   │  • UI state management          │    │   │
│  │   │  • Orchestration                │    │   │
│  │   └──┬──────────┬───────────┬───────┘    │   │
│  │      │          │           │             │   │
│  │      ▼          ▼           ▼             │   │
│  │   ┌─────┐  ┌────────┐  ┌────────┐       │   │
│  │   │config│  │   ai   │  │ memory │       │   │
│  │   │ .js  │  │  .js   │  │  .js   │       │   │
│  │   └──┬──┘  └───┬────┘  └───┬────┘       │   │
│  │      │         │            │             │   │
│  └──────┼─────────┼────────────┼─────────────┘   │
│         │         │            │                  │
│         ▼         ▼            ▼                  │
│  ┌─────────────────────────────────────────┐    │
│  │      Chrome Storage API                  │    │
│  │  • settings (API key, model)            │    │
│  │  • tradingStats (wins/losses)           │    │
│  └─────────────────────────────────────────┘    │
└─────────────────┬───────────────────────────────┘
                  │ HTTPS
                  ▼
         ┌─────────────────┐
         │  OpenAI API     │
         │  • GPT-4o       │
         │  • Vision input │
         └─────────────────┘
```

---

## 🧩 Module Breakdown

### 1. Background Service Worker (`background/service-worker.js`)

**Purpose:** Handle browser-level operations that require privileged APIs.

**Responsibilities:**
- Capture screenshots using `chrome.tabs.captureVisibleTab`
- Message routing between popup and browser
- Extension lifecycle management

**Key Decisions:**
- ✅ **Manifest V3 Service Worker** (not background page)
  - Required by Chrome's latest standards
  - More efficient (event-driven, not persistent)
  - Better security model
  
- ✅ **Minimal state**
  - Service workers are ephemeral (can be killed anytime)
  - All persistent data in chrome.storage
  - No complex logic (delegated to popup)

**Code Pattern:**
```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureVisibleTab') {
    // Async operation
    handleCapture(sendResponse);
    return true; // Required for async sendResponse
  }
});
```

---

### 2. Popup UI (`popup/`)

**Purpose:** User interface and application logic orchestration.

**Files:**
- `popup.html` - Structure (semantic HTML)
- `popup.css` - Styling (clean, modern design)
- `popup.js` - Controller (event handling, orchestration)

**Key Decisions:**
- ✅ **Vanilla JavaScript** (no frameworks)
  - Faster load time
  - No dependencies
  - Simpler debugging
  - Appropriate for extension size

- ✅ **Module pattern** (not ES6 modules)
  - Chrome extensions have CSP restrictions
  - Global objects are fine for this scope
  - Each script is self-contained

- ✅ **Clear separation of concerns**
  - HTML = structure
  - CSS = presentation
  - JS = behavior
  - No inline styles or scripts

**State Management:**
```javascript
// Simple state variables
let currentAnalysis = null;
let currentSetupType = null;

// No complex state management needed for MVP
// Can migrate to Redux/Zustand if complexity grows
```

---

### 3. AI Module (`scripts/ai.js`)

**Purpose:** OpenAI Vision API integration and prompt engineering.

**Responsibilities:**
- Construct prompts with context
- Call OpenAI API
- Parse and structure responses
- Extract setup type
- Generate warnings

**Key Decisions:**
- ✅ **Direct API calls** (no backend proxy)
  - Simpler MVP implementation
  - Personal use only (API key stays local)
  - Easy to add proxy later:
    ```javascript
    // Future migration:
    const response = await fetch('https://your-backend.com/analyze', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${userToken}` },
      body: JSON.stringify({ image: base64Data })
    });
    ```

- ✅ **Structured prompt engineering**
  - Clear instructions for setup classification
  - Trading memory injection
  - Explicit warning instructions
  - Consistent format for parsing

- ✅ **High detail mode** for images
  - `detail: 'high'` in image_url config
  - Better for chart analysis (text, patterns)
  - Slightly more expensive but worth it

**API Call Structure:**
```javascript
{
  model: 'gpt-4o',
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: prompt },
      { type: 'image_url', image_url: {
        url: `data:image/png;base64,${base64}`,
        detail: 'high'
      }}
    ]
  }],
  max_tokens: 1000
}
```

---

### 4. Memory Module (`scripts/memory.js`)

**Purpose:** Trading statistics storage and retrieval.

**Data Structure:**
```javascript
{
  "Bull Flag": {
    wins: 5,
    losses: 3,
    breakEven: 1,
    trades: [{
      outcome: 'win',
      note: 'Perfect entry',
      timestamp: '2026-01-15T10:30:00Z'
    }],
    commonMistakes: ['Entered too early']
  }
}
```

**Key Decisions:**
- ✅ **Chrome Storage** (not IndexedDB)
  - Simpler API for MVP
  - Built-in JSON serialization
  - Max 10MB (plenty for stats)
  - Easy chrome.storage.sync migration later

- ✅ **Normalized setup types**
  - Capitalize first letter of each word
  - Consistent matching for history lookup
  - Example: "bull flag" → "Bull Flag"

- ✅ **Automatic mistake extraction**
  - Pattern matching in trade notes
  - Common phrases like "entered too early"
  - Builds knowledge base automatically

- ✅ **Designed for backend migration**
  - All operations are async
  - Simple to replace storage calls with API:
    ```javascript
    // Current:
    await chrome.storage.local.get(key);
    
    // Future:
    await fetch(`/api/stats/${userId}`);
    ```

**Why not IndexedDB?**
- More complex API (transactions, cursors)
- Overkill for current data volume
- Chrome Storage is adequate and simpler
- Can migrate later if needed

---

### 5. Config Module (`scripts/config.js`)

**Purpose:** Settings and API key management.

**Key Decisions:**
- ✅ **Chrome Storage for API keys**
  - Acceptable for personal MVP
  - User understands the risk
  - Masked display for security

- ⚠️ **Security considerations documented**
  - Chrome Storage is NOT encrypted at rest
  - Accessible by other extensions with storage permissions
  - Production alternatives suggested:
    - OAuth with backend proxy
    - Session-only API key prompts
    - Chrome Identity API

- ✅ **Validation included**
  - API key format check (`sk-` prefix)
  - Token limits validation
  - Configuration health check

**Future Security Options:**
```javascript
// Option 1: Session-only (most secure)
sessionStorage.setItem('apiKey', key); // Cleared on close

// Option 2: Chrome Identity + Backend
chrome.identity.getAuthToken({ interactive: true }, token => {
  // Use OAuth token, backend makes OpenAI calls
});

// Option 3: Encrypted storage (requires native messaging)
// Store in system keychain via native app
```

---

## 🔄 Data Flow

### Capture & Analyze Flow

```
1. User clicks "Capture & Analyze"
   ↓
2. popup.js → chrome.runtime.sendMessage('captureVisibleTab')
   ↓
3. service-worker.js → chrome.tabs.captureVisibleTab()
   ↓
4. service-worker.js → sendResponse({ base64Data, tabInfo })
   ↓
5. popup.js → AIService.analyzeChart()
   ↓
6. ai.js → buildPrompt() with trading memory
   ↓
7. ai.js → fetch OpenAI API
   ↓
8. ai.js → parseResponse() (extract setup type, check warnings)
   ↓
9. popup.js → displayAnalysis()
   ↓
10. User sees results + optional warning
```

### Trade Logging Flow

```
1. User clicks Win/Loss/BE
   ↓
2. popup.js → TradingMemory.logTrade()
   ↓
3. memory.js → Get current stats from storage
   ↓
4. memory.js → Update counters
   ↓
5. memory.js → Extract mistakes from note (if loss)
   ↓
6. memory.js → Save updated stats to storage
   ↓
7. popup.js → Show success notification
```

---

## 🎯 Design Patterns Used

### 1. Module Pattern
```javascript
const AIService = {
  async analyzeChart() { /* ... */ },
  buildPrompt() { /* ... */ }
};
window.AIService = AIService; // Global exposure
```

**Why:** Simple namespacing, no build step needed.

### 2. Promise-based Async/Await
```javascript
async function handleCapture() {
  const capture = await captureVisibleTab();
  const memory = await TradingMemory.getSummary();
  const analysis = await AIService.analyzeChart({ /* ... */ });
}
```

**Why:** Clean async code, better error handling.

### 3. Message Passing (Chrome APIs)
```javascript
chrome.runtime.sendMessage({ action: 'capture' }, response => {
  // Handle response
});
```

**Why:** Required for extension architecture, decouples components.

### 4. Dependency Injection (via parameters)
```javascript
AIService.analyzeChart({
  base64Image,
  asset,
  timeframe,
  tradingMemory  // Injected dependency
});
```

**Why:** Testable, flexible, clear data flow.

---

## 🔒 Security Architecture

### Current Model (MVP)
```
User → Extension → OpenAI API
         ↓
   Chrome Storage
   (API key stored)
```

**Risks:**
- API key in plaintext storage
- Accessible by malicious extensions
- Lost if Chrome profile compromised

**Mitigations:**
- Personal use only
- User awareness
- Masked display
- Can clear key anytime

### Production Model (Future)
```
User → Extension → Your Backend → OpenAI API
         ↓              ↓
   OAuth Token    (API key hidden)
```

**Benefits:**
- API key never on client
- Usage tracking per user
- Rate limiting
- Audit logs

---

## 🚀 Performance Considerations

### 1. Image Size Optimization
- Capture at native resolution (high quality for AI)
- PNG format (better for charts than JPEG)
- Base64 encoding adds ~33% size overhead
- Typical size: 500KB - 2MB per screenshot

### 2. API Response Time
- OpenAI Vision: 3-10 seconds typical
- Factors: image size, server load, model
- User feedback: loading spinner, progress text

### 3. Storage Efficiency
- Chrome Storage limit: 10MB local
- Current usage: ~10KB per 100 trades
- Safe for thousands of trades

### 4. Service Worker Lifecycle
- Wakes on message, sleeps after 30s idle
- No background compute (efficient)
- All processing in popup context

---

## 🧪 Testability

### Current State (Manual Testing)
- Extension loaded in dev mode
- Test with real charts
- Console logging for debugging

### Future Testing Strategy

**Unit Tests:**
```javascript
// Example with Jest
describe('TradingMemory', () => {
  test('normalizes setup types', () => {
    expect(TradingMemory.normalizeSetupType('bull flag'))
      .toBe('Bull Flag');
  });
});
```

**Integration Tests:**
```javascript
// Mock Chrome APIs
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  }
};
```

**E2E Tests:**
```javascript
// Puppeteer + chrome extension testing
const extensionId = 'your-extension-id';
await browser.goto(`chrome-extension://${extensionId}/popup/popup.html`);
```

---

## 📈 Scalability Path

### Current (MVP)
- Single user
- Local storage
- Direct API calls
- No analytics

### Phase 2 (Personal Pro)
- Backend sync
- Multiple devices
- Usage tracking
- Export/import

### Phase 3 (Multi-user)
- User authentication
- Database storage
- API rate limiting
- Subscription model

### Migration Strategy
```javascript
// memory.js already designed for this:

// Current
async getAllStats() {
  return await chrome.storage.local.get('stats');
}

// Future
async getAllStats() {
  const token = await Auth.getToken();
  return await fetch('/api/stats', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
}
```

Only need to change implementation, not interface!

---

## 🎨 UI/UX Decisions

### Design Principles
1. **Clarity over complexity** - Simple, obvious actions
2. **Immediate feedback** - Loading states, success messages
3. **Progressive disclosure** - Advanced features hidden initially
4. **Mobile-first dimensions** - 450px width (popup optimized)

### Color Scheme
- Primary: `#667eea` (Purple) - Trust, intelligence
- Success: `#10b981` (Green) - Positive outcomes
- Warning: `#f59e0b` (Amber) - Caution signals
- Error: `#ef4444` (Red) - Losses, problems

### Typography
- System fonts (`-apple-system`, etc.) - Fast, native feel
- 14px base size - Readable in popup
- Bold for emphasis, not color alone (accessibility)

---

## 🔮 Future Enhancements Architecture

### Backend API (When Needed)
```
┌─────────────┐
│  Extension  │
└──────┬──────┘
       │ REST/GraphQL
       ▼
┌─────────────┐
│  API Server │
│  (Node.js)  │
└──────┬──────┘
       │
       ├─► PostgreSQL (user data, stats)
       ├─► Redis (caching, sessions)
       └─► OpenAI API (proxied)
```

### Real-time Features
```
WebSocket connection for:
- Live market alerts
- Trade notifications
- Multi-device sync
```

### Advanced AI Features
```
- Custom model fine-tuning on your trades
- Pattern recognition across your history
- Predictive win rate calculations
- Automated journaling
```

---

## 📋 Code Quality Standards

### Followed Principles
- ✅ DRY (Don't Repeat Yourself)
- ✅ KISS (Keep It Simple, Stupid)
- ✅ Separation of Concerns
- ✅ Single Responsibility Principle
- ✅ Explicit over Implicit

### Comments Strategy
- **What** (not how) - Explain intent
- **Why** - Explain design decisions
- **Important** - Mark critical sections
- **TODO/FIXME** - Track technical debt

### Error Handling
```javascript
try {
  await riskyOperation();
} catch (error) {
  console.error('Context:', error); // Log for debugging
  showError('User-friendly message'); // Display to user
  // Don't throw - handle gracefully
}
```

---

## 🏁 Conclusion

This architecture balances:
- **Simplicity** - Easy to understand and modify
- **Extensibility** - Clear migration paths
- **Performance** - Efficient resource usage
- **Security** - Documented risks and mitigations
- **Maintainability** - Clean separation of concerns

Perfect for MVP, ready to scale. 🚀
