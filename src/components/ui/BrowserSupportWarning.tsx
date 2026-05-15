'use client';

import { useEffect, useState } from 'react';

interface BrowserSupportWarningProps {
  children: React.ReactNode;
}

export default function BrowserSupportWarning({
  children,
}: BrowserSupportWarningProps) {
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window ||
        'webkitSpeechRecognition' in window);
    setIsSupported(supported);
  }, []);

  if (!isSupported) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="max-w-md rounded-2xl border border-yellow-200 bg-yellow-50 p-6 text-center dark:border-yellow-800 dark:bg-yellow-950">
          <div className="mb-3 text-4xl">&#9888;&#65039;</div>
          <h2 className="mb-2 text-lg font-semibold text-yellow-800 dark:text-yellow-200">
            Browser Not Supported
          </h2>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Speech recognition is not available in your browser. For the best
            experience, please use{' '}
            <strong>Google Chrome</strong> or <strong>Safari</strong>.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
