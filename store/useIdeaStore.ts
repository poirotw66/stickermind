import { useState, useEffect, useCallback } from 'react';
import { StickerIdea } from '../types';

const STORAGE_KEY = 'stickermind_ideas_v1';

export const useIdeaStore = () => {
  const [ideas, setIdeas] = useState<StickerIdea[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
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
    setLoading(false);
  }, []);

  // Save to local storage whenever ideas change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
    }
  }, [ideas, loading]);

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

  const clearAll = useCallback(() => {
    if(window.confirm("確定要清空所有題材嗎？這將無法復原。")) {
      setIdeas([]);
    }
  }, []);

  return {
    ideas,
    addIdeas,
    removeIdea,
    toggleFavorite,
    updateStatus,
    clearAll,
    loading
  };
};