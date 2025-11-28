import React from 'react';
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { ChartPoint } from '../types';
import { format } from 'date-fns';

interface PriceChartProps {
  data: ChartPoint[];
  loading: boolean;
  color?: string;
}

const PriceChart: React.FC<PriceChartProps> = ({ data, loading, color = "#EAB308" }) => {
  if (loading) {
    return (
      <div className="w-full h-[450px] bg-slate-800/50 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-slate-500">正在加载市场数据...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[450px] bg-slate-800/50 rounded-xl flex items-center justify-center border border-slate-700">
        <span className="text-slate-400">暂无图表数据</span>
      </div>
    );
  }

  // Calculate dynamic domain
  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.1;
  
  // Calculate time duration to determine date format
  const startDate = data[0]?.timestamp || 0;
  const endDate = data[data.length - 1]?.timestamp || 0;
  const durationMs = endDate - startDate;
  const isMultiYear = durationMs > 1000 * 60 * 60 * 24 * 365; // > 1 year
  const isMultiDay = durationMs > 1000 * 60 * 60 * 24 * 2; // > 2 days

  // Formatting helpers
  const formatPrice = (val: number) => `$${val.toFixed(4)}`;
  const formatVolume = (val: number) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toString();
  };

  const formatAxisDate = (ts: number) => {
    if (isMultiYear) return format(new Date(ts), 'yyyy/MM');
    if (isMultiDay) return format(new Date(ts), 'MM/dd');
    return format(new Date(ts), 'HH:mm');
  };

  const formatTooltipDate = (ts: number) => {
    return format(new Date(ts), 'yyyy年MM月dd日 HH:mm');
  };

  return (
    <div className="w-full h-[450px] bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-xl flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">价格 & 交易量走势</h3>
        <span className="text-xs text-slate-400">数据来源: CoinGecko</span>
      </div>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={formatAxisDate}
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              minTickGap={50}
            />
            {/* Price Y-Axis (Left) */}
            <YAxis 
              yAxisId="price"
              domain={[minPrice - padding, maxPrice + padding]}
              stroke="#94a3b8"
              fontSize={11}
              tickFormatter={formatPrice}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            {/* Volume Y-Axis (Right) - Hidden axis line but used for scaling */}
            <YAxis 
              yAxisId="volume"
              orientation="right"
              stroke="#64748b"
              fontSize={10}
              tickFormatter={formatVolume}
              axisLine={false}
              tickLine={false}
              width={40}
              opacity={0.5}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
              labelFormatter={formatTooltipDate}
              formatter={(value: number, name: string) => [
                name === 'price' ? formatPrice(value) : formatVolume(value),
                name === 'price' ? '价格' : '交易量'
              ]}
            />
            {/* Volume Bar */}
            <Bar 
              dataKey="volume" 
              yAxisId="volume" 
              fill="#94a3b8" 
              opacity={0.2} 
              barSize={isMultiYear ? 4 : 10} // Thinner bars for long history
            />
            {/* Price Area */}
            <Area 
              type="monotone" 
              dataKey="price" 
              yAxisId="price"
              stroke={color} 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;