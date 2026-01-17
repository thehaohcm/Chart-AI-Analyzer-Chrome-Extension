/**
 * Popup UI Controller
 * 
 * Orchestrates the user interface, handles user interactions,
 * and coordinates between capture, AI analysis, and memory modules.
 */

// State management
let currentAnalysis = null;
let currentSetupType = null;

// DOM Elements
const elements = {
  // Setup
  apiKeySetup: null,
  apiKeyInput: null,
  saveApiKeyBtn: null,
  mainInterface: null,
  
  // Input
  assetInput: null,
  timeframeInput: null,
  captureBtn: null,
  
  // Preview
  previewSection: null,
  screenshotPreview: null,
  
  // Analysis
  analysisSection: null,
  analysisResult: null,
  copyAnalysisBtn: null,
  loadingOverlay: null,
  
  // Trade Log
  tradeLogSection: null,
  tradeNoteInput: null,
  logBtns: null,
  
  // Stats
  viewStatsBtn: null,
  settingsBtn: null
};

/**
 * Initialize the popup
 */
document.addEventListener('DOMContentLoaded', async () => {
  initializeElements();
  await checkApiKeyConfiguration();
  attachEventListeners();
  await initializeProviderSettings();
});

/**
 * Cache DOM element references
 */
function initializeElements() {
  elements.apiKeySetup = document.getElementById('apiKeySetup');
  elements.apiKeyInput = document.getElementById('apiKeyInput');
  elements.saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
  elements.mainInterface = document.getElementById('mainInterface');
  
  elements.assetInput = document.getElementById('assetInput');
  elements.timeframeInput = document.getElementById('timeframeInput');
  elements.captureBtn = document.getElementById('captureBtn');
  
  elements.previewSection = document.getElementById('previewSection');
  elements.screenshotPreview = document.getElementById('screenshotPreview');
  
  elements.analysisSection = document.getElementById('analysisSection');
  elements.analysisResult = document.getElementById('analysisResult');
  elements.copyAnalysisBtn = document.getElementById('copyAnalysisBtn');
  elements.loadingOverlay = document.getElementById('loadingOverlay');
  
  elements.tradeLogSection = document.getElementById('tradeLogSection');
  elements.tradeNoteInput = document.getElementById('tradeNoteInput');
  elements.logBtns = document.querySelectorAll('.log-btn');
  
  elements.viewStatsBtn = document.getElementById('viewStatsBtn');
  elements.settingsBtn = document.getElementById('settingsBtn');
}

/**
 * Check if API key is configured
 */
async function checkApiKeyConfiguration() {
  const config = await Config.getConfig();
  
  if (!config.apiKey) {
    elements.apiKeySetup.style.display = 'block';
    elements.mainInterface.style.display = 'none';
  } else {
    elements.apiKeySetup.style.display = 'none';
    elements.mainInterface.style.display = 'block';
  }
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
  // API Key setup
  elements.saveApiKeyBtn.addEventListener('click', handleSaveApiKey);
  
  // Provider selection
  const providerSelect = document.getElementById('providerSelect');
  if (providerSelect) {
    providerSelect.addEventListener('change', handleProviderChange);
  }
  
  // Capture button
  elements.captureBtn.addEventListener('click', handleCapture);
  
  // Copy analysis button
  elements.copyAnalysisBtn.addEventListener('click', handleCopyAnalysis);
  
  // Trade log buttons
  elements.logBtns.forEach(btn => {
    btn.addEventListener('click', handleTradeLog);
  });
  
  // View stats button
  elements.viewStatsBtn.addEventListener('click', handleViewStats);
  
  // Settings button
  elements.settingsBtn.addEventListener('click', handleSettings);
}

/**
 * Initialize provider settings on load
 */
async function initializeProviderSettings() {
  const config = await Config.getConfig();
  const providerSelect = document.getElementById('providerSelect');
  const modelSelect = document.getElementById('modelSelect');
  
  if (providerSelect && config.provider) {
    providerSelect.value = config.provider;
    await handleProviderChange();
    
    if (modelSelect && config.model) {
      modelSelect.value = config.model;
    }
  }
}

/**
 * Handle provider change
 */
async function handleProviderChange() {
  const providerSelect = document.getElementById('providerSelect');
  const modelSelect = document.getElementById('modelSelect');
  const apiKeyLabel = document.getElementById('apiKeyLabel');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const providerInfo = document.getElementById('providerInfo');
  
  const providerId = providerSelect.value;
  const providers = Config.getProviders();
  const provider = providers[providerId];
  
  // Update model options
  modelSelect.innerHTML = '';
  provider.models.forEach(model => {
    const option = document.createElement('option');
    option.value = model.id;
    option.textContent = model.name;
    modelSelect.appendChild(option);
  });
  
  // Update API key label and placeholder
  apiKeyLabel.textContent = provider.apiKeyLabel + ':';
  apiKeyInput.placeholder = `${provider.apiKeyFormat}...`;
  
  // Update provider info
  const infoTexts = {
    openai: '<strong>OpenAI:</strong> Get your API key at <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com/api-keys</a>',
    gemini: '<strong>Google Gemini:</strong> Get your API key at <a href="https://aistudio.google.com/app/apikey" target="_blank">aistudio.google.com/app/apikey</a>',
    anthropic: '<strong>Anthropic:</strong> Get your API key at <a href="https://console.anthropic.com/" target="_blank">console.anthropic.com</a>'
  };
  providerInfo.innerHTML = infoTexts[providerId];
}

