'use client';

import { cn } from '@/lib/utils';

interface VoiceVisualizerProps {
  active: boolean;
}

export default function VoiceVisualizer({ active }: VoiceVisualizerProps) {
  return (
    <div className="flex items-end justify-center gap-1 h-8">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'w-1.5 rounded-full bg-primary/60 transition-all',
            active ? 'animate-voice-bar' : 'h-2',
          )}
          style={active ? { animationDelay: `${i * 0.1}s` } : undefined}
        />
      ))}
    </div>
  );
}
