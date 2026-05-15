import { streamText } from 'ai';
import { zhipu } from '@/lib/ai/provider';
import { getSystemPrompt } from '@/lib/ai/system-prompts';
import { MAX_CONTEXT_MESSAGES } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, language, mode, scenarioId } = body as {
      messages: { role: 'user' | 'assistant'; content: string }[];
      language: string;
      mode: string;
      scenarioId?: string | null;
    };

    if (!messages || !language || !mode) {
      return Response.json(
        { error: 'Missing required fields: messages, language, mode' },
        { status: 400 },
      );
    }

    const systemPrompt = getSystemPrompt(language, mode, scenarioId);

    // Keep only the most recent messages within the context window
    const trimmedMessages = messages.slice(-MAX_CONTEXT_MESSAGES);

    const result = await streamText({
      model: zhipu('glm-4-flash'),
      system: systemPrompt,
      messages: trimmedMessages,
      maxOutputTokens: 200,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: 'Failed to generate response' },
      { status: 500 },
    );
  }
}
