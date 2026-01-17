/**
 * AI Service Module
 * 
 * Handles communication with OpenAI Vision API (GPT-4o/GPT-4.1)
 * Constructs prompts with trading memory context
 * Parses and structures AI responses
 * 
 * IMPORTANT: This module uses fetch API which is available in Chrome Extension context.
 * No external dependencies required.
 */

const AIService = {
  
  /**
   * Analyze a chart using OpenAI Vision API
   * 
   * @param {Object} params - Analysis parameters
   * @param {string} params.base64Image - Base64 encoded image
   * @param {string} params.asset - Asset symbol (e.g., BTC/USD)
   * @param {string} params.timeframe - Chart timeframe
   * @param {Object} params.tradingMemory - Historical trading stats
   * @param {Object} params.tabInfo - Browser tab information
   * @returns {Promise<Object>} Analysis result with setup type and full text
   */
  async analyzeChart({ base64Image, asset, timeframe, tradingMemory, tabInfo }) {
    try {
      // Get configuration
      const config = await Config.getConfig();
      
      if (!config.apiKey) {
        throw new Error('OpenAI API key not configured');
      }
      
      // Construct the prompt
      const prompt = this.buildPrompt({
        asset,
        timeframe,
        tradingMemory,
        tabInfo
      });
      
      // Call Vision API (supports multiple providers)
      const response = await this.callVisionAPI({
        provider: config.provider || 'openai',
        apiKey: config.apiKey,
        model: config.model || 'gpt-4o',
        prompt: prompt,
        base64Image: base64Image,
        maxTokens: config.maxTokens || 1000
      });
      
      // Parse and structure the response
      return this.parseResponse(response, tradingMemory);
      
    } catch (error) {
      console.error('AI analysis error:', error);
      throw error;
    }
  },
  
  /**
   * Build the prompt for the Vision LLM
   * Includes trading memory context to enable personalized warnings
   */
  buildPrompt({ asset, timeframe, tradingMemory, tabInfo }) {
    let prompt = `Bạn là chuyên gia phân tích kỹ thuật. Phân tích biểu đồ này và TRẢ LỜI NGẮN GỌN bằng TIẾNG VIỆT.

**Thông tin:**
- Tài sản: ${asset}
- Khung thời gian: ${timeframe}
- Nguồn: ${tabInfo?.title || 'Chart'}

**YÊU CẦU:**
1. Dòng đầu tiên: "SETUP_TYPE: [phân loại mẫu hình]" (VD: "Bull Flag", "Hỗ trợ bật lên")

2. Trả lời NGẮN GỌN (3-5 câu) các câu hỏi sau:

📊 **HÀNH ĐỘNG:** Nên MUA, BÁN hay KHÔNG GIAO DỊCH?

📍 **VÙNG GIAO DỊCH:** 
   - Mua/Bán ở đâu?
   - Cắt lỗ ở đâu?
   - Mục tiêu lợi nhuận?

⚖️ **RỦI RO/LỢI NHUẬN:** Tỷ lệ R/R là bao nhiêu? (VD: 1:2, 1:3)

`;

    // Add trading memory context
    if (tradingMemory && Object.keys(tradingMemory).length > 0) {
      prompt += `\n⚠️ **LỊCH SỬ GIAO DỊCH CỦA BẠN:**\n`;
      
      for (const [setupType, stats] of Object.entries(tradingMemory)) {
        const total = stats.wins + stats.losses;
        const winRate = total > 0 ? ((stats.wins / total) * 100).toFixed(1) : 0;
        
        prompt += `- ${setupType}: ${stats.wins} thắng / ${stats.losses} thua (${winRate}% thắng)\n`;
        
        if (stats.commonMistakes && stats.commonMistakes.length > 0) {
          prompt += `  Lỗi thường gặp: ${stats.commonMistakes.join(', ')}\n`;
        }
      }
      
      prompt += `\n**QUAN TRỌNG:** Nếu mẫu hình hiện tại giống với mẫu hình bạn hay thua (tỷ lệ thắng < 40%), hãy CẢNH BÁO RÕ RÀNG:\n`;
      prompt += `"⚠️ CẢNH BÁO: Bạn có lịch sử thua lỗ với mẫu hình [tên] - [X] thắng / [Y] thua ([Z]% thắng). Cần thận trọng hoặc bỏ qua giao dịch này."\n\n`;
    }
    
    prompt += `\n**LƯU Ý:**
- Chỉ mục đích HỌC TẬP, KHÔNG phải lời khuyên tài chính
- TRẢ LỜI NGẮN GỌN, SÚNG TÍC (3-5 câu)
- Tập trung vào: MUA/BÁN/KHÔNG? Ở ĐÂU? CẮT LỔ Ở ĐÂU? R/R?

Hãy phân tích ngay.`;
    
    return prompt;
  },
  
  /**
   * Call Vision API based on provider
   */
  async callVisionAPI({ provider, apiKey, model, prompt, base64Image, maxTokens }) {
    switch (provider) {
      case 'openai':
        return await this.callOpenAIVisionAPI({ apiKey, model, prompt, base64Image, maxTokens });
      case 'gemini':
        return await this.callGeminiVisionAPI({ apiKey, model, prompt, base64Image, maxTokens });
      case 'anthropic':
        return await this.callAnthropicVisionAPI({ apiKey, model, prompt, base64Image, maxTokens });
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  },
  
  /**
   * Call OpenAI Vision API
   * Uses the Chat Completions endpoint with image input
   */
  async callOpenAIVisionAPI({ apiKey, model, prompt, base64Image, maxTokens }) {
    const url = 'https://api.openai.com/v1/chat/completions';
    
    const payload = {
      model: model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${base64Image}`,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.7
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API error (${response.status}): ${errorData.error?.message || 'Unknown error'}`
      );
    }
    
    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }
    
    return data.choices[0].message.content;
  },
  
  /**
   * Call Google Gemini Vision API
   */
  async callGeminiVisionAPI({ apiKey, model, prompt, base64Image, maxTokens }) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: 'image/png',
              data: base64Image
            }
          }
        ]
      }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.7
      }
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Enhanced error message for common issues
      let errorMessage = errorData.error?.message || 'Unknown error';
      
      // Quota exceeded - provide helpful guidance
      if (response.status === 429) {
        errorMessage = `Quota exceeded. Please try:\n\n` +
          `1. Switch to "Gemini 1.5 Flash" model (better free tier support)\n` +
          `2. Wait a few minutes and try again\n` +
          `3. Check your quota at: https://ai.google.dev/gemini-api/docs/quota\n\n` +
          `Original error: ${errorMessage}`;
      }
      
      throw new Error(
        `Gemini API error (${response.status}): ${errorMessage}`
      );
    }
    
    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }
    
    return data.candidates[0].content.parts[0].text;
  },
  
  /**
   * Call Anthropic Claude Vision API
   */
  async callAnthropicVisionAPI({ apiKey, model, prompt, base64Image, maxTokens }) {
    const url = 'https://api.anthropic.com/v1/messages';
    
    const payload = {
      model: model,
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: base64Image
              }
            },
            {
              type: 'text',
              text: prompt
            }
          ]
        }
      ]
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Anthropic API error (${response.status}): ${errorData.error?.message || 'Unknown error'}`
      );
    }
    
    const data = await response.json();
    
    if (!data.content || !data.content[0]) {
      throw new Error('Invalid response from Anthropic API');
    }
    
    return data.content[0].text;
  },
  
  /**
   * Parse AI response and extract setup type
   * Also check for warnings based on trading history
   */
  parseResponse(responseText, tradingMemory) {
    // Extract setup type from response
    // Expected format: "SETUP_TYPE: Bull Flag" at the start
    let setupType = 'Unknown';
    let fullAnalysis = responseText;
    
    const setupMatch = responseText.match(/SETUP_TYPE:\s*([^\n]+)/i);
    if (setupMatch) {
      setupType = setupMatch[1].trim();
      // Remove the SETUP_TYPE line from the full analysis
      fullAnalysis = responseText.replace(/SETUP_TYPE:\s*[^\n]+\n*/i, '').trim();
    }
    
    // Check if this setup has poor historical performance
    let warning = null;
    if (tradingMemory && setupType !== 'Unknown') {
      // Normalize setup type for matching (case-insensitive, remove special chars)
      const normalizedSetup = setupType.toLowerCase().replace(/[^a-z0-9\s]/g, '');
      
      for (const [historicalSetup, stats] of Object.entries(tradingMemory)) {
        const normalizedHistorical = historicalSetup.toLowerCase().replace(/[^a-z0-9\s]/g, '');
        
        // Fuzzy match (contains or very similar)
        if (normalizedSetup.includes(normalizedHistorical) || 
            normalizedHistorical.includes(normalizedSetup)) {
          
          const total = stats.wins + stats.losses;
          const winRate = total > 0 ? ((stats.wins / total) * 100) : 0;
          
          // If win rate is below 40%, add a warning
          if (total >= 3 && winRate < 40) {
            warning = `You have a poor track record with "${historicalSetup}" setups: ${stats.wins} wins vs ${stats.losses} losses (${winRate.toFixed(1)}% win rate). Consider extra caution or skipping this trade.`;
          }
        }
      }
    }
    
    return {
      setupType,
      fullAnalysis,
      warning,
      timestamp: new Date().toISOString()
    };
  }
  
};

// Make available globally
window.AIService = AIService;
