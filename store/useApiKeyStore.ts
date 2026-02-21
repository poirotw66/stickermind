import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'stickermind_gemini_api_key';

export function useApiKeyStore() {
  const [apiKey, setApiKeyState] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(STORAGE_KEY) || '';
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) || '';
    setApiKeyState(stored);
  }, []);

  const setApiKey = useCallback((key: string) => {
    const trimmed = key.trim();
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY, trimmed);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setApiKeyState(trimmed);
  }, []);

  const clearApiKey = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKeyState('');
  }, []);

  const hasApiKey = apiKey.length > 0;

  return { apiKey, setApiKey, clearApiKey, hasApiKey };
}

/** Read API key from localStorage (for use in non-React code e.g. geminiService). */
export function getStoredApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY) || '';
}
