import { useState, useEffect, useCallback } from 'react';
import { StickerIdea, ThemeIdea } from '../types';

const STORAGE_KEY_IDEAS = 'stickermind_ideas_v1';
const STORAGE_KEY_THEMES = 'stickermind_themes_v1';

export const useIdeaStore = () => {
  const [ideas, setIdeas] = useState<StickerIdea[]>([]);
  const [themes, setThemes] = useState<ThemeIdea[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from local storage on mount
  useEffect(() => {
    const storedIdeas = localStorage.getItem(STORAGE_KEY_IDEAS);
    const storedThemes = localStorage.getItem(STORAGE_KEY_THEMES);

    if (storedIdeas) {
      try {
        const parsed = JSON.parse(storedIdeas);
        // Migration logic: Add name if it doesn't exist for legacy data
        const migratedData = parsed.map((item: any) => ({
          ...item,
          name: item.name || `${item.role} ${item.emotion} - ${item.catchphrase || ''}`
        }));
        setIdeas(migratedData);
      } catch (e) {
        console.error("Failed to parse stored ideas", e);
      }
    }

    if (storedThemes) {
      try {
        setThemes(JSON.parse(storedThemes));
      } catch (e) {
        console.error("Failed to parse stored themes", e);
      }
    }

    setLoading(false);
  }, []);

  // Save Ideas to local storage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY_IDEAS, JSON.stringify(ideas));
    }
  }, [ideas, loading]);

  // Save Themes to local storage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY_THEMES, JSON.stringify(themes));
    }
  }, [themes, loading]);

  // --- Sticker Ideas Actions ---
  const addIdeas = useCallback((newIdeas: StickerIdea[]) => {
    setIdeas(prev => [...newIdeas, ...prev]);
  }, []);

  const removeIdea = useCallback((id: string) => {
    setIdeas(prev => prev.filter(idea => idea.id !== id));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setIdeas(prev => prev.map(idea => 
      idea.id === id ? { ...idea, isFavorite: !idea.isFavorite } : idea
    ));
  }, []);

  const updateStatus = useCallback((id: string, status: StickerIdea['status']) => {
    setIdeas(prev => prev.map(idea => 
      idea.id === id ? { ...idea, status } : idea
    ));
  }, []);

  // --- Theme Actions ---
  const addTheme = useCallback((theme: ThemeIdea) => {
    setThemes(prev => {
        // Prevent duplicates by title check (optional, but good UX)
        if (prev.some(t => t.title === theme.title)) return prev;
        return [theme, ...prev];
    });
  }, []);

  const removeTheme = useCallback((id: string) => {
    setThemes(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    if(window.confirm("確定要清空所有資料（包含貼圖與主題）嗎？這將無法復原。")) {
      setIdeas([]);
      setThemes([]);
    }
  }, []);

  return {
    ideas,
    themes,
    addIdeas,
    removeIdea,
    toggleFavorite,
    updateStatus,
    addTheme,
    removeTheme,
    clearAll,
    loading
  };
};