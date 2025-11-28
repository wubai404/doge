import React, { useState, useEffect, useCallback } from 'react';
import { fetchDogePrice, fetchDogeChart } from './services/cryptoService';
import { analyzeMarket } from './services/geminiService';
import StatsCard from './components/StatsCard';
import PriceChart from './components/PriceChart';
import AiInsight from './components/AiInsight';
import { DogePriceData, ChartPoint, MarketAnalysis, TimeRange } from './types';
import { Dog, DollarSign, BarChart2, Zap, RefreshCw, Activity, Bell, BellRing, X } from 'lucide-react';

const App: React.FC = () => {
  const [dogeData, setDogeData] = useState<DogePriceData | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<TimeRange>(TimeRange.H24);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Price Alert State
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [alertEnabled, setAlertEnabled] = useState<boolean>(false);
  const [alertTriggered, setAlertTriggered] = useState<boolean>(false);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoadingData(true);
    setError(null);
    
    try {
      const [priceData, chartHistory] = await Promise.all([
        fetchDogePrice(),
        fetchDogeChart(timeRange)
      ]);
      
      setDogeData(priceData);
      setChartData(chartHistory);
      setLastUpdated(new Date());

      // Check Price Alert
      if (alertEnabled && !alertTriggered && priceData) {
        const target = parseFloat(targetPrice);
        if (!isNaN(target) && priceData.usd >= target) {
          setAlertTriggered(true);
          // Optional: Browser notification could go here
        }
      }

      // Only run initial AI analysis if we have no analysis yet
      if (!analysis) {
        handleAiAnalysis(priceData, chartHistory);
      }

    } catch (err) {
      console.error(err);
      setError("无法获取加密数据。可能已达到 API 限制。");
    } finally {
      setLoadingData(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, alertEnabled, targetPrice, alertTriggered]);

  const handleAiAnalysis = async (price: DogePriceData | null, history: ChartPoint[]) => {
    if (!price || history.length === 0) return;
    
    setLoadingAi(true);
    try {
      const result = await analyzeMarket(price, history);
      setAnalysis(result);
    } catch (e) {
      console.error("AI Error", e);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 60000); // Poll every minute
    return () => clearInterval(interval);
  }, [loadData]);

  // Format currency
  const fmt = (num: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4 }).format(num);

  const fmtCompact = (num: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: "compact", maximumFractionDigits: 1 }).format(num);

  // Helper to translate sentiment
  const getSentimentLabel = (sentiment: string | undefined) => {
    switch (sentiment) {
      case 'Bullish': return '看涨';
      case 'Bearish': return '看跌';
      case 'Volatile': return '剧烈波动';
      case 'Neutral': return '中性';
      default: return '---';
    }
  };

  const toggleAlert = () => {
    if (alertEnabled) {
      setAlertEnabled(false);
      setAlertTriggered(false);
    } else {
      if (!targetPrice || isNaN(parseFloat(targetPrice))) {
        alert("请输入有效的价格目标");
        return;
      }
      setAlertEnabled(true);
      setAlertTriggered(false);
    }
  };

  return (
    <div className="min-h-screen pb-12 bg-slate-900">
      {/* Alert Banner */}
      {alertTriggered && (
        <div className="bg-red-500 text-white px-4 py-3 sticky top-16 z-40 flex justify-between items-center shadow-lg animate-bounce-short">
          <div className="flex items-center gap-2 font-bold">
            <BellRing size={20} />
            <span>价格警报：狗狗币已触及目标价格 ${targetPrice}！</span>
          </div>
          <button onClick={() => setAlertTriggered(false)} className="hover:bg-red-600 p-1 rounded">
            <X size={20} />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-doge-500 p-2 rounded-full shadow-lg shadow-doge-500/20">
              <Dog size={24} className="text-slate-900" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Doge<span className="text-doge-400">Vol</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-xs text-slate-400 hidden sm:block">
              {lastUpdated && `更新于: ${lastUpdated.toLocaleTimeString()}`}
             </div>
             <button 
                onClick={() => loadData(false)}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-slate-300"
                title="刷新数据"
             >
                <RefreshCw size={18} className={loadingData ? 'animate-spin' : ''} />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        
        {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl flex items-center gap-2">
                <Zap size={16} /> {error}
            </div>
        )}

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            label="当前价格"
            value={dogeData ? fmt(dogeData.usd) : '---'}
            subValue={dogeData ? `${dogeData.usd_24h_change.toFixed(2)}% (24小时)` : undefined}
            isPositive={dogeData ? dogeData.usd_24h_change >= 0 : undefined}
            loading={loadingData}
            icon={<DollarSign size={20} />}
          />
          <StatsCard 
            label="24小时交易量"
            value={dogeData ? fmtCompact(dogeData.usd_24h_vol) : '---'}
            subValue="流动性"
            isPositive={true}
            loading={loadingData}
            icon={<BarChart2 size={20} />}
          />
          <StatsCard 
            label="波动率指数"
            value={chartData.length > 0 ? 
                `${(((Math.max(...chartData.map(d=>d.price)) - Math.min(...chartData.map(d=>d.price))) / Math.min(...chartData.map(d=>d.price))) * 100).toFixed(2)}%` 
                : '---'}
            subValue={timeRange === TimeRange.H24 ? '日内波幅' : '区间波幅'}
            loading={loadingData}
            icon={<Activity size={20} />}
          />
           <StatsCard 
            label="Gemini 情绪指数"
            value={analysis ? getSentimentLabel(analysis.sentiment) : '---'}
            subValue={analysis ? 'AI 驱动' : '等待中...'}
            isPositive={analysis?.sentiment === 'Bullish'}
            loading={loadingAi || (loadingData && !analysis)}
            icon={<Zap size={20} />}
          />
        </div>

        {/* Main Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Chart */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-white font-semibold flex items-center gap-2">
                    <BarChart2 size={20} className="text-doge-400"/>
                    市场趋势
                </h2>
                <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
                    {[
                        { val: TimeRange.H24, label: '24小时' },
                        { val: TimeRange.D7, label: '7天' },
                        { val: TimeRange.D30, label: '30天' },
                        { val: TimeRange.D90, label: '90天' },
                        { val: TimeRange.Y1, label: '1年' },
                        { val: TimeRange.Y10, label: '10年' },
                    ].map((opt) => (
                        <button
                            key={opt.val}
                            onClick={() => setTimeRange(opt.val)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                timeRange === opt.val 
                                ? 'bg-doge-500 text-slate-900 shadow-lg' 
                                : 'text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>
            <PriceChart data={chartData} loading={loadingData} />
          </div>

          {/* Right: AI Analysis & Tools */}
          <div className="lg:col-span-1 space-y-6">
             {/* Alert Tool */}
             <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Bell size={20} className={alertEnabled ? "text-doge-400" : "text-slate-400"} />
                    <h3 className="text-lg font-bold text-white">价格提醒</h3>
                </div>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                        <input 
                            type="number" 
                            step="0.0001"
                            placeholder="输入目标价格"
                            value={targetPrice}
                            onChange={(e) => setTargetPrice(e.target.value)}
                            disabled={alertEnabled}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2 pl-7 pr-4 text-white focus:outline-none focus:border-doge-500 disabled:opacity-50"
                        />
                    </div>
                    <button 
                        onClick={toggleAlert}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            alertEnabled 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' 
                            : 'bg-doge-500 text-slate-900 hover:bg-doge-400'
                        }`}
                    >
                        {alertEnabled ? '停止' : '设置'}
                    </button>
                </div>
                {alertEnabled && (
                    <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                        <Activity size={12} /> 正在监控: 当价格 &ge; ${targetPrice} 时提醒
                    </p>
                )}
             </div>

             <AiInsight 
                analysis={analysis} 
                loading={loadingAi} 
                onRefresh={() => handleAiAnalysis(dogeData, chartData)} 
             />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;