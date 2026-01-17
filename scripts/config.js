/**
 * Configuration Module
 * 
 * Manages extension settings including API keys and preferences.
 * Uses Chrome Storage API with encryption considerations for sensitive data.
 * 
 * IMPORTANT SECURITY NOTE:
 * Chrome Storage is NOT encrypted at rest. For production use with real API keys:
 * - Consider using Chrome's Identity API with OAuth
 * - Or prompt for API key each session
 * - Or use a backend proxy service
 * 
 * For personal MVP use, this is acceptable if user understands the risk.
 */

const Config = {
  
  STORAGE_KEY: 'settings',
  
  /**
   * Default configuration values
   */
  defaults: {
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4o',
    maxTokens: 1000,
    temperature: 0.7
  },
  
  /**
   * Available AI providers and their models
   */
  providers: {
    openai: {
      name: 'OpenAI',
      models: [
        { id: 'gpt-4o', name: 'GPT-4o (Recommended)', vision: true },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Cheaper)', vision: true },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', vision: true },
        { id: 'chatgpt-4o-latest', name: 'ChatGPT-4o Latest', vision: true }
      ],
      apiKeyFormat: 'sk-',
      apiKeyLabel: 'OpenAI API Key'
    },
    gemini: {
      name: 'Google Gemini',
      models: [
        { id: 'gemini-3.0-flash', name: 'Gemini 3.0 Flash (Latest Generation)', vision: true },
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Stable & Fast)', vision: true },
        { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite (Cheapest)', vision: true },
        { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Deep thinking)', vision: true },
        { id: 'gemini-3.0-pro-preview', name: 'Gemini 3.0 Pro Preview (Beta)', vision: true }
      ],
      apiKeyFormat: 'AI',
      apiKeyLabel: 'Google AI API Key'
    },
    anthropic: {
      name: 'Anthropic Claude',
      models: [
        { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', vision: true },
        { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', vision: true },
        { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku (Faster)', vision: true }
      ],
      apiKeyFormat: 'sk-ant-',
      apiKeyLabel: 'Anthropic API Key'
    }
  },
  
  /**
   * Get current configuration
   * @returns {Promise<Object>} Configuration object
   */
  async getConfig() {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      const settings = result[this.STORAGE_KEY] || {};
      
      // Merge with defaults
      return {
        ...this.defaults,
        ...settings
      };
    } catch (error) {
      console.error('Failed to get config:', error);
      return this.defaults;
    }
  },
  
  /**
   * Set API Key (validates based on current provider)
   * @param {string} apiKey - API key from provider
   */
  async setApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('Invalid API key');
    }
    
    // Get current provider to validate format
    const config = await this.getConfig();
    const currentProvider = config.provider || 'openai';
    const provider = this.providers[currentProvider];
    
    // Validate API key format based on provider
    if (!apiKey.startsWith(provider.apiKeyFormat)) {
      throw new Error(`${provider.name} API keys should start with "${provider.apiKeyFormat}"`);
    }
    
    config.apiKey = apiKey;
    
    await this.saveConfig(config);
  },
  
  /**
   * Get API Key (for internal use)
   * @returns {Promise<string>} API key
   */
  async getApiKey() {
    const config = await this.getConfig();
    return config.apiKey;
  },
  
  /**
   * Update model setting
   * @param {string} model - Model name (e.g., 'gpt-4o', 'gpt-4-turbo')
   */
  async setModel(model) {
    const config = await this.getConfig();
    config.model = model;
    await this.saveConfig(config);
  },
  
  /**
   * Update max tokens setting
   * @param {number} maxTokens - Maximum tokens for response
   */
  async setMaxTokens(maxTokens) {
    if (typeof maxTokens !== 'number' || maxTokens < 100 || maxTokens > 4000) {
      throw new Error('Max tokens must be between 100 and 4000');
    }
    
    const config = await this.getConfig();
    config.maxTokens = maxTokens;
    await this.saveConfig(config);
  },
  
  /**
   * Save entire configuration
   * @param {Object} config - Configuration object
   */
  async saveConfig(config) {
    try {
      await chrome.storage.local.set({
        [this.STORAGE_KEY]: config
      });
    } catch (error) {
      console.error('Failed to save config:', error);
      throw error;
    }
  },
  
  /**
   * Clear API key (for security)
   */
  async clearApiKey() {
    const config = await this.getConfig();
    config.apiKey = '';
    await this.saveConfig(config);
  },
  
  /**
   * Reset all settings to defaults
   */
  async resetToDefaults() {
    await this.saveConfig(this.defaults);
  },
  
  /**
   * Validate configuration
   * @returns {Promise<Object>} Validation result
   */
  async validate() {
    const config = await this.getConfig();
    const issues = [];
    
    if (!config.apiKey) {
      issues.push('API key is not configured');
    } else if (!config.apiKey.startsWith('sk-')) {
      issues.push('API key format appears invalid');
    }
    
    if (!config.model) {
      issues.push('Model is not set');
    }
    
    if (config.maxTokens < 100 || config.maxTokens > 4000) {
      issues.push('Max tokens is out of valid range');
    }
    
    return {
      valid: issues.length === 0,
      issues: issues
    };
  },
  
  /**
   * Get masked API key for display
   * Shows only first 7 and last 4 characters
   * @returns {Promise<string>} Masked API key
   */
  async getMaskedApiKey() {
    const apiKey = await this.getApiKey();
    
    if (!apiKey || apiKey.length < 15) {
      return 'Not configured';
    }
    
    const start = apiKey.substring(0, 7);
    const end = apiKey.substring(apiKey.length - 4);
    const masked = '•'.repeat(apiKey.length - 11);
    
    return `${start}${masked}${end}`;
  },
  
  /**
   * Set AI provider
   * @param {string} provider - Provider ID (openai, gemini, anthropic)
   */
  async setProvider(provider) {
    if (!this.providers[provider]) {
      throw new Error(`Unknown provider: ${provider}`);
    }
    
    const config = await this.getConfig();
    config.provider = provider;
    
    // Set default model for this provider
    const defaultModel = this.providers[provider].models[0].id;
    config.model = defaultModel;
    
    await this.saveConfig(config);
  },
  
  /**
   * Get available providers
   * @returns {Object} Providers configuration
   */
  getProviders() {
    return this.providers;
  },
  
  /**
   * Get models for current provider
   * @returns {Promise<Array>} Available models
   */
  async getAvailableModels() {
    const config = await this.getConfig();
    const provider = config.provider || 'openai';
    return this.providers[provider]?.models || [];
  },
  
  /**
   * Get current provider info
   * @returns {Promise<Object>} Provider information
   */
  async getCurrentProvider() {
    const config = await this.getConfig();
    const provider = config.provider || 'openai';
    return {
      id: provider,
      ...this.providers[provider]
    };
  }
  
};

// Make available globally
window.Config = Config;
