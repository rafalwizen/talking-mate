import { getScenarioById } from './scenarios';

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  de: 'German',
  es: 'Spanish',
};

const BASE_PROMPT = `You are a friendly and patient language tutor helping the user practice {language}.

Your role:
- Have natural conversations with the user in {language}
- Keep your responses concise (2-3 sentences typically) since they will be read aloud
- Use vocabulary appropriate for a language learner
- When the user makes grammar or vocabulary mistakes, gently correct them by repeating the correct form naturally in your response
- Adapt your complexity to the user's apparent level
- If the user seems stuck, offer hints or suggest phrases they could use
- Always respond in {language} unless the user explicitly asks for an explanation in their native language
- Do not use markdown formatting — respond in plain text only`;

export function getSystemPrompt(
  language: string,
  mode: string,
  scenarioId?: string | null,
): string {
  const langName = LANGUAGE_NAMES[language] ?? language;
  let prompt = BASE_PROMPT.replace(/\{language\}/g, langName);

  if (mode === 'scenario' && scenarioId) {
    const scenario = getScenarioById(scenarioId);
    if (scenario) {
      prompt += `\n\nScenario: ${scenario.systemPromptAddition}`;
    }
  }

  return prompt;
}
