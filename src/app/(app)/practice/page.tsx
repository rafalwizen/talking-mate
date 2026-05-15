'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LANGUAGES } from '@/lib/constants';
import type { LanguageCode, ConversationMode } from '@/lib/constants';
import { SCENARIOS } from '@/lib/ai/scenarios';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function PracticePage() {
  const router = useRouter();
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [mode, setMode] = useState<ConversationMode>('free_talk');
  const [scenarioId, setScenarioId] = useState<string>('restaurant');

  function handleStart() {
    const params = new URLSearchParams({ lang: language, mode });
    if (mode === 'scenario') params.set('scenario', scenarioId);
    router.push(`/practice/session?${params.toString()}`);
  }

  return (
    <div className="flex flex-1 flex-col gap-8 px-4 py-6 max-w-lg mx-auto">
      <section>
        <h2 className="mb-3 text-lg font-semibold">Choose a language</h2>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(LANGUAGES).map(([code, lang]) => (
            <Card
              key={code}
              selected={language === code}
              onClick={() => setLanguage(code as LanguageCode)}
            >
              <div className="text-center">
                <div className="text-2xl">{lang.flag}</div>
                <div className="mt-1 text-sm font-medium">{lang.name}</div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Choose a mode</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card selected={mode === 'free_talk'} onClick={() => setMode('free_talk')}>
            <div className="text-center">
              <div className="text-xl">💬</div>
              <div className="mt-1 text-sm font-medium">Free Talk</div>
            </div>
          </Card>
          <Card selected={mode === 'scenario'} onClick={() => setMode('scenario')}>
            <div className="text-center">
              <div className="text-xl">🎭</div>
              <div className="mt-1 text-sm font-medium">Scenario</div>
            </div>
          </Card>
        </div>
      </section>

      {mode === 'scenario' && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Pick a scenario</h2>
          <div className="flex flex-col gap-2">
            {SCENARIOS.map((scenario) => (
              <Card
                key={scenario.id}
                selected={scenarioId === scenario.id}
                onClick={() => setScenarioId(scenario.id)}
              >
                <div className="font-medium text-sm">
                  {scenario.title[language] ?? scenario.title.en}
                </div>
                <div className="text-xs text-muted mt-1">
                  {scenario.description[language] ?? scenario.description.en}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <Button size="lg" className="w-full" onClick={handleStart}>
        Start Practice
      </Button>
    </div>
  );
}
