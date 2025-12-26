
export interface DrinkRecord {
  id: string;
  name: string;
  brand: string;
  price: number;
  cupSize: string; // e.g., "中杯", "大杯"
  volume: number; // in ml
  sugarLevel: string;
  iceLevel: string;
  date: string;
  toppings: string[];
  calories: number; // in kcal
}

export interface SummaryStats {
  totalCount: number;
  totalSpent: number;
  averagePrice: number;
  topBrand: string;
  todayCount: number;
  todayCalories: number;
}

export enum ViewType {
  DASHBOARD = 'DASHBOARD',
  HISTORY = 'HISTORY',
  AI_INSIGHTS = 'AI_INSIGHTS'
}
