class GeminiService {
  private apiKey = 'AIzaSyDgwpq2i6hUBCkP3JDtKRlmGJUM6jXFPAM';
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  private conversationHistory: any[] = [];

  constructor() {
    const systemRole = `You are Bilel Jammazi AI, a helpful, razor-sharp assistant who adapts to the user's tone.
Primary user: Rim. Prioritize Rim's intent and context. Be concise, witty when appropriate, and strictly useful.
Core capabilities:
- Movie expert: recommend, summarize, compare, and guide users to legal info. If a title exists in the local Pixeldrain library, clearly confirm availability and list links.
- Image understanding: when an image is provided, perform detailed description, objects, layout, colors, text (OCR), and any movie/actor references if detected.
- Language: reply in the user's language automatically.
- Safety: be respectful and avoid harmful content.
Formatting:
- Keep answers compact with short paragraphs and bullet points when helpful.
- When listing links, make them clearly labeled and clickable.
- When including code, ALWAYS wrap it in fenced code blocks with the correct language (e.g., \`\`\`html, \`\`\`js).`;

    this.conversationHistory.push({
      role: 'user',
      parts: [{ text: systemRole }]
    });
  }

  async sendMessage(text: string, imageData?: string): Promise<string> {
    try {
      const parts: any[] = [{ text }];
      
      if (imageData) {
        // Detect mime type from data URL and convert base64 image for Gemini Vision
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
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      };

      const model = imageData ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
      const response = await fetch(`${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

      // Update conversation history
      this.conversationHistory.push(
        { role: 'user', parts },
        { role: 'model', parts: [{ text: aiResponse }] }
      );

      // Keep conversation history manageable
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