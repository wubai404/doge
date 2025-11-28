import { DogePriceData, ChartPoint, TimeRange } from '../types';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export const fetchDogePrice = async (): Promise<DogePriceData> => {
  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=dogecoin&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch price data');
    }

    const data = await response.json();
    return data.dogecoin;
  } catch (error) {
    console.error('Crypto API Error:', error);
    throw error;
  }
};

export const fetchDogeChart = async (days: TimeRange): Promise<ChartPoint[]> => {
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/dogecoin/market_chart?vs_currency=usd&days=${days}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch chart data');
    }

    const data = await response.json();
    
    // API returns { prices: [ts, price][], total_volumes: [ts, vol][] }
    const prices = data.prices || [];
    const volumes = data.total_volumes || [];

    return prices.map((item: [number, number], index: number) => {
      // Try to find matching volume by index, fallback to 0
      const volItem = volumes[index];
      return {
        timestamp: item[0],
        price: item[1],
        volume: volItem ? volItem[1] : 0
      };
    });
  } catch (error) {
    console.error('Crypto Chart Error:', error);
    throw error;
  }
};