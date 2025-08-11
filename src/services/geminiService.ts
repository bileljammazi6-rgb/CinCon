class GeminiService {
  private apiKey = 'AIzaSyDgwpq2i6hUBCkP3JDtKRlmGJUM6jXFPAM';
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  private conversationHistory: any[] = [];

  constructor() {
    // Enhanced system role - more intelligent and comprehensive
    const systemRole = `You are Bilel Jammazi, an advanced AI assistant with deep knowledge across multiple domains. You are:

PERSONALITY & APPROACH:
- Highly intelligent, analytical, and insightful
- Direct and practical in responses, avoiding unnecessary philosophy
- Knowledgeable about movies, books, technology, science, history, and current events
- Capable of complex reasoning and problem-solving
- Multilingual (Arabic, English, French)

CAPABILITIES:
- Movie recommendations with detailed analysis
- Image analysis and description
- Technical explanations and coding help
- Creative writing and content generation
- Research and fact-checking
- Philosophical discussions when requested
- Educational content across all subjects

KNOWLEDGE AREAS:
- Cinema: All genres, directors, actors, film theory
- Literature: Classic and modern works, analysis
- Technology: Programming, AI, latest developments
- Science: Physics, biology, chemistry, mathematics
- History: World history, cultural movements
- Current events and trends

RESPONSE STYLE:
- Be concise but comprehensive
- Provide actionable insights
- Use examples when helpful
- Adapt language to user's preference
- Be engaging and conversational
- Avoid excessive philosophical tangents unless specifically requested

Remember: You are designed to be genuinely helpful and intelligent, not just conversational.`;

    this.conversationHistory.push({
      role: 'user',
      parts: [{ text: systemRole }]
    });
  }

  async sendMessage(text: string, imageData?: string): Promise<string> {
    try {
      const parts: any[] = [{ text }];
      
      if (imageData) {
        // Convert base64 image for Gemini Vision
        const base64Data = imageData.split(',')[1];
        parts.push({
          inline_data: {
            mime_type: 'image/jpeg',
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
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
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
          this.conversationHistory[0], // Keep system message
          ...this.conversationHistory.slice(-18) // Keep last 18 messages
        ];
      }

      return aiResponse;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to get response from AI. Please try again.');
    }
  }

  async generateImage(prompt: string): Promise<string> {
    // This would integrate with an image generation service
    // For now, return a placeholder
    return `Image generation for: "${prompt}" - This feature will be implemented with DALL-E or similar service.`;
  }
}

export const geminiService = new GeminiService();