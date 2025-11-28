import React from 'react';
import { ArrowUp, ArrowDown, Activity } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string;
  subValue?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  label, 
  value, 
  subValue, 
  isPositive, 
  icon,
  loading 
}) => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col justify-between hover:border-doge-500/50 transition-colors duration-300">
      <div className="flex justify-between items-start mb-2">
        <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">{label}</span>
        {icon && <span className="text-doge-400">{icon}</span>}
      </div>
      
      {loading ? (
        <div className="animate-pulse flex flex-col gap-2">
          <div className="h-8 w-32 bg-slate-700 rounded"></div>
          <div className="h-4 w-16 bg-slate-700 rounded"></div>
        </div>
      ) : (
        <div>
          <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
          {subValue && (
            <div className={`flex items-center text-sm font-medium mt-1 ${isPositive === true ? 'text-green-400' : isPositive === false ? 'text-red-400' : 'text-slate-500'}`}>
              {isPositive === true && <ArrowUp size={14} className="mr-1" />}
              {isPositive === false && <ArrowDown size={14} className="mr-1" />}
              {subValue}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatsCard;