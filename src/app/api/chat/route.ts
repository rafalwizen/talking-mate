import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { zhipu } from '@/lib/ai/provider';
import { getSystemPrompt } from '@/lib/ai/system-prompts';
import { MAX_CONTEXT_MESSAGES } from '@/lib/constants';

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { messages, language, mode, scenarioId } = body as {
      messages: UIMessage[];
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
    const modelMessages = await convertToModelMessages(messages);
    const trimmedMessages = modelMessages.slice(-MAX_CONTEXT_MESSAGES);

    console.log(`[chat] lang=${language} mode=${mode} messages=${trimmedMessages.length} prompt_len=${systemPrompt.length}`);

    const result = await streamText({
      model: zhipu('glm-4.7-flash'),
      system: systemPrompt,
      messages: trimmedMessages,
      maxOutputTokens: 200,
      temperature: 0.7,
      onChunk({ chunk }) {
        if (chunk.type === 'text-delta') {
          process.stdout.write(chunk.textDelta);
        }
      },
      onFinish({ text, usage }) {
        console.log(`\n[chat] done in ${Date.now() - startTime}ms tokens=${usage?.totalTokens ?? '?'}`);
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error(`[chat] error in ${Date.now() - startTime}ms:`, error);
    return Response.json(
      { error: 'Failed to generate response' },
      { status: 500 },
    );
  }
}
