import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Generator from './pages/Generator';
import Library from './pages/Library';
import { useIdeaStore } from './store/useIdeaStore';

const App: React.FC = () => {
  const { 
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
  } = useIdeaStore();

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-line font-bold text-xl animate-pulse">StickerMind Loading...</div>
        </div>
    )
  }

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard ideas={ideas} />} />
          <Route 
            path="/generator" 
            element={<Generator onAddIdeas={addIdeas} onAddTheme={addTheme} />} 
          />
          <Route 
            path="/library" 
            element={
              <Library 
                ideas={ideas}
                themes={themes}
                onRemove={removeIdea}
                onRemoveTheme={removeTheme} 
                onToggleFavorite={toggleFavorite} 
                onUpdateStatus={updateStatus}
                onClearAll={clearAll}
              />
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;