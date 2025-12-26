
import React, { useState, useRef } from 'react';
import { DrinkRecord } from '../types';
import { X, Check, Clock, Zap, ChevronRight } from 'lucide-react';

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

const AddDrinkModal: React.FC<Props> = ({ onClose, onSubmit }) => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  
  const getNowLocalISO = () => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    cupSize: '中杯',
    volume: '470',
    calories: '300',
    sugarLevel: '半糖',
    iceLevel: '少冰',
    date: getNowLocalISO()
  });

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

  const setTimeToNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData(prev => ({ ...prev, date: getNowLocalISO() }));
  };

  const handleTimeClick = () => {
    // 现代浏览器支持 showPicker 显式唤起
    if (dateInputRef.current) {
      if ('showPicker' in HTMLInputElement.prototype) {
        try {
          dateInputRef.current.showPicker();
        } catch (e) {
          dateInputRef.current.focus();
        }
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.brand || !formData.price) return;
    const price = Math.max(0, parseFloat(formData.price));
    const volume = Math.max(0, parseInt(formData.volume) || 0);
    const calories = Math.max(0, parseInt(formData.calories) || 0);

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
      toppings: []
    };
    onSubmit(newRecord);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-[2px] overflow-hidden">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="bg-white w-full max-w-xl rounded-t-[2.5rem] shadow-2xl relative animate-in slide-in-from-bottom-full duration-300 ease-out max-h-[92vh] flex flex-col pb-[env(safe-area-inset-bottom)]">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 mb-2 shrink-0" />
        
        <div className="flex justify-between items-center px-8 py-2 shrink-0">
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">记一杯</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full active:scale-90 transition-transform">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 pb-8 pt-2 space-y-7">
          <div className="space-y-7">
            {/* 杯型选择 */}
            <section>
              <label className="block text-[11px] font-black text-gray-400 mb-3 uppercase tracking-widest">选择杯型</label>
              <div className="grid grid-cols-4 gap-2">
                {CUP_PRESETS.map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleCupSizeSelect(preset)}
                    className={`py-3.5 rounded-2xl text-[13px] font-black transition-all ${
                      formData.cupSize === preset.label 
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-100 scale-[1.02]' 
                      : 'bg-gray-50 text-gray-400 active:bg-gray-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </section>

            {/* 名称和品牌 */}
            <div className="grid grid-cols-2 gap-4">
              <section>
                <label className="block text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest">饮品名称</label>
                <input required type="text" placeholder="多肉葡萄"
                  className="w-full h-14 px-5 bg-gray-50 border-2 border-transparent focus:border-orange-100 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </section>
              <section>
                <label className="block text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest">品牌</label>
                <input required type="text" placeholder="喜茶"
                  className="w-full h-14 px-5 bg-gray-50 border-2 border-transparent focus:border-orange-100 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                  value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})}
                />
              </section>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <section>
                <label className="block text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest">单价 (¥)</label>
                <input required type="number" step="0.01"
                  className="w-full h-14 px-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-200 outline-none"
                  value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                />
              </section>
              <section>
                <label className="block text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest">容量 (ml)</label>
                <input type="number"
                  className="w-full h-14 px-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-200 outline-none"
                  value={formData.volume} onChange={e => setFormData({...formData, volume: e.target.value})}
                />
              </section>
              <section>
                <label className="block text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest">热量 (kcal)</label>
                <input type="number"
                  className="w-full h-14 px-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-200 outline-none"
                  value={formData.calories} onChange={e => setFormData({...formData, calories: e.target.value})}
                />
              </section>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <section>
                <label className="block text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest">甜度</label>
                <select className="w-full h-14 px-5 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none"
                  value={formData.sugarLevel} onChange={e => setFormData({...formData, sugarLevel: e.target.value})}
                >
                  <option value="不加糖">不加糖</option>
                  <option value="少少糖">少少糖 (30%)</option>
                  <option value="半糖">半糖 (50%)</option>
                  <option value="少糖">少糖 (70%)</option>
                  <option value="正常糖">正常糖 (100%)</option>
                </select>
              </section>
              <section>
                <label className="block text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest">冰量</label>
                <select className="w-full h-14 px-5 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none"
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

            {/* 饮用时间：点击自动唤起选择器 */}
            <section className="relative">
              <div className="flex justify-between items-center mb-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">饮用时间</label>
                <button 
                  type="button" 
                  onClick={setTimeToNow} 
                  className="text-[10px] font-black text-orange-600 bg-orange-100/50 px-3 py-1.5 rounded-full active:scale-95 transition-all flex items-center gap-1"
                >
                  <Zap size={10} className="fill-orange-500 text-orange-500" /> 设为现在
                </button>
              </div>
              
              <div 
                onClick={handleTimeClick}
                className="relative group cursor-pointer active:scale-[0.99] transition-transform"
              >
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none z-10">
                  <Clock size={20} />
                </div>
                <input 
                  ref={dateInputRef}
                  type="datetime-local" 
                  className="w-full h-16 pl-14 pr-12 bg-gray-50 border-2 border-transparent group-hover:bg-gray-100 focus:border-orange-100 focus:bg-white rounded-[1.8rem] text-sm font-black transition-all outline-none text-gray-700 relative z-20 cursor-pointer"
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none z-10">
                  <ChevronRight size={20} />
                </div>
              </div>
            </section>
          </div>

          <button type="submit"
            className="w-full h-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-orange-100 flex items-center justify-center gap-2 active:scale-[0.97] transition-all mt-4 mb-2"
          >
            <Check size={24} strokeWidth={3} />
            完成记录
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDrinkModal;
