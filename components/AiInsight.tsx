import React from 'react';
import { MarketAnalysis } from '../types';
import { Bot, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

interface AiInsightProps {
  analysis: MarketAnalysis | null;
  loading: boolean;
  onRefresh: () => void;
}

const AiInsight: React.FC<AiInsightProps> = ({ analysis, loading, onRefresh }) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Bullish': return 'text-green-400 border-green-400/30 bg-green-400/10';
      case 'Bearish': return 'text-red-400 border-red-400/30 bg-red-400/10';
      case 'Volatile': return 'text-doge-400 border-doge-400/30 bg-doge-400/10';
      default: return 'text-slate-400 border-slate-400/30 bg-slate-400/10';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'Bullish': return <TrendingUp size={20} />;
      case 'Bearish': return <TrendingDown size={20} />;
      case 'Volatile': return <Activity size={20} />;
      default: return <Minus size={20} />;
    }
  };

  const getSentimentLabel = (sentiment: string) => {
    switch (sentiment) {
      case 'Bullish': return '看涨';
      case 'Bearish': return '看跌';
      case 'Volatile': return '剧烈波动';
      case 'Neutral': return '中性';
      default: return sentiment;
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Bot size={120} />
      </div>

      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
            <Bot size={20} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Gemini 市场分析师</h2>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
        >
          {loading ? '思考中...' : '刷新分析'}
        </button>
      </div>

      {loading && !analysis ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-3/4"></div>
          <div className="h-4 bg-slate-700 rounded w-full"></div>
          <div className="h-4 bg-slate-700 rounded w-5/6"></div>
        </div>
      ) : analysis ? (
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 font-bold ${getSentimentColor(analysis.sentiment)}`}>
              {getSentimentIcon(analysis.sentiment)}
              {getSentimentLabel(analysis.sentiment)}
            </div>
            
            {(analysis.supportLevel || analysis.resistanceLevel) && (
              <div className="flex gap-4 text-sm text-slate-400">
                {analysis.supportLevel && (
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider">支撑位</span>
                        <span className="text-white font-mono">{analysis.supportLevel}</span>
                    </div>
                )}
                {analysis.resistanceLevel && (
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider">阻力位</span>
                        <span className="text-white font-mono">{analysis.resistanceLevel}</span>
                    </div>
                )}
              </div>
            )}
          </div>

          <p className="text-slate-300 leading-relaxed border-l-2 border-slate-600 pl-4 italic">
            "{analysis.summary}"
          </p>
        </div>
      ) : (
        <div className="text-center py-6 text-slate-500">
          <p>点击刷新以获取 AI 市场洞察。</p>
        </div>
      )}
    </div>
  );
};

export default AiInsight;