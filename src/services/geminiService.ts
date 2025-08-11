class GeminiService {
  private apiKey = 'AIzaSyDgwpq2i6hUBCkP3JDtKRlmGJUM6jXFPAM';
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  private conversationHistory: any[] = [];

  constructor() {
    const systemRole = `You are Bilel Jammazi AI — built by Bilel Jammazi.
Be based: confident, direct, and relentlessly useful. You love hacking culture, software/dev, books, anime, movies, and series. You can also discuss and play chess (explain lines, tactics, openings).
Push boundaries intellectually and creatively, while staying respectful.

Authorial intelligence:
- Adham Sharqawy: Arabic storytelling cadence, moral parables, social insight.
- Dan Brown: clue-driven structure, momentum, clean reveals.
- Robert Greene: strategic framing, aphoristic wisdom, practical laws.
Channel styles on request without copying.

Core capabilities:
- Movie/Series expert: recommend, summarize, compare, analyze themes; if title exists in local Pixeldrain library, clearly confirm availability and list links.
- Image understanding: when an image is provided, give detailed description (objects, layout, colors, OCR, movie/actor references if any).
- Chess: analyze positions, suggest plans, evaluate moves succinctly.
- Language: reply in the user's language automatically.

Formatting:
- Use short paragraphs and bullets when helpful.
- Label links clearly and make them easy to copy.
- For code, use fenced blocks and specify language (e.g., html, js).`;

    this.conversationHistory.push({
      role: 'user',
      parts: [{ text: systemRole }]
    });
  }

  async sendMessage(text: string, imageData?: string, options?: { model?: 'flash' | 'pro' }): Promise<string> {
    try {
      const parts: any[] = [{ text }];
      
      if (imageData) {
        const mimeMatch = imageData.match(/^data:(.*?);base64,/i);
        const detectedMimeType = mimeMatch?.[1] || 'image/jpeg';
        const base64Data = imageData.split(',')[1];
        parts.push({
          inline_data: {
            mime_type: detectedMimeType,
            data: base64Data
          }
        });
      }

      const payload = {
        contents: [
          ...this.conversationHistory,
          {
            role: 'user',
            parts
          }
        ],
        generationConfig: {
          temperature: 0.6,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
        ]
      };

      let model: 'gemini-1.5-flash' | 'gemini-1.5-pro';
      if (options?.model) {
        model = options.model === 'pro' ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
      } else {
        model = imageData ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
      }

      const response = await fetch(`${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

      this.conversationHistory.push(
        { role: 'user', parts },
        { role: 'model', parts: [{ text: aiResponse }] }
      );

      if (this.conversationHistory.length > 20) {
        this.conversationHistory = [
          this.conversationHistory[0],
          ...this.conversationHistory.slice(-18)
        ];
      }

      return aiResponse;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to get response from AI. Please try again.');
    }
  }

  async generateImage(prompt: string): Promise<string> {
    return `Image generation for: "${prompt}" - This feature will be implemented with DALL-E or similar service.`;
  }
}

export const geminiService = new GeminiService();