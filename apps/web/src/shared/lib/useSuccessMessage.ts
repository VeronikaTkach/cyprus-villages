'use client';

import { useRef, useState } from 'react';

export function useSuccessMessage(duration = 2500) {
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function show(text: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(text);
    timerRef.current = setTimeout(() => setMessage(null), duration);
  }

  return { message, show };
}
