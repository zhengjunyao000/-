
import React, { useState, useMemo } from 'react';
import { DrinkRecord } from '../types';
import { Trash2, Search, Filter, Droplets, Flame, Share2, ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import ShareModal from './ShareModal';

interface Props {
  records: DrinkRecord[];
  onDelete: (id: string) => void;
}

type TimeView = 'day' | 'week' | 'month';

const History: React.FC<Props> = ({ records, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShareRecord, setSelectedShareRecord] = useState<DrinkRecord | null>(null);
  const [view, setView] = useState<TimeView>('day');
  const [currentDate, setCurrentDate] = useState(new Date());

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  /**
   * 解析存储的时间字符串
   */
  const parseDate = (dateStr: string) => {
    // 确保格式符合 new Date() 解析要求
    return new Date(dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T'));
  };

  const filteredRecordsByTime = useMemo(() => {
    return records.filter(record => {
      const recordDate = parseDate(record.date);
      if (view === 'day') {
        return recordDate.toDateString() === currentDate.toDateString();
      } else if (view === 'week') {
        const startOfWeek = getStartOfWeek(currentDate);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        recordDate.setHours(0,0,0,0);
        const start = new Date(startOfWeek); start.setHours(0,0,0,0);
        const end = new Date(endOfWeek); end.setHours(23,59,59,999);
        
        return recordDate >= start && recordDate <= end;
      } else if (view === 'month') {
        return recordDate.getMonth() === currentDate.getMonth() && recordDate.getFullYear() === currentDate.getFullYear();
      }
      return true;
    });
  }, [records, view, currentDate]);

  const finalFilteredRecords = filteredRecordsByTime.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const navigateDate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(currentDate.getDate() + direction);
    } else if (view === 'week') {
      newDate.setDate(currentDate.getDate() + direction * 7);
    } else if (view === 'month') {
      newDate.setMonth(currentDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  const getDateLabel = () => {
    if (view === 'day') {
      return currentDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    } else if (view === 'week') {
      const start = getStartOfWeek(currentDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${start.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}`;
    } else if (view === 'month') {
      return currentDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
    }
  };

  const formatRecordTime = (dateStr: string) => {
    return dateStr.replace('T', ' ').split('.')[0];
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-orange-50 space-y-4">
        <div className="flex bg-gray-50 p-1 rounded-2xl">
          {(['day', 'week', 'month'] as TimeView[]).map((v) => (
            <button
              key={v}
              onClick={() => { setView(v); setCurrentDate(new Date()); }}
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${
                view === v ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {v === 'day' ? '日视图' : v === 'week' ? '周视图' : '月视图'}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between px-2">
          <button onClick={() => navigateDate(-1)} className="p-2 hover:bg-orange-50 rounded-full text-orange-500 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2 font-bold text-gray-700">
            <Calendar size={18} className="text-orange-400" />
            <span>{getDateLabel()}</span>
          </div>
          <button onClick={() => navigateDate(1)} className="p-2 hover:bg-orange-50 rounded-full text-orange-500 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="搜索饮品或品牌..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-orange-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="p-2.5 bg-white border border-orange-100 rounded-2xl text-gray-500 hover:bg-orange-50 transition-colors">
          <Filter size={20} />
        </button>
      </div>

      <div className="space-y-3">
        {finalFilteredRecords.length > 0 ? (
          finalFilteredRecords.map(record => (
            <div key={record.id} className="bg-white p-4 rounded-2xl border border-orange-50 flex justify-between items-center group hover:shadow-md transition-shadow">
              <div className="flex gap-4 items-center min-w-0 flex-1">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 font-bold text-lg flex-shrink-0">
                  {record.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-base truncate">{record.name}</h4>
                  <p className="text-xs text-gray-500 truncate">{record.brand} · {record.cupSize || '标杯'} · {record.sugarLevel} · {record.iceLevel}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] font-medium">
                    <span className="text-orange-400 flex items-center gap-0.5">
                      <Clock size={10} /> {formatRecordTime(record.date)}
                    </span>
                    <span className="flex items-center gap-0.5 text-blue-400">
                      <Droplets size={10} /> {record.volume}ml
                    </span>
                    <span className="flex items-center gap-0.5 text-red-400">
                      <Flame size={10} /> {record.calories}kcal
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <div className="flex flex-col items-end">
                  <span className="font-bold text-orange-600 text-lg whitespace-nowrap">¥{record.price.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setSelectedShareRecord(record)}
                    className="p-2 bg-gray-50 text-gray-400 hover:bg-orange-50 hover:text-orange-500 rounded-xl transition-all"
                    title="生成分享卡片"
                  >
                    <Share2 size={18} />
                  </button>

                  <button 
                    onClick={() => onDelete(record.id)}
                    className="p-2 bg-gray-50 text-gray-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    title="删除记录"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center flex flex-col items-center gap-3 bg-white/50 rounded-3xl border border-dashed border-orange-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
              <Search size={32} />
            </div>
            <p className="text-gray-400 font-medium">该时间段内没找到相关的奶茶记录</p>
          </div>
        )}
      </div>

      {selectedShareRecord && (
        <ShareModal 
          record={selectedShareRecord} 
          onClose={() => setSelectedShareRecord(null)} 
        />
      )}
    </div>
  );
};

export default History;