/**
 * Handle API key save
 */
async function handleSaveApiKey() {
  const providerSelect = document.getElementById('providerSelect');
  const modelSelect = document.getElementById('modelSelect');
  const apiKey = elements.apiKeyInput.value.trim();
  const saveBtn = elements.saveApiKeyBtn;
  
  if (!apiKey) {
    showSettingsError('Please enter an API key');
    return;
  }
  
  const providerId = providerSelect.value;
  const model = modelSelect.value;
  const originalText = saveBtn.textContent;
  
  try {
    // Show loading state
    saveBtn.disabled = true;
    saveBtn.textContent = '💾 Saving...';
    
    // Save provider
    await Config.setProvider(providerId);
    
    // Save model
    await Config.setModel(model);
    
    // Save API key
    await Config.setApiKey(apiKey);
    
    // Show success state
    saveBtn.textContent = '✅ Saved!';
    saveBtn.style.backgroundColor = '#10b981';
    
    // Clear input and switch to main interface
    elements.apiKeyInput.value = '';
    
    setTimeout(async () => {
      await checkApiKeyConfiguration();
      saveBtn.textContent = originalText;
      saveBtn.style.backgroundColor = '';
      saveBtn.disabled = false;
    }, 1500);
    
  } catch (error) {
    showSettingsError('Failed to save: ' + error.message);
    saveBtn.textContent = originalText;
    saveBtn.disabled = false;
    saveBtn.style.backgroundColor = '';
  }
}

/**
 * Handle capture and analyze action
 */
async function handleCapture() {
  try {
    showLoading(true);
    elements.tradeLogSection.style.display = 'none';
    
    // Step 1: Capture screenshot
    const captureResult = await captureVisibleTab();
    
    if (!captureResult.success) {
      throw new Error(captureResult.error || 'Failed to capture screenshot');
    }
    
    // Show preview
    elements.screenshotPreview.src = captureResult.imageData;
    elements.previewSection.style.display = 'block';
    
    // Step 2: Get user inputs
    const asset = elements.assetInput.value.trim() || 'Unknown';
    const timeframe = elements.timeframeInput.value || 'Auto-detect';
    
    // Step 3: Get trading memory
    const tradingMemory = await TradingMemory.getSummary();
    
    // Step 4: Analyze with AI
    const analysis = await AIService.analyzeChart({
      base64Image: captureResult.base64Data,
      asset: asset,
      timeframe: timeframe,
      tradingMemory: tradingMemory,
      tabInfo: captureResult.tabInfo
    });
    
    // Step 5: Display results
    displayAnalysis(analysis);
    
    // Show trade logging section
    elements.tradeLogSection.style.display = 'block';
    
  } catch (error) {
    console.error('Error during capture/analysis:', error);
    showError('Analysis failed: ' + error.message);
  } finally {
    showLoading(false);
  }
}

/**
 * Capture visible tab via background service worker
 */
function captureVisibleTab() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { action: 'captureVisibleTab' },
      (response) => {
        if (chrome.runtime.lastError) {
          resolve({
            success: false,
            error: chrome.runtime.lastError.message
          });
        } else {
          resolve(response);
        }
      }
    );
  });
}

/**
 * Display AI analysis results
 */
function displayAnalysis(analysis) {
  currentAnalysis = analysis.fullAnalysis;
  currentSetupType = analysis.setupType;
  
  // Format the analysis text
  const formattedAnalysis = formatAnalysisText(analysis);
  
  elements.analysisResult.innerHTML = formattedAnalysis;
  elements.copyAnalysisBtn.style.display = 'inline-block';
}

/**
 * Format analysis text for display
 */
function formatAnalysisText(analysis) {
  let html = '';
  
  // Setup Type
  if (analysis.setupType) {
    html += `<div class="analysis-header">
      <strong>Setup Type:</strong> <span class="setup-badge">${escapeHtml(analysis.setupType)}</span>
    </div>`;
  }
  
  // Main analysis
  html += `<div class="analysis-content">${formatTextWithLineBreaks(analysis.fullAnalysis)}</div>`;
  
  // Warning if poor track record
  if (analysis.warning) {
    html += `<div class="warning-box">⚠️ ${escapeHtml(analysis.warning)}</div>`;
  }
  
  return html;
}

