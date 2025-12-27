
/**
 * 奶茶饮用记录接口
 */
export interface DrinkRecord {
  id: string;        // 唯一标识符（通常使用时间戳）
  name: string;      // 饮品名称（如：多肉葡萄）
  brand: string;     // 品牌名称（如：喜茶）
  price: number;     // 价格
  cupSize: string;   // 杯型（中杯、大杯等）
  volume: number;    // 容量（ml）
  sugarLevel: string;// 甜度
  iceLevel: string;  // 冰量
  date: string;      // 记录时间（ISO 格式字符串）
  toppings: string[];// 加料列表
  calories: number;  // 预计热量（kcal）
}

/**
 * 仪表盘统计数据接口
 */
export interface SummaryStats {
  totalCount: number;    // 累计总杯数
  totalSpent: number;    // 累计总支出
  averagePrice: number;  // 平均单杯价格
  topBrand: string;      // 喝得最多的品牌
  todayCount: number;    // 今日已饮用杯数
  todayCalories: number; // 今日已摄入热量
}

/**
 * 页面视图枚举
 */
export enum ViewType {
  DASHBOARD = 'DASHBOARD', // 概览页
  HISTORY = 'HISTORY',   // 历史足迹页
  AI_INSIGHTS = 'AI_INSIGHTS' // AI 分析页
}
