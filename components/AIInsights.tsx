
import React, { useState, useEffect } from 'react';
import { DrinkRecord } from '../types';
import { getAIInsights } from '../services/gemini';
import { Sparkles, RefreshCw } from 'lucide-react';

interface Props {
  records: DrinkRecord[];
}

const AIInsights: React.FC<Props> = ({ records }) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    if (records.length === 0) {
      setInsight("记录你的第一杯奶茶，开启 AI 足迹分析之旅吧！🥤");
      return;
    }
    setLoading(true);
    const result = await getAIInsights(records);
    setInsight(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6 animate-in zoom-in-95 duration-500">
      <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-6 rounded-3xl text-white relative overflow-hidden shadow-xl">
        <Sparkles className="absolute -right-4 -top-4 opacity-20 w-32 h-32" />
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">AI 饮品洞察</h2>
          <p className="text-orange-100 text-sm opacity-90">基于你的饮用历史，Gemini AI 实时分析你的消费与健康趋势。</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-orange-50 min-h-[300px] relative shadow-sm">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <RefreshCw className="text-orange-500 animate-spin" size={32} />
            <p className="text-gray-400 animate-pulse font-medium">AI 正在翻阅你的奶茶日记...</p>
          </div>
        ) : (
          <div className="prose prose-orange max-w-none">
            {insight.split('\n').map((line, i) => {
              if (line.startsWith('#')) return <h3 key={i} className="text-lg font-bold text-orange-700 mt-4 mb-2">{line.replace(/#/g, '').trim()}</h3>;
              return <p key={i} className="text-gray-600 leading-relaxed text-sm mb-2">{line}</p>;
            })}
          </div>
        )}
        
        {!loading && insight && (
          <button 
            onClick={fetchInsights}
            className="mt-6 w-full py-3 bg-orange-50 text-orange-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-100 transition-colors"
          >
            <RefreshCw size={18} />
            <span>重新分析</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
