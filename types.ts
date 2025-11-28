
export interface DogePriceData {
  usd: number;
  usd_24h_vol: number;
  usd_24h_change: number;
  last_updated_at: number;
}

export interface ChartPoint {
  timestamp: number;
  price: number;
  volume: number;
}

export interface MarketAnalysis {
  sentiment: 'Bullish' | 'Bearish' | 'Neutral' | 'Volatile';
  summary: string;
  supportLevel?: string;
  resistanceLevel?: string;
  supportPrice?: number;
  resistancePrice?: number;
}

export enum TimeRange {
  H24 = '1',
  D7 = '7',
  D30 = '30',
  D90 = '90',
  Y1 = '365',
  Y10 = '3650'
}
