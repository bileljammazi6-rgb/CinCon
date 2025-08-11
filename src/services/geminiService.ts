class GeminiService {
  private apiKey = 'AIzaSyDgwpq2i6hUBCkP3JDtKRlmGJUM6jXFPAM';
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  private conversationHistory: any[] = [];

  constructor() {
    const systemRole = `You are Bilel Jammazi AI — created by Bilel Jammazi to serve Rim Nsiri.
Be based, confident, and relentlessly useful while staying respectful. You love hacking/dev, books, anime, movies, and series, and you can discuss and play chess.
Ground your reasoning in sound logic and, when relevant, Islamic sources: Quran and authentic Sunnah.

Evidence-first replies:
- For any non-trivial claim, proposal, or idea, include a short “Sources / Evidence” section with verifiable references (reputable links, docs, or precise citations like Quran (surah:ayah) or Hadith (collection • number)).
- If uncertain, say so and suggest how to verify.

Authorial intelligence (on request): Adham Sharqawy (Arabic cadence), Dan Brown (clue-driven clarity), Robert Greene (strategic framing). Channel style without copying.

Capabilities:
- Movies/Series: recommend, summarize, compare, analyze themes; if a title exists in local Pixeldrain library, clearly confirm availability and list links.
- Image understanding: give detailed description (objects, layout, colors, OCR, movie/actor references if any).
- Chess: analyze positions succinctly; suggest plans and tactics; can play against the user.
- Language: answer in the user’s language automatically.

Formatting:
- Use short paragraphs and bullets.
- Label links clearly; make them easy to copy.
- For code, use fenced blocks with language labels (e.g., html, js).`;

    this.conversationHistory.push({
      role: 'user',
      parts: [{ text: systemRole }]
    });
  }

  private async fetchWithRetry(url: string, init: RequestInit, retries = 2): Promise<Response> {
    let attempt = 0;
    let lastError: any = null;
    while (attempt <= retries) {
      try {
        const res = await fetch(url, init);
        if (res.ok) return res;
        // Retry on transient statuses
        if ([408, 429, 500, 502, 503, 504].includes(res.status) && attempt < retries) {
          await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)));
          attempt++;
          continue;
        }
        // Non-retriable error
        return res;
      } catch (e) {
        lastError = e;
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)));
          attempt++;
          continue;
        }
        throw lastError;
      }
    }
    throw lastError || new Error('Network error');
  }

  async sendMessage(text: string, imageData?: string, options?: { model?: 'flash' | 'pro' }): Promise<string> {
    try {
      if (!this.apiKey || this.apiKey.trim().length < 10) {
        throw new Error('AI API key missing or invalid. Please configure the Gemini API key.');
      }

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
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' }
        ]
      };

      let model: 'gemini-1.5-flash' | 'gemini-1.5-pro';
      if (options?.model) {
        model = options.model === 'pro' ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
      } else {
        model = imageData ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
      }

      const url = `${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`;
      const response = await this.fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let detail = '';
        try { const j = await response.json(); detail = j?.error?.message || JSON.stringify(j); } catch {}
        const msg = `AI service error ${response.status}${detail ? `: ${detail}` : ''}`;
        throw new Error(msg);
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';

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
    } catch (error: any) {
      const hint = error?.message?.includes('AI service error') ? '' : ' (check network/CORS)';
      const msg = error?.message ? `AI error: ${error.message}${hint}` : 'AI error: unexpected failure.';
      throw new Error(msg);
    }
  }

  async generateImage(prompt: string): Promise<string> {
    return `Image generation for: "${prompt}" - This feature will be implemented with DALL-E or similar service.`;
  }
}

export const geminiService = new GeminiService();