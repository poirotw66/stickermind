import React, { useMemo } from 'react';
import { StickerIdea } from '../types';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie 
} from 'recharts';
import { ArrowRight, Lightbulb, CheckCircle, Heart } from 'lucide-react';

interface DashboardProps {
  ideas: StickerIdea[];
}

const COLORS = ['#06C755', '#00B900', '#333', '#FF9F0A', '#FF3B30', '#5AC8FA'];

const Dashboard: React.FC<DashboardProps> = ({ ideas }) => {
  const totalIdeas = ideas.length;
  const completedIdeas = ideas.filter(i => i.status === 'completed').length;
  const favoriteIdeas = ideas.filter(i => i.isFavorite).length;

  const emotionData = useMemo(() => {
    const counts: Record<string, number> = {};
    ideas.forEach(idea => {
      counts[idea.emotion] = (counts[idea.emotion] || 0) + 1;
    });
    return Object.keys(counts)
      .map(key => ({ name: key, value: counts[key] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 emotions
  }, [ideas]);

  const audienceData = useMemo(() => {
    const counts: Record<string, number> = {};
    ideas.forEach(idea => {
      counts[idea.targetAudience] = (counts[idea.targetAudience] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [ideas]);

  if (totalIdeas === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 bg-line-light rounded-full flex items-center justify-center mb-4">
          <Lightbulb size={40} className="text-line" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">歡迎來到 StickerMind</h2>
        <p className="text-lg text-gray-600 max-w-md">
          您的靈感庫目前是空的。使用 AI 快速生成針對台灣市場的 LINE 貼圖題材吧！
        </p>
        <Link 
          to="/generator" 
          className="bg-line hover:bg-line-dark text-white px-8 py-3 rounded-full font-bold text-lg transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          開始生成題材 <ArrowRight size={20} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">總覽儀表板</h1>
        <p className="text-gray-500">追蹤您的創作進度與題材分佈</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Lightbulb size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">總靈感數</p>
            <p className="text-2xl font-bold text-gray-900">{totalIdeas}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">已完成繪製</p>
            <p className="text-2xl font-bold text-gray-900">{completedIdeas}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-500 rounded-lg">
            <Heart size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">收藏題材</p>
            <p className="text-2xl font-bold text-gray-900">{favoriteIdeas}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Emotion Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
          <h3 className="text-lg font-bold text-gray-800 mb-6">情緒分佈 (Top 6)</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={emotionData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
              <Tooltip cursor={{fill: '#f3f4f6'}} />
              <Bar dataKey="value" fill="#06C755" radius={[0, 4, 4, 0]} barSize={24} label={{ position: 'right' }}>
                {emotionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Audience Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
          <h3 className="text-lg font-bold text-gray-800 mb-6">目標客群佔比</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={audienceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {audienceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Ideas Snippet */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">最新生成的靈感</h3>
            <Link to="/library" className="text-line hover:text-line-dark text-sm font-medium">查看全部</Link>
         </div>
         <div className="divide-y divide-gray-100">
            {ideas.slice(0, 5).map(idea => (
              <div key={idea.id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                 <div>
                    <span className="inline-block px-2 py-1 rounded text-xs bg-gray-100 text-gray-600 mr-2">{idea.role}</span>
                    <span className="font-medium text-gray-900">{idea.catchphrase}</span>
                    <span className="text-gray-500 text-sm ml-2">- {idea.scenario}</span>
                 </div>
                 <div className="text-xs text-gray-400">
                    {new Date(idea.createdAt).toLocaleDateString()}
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default Dashboard;