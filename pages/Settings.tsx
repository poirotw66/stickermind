import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Key, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { useApiKeyStore } from '../store/useApiKeyStore';

const Settings: React.FC = () => {
  const { apiKey, setApiKey, clearApiKey, hasApiKey } = useApiKeyStore();
  const [inputValue, setInputValue] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setInputValue(apiKey);
  }, [apiKey]);

  const handleSave = () => {
    setApiKey(inputValue);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    setInputValue('');
    clearApiKey();
    setSaved(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <SettingsIcon size={28} />
          設定
        </h1>
        <p className="text-gray-500 mt-1">管理您的 API Key 與偏好</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
          <Key size={20} />
          Gemini API Key
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          請在此輸入您的 Google Gemini API Key，僅儲存於本機瀏覽器，不會上傳至任何伺服器。
          可至{' '}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-line hover:underline"
          >
            Google AI Studio
          </a>{' '}
          取得 API Key。
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showKey ? 'text' : 'password'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="請貼上您的 API Key"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-line focus:border-line"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              aria-label={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2.5 bg-line text-white rounded-lg font-medium hover:bg-line-dark transition-colors shrink-0"
          >
            {saved ? <Check size={18} /> : null}
            {saved ? '已儲存' : '儲存'}
          </button>
          {hasApiKey && (
            <button
              onClick={handleClear}
              className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors shrink-0"
            >
              清除
            </button>
          )}
        </div>
        {hasApiKey && (
          <p className="mt-3 text-sm text-green-600 flex items-center gap-1">
            <Check size={16} /> 已設定 API Key，可使用題材生成功能。
          </p>
        )}
        {!hasApiKey && inputValue.length === 0 && (
          <div className="mt-3 flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>尚未設定 API Key 時，無法使用「題材生成器」的 AI 功能。請在此儲存您的 Key。</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
