interface GeminiPart {
  text?: string;
  inline_data?: {
    mime_type: string;
    data: string;
  };
}

interface GeminiMessage {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

class GeminiService {
  private apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
  private model = 'gemini-2.0-flash-exp';
  private baseUrl = (import.meta.env.VITE_GEMINI_API_URL as string) || 'https://generativelanguage.googleapis.com/v1beta/models';
  private conversationHistory: GeminiMessage[] = [];

  async sendMessage(text: string, imageData?: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Missing VITE_GEMINI_API_KEY');
    }

    try {
      const parts: GeminiPart[] = [{ text }];

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
            role: 'user' as const,
            parts
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      };

      const apiUrl = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

      this.conversationHistory.push(
        { role: 'user', parts },
        { role: 'model', parts: [{ text: aiResponse }] }
      );

      if (this.conversationHistory.length > 20) {
        this.conversationHistory = [
          ...this.conversationHistory.slice(-20)
        ];
      }

      return aiResponse;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to get response from AI. Please try again.');
    }
  }

  async generateImage(prompt: string): Promise<string> {
    return `Image generation for: "${prompt}" - This feature will be implemented with an image generation service.`;
  }
}

export const geminiService = new GeminiService();