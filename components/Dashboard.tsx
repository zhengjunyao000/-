
import React, { useState, useMemo } from 'react';
import { SummaryStats, DrinkRecord } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { TrendingUp, Wallet, Award, Flame, Trophy, ChevronRight } from 'lucide-react';

interface Props {
  stats: SummaryStats;
  records: DrinkRecord[];
}

type TimeRange = 'day' | 'week' | 'month' | 'year';

const Dashboard: React.FC<Props> = ({ stats: initialStats, records }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  const filteredStats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const getStartOfWeek = (d: Date) => {
      const date = new Date(d);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(date.setDate(diff)).toISOString().split('T')[0];
    };
    const startOfWeek = getStartOfWeek(now);
    const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const startOfYear = `${now.getFullYear()}-01-01`;

    const filtered = records.filter(r => {
      const rDateOnly = r.date.split('T')[0];
      if (timeRange === 'day') return rDateOnly === todayStr;
      if (timeRange === 'week') return rDateOnly >= startOfWeek;
      if (timeRange === 'month') return rDateOnly >= startOfMonth;
      if (timeRange === 'year') return rDateOnly >= startOfYear;
      return true;
    });

    return {
      count: filtered.length,
      spent: filtered.reduce((sum, r) => sum + r.price, 0),
      calories: filtered.reduce((sum, r) => sum + (r.calories || 0), 0)
    };
  }, [records, timeRange]);

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dailyRecords = records.filter(r => r.date.startsWith(dateStr));
      return {
        date: dateStr.split('-').slice(2).join('/'),
        count: dailyRecords.length,
        spent: dailyRecords.reduce((sum, r) => sum + r.price, 0)
      };
    }).reverse();
  }, [records]);

  const frequentDrinks = useMemo(() => {
    return Object.entries(
      records.reduce((acc, r) => {
        acc[r.name] = (acc[r.name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [records]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* 顶部统计：核心焦点 */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-xl font-black text-gray-800 tracking-tight">概览数据</h2>
          <div className="flex bg-white/80 p-1 rounded-xl shadow-sm border border-orange-50/50">
            {(['day', 'week', 'month', 'year'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all duration-300 ${
                  timeRange === range 
                    ? 'bg-orange-500 text-white shadow-sm' 
                    : 'text-gray-400 active:bg-orange-50'
                }`}
              >
                {range === 'day' ? '今日' : range === 'week' ? '本周' : range === 'month' ? '本月' : '年度'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <HighlightCard 
            label={timeRange === 'day' ? '今日消费' : '累计消费'} 
            value={`¥${filteredStats.spent.toFixed(2)}`} 
            subValue={filteredStats.count > 0 ? `平均每杯 ¥${(filteredStats.spent / filteredStats.count).toFixed(1)}` : '期待第一杯'}
            icon={<Wallet size={20} />}
            gradient="from-orange-500 to-orange-600"
          />
          <HighlightCard 
            label={timeRange === 'day' ? '今日杯数' : '饮用总量'} 
            value={`${filteredStats.count} 杯`} 
            subValue={`热量约 ${filteredStats.calories} kcal`}
            icon={<CupSodaIcon />}
            gradient="from-amber-400 to-amber-500"
          />
        </div>
      </section>

      {/* 中间层：品牌与榜单 */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-orange-50/50">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 rounded-xl">
                <Trophy className="text-amber-500" size={16} />
              </div>
              <h3 className="text-sm font-black text-gray-800">常喝排行榜</h3>
            </div>
          </div>
          <div className="space-y-3">
            {frequentDrinks.length > 0 ? frequentDrinks.map(([name, count], idx) => (
              <div key={name} className="group flex items-center gap-3 p-3 bg-gray-50/50 rounded-2xl hover:bg-orange-50/50 transition-colors">
                <span className={`w-7 h-7 flex items-center justify-center rounded-xl text-[10px] font-black shadow-sm ${
                  idx === 0 ? 'bg-orange-500 text-white' : 'bg-white text-gray-400'
                }`}>
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-gray-700 flex-1 truncate">{name}</span>
                <span className="text-[10px] font-black text-gray-400 group-hover:text-orange-500 transition-colors">{count}杯</span>
              </div>
            )) : (
              <p className="text-center py-6 text-xs text-gray-400 italic">尚未开启你的茶饮地图</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-orange-50/50 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-purple-50 rounded-xl">
              <Award className="text-purple-500" size={16} />
            </div>
            <h3 className="text-sm font-black text-gray-800">品牌偏好</h3>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <div className="w-16 h-16 bg-purple-100 rounded-3xl flex items-center justify-center mb-3 shadow-inner">
              <span className="text-2xl">{initialStats.topBrand !== '暂无' ? initialStats.topBrand.charAt(0) : '🥤'}</span>
            </div>
            <h4 className="text-lg font-black text-gray-800 mb-1">{initialStats.topBrand}</h4>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Most Checked-in Brand</p>
          </div>
        </div>
      </section>

      {/* 底部：走势图 */}
      <section className="bg-white p-6 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-orange-50/50">
        <div className="flex justify-between items-center mb-8 px-2">
          <div>
            <h3 className="text-sm font-black text-gray-800">近 7 日趋势</h3>
            <p className="text-[10px] font-bold text-gray-400 mt-0.5">一杯一心情，记录生活甜度</p>
          </div>
          <div className="p-2 bg-orange-50 rounded-xl">
            <TrendingUp className="text-orange-500" size={16} />
          </div>
        </div>
        <div className="h-48 -ml-10 -mr-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7Days} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fef3c7" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#9a3412', fontSize: 10, fontWeight: 700}}
                dy={10}
              />
              <YAxis hide domain={[0, 'dataMax + 1']} />
              <Tooltip 
                cursor={{fill: '#fff7ed', radius: 10}} 
                contentStyle={{borderRadius: '16px', border: 'none', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} 
                formatter={(value: number) => [`${value} 杯`, '']}
              />
              <Bar dataKey="count" radius={[10, 10, 10, 10]} barSize={24}>
                {last7Days.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#f97316' : '#f3f4f6'} />
                ))}
                <LabelList 
                  dataKey="count" 
                  position="top" 
                  style={{ fill: '#f97316', fontSize: 11, fontWeight: 900 }}
                  formatter={(val: number) => val > 0 ? val : ''}
                  offset={10}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

const HighlightCard: React.FC<{ label: string, value: string, subValue: string, icon: React.ReactNode, gradient: string }> = ({ label, value, subValue, icon, gradient }) => (
  <div className={`relative overflow-hidden p-5 rounded-[2.2rem] text-white bg-gradient-to-br ${gradient} shadow-lg shadow-orange-200/20 active:scale-[0.98] transition-all`}>
    <div className="relative z-10 flex flex-col h-full justify-between gap-4">
      <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">{label}</p>
        <h3 className="text-2xl font-black tracking-tight">{value}</h3>
        <p className="text-[9px] font-bold opacity-60 mt-1.5 flex items-center gap-1">
          <ChevronRight size={8} /> {subValue}
        </p>
      </div>
    </div>
    <div className="absolute -right-4 -bottom-4 bg-white/10 w-24 h-24 rounded-full blur-2xl" />
  </div>
);

const CupSodaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8h12" />
    <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
    <path d="M9 11h6" />
    <path d="M15 2 12 8" />
  </svg>
);

export default Dashboard;
