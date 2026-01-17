/**
 * Background Service Worker (Manifest V3)
 * 
 * Responsibilities:
 * - Handle messages from popup for capturing screenshots
 * - Capture visible tab content as image
 * - Send captured image data back to popup
 * 
 * IMPORTANT: Service workers are ephemeral and should not maintain state.
 * All persistent data should be stored in chrome.storage.
 */

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureVisibleTab') {
    handleCaptureVisibleTab(sendResponse);
    return true; // Required for async sendResponse
  }
  
  if (request.action === 'ping') {
    sendResponse({ status: 'alive' });
    return true;
  }
});

/**
 * Capture the currently active tab's visible area
 * @param {Function} sendResponse - Callback to send response back to popup
 */
async function handleCaptureVisibleTab(sendResponse) {
  try {
    // Get the current active tab
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!activeTab) {
      sendResponse({ 
        success: false, 
        error: 'No active tab found' 
      });
      return;
    }

    // Capture visible area of the tab
    // Format: 'png' or 'jpeg' (png for better quality)
    const dataUrl = await chrome.tabs.captureVisibleTab(
      activeTab.windowId, 
      { format: 'png' }
    );

    if (!dataUrl) {
      sendResponse({ 
        success: false, 
        error: 'Failed to capture screenshot' 
      });
      return;
    }

    // Extract base64 data from data URL
    // dataUrl format: "data:image/png;base64,iVBORw0KG..."
    const base64Data = dataUrl.split(',')[1];

    sendResponse({
      success: true,
      imageData: dataUrl,        // Full data URL for preview
      base64Data: base64Data,    // Base64 only for API
      tabInfo: {
        title: activeTab.title,
        url: activeTab.url,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error capturing tab:', error);
    sendResponse({
      success: false,
      error: error.message || 'Unknown error occurred'
    });
  }
}

/**
 * Handle extension installation
 * Initialize storage with default values if needed
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('Chart AI Assistant installed');
    
    // Initialize default settings
    await chrome.storage.local.set({
      settings: {
        apiKey: '',
        model: 'gpt-4o',
        maxTokens: 1000
      },
      tradingStats: {},
      version: '1.0.0'
    });
  } else if (details.reason === 'update') {
    console.log('Chart AI Assistant updated');
  }
});

// Keep service worker alive (optional, for debugging)
// In production, service workers should be designed to wake up on demand
chrome.runtime.onStartup.addListener(() => {
  console.log('Service worker started');
});
