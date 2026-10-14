import config from '../../config/index.js';

/**
 * AI Provider Abstraction
 * Supports Google Gemini, OpenAI-compatible, and Heuristic/NLP fallback.
 */

export const generateText = async (prompt, systemInstruction = '', jsonMode = false) => {
  // 1. Try Google Gemini if key provided
  if (config.ai.geminiApiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.ai.geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              ...(systemInstruction ? [{ role: 'user', parts: [{ text: systemInstruction }] }, { role: 'model', parts: [{ text: 'Understood. I will follow your instructions precisely.' }] }] : []),
              { role: 'user', parts: [{ text: prompt }] }
            ],
            generationConfig: {
              temperature: 0.3,
              ...(jsonMode ? { responseMimeType: 'application/json' } : {})
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (err) {
      console.warn('[AIProvider] Gemini request failed, using intelligent fallback:', err.message);
    }
  }

  // 2. Try OpenAI if key provided
  if (config.ai.openaiApiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.ai.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          ...(jsonMode ? { response_format: { type: 'json_object' } } : {})
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return text;
      }
    } catch (err) {
      console.warn('[AIProvider] OpenAI request failed, using intelligent fallback:', err.message);
    }
  }

  // 3. Fallback Heuristic response
  return null;
};

export default {
  generateText
};