/**
 * Format text with line breaks
 */
function formatTextWithLineBreaks(text) {
  return escapeHtml(text).replace(/\n/g, '<br>');
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Handle copy analysis to clipboard
 */
async function handleCopyAnalysis() {
  if (!currentAnalysis) return;
  
  try {
    await navigator.clipboard.writeText(currentAnalysis);
    showSuccess('Analysis copied to clipboard!');
  } catch (error) {
    showError('Failed to copy: ' + error.message);
  }
}

/**
 * Handle trade outcome logging
 */
async function handleTradeLog(event) {
  const outcome = event.target.dataset.outcome;
  const note = elements.tradeNoteInput.value.trim();
  
  if (!currentSetupType) {
    showError('No setup type to log');
    return;
  }
  
  try {
    await TradingMemory.logTrade({
      setupType: currentSetupType,
      outcome: outcome,
      note: note,
      timestamp: new Date().toISOString()
    });
    
    showSuccess(`Trade logged as ${outcome.toUpperCase()}!`);
    elements.tradeNoteInput.value = '';
    elements.tradeLogSection.style.display = 'none';
    
  } catch (error) {
    showError('Failed to log trade: ' + error.message);
  }
}

/**
 * Handle view stats
 */
async function handleViewStats() {
  const stats = await TradingMemory.getAllStats();
  
  if (Object.keys(stats).length === 0) {
    showInfo('No trading history yet. Start logging trades to see stats!');
    return;
  }
  
  // Format stats display
  let statsHtml = '<div class="stats-display"><h3>Trading Statistics</h3>';
  
  for (const [setupType, data] of Object.entries(stats)) {
    const total = data.wins + data.losses;
    const winRate = total > 0 ? ((data.wins / total) * 100).toFixed(1) : 0;
    
    statsHtml += `
      <div class="stat-item">
        <div class="stat-header">
          <strong>${escapeHtml(setupType)}</strong>
          <span class="win-rate ${winRate >= 50 ? 'positive' : 'negative'}">${winRate}% Win Rate</span>
        </div>
        <div class="stat-details">
          Wins: ${data.wins} | Losses: ${data.losses} | BE: ${data.breakEven || 0}
        </div>
      </div>
    `;
  }
  
  statsHtml += '</div>';
  
  elements.analysisResult.innerHTML = statsHtml;
  elements.copyAnalysisBtn.style.display = 'none';
}

/**
 * Handle settings
 */
async function handleSettings() {
  elements.apiKeySetup.style.display = 'block';
  elements.mainInterface.style.display = 'block';
  
  // Load current configuration
  const config = await Config.getConfig();
  const providerSelect = document.getElementById('providerSelect');
  const modelSelect = document.getElementById('modelSelect');
  
  if (providerSelect) {
    providerSelect.value = config.provider || 'openai';
    await handleProviderChange();
    
    if (modelSelect && config.model) {
      modelSelect.value = config.model;
    }
  }
  
  elements.apiKeyInput.focus();
}

/**
 * Show/hide loading overlay
 */
function showLoading(show) {
  elements.loadingOverlay.style.display = show ? 'flex' : 'none';
  elements.captureBtn.disabled = show;
}

/**
 * Show error message
 */
function showError(message) {
  elements.analysisResult.innerHTML = `<div class="error-message">❌ ${escapeHtml(message)}</div>`;
  elements.copyAnalysisBtn.style.display = 'none';
}

/**
 * Show success message
 */
function showSuccess(message) {
  // Create temporary success notification
  const notification = document.createElement('div');
  notification.className = 'success-notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

/** * Show error in settings page
 */
function showSettingsError(message) {
  // Create or update error message in settings
  let errorDiv = document.getElementById('settingsError');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.id = 'settingsError';
    errorDiv.className = 'settings-error';
    const saveBtn = document.getElementById('saveApiKeyBtn');
    saveBtn.parentNode.insertBefore(errorDiv, saveBtn);
  }
  errorDiv.textContent = '❌ ' + message;
  errorDiv.style.display = 'block';
  
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
}

/** * Show error in settings page
 */
function showSettingsError(message) {
  // Create or update error message in settings
  let errorDiv = document.getElementById('settingsError');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.id = 'settingsError';
    errorDiv.className = 'settings-error';
    const saveBtn = document.getElementById('saveApiKeyBtn');
    saveBtn.parentNode.insertBefore(errorDiv, saveBtn);
  }
  errorDiv.textContent = '❌ ' + message;
  errorDiv.style.display = 'block';
  
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
}

/**
 * Show info message
 */
function showInfo(message) {
  elements.analysisResult.innerHTML = `<div class="info-message">ℹ️ ${escapeHtml(message)}</div>`;
  elements.copyAnalysisBtn.style.display = 'none';
}
