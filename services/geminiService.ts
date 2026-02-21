/**
 * Client for StickerMind backend API. The backend holds GEMINI_API_KEY;
 * this file never touches the key. Use VITE_API_BASE_URL in production
 * when frontend and API are on different origins.
 */
import type { GenerationParams, StickerIdea, ThemeIdea } from '../types';

const getApiBaseUrl = (): string =>
  (import.meta.env.VITE_API_BASE_URL as string) || '';

async function postJson<T>(path: string, body: object): Promise<T> {
  const base = getApiBaseUrl();
  const url = `${base}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data && typeof data.error === 'string') ? data.error : res.statusText;
    throw new Error(message || `Request failed (${res.status})`);
  }
  return data as T;
}

/**
 * Generate sticker ideas via backend proxy (Gemini key stays on server).
 */
export async function generateStickerIdeas(params: GenerationParams): Promise<StickerIdea[]> {
  return postJson<StickerIdea[]>('/api/generate-stickers', params);
}

/**
 * Generate theme ideas via backend proxy (Gemini key stays on server).
 */
export async function generateStickerThemes(params: GenerationParams): Promise<ThemeIdea[]> {
  return postJson<ThemeIdea[]>('/api/generate-themes', params);
}
