import React, { useState } from 'react';
import { Sparkles, Loader2, Save } from 'lucide-react';
import { generateStickerIdeas } from '../services/geminiService';
import { StickerIdea, GenerationParams, TARGET_AUDIENCES, ROLE_TYPES, STYLES } from '../types';
import { useNavigate } from 'react-router-dom';

interface GeneratorProps {
  onAddIdeas: (ideas: StickerIdea[]) => void;
}

const Generator: React.FC<GeneratorProps> = ({ onAddIdeas }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedIdeas, setGeneratedIdeas] = useState<StickerIdea[]>([]);
  
  // State to track if the user selected "Other" for role
  const [isCustomRole, setIsCustomRole] = useState(false);
  
  const [params, setParams] = useState<GenerationParams>({
    targetAudience: TARGET_AUDIENCES[0],
    roleType: ROLE_TYPES[0],
    theme: '',
    style: STYLES[0],
    count: 10,
  });

  const handleGenerate = async () => {
    if (!params.roleType.trim()) {
      setError("請選擇或輸入角色類型");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedIdeas([]);
    
    try {
      const ideas = await generateStickerIdeas(params);
      setGeneratedIdeas(ideas);
    } catch (err: any) {
      setError(err.message || '發生未知錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = () => {
    onAddIdeas(generatedIdeas);
    navigate('/library');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">AI 貼圖題材生成器</h1>
        <p className="text-gray-500 mt-2">設定您的目標與條件，讓 AI 幫您想出 20-100 個爆款點子。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">目標客群 (TA)</label>
              <select 
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-line focus:ring-line p-2 border"
                value={params.targetAudience}
                onChange={(e) => setParams({...params, targetAudience: e.target.value})}
              >
                {TARGET_AUDIENCES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">角色類型</label>
              <select 
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-line focus:ring-line p-2 border"
                value={isCustomRole ? 'custom' : params.roleType}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'custom') {
                    setIsCustomRole(true);
                    setParams({...params, roleType: ''}); // Clear value for user input
                  } else {
                    setIsCustomRole(false);
                    setParams({...params, roleType: val});
                  }
                }}
              >
                {ROLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                <option value="custom">其他 (自填)...</option>
              </select>
              
              {isCustomRole && (
                <input 
                  type="text"
                  autoFocus
                  placeholder="請輸入角色關鍵字 (例：水豚、負責人)"
                  className="mt-2 w-full border-gray-300 rounded-md shadow-sm focus:border-line focus:ring-line p-2 border bg-gray-50"
                  value={params.roleType}
                  onChange={(e) => setParams({...params, roleType: e.target.value})}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">繪畫風格</label>
              <select 
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-line focus:ring-line p-2 border"
                value={params.style}
                onChange={(e) => setParams({...params, style: e.target.value})}
              >
                {STYLES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">特定主題 (選填)</label>
              <input 
                type="text" 
                placeholder="例如：農曆新年、颱風天、健身..."
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-line focus:ring-line p-2 border"
                value={params.theme}
                onChange={(e) => setParams({...params, theme: e.target.value})}
              />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">生成數量 (批次)</label>
               <input 
                 type="range" min="5" max="20" step="5"
                 className="w-full accent-line"
                 value={params.count}
                 onChange={(e) => setParams({...params, count: parseInt(e.target.value)})}
               />
               <div className="text-right text-xs text-gray-500">{params.count} 個</div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-line hover:bg-line-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-line transition-all ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  AI 思考中...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  開始生成
                </>
              )}
            </button>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700">
            <h4 className="font-bold mb-1">💡 小撇步</h4>
            <p>嘗試結合衝突的元素，例如「可愛兔子」加上「厭世社畜」的情境，通常更容易產生共鳴！</p>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
           {error && (
             <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
               {error}
             </div>
           )}

           {generatedIdeas.length > 0 && (
             <div className="mb-4 flex justify-between items-center">
               <h2 className="text-xl font-bold text-gray-800">生成結果 ({generatedIdeas.length})</h2>
               <button 
                onClick={handleSaveAll}
                className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 transition-colors"
               >
                 <Save size={18} />
                 全部儲存至資料庫
               </button>
             </div>
           )}

           <div className="space-y-4">
             {generatedIdeas.length === 0 && !loading && !error && (
               <div className="h-full flex flex-col items-center justify-center text-gray-400 min-h-[400px] border-2 border-dashed border-gray-200 rounded-xl">
                 <Sparkles size={48} className="mb-4 opacity-20" />
                 <p>等待生成...</p>
               </div>
             )}

             {loading && (
               <div className="space-y-4">
                 {[1,2,3].map(i => (
                   <div key={i} className="animate-pulse bg-white h-32 rounded-xl w-full border border-gray-100"></div>
                 ))}
               </div>
             )}

             {generatedIdeas.map((idea, index) => (
               <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="bg-line-light text-line px-2 py-0.5 rounded text-xs font-bold">{idea.emotion}</span>
                       <span className="text-gray-500 text-xs px-2 py-0.5 border border-gray-200 rounded">{idea.cultureTag}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                       {idea.catchphrase}
                    </h3>
                    <p className="text-gray-600 text-sm">
                       <span className="font-semibold">{idea.role}</span> 在 {idea.scenario}
                    </p>
                  </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Generator;