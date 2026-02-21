import React, { useState, useMemo } from 'react';
import { StickerIdea, ThemeIdea } from '../types';
import { Search, Filter, Trash2, Heart, CheckCircle, Circle, Download, Lightbulb, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LibraryProps {
  ideas: StickerIdea[];
  themes: ThemeIdea[]; // New prop
  onRemove: (id: string) => void;
  onRemoveTheme: (id: string) => void; // New prop
  onToggleFavorite: (id: string) => void;
  onUpdateStatus: (id: string, status: StickerIdea['status']) => void;
  onClearAll: () => void;
}

const Library: React.FC<LibraryProps> = ({ 
    ideas, 
    themes, 
    onRemove, 
    onRemoveTheme, 
    onToggleFavorite, 
    onUpdateStatus, 
    onClearAll 
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'stickers' | 'themes'>('stickers');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'completed' | 'favorite'>('all');

  const filteredIdeas = useMemo(() => {
    return ideas.filter(idea => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (idea.name && idea.name.toLowerCase().includes(searchLower)) ||
        idea.catchphrase.toLowerCase().includes(searchLower) || 
        idea.role.toLowerCase().includes(searchLower) ||
        idea.scenario.toLowerCase().includes(searchLower) ||
        idea.emotion.toLowerCase().includes(searchLower);
      
      const matchesStatus = 
        filterStatus === 'all' ? true :
        filterStatus === 'favorite' ? idea.isFavorite :
        idea.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [ideas, searchTerm, filterStatus]);

  const filteredThemes = useMemo(() => {
      const searchLower = searchTerm.toLowerCase();
      return themes.filter(theme => 
        theme.title.toLowerCase().includes(searchLower) ||
        theme.description.toLowerCase().includes(searchLower)
      );
  }, [themes, searchTerm]);

  // Escape CSV field: double quotes become two double quotes per RFC 4180
  const escapeCsvField = (value: string): string =>
    `"${String(value).replace(/"/g, '""')}"`;

  const exportCSV = () => {
    let csvContent = "";
    if (activeTab === 'stickers') {
        const headers = ['ID', 'Name', 'Role', 'Emotion', 'Catchphrase', 'Scenario', 'CultureTag', 'Status'];
        csvContent = [
            headers.join(','),
            ...filteredIdeas.map(i =>
              [i.id, i.name, i.role, i.emotion, i.catchphrase, i.scenario, i.cultureTag, i.status]
                .map(escapeCsvField).join(','))
        ].join('\n');
    } else {
        const headers = ['ID', 'Title', 'Description', 'SellingPoint', 'ExamplePhrases'];
        csvContent = [
            headers.join(','),
            ...filteredThemes.map(t =>
              [t.id, t.title, t.description, t.sellingPoint, t.examplePhrases.join(' | ')]
                .map(escapeCsvField).join(','))
        ].join('\n');
    }

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeTab}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToGenerator = (themeTitle: string) => {
    // Navigate to generator with state would be ideal, but for now simple navigation
    // In a real app, use context or query params to pre-fill the form
    alert(`已複製主題「${themeTitle}」，請至生成器貼上使用。`);
    navigate('/generator');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">靈感資料庫</h1>
          <p className="text-gray-500">管理、篩選並標記您的創作題材</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
             onClick={exportCSV} 
             disabled={(activeTab === 'stickers' ? filteredIdeas.length : filteredThemes.length) === 0}
             className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <Download size={16} /> 匯出 CSV
          </button>
          <button 
             onClick={onClearAll} 
             className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors"
          >
            <Trash2 size={16} /> 清空全部
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
            <button
                onClick={() => setActiveTab('stickers')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === 'stickers'
                    ? 'border-line text-line'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
                <Filter size={18} />
                貼圖靈感 ({ideas.length})
            </button>
            <button
                onClick={() => setActiveTab('themes')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === 'themes'
                    ? 'border-slate-800 text-slate-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
                <Lightbulb size={18} />
                收藏主題 ({themes.length})
            </button>
        </nav>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder={activeTab === 'stickers' ? "搜尋名稱、角色、台詞或情境..." : "搜尋主題名稱或描述..."}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-line focus:border-line"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {activeTab === 'stickers' && (
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <FilterButton active={filterStatus === 'all'} onClick={() => setFilterStatus('all')} label="全部" />
            <FilterButton active={filterStatus === 'new'} onClick={() => setFilterStatus('new')} label="未完成" />
            <FilterButton active={filterStatus === 'completed'} onClick={() => setFilterStatus('completed')} label="已完成" />
            <FilterButton active={filterStatus === 'favorite'} onClick={() => setFilterStatus('favorite')} label="收藏" icon={<Heart size={14} className={filterStatus === 'favorite' ? 'fill-current' : ''} />} />
            </div>
        )}
      </div>

      {/* STICKERS LIST */}
      {activeTab === 'stickers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIdeas.map(idea => (
            <div key={idea.id} className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md ${idea.status === 'completed' ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
                <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${idea.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {idea.emotion}
                    </span>
                    <button onClick={() => onToggleFavorite(idea.id)} className={`p-1 rounded-full hover:bg-gray-100 ${idea.isFavorite ? 'text-red-500' : 'text-gray-300'}`}>
                        <Heart size={20} className={idea.isFavorite ? 'fill-current' : ''} />
                    </button>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-1">{idea.catchphrase}</h3>
                <p className="text-xs text-line font-medium mb-3 bg-line-light inline-block px-1.5 py-0.5 rounded border border-green-100">
                    {idea.name}
                </p>
                
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <p><span className="font-medium text-gray-400">角色:</span> {idea.role}</p>
                    <p><span className="font-medium text-gray-400">情境:</span> {idea.scenario}</p>
                    <p><span className="font-medium text-gray-400">標籤:</span> #{idea.cultureTag}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <button 
                    onClick={() => onUpdateStatus(idea.id, idea.status === 'completed' ? 'new' : 'completed')}
                    className={`flex items-center gap-1.5 text-sm font-medium ${idea.status === 'completed' ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                    {idea.status === 'completed' ? <CheckCircle size={18} /> : <Circle size={18} />}
                    {idea.status === 'completed' ? '已完成' : '標記完成'}
                    </button>
                    <button onClick={() => onRemove(idea.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                    </button>
                </div>
                </div>
            </div>
            ))}
            {filteredIdeas.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400">
                    <p>沒有找到符合條件的題材。</p>
                </div>
            )}
        </div>
      )}

      {/* THEMES LIST */}
      {activeTab === 'themes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {filteredThemes.map(theme => (
                 <div key={theme.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
                     <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{theme.title}</h3>
                        <button onClick={() => onRemoveTheme(theme.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                            <Trash2 size={18} />
                        </button>
                     </div>
                     <p className="text-gray-600 text-sm mb-3">{theme.description}</p>
                     
                     <div className="bg-yellow-50 px-3 py-2 rounded text-xs text-yellow-800 font-medium mb-3 inline-block">
                        🎯 賣點：{theme.sellingPoint}
                     </div>

                     <div className="flex flex-wrap gap-2 mt-2 mb-4">
                        {theme.examplePhrases.map((phrase, pIdx) => (
                        <span key={pIdx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {phrase}
                        </span>
                        ))}
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                         <button 
                           onClick={() => copyToGenerator(theme.title)}
                           className="text-sm flex items-center gap-1 text-gray-500 hover:text-line transition-colors"
                         >
                            <Copy size={16} /> 複製標題去製作
                         </button>
                    </div>
                 </div>
             ))}
             {filteredThemes.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                    <Lightbulb size={40} className="mx-auto mb-2 opacity-30" />
                    <p>尚未收藏任何主題。</p>
                    <p className="text-sm mt-1">去生成器發想一些好點子並將它們存下來吧！</p>
                </div>
            )}
        </div>
      )}

    </div>
  );
};

const FilterButton: React.FC<{ active: boolean; onClick: () => void; label: string; icon?: React.ReactNode }> = ({ active, onClick, label, icon }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
      active 
        ? 'bg-slate-800 text-white' 
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default Library;