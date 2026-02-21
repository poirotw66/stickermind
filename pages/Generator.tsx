import React, { useState } from 'react';
import { Sparkles, Loader2, Save, Layers, Lightbulb, ArrowRight, Bookmark, Check, Copy } from 'lucide-react';
import { generateStickerIdeas, generateStickerThemes } from '../services/geminiService';
import { StickerIdea, ThemeIdea, GenerationParams, TARGET_AUDIENCES, ROLE_TYPES, STYLES } from '../types';
import { useNavigate } from 'react-router-dom';

interface GeneratorProps {
  onAddIdeas: (ideas: StickerIdea[]) => void;
  onAddTheme: (theme: ThemeIdea) => void;
}

type GeneratorMode = 'themes' | 'stickers';

const Generator: React.FC<GeneratorProps> = ({ onAddIdeas, onAddTheme }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<GeneratorMode>('themes');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Results
  const [generatedIdeas, setGeneratedIdeas] = useState<StickerIdea[]>([]);
  const [generatedThemes, setGeneratedThemes] = useState<ThemeIdea[]>([]);
  const [savedThemeIds, setSavedThemeIds] = useState<Set<string>>(new Set());
  
  // State to track if the user selected "Other" for role
  const [isCustomRole, setIsCustomRole] = useState(false);
  
  const [params, setParams] = useState<GenerationParams>({
    targetAudience: TARGET_AUDIENCES[0],
    roleType: ROLE_TYPES[0],
    theme: '',
    style: STYLES[0],
    count: 24, // Default sticker count
    themeCount: 4, // Default theme count
  });

  // --- Handlers ---

  const handleGenerateThemes = async () => {
    if (!params.roleType.trim()) {
      setError("請選擇或輸入角色類型");
      return;
    }
    setLoading(true);
    setError(null);
    setGeneratedThemes([]);
    setSavedThemeIds(new Set()); // Reset saved state for new generation
    
    try {
      const themes = await generateStickerThemes(params);
      setGeneratedThemes(themes);
    } catch (err: any) {
      setError(err.message || '無法產生主題靈感');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStickers = async () => {
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
      setError(err.message || '無法產生貼圖內容');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAllIdeas = () => {
    onAddIdeas(generatedIdeas);
    navigate('/library');
  };

  const handleSaveTheme = (theme: ThemeIdea) => {
    onAddTheme(theme);
    setSavedThemeIds(prev => new Set(prev).add(theme.id));
  };

  const handleCopyThemeContent = (theme: ThemeIdea) => {
    const content = `【${theme.title}】\n\n${theme.description}\n\n🎯 賣點：${theme.sellingPoint}\n💬 範例：${theme.examplePhrases.join(' / ')}`;
    navigator.clipboard.writeText(content);
    alert('已複製主題內容！');
  };

  const applyTheme = (themeTitle: string) => {
    setParams({ ...params, theme: themeTitle });
    setMode('stickers');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- UI Components ---

  const renderInputs = () => (
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
        <label className="block text-sm font-medium text-gray-700 mb-1">角色設定</label>
        <select 
          className="w-full border-gray-300 rounded-md shadow-sm focus:border-line focus:ring-line p-2 border"
          value={isCustomRole ? 'custom' : params.roleType}
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'custom') {
              setIsCustomRole(true);
              setParams({...params, roleType: ''}); 
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

      {/* Mode Specific Inputs */}
      {mode === 'themes' && (
        <div className="pt-4 border-t border-gray-100">
           <div className="flex justify-between items-center mb-1">
             <label className="block text-sm font-medium text-gray-700">發想數量</label>
             <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                {params.themeCount} 個主題
             </span>
           </div>
           <input 
             type="range" min="2" max="8" step="1"
             className="w-full accent-slate-800"
             value={params.themeCount}
             onChange={(e) => setParams({...params, themeCount: parseInt(e.target.value)})}
           />
        </div>
      )}

      {mode === 'stickers' && (
        <>
          <div className="pt-4 border-t border-gray-100">
             <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
               貼圖主題
               <span className="text-xs font-normal text-line bg-line-light px-2 py-0.5 rounded-full">核心</span>
             </label>
             <input 
               type="text" 
               placeholder="例如：職場生存、情侶日常..."
               className="w-full border-gray-300 rounded-md shadow-sm focus:border-line focus:ring-line p-2 border"
               value={params.theme}
               onChange={(e) => setParams({...params, theme: e.target.value})}
             />
             <p className="text-xs text-gray-400 mt-1">若沒有靈感，請切換至「主題發想」模式。</p>
          </div>

          <div>
             <div className="flex justify-between items-center mb-1">
               <label className="block text-sm font-medium text-gray-700">生成張數</label>
               <button 
                  onClick={() => setParams({...params, count: 40})}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
               >
                  <Layers size={12} /> 設定 40 張
               </button>
             </div>
             <input 
               type="range" min="8" max="40" step="4"
               className="w-full accent-line"
               value={params.count}
               onChange={(e) => setParams({...params, count: parseInt(e.target.value)})}
             />
             <div className="text-right text-xs text-gray-500">{params.count} 張貼圖</div>
          </div>
        </>
      )}

      {/* Action Button */}
      <button
        onClick={mode === 'themes' ? handleGenerateThemes : handleGenerateStickers}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all mt-4 ${
          mode === 'themes' ? 'bg-slate-800 hover:bg-slate-900' : 'bg-line hover:bg-line-dark'
        } ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            AI 思考中...
          </>
        ) : mode === 'themes' ? (
          <>
            <Lightbulb size={20} />
            發想主題提案
          </>
        ) : (
          <>
            <Sparkles size={20} />
            生成貼圖內容
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header & Tabs */}
      <div className="text-center space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI 貼圖企劃室</h1>
          <p className="text-gray-500 mt-2">從靈感發想到完整內容規劃，一站式完成。</p>
        </div>

        <div className="inline-flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
           <button 
             onClick={() => setMode('themes')}
             className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'themes' ? 'bg-slate-800 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
           >
             <Lightbulb size={18} />
             1. 主題發想
           </button>
           <button 
             onClick={() => setMode('stickers')}
             className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'stickers' ? 'bg-line text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
           >
             <Layers size={18} />
             2. 內容企劃
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-1 space-y-6">
          {renderInputs()}
          
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700">
            <h4 className="font-bold mb-1">
              {mode === 'themes' ? '💡 為什麼要先想主題？' : '💡 貼圖小撇步'}
            </h4>
            <p>
              {mode === 'themes' 
                ? '一個明確的主題（如：全職媽媽的崩潰）比通用的角色（如：可愛的貓）更容易吸引到特定族群購買喔！' 
                : '設定 40 張能讓您的貼圖在商店看起來更豐富，CP 值更高，但也需要涵蓋更多實用情境。'}
            </p>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-2">
           {error && (
             <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
               {error}
             </div>
           )}

           {/* --- MODE A: THEME RESULTS --- */}
           {mode === 'themes' && (
             <div className="space-y-6">
                {generatedThemes.length === 0 && !loading && (
                   <div className="h-full flex flex-col items-center justify-center text-gray-400 min-h-[400px] border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                     <Lightbulb size={48} className="mb-4 opacity-20" />
                     <p className="font-medium text-gray-500">還不知道要畫什麼？</p>
                     <p className="text-sm mt-2 max-w-xs text-center text-gray-400">
                       設定好角色與風格，讓 AI 幫您找出 {params.themeCount} 個最具市場潛力的切入點。
                     </p>
                   </div>
                )}

                {loading && (
                   <div className="grid gap-4">
                     {Array.from({ length: params.themeCount }).map((_, i) => (
                       <div key={i} className="animate-pulse bg-white h-40 rounded-xl w-full border border-gray-100"></div>
                     ))}
                   </div>
                )}

                {generatedThemes.length > 0 && (
                  <>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">為您發想的 {generatedThemes.length} 個主題提案</h2>
                    <div className="grid gap-4">
                      {generatedThemes.map((theme) => (
                        <div key={theme.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:border-line-light hover:shadow-md transition-all p-5">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 pr-4">
                               <h3 className="text-lg font-bold text-gray-900 mb-1">{theme.title}</h3>
                               <p className="text-gray-600 text-sm mb-3">{theme.description}</p>
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                                <button 
                                  onClick={() => applyTheme(theme.title)}
                                  className="flex items-center justify-center gap-1 text-sm bg-line text-white px-3 py-1.5 rounded-lg hover:bg-line-dark transition-colors shadow-sm w-full"
                                >
                                  使用此主題 <ArrowRight size={16} />
                                </button>
                                <button 
                                  onClick={() => handleSaveTheme(theme)}
                                  disabled={savedThemeIds.has(theme.id)}
                                  className={`flex items-center justify-center gap-1 text-sm px-3 py-1.5 rounded-lg border transition-colors w-full ${
                                    savedThemeIds.has(theme.id) 
                                      ? 'bg-slate-100 text-slate-400 border-slate-200' 
                                      : 'bg-white text-slate-700 border-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  {savedThemeIds.has(theme.id) ? (
                                    <>
                                        <Check size={16} /> 已收藏
                                    </>
                                  ) : (
                                    <>
                                        <Bookmark size={16} /> 收藏
                                    </>
                                  )}
                                </button>
                                <button 
                                  onClick={() => handleCopyThemeContent(theme)}
                                  className="flex items-center justify-center gap-1 text-sm px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 transition-colors w-full"
                                >
                                  <Copy size={16} /> 複製
                                </button>
                            </div>
                          </div>
                          
                          <div className="bg-yellow-50 px-3 py-2 rounded text-xs text-yellow-800 font-medium mb-3 inline-block">
                             🎯 賣點：{theme.sellingPoint}
                          </div>

                          <div className="flex flex-wrap gap-2 mt-2">
                             {theme.examplePhrases.map((phrase, pIdx) => (
                               <span key={pIdx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                 {phrase}
                               </span>
                             ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
             </div>
           )}

           {/* --- MODE B: STICKER PLANNER RESULTS --- */}
           {mode === 'stickers' && (
             <div className="space-y-6">
               {generatedIdeas.length > 0 && (
                 <div className="flex justify-between items-center bg-green-50 p-4 rounded-xl border border-green-100">
                   <div>
                      <h2 className="text-lg font-bold text-gray-800">企劃完成！共 {generatedIdeas.length} 張</h2>
                      <p className="text-sm text-gray-600">主題：{params.theme || '未指定'}</p>
                   </div>
                   <button 
                    onClick={handleSaveAllIdeas}
                    className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-lg hover:bg-slate-900 transition-colors shadow-lg font-medium"
                   >
                     <Save size={18} />
                     全部儲存至資料庫
                   </button>
                 </div>
               )}

               <div className="space-y-4">
                 {generatedIdeas.length === 0 && !loading && !error && (
                   <div className="h-full flex flex-col items-center justify-center text-gray-400 min-h-[400px] border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                     <Layers size={48} className="mb-4 opacity-20" />
                     <p className="font-medium">等待企劃生成</p>
                     <p className="text-sm mt-2 max-w-xs text-center">
                       您可以先在「主題發想」找靈感，或直接在此輸入主題開始規劃。
                     </p>
                   </div>
                 )}

                 {loading && (
                   <div className="space-y-4">
                     <div className="flex items-center justify-center py-8 text-gray-500">
                        <p>AI 正在根據 "{params.theme}" 規劃 {params.count} 張貼圖...</p>
                     </div>
                     {[1,2,3,4].map(i => (
                       <div key={i} className="animate-pulse bg-white h-24 rounded-xl w-full border border-gray-100"></div>
                     ))}
                   </div>
                 )}

                 <div className="grid grid-cols-1 gap-4">
                  {generatedIdeas.map((idea, index) => (
                    <div key={idea.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-start gap-4 hover:border-line-light transition-colors group">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-sm group-hover:bg-line group-hover:text-white transition-colors">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-lg font-bold text-gray-900">
                              {idea.catchphrase}
                            </h3>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">{idea.emotion}</span>
                          </div>
                          <p className="text-gray-600 text-sm">
                            <span className="font-medium text-line-dark">畫面動作：</span> {idea.scenario}
                          </p>
                        </div>
                    </div>
                  ))}
                 </div>
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Generator;