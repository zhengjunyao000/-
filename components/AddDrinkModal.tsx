
import React, { useState, useEffect } from 'react';
import { DrinkRecord } from '../types';
import { storage } from '../services/storage';
import { X, Check, Plus, Clock } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSubmit: (record: DrinkRecord) => void;
}

const CUP_PRESETS = [
  { label: '小杯', volume: 350, calories: 200 },
  { label: '中杯', volume: 470, calories: 300 },
  { label: '大杯', volume: 650, calories: 450 },
  { label: '自定义', volume: null, calories: null },
];

const TOPPING_PRESETS = [
  '珍珠', '波霸', '椰果', '布丁', '仙草', '芝士奶盖', '奥利奥', '红豆', '燕麦', '芋圆', '爆爆珠'
];

const AddDrinkModal: React.FC<Props> = ({ onClose, onSubmit }) => {
  /**
   * 生成本地日期格式字符串 (YYYY-MM-DD)
   */
  const getTodayLocalStr = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 状态初始化：尝试获取最后一次的记录以记忆选择
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    cupSize: '中杯',
    volume: '470',
    calories: '300',
    sugarLevel: '半糖',
    iceLevel: '少冰',
    toppings: [] as string[],
    date: getTodayLocalStr()
  });

  // 组件挂载时加载历史偏好
  useEffect(() => {
    const lastRecord = storage.getRecords()[0];
    if (lastRecord) {
      setFormData(prev => ({
        ...prev,
        sugarLevel: lastRecord.sugarLevel,
        iceLevel: lastRecord.iceLevel
      }));
    }
  }, []);

  const handleCupSizeSelect = (preset: typeof CUP_PRESETS[0]) => {
    if (preset.label === '自定义') {
      setFormData(prev => ({ 
        ...prev, 
        cupSize: preset.label, 
        volume: '', 
        calories: '' 
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        cupSize: preset.label, 
        volume: preset.volume?.toString() || '', 
        calories: preset.calories?.toString() || '' 
      }));
    }
  };

  const toggleTopping = (topping: string) => {
    setFormData(prev => {
      const isSelected = prev.toppings.includes(topping);
      if (isSelected) {
        return { ...prev, toppings: prev.toppings.filter(t => t !== topping) };
      } else {
        return { ...prev, toppings: [...prev.toppings, topping] };
      }
    });
  };

  const handleNumberInputChange = (field: 'price' | 'volume' | 'calories', value: string) => {
    // 仅允许数字和小数点，且不为负
    if (value === '' || parseFloat(value) >= 0) {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.brand || !formData.price) return;
    
    // 最终解析并保留两位小数
    const price = Math.max(0, parseFloat(parseFloat(formData.price).toFixed(2)));
    const volume = Math.max(0, parseFloat(parseFloat(formData.volume || '0').toFixed(2)));
    const calories = Math.max(0, parseFloat(parseFloat(formData.calories || '0').toFixed(2)));

    const newRecord: DrinkRecord = {
      id: Date.now().toString(),
      name: formData.name,
      brand: formData.brand,
      price: price,
      cupSize: formData.cupSize,
      volume: volume,
      calories: calories,
      sugarLevel: formData.sugarLevel,
      iceLevel: formData.iceLevel,
      date: formData.date,
      toppings: formData.toppings
    };
    onSubmit(newRecord);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-[4px] overflow-hidden">
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* 注入 CSS 隐藏 Input 箭头 */}
      <style>{`
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type='number'] {
          -moz-appearance: textfield;
        }
      `}</style>

      <div className="bg-white w-full max-w-xl rounded-t-[3rem] shadow-2xl relative animate-in slide-in-from-bottom-full duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] max-h-[94vh] flex flex-col pb-[env(safe-area-inset-bottom)]">
        <div className="w-14 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 mb-2 shrink-0 opacity-50" />
        
        <div className="flex justify-between items-center px-10 py-4 shrink-0">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">记录这一杯</h2>
          <button type="button" onClick={onClose} className="p-2.5 bg-gray-100 rounded-full active:scale-90 transition-transform">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-10 pb-10 pt-2 space-y-8 scroll-smooth">
          <div className="space-y-8">
            {/* 1. 杯型选择 */}
            <section>
              <label className="block text-[11px] font-black text-gray-400 mb-4 uppercase tracking-[0.2em]">杯型规格</label>
              <div className="grid grid-cols-4 gap-3">
                {CUP_PRESETS.map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleCupSizeSelect(preset)}
                    className={`py-4 rounded-[1.5rem] text-[13px] font-black transition-all duration-300 ${
                      formData.cupSize === preset.label 
                      ? 'bg-orange-500 text-white shadow-xl shadow-orange-200 scale-[1.05]' 
                      : 'bg-gray-50 text-gray-400 active:bg-gray-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </section>

            {/* 2. 品名和品牌 */}
            <div className="grid grid-cols-2 gap-5">
              <section>
                <label className="block text-[11px] font-black text-gray-400 mb-2.5 uppercase tracking-[0.2em]">饮品名称</label>
                <input required type="text" placeholder="例如：多肉葡萄"
                  className="w-full h-14 px-6 bg-gray-50 border-2 border-transparent focus:border-orange-100 focus:bg-white rounded-2xl text-[15px] font-bold transition-all outline-none"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </section>
              <section>
                <label className="block text-[11px] font-black text-gray-400 mb-2.5 uppercase tracking-[0.2em]">品牌名称</label>
                <input required type="text" placeholder="例如：喜茶"
                  className="w-full h-14 px-6 bg-gray-50 border-2 border-transparent focus:border-orange-100 focus:bg-white rounded-2xl text-[15px] font-bold transition-all outline-none"
                  value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})}
                />
              </section>
            </div>
            
            {/* 3. 核心数值输入 (限制 >= 0, 步长 0.01, 隐藏箭头) */}
            <div className="grid grid-cols-3 gap-3">
              <section>
                <label className="block text-[11px] font-black text-gray-400 mb-2.5 uppercase tracking-[0.1em]">单价 (元)</label>
                <input required type="number" step="0.01" min="0"
                  placeholder="0.00"
                  className="w-full h-14 px-5 bg-gray-50 border-none rounded-2xl text-[15px] font-bold focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  value={formData.price} onChange={e => handleNumberInputChange('price', e.target.value)}
                />
              </section>
              <section>
                <label className="block text-[11px] font-black text-gray-400 mb-2.5 uppercase tracking-[0.1em]">容量 (ml)</label>
                <input type="number" step="0.01" min="0"
                  placeholder="0.00"
                  className="w-full h-14 px-5 bg-gray-50 border-none rounded-2xl text-[15px] font-bold focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  value={formData.volume} onChange={e => handleNumberInputChange('volume', e.target.value)}
                />
              </section>
              <section>
                <label className="block text-[11px] font-black text-gray-400 mb-2.5 uppercase tracking-[0.1em]">热量 (kcal)</label>
                <input type="number" step="0.01" min="0"
                  placeholder="0.00"
                  className="w-full h-14 px-5 bg-gray-50 border-none rounded-2xl text-[15px] font-bold focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  value={formData.calories} onChange={e => handleNumberInputChange('calories', e.target.value)}
                />
              </section>
            </div>

            {/* 4. 口味偏好 (智能记忆) */}
            <div className="grid grid-cols-2 gap-5">
              <section>
                <label className="block text-[11px] font-black text-gray-400 mb-2.5 uppercase tracking-[0.2em]">甜度选择</label>
                <select className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl text-[15px] font-bold outline-none appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23ccc%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_1.25rem_center] bg-no-repeat transition-all focus:ring-2 focus:ring-orange-200"
                  value={formData.sugarLevel} onChange={e => setFormData({...formData, sugarLevel: e.target.value})}
                >
                  <option value="不加糖">不加糖 (0%)</option>
                  <option value="少少糖">少少糖 (30%)</option>
                  <option value="半糖">半糖 (50%)</option>
                  <option value="少糖">少糖 (70%)</option>
                  <option value="正常糖">正常糖 (100%)</option>
                </select>
              </section>
              <section>
                <label className="block text-[11px] font-black text-gray-400 mb-2.5 uppercase tracking-[0.2em]">冰量选择</label>
                <select className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl text-[15px] font-bold outline-none appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23ccc%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_1.25rem_center] bg-no-repeat transition-all focus:ring-2 focus:ring-orange-200"
                  value={formData.iceLevel} onChange={e => setFormData({...formData, iceLevel: e.target.value})}
                >
                  <option value="去冰">去冰</option>
                  <option value="少冰">少冰</option>
                  <option value="正常冰">正常冰</option>
                  <option value="常温">常温</option>
                  <option value="热饮">热饮</option>
                </select>
              </section>
            </div>

            {/* 5. 加料模块 */}
            <section>
              <label className="block text-[11px] font-black text-gray-400 mb-4 uppercase tracking-[0.2em]">添加配料</label>
              <div className="flex flex-wrap gap-2.5">
                {TOPPING_PRESETS.map(topping => {
                  const isSelected = formData.toppings.includes(topping);
                  return (
                    <button
                      key={topping}
                      type="button"
                      onClick={() => toggleTopping(topping)}
                      className={`px-5 py-2.5 rounded-full text-[13px] font-bold transition-all flex items-center gap-2 ${
                        isSelected 
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-100 scale-[1.05]' 
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-transparent active:scale-95'
                      }`}
                    >
                      {topping}
                      {isSelected ? <Check size={14} strokeWidth={3} /> : <Plus size={14} className="opacity-40" />}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 6. 饮用时间模块 - 文本输入在最底部 */}
            <section className="pt-4 border-t border-gray-100">
              <label className="block text-[11px] font-black text-gray-400 mb-2.5 uppercase tracking-[0.2em]">饮用时间</label>
              <div className="relative flex items-center group">
                <div className="absolute left-5 text-gray-400 group-focus-within:text-orange-500 transition-colors pointer-events-none">
                  <Clock size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="例如：2023-10-24"
                  className="w-full h-14 pl-14 pr-6 bg-gray-50 border-2 border-transparent focus:border-orange-100 focus:bg-white rounded-2xl text-[15px] font-bold transition-all outline-none"
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <p className="text-[9px] text-gray-300 mt-2 ml-1 font-medium italic">格式参考：YYYY-MM-DD</p>
            </section>
          </div>

          {/* 提交按钮 */}
          <div className="pt-4">
            <button type="submit"
              className="w-full h-18 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-[2.2rem] font-black text-lg shadow-2xl shadow-orange-200 flex items-center justify-center gap-3 active:scale-[0.96] hover:brightness-110 transition-all"
            >
              <div className="p-1.5 bg-white/20 rounded-full">
                <Check size={24} strokeWidth={4} />
              </div>
              完成并保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDrinkModal;
