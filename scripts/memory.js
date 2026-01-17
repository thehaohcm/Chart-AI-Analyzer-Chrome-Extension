/**
 * Trading Memory Module
 * 
 * Manages storage and retrieval of trading statistics per setup type.
 * Uses IndexedDB for structured data storage with fallback to Chrome Storage.
 * 
 * Data Structure:
 * {
 *   "Bull Flag": {
 *     wins: 5,
 *     losses: 3,
 *     breakEven: 1,
 *     trades: [
 *       {
 *         outcome: 'win',
 *         note: 'Perfect entry',
 *         timestamp: '2026-01-15T10:30:00Z'
 *       }
 *     ],
 *     commonMistakes: ['Entered too early', 'Stop loss too tight']
 *   }
 * }
 * 
 * Design Note: This implementation uses Chrome Storage API for simplicity.
 * Can be easily migrated to backend API by replacing get/set methods.
 */

const TradingMemory = {
  
  STORAGE_KEY: 'tradingStats',
  
  /**
   * Initialize storage (if needed)
   */
  async init() {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      if (!result[this.STORAGE_KEY]) {
        await chrome.storage.local.set({
          [this.STORAGE_KEY]: {}
        });
      }
    } catch (error) {
      console.error('Failed to initialize trading memory:', error);
    }
  },
  
  /**
   * Log a trade outcome
   * 
   * @param {Object} trade - Trade information
   * @param {string} trade.setupType - Setup classification (e.g., "Bull Flag")
   * @param {string} trade.outcome - 'win', 'loss', or 'be' (break even)
   * @param {string} trade.note - Optional trader note
   * @param {string} trade.timestamp - ISO timestamp
   */
  async logTrade({ setupType, outcome, note, timestamp }) {
    try {
      // Normalize setup type (consistent casing)
      const normalizedSetup = this.normalizeSetupType(setupType);
      
      // Get current stats
      const stats = await this.getAllStats();
      
      // Initialize if doesn't exist
      if (!stats[normalizedSetup]) {
        stats[normalizedSetup] = {
          wins: 0,
          losses: 0,
          breakEven: 0,
          trades: [],
          commonMistakes: []
        };
      }
      
      // Update counters
      if (outcome === 'win') {
        stats[normalizedSetup].wins++;
      } else if (outcome === 'loss') {
        stats[normalizedSetup].losses++;
      } else if (outcome === 'be') {
        stats[normalizedSetup].breakEven++;
      }
      
      // Add trade to history
      stats[normalizedSetup].trades.push({
        outcome,
        note: note || '',
        timestamp
      });
      
      // Extract common mistakes from notes (simple keyword extraction)
      if (outcome === 'loss' && note) {
        this.updateCommonMistakes(stats[normalizedSetup], note);
      }
      
      // Save updated stats
      await this.saveStats(stats);
      
      console.log(`Trade logged: ${normalizedSetup} - ${outcome}`);
      
    } catch (error) {
      console.error('Failed to log trade:', error);
      throw error;
    }
  },
  
  /**
   * Get all trading statistics
   * @returns {Promise<Object>} All stats by setup type
   */
  async getAllStats() {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      return result[this.STORAGE_KEY] || {};
    } catch (error) {
      console.error('Failed to get stats:', error);
      return {};
    }
  },
  
  /**
   * Get statistics for a specific setup type
   * @param {string} setupType - Setup classification
   * @returns {Promise<Object|null>} Stats for the setup or null
   */
  async getStatsForSetup(setupType) {
    const normalizedSetup = this.normalizeSetupType(setupType);
    const allStats = await this.getAllStats();
    return allStats[normalizedSetup] || null;
  },
  
  /**
   * Get summary of trading memory for AI prompt context
   * Returns simplified version without full trade history
   * @returns {Promise<Object>} Summarized stats
   */
  async getSummary() {
    const allStats = await this.getAllStats();
    const summary = {};
    
    for (const [setupType, stats] of Object.entries(allStats)) {
      summary[setupType] = {
        wins: stats.wins,
        losses: stats.losses,
        breakEven: stats.breakEven || 0,
        commonMistakes: stats.commonMistakes || []
      };
    }
    
    return summary;
  },
  
  /**
   * Save stats to storage
   * @param {Object} stats - Complete stats object
   */
  async saveStats(stats) {
    try {
      await chrome.storage.local.set({
        [this.STORAGE_KEY]: stats
      });
    } catch (error) {
      console.error('Failed to save stats:', error);
      throw error;
    }
  },
  
  /**
   * Clear all trading statistics (use with caution)
   */
  async clearAllStats() {
    try {
      await chrome.storage.local.set({
        [this.STORAGE_KEY]: {}
      });
      console.log('All trading stats cleared');
    } catch (error) {
      console.error('Failed to clear stats:', error);
      throw error;
    }
  },
  
  /**
   * Export stats as JSON (for backup or migration)
   * @returns {Promise<string>} JSON string of all stats
   */
  async exportStats() {
    const stats = await this.getAllStats();
    return JSON.stringify(stats, null, 2);
  },
  
  /**
   * Import stats from JSON (for restore or migration)
   * @param {string} jsonString - JSON string of stats
   */
  async importStats(jsonString) {
    try {
      const stats = JSON.parse(jsonString);
      await this.saveStats(stats);
      console.log('Stats imported successfully');
    } catch (error) {
      console.error('Failed to import stats:', error);
      throw new Error('Invalid JSON format');
    }
  },
  
  /**
   * Normalize setup type for consistent storage
   * @param {string} setupType - Raw setup type
   * @returns {string} Normalized setup type
   */
  normalizeSetupType(setupType) {
    // Trim, capitalize first letter of each word
    return setupType
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  },
  
  /**
   * Update common mistakes list based on loss notes
   * Simple keyword extraction from notes
   */
  updateCommonMistakes(setupStats, note) {
    // Common mistake patterns to look for
    const patterns = [
      { regex: /enter(?:ed)?\s+too\s+early/i, mistake: 'Entered too early' },
      { regex: /enter(?:ed)?\s+too\s+late/i, mistake: 'Entered too late' },
      { regex: /stop\s+(?:loss\s+)?too\s+tight/i, mistake: 'Stop loss too tight' },
      { regex: /stop\s+(?:loss\s+)?too\s+wide/i, mistake: 'Stop loss too wide' },
      { regex: /miss(?:ed)?\s+confirmation/i, mistake: 'Missed confirmation' },
      { regex: /fomo/i, mistake: 'FOMO entry' },
      { regex: /revenge\s+trad/i, mistake: 'Revenge trading' },
      { regex: /over\s?lever/i, mistake: 'Over-leveraged' },
      { regex: /wrong\s+direction/i, mistake: 'Wrong direction' },
      { regex: /against\s+trend/i, mistake: 'Traded against trend' }
    ];
    
    for (const { regex, mistake } of patterns) {
      if (regex.test(note) && !setupStats.commonMistakes.includes(mistake)) {
        setupStats.commonMistakes.push(mistake);
        
        // Keep only top 5 most common mistakes
        if (setupStats.commonMistakes.length > 5) {
          setupStats.commonMistakes.shift();
        }
      }
    }
  },
  
  /**
   * Get trading statistics summary for display
   * @returns {Promise<Object>} Formatted stats summary
   */
  async getDisplaySummary() {
    const stats = await this.getAllStats();
    const summary = {
      totalTrades: 0,
      totalWins: 0,
      totalLosses: 0,
      totalBE: 0,
      overallWinRate: 0,
      setupBreakdown: []
    };
    
    for (const [setupType, data] of Object.entries(stats)) {
      const total = data.wins + data.losses;
      const winRate = total > 0 ? ((data.wins / total) * 100) : 0;
      
      summary.totalTrades += total + (data.breakEven || 0);
      summary.totalWins += data.wins;
      summary.totalLosses += data.losses;
      summary.totalBE += data.breakEven || 0;
      
      summary.setupBreakdown.push({
        setupType,
        wins: data.wins,
        losses: data.losses,
        breakEven: data.breakEven || 0,
        winRate: winRate.toFixed(1),
        totalTrades: total
      });
    }
    
    const totalDecidedTrades = summary.totalWins + summary.totalLosses;
    summary.overallWinRate = totalDecidedTrades > 0 
      ? ((summary.totalWins / totalDecidedTrades) * 100).toFixed(1)
      : 0;
    
    // Sort by total trades descending
    summary.setupBreakdown.sort((a, b) => b.totalTrades - a.totalTrades);
    
    return summary;
  }
  
};

// Initialize on load
TradingMemory.init();

// Make available globally
window.TradingMemory = TradingMemory;
