
import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { DrinkRecord, SummaryStats } from './types';
import { storage } from './services/storage';
import Dashboard from './components/Dashboard';
import History from './components/History';
import AIInsights from './components/AIInsights';
import AddDrinkModal from './components/AddDrinkModal';
import { CupSoda, History as HistoryIcon, Sparkles, Plus } from 'lucide-react';

const App: React.FC = () => {
  const [records, setRecords] = useState<DrinkRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setRecords(storage.getRecords());
  }, []);

  const stats: SummaryStats = useMemo(() => {
    // 修复：使用本地日期格式 YYYY-MM-DD
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    const todayRecords = records.filter(r => r.date.startsWith(today));
    
    const brandsCount: Record<string, number> = {};
    let totalSpent = 0;
    records.forEach(r => {
      totalSpent += r.price;
      brandsCount[r.brand] = (brandsCount[r.brand] || 0) + 1;
    });

    const todayCalories = todayRecords.reduce((sum, r) => sum + (r.calories || 0), 0);
    const topBrand = Object.entries(brandsCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '暂无';

    return {
      totalCount: records.length,
      totalSpent,
      averagePrice: records.length ? totalSpent / records.length : 0,
      topBrand,
      todayCount: todayRecords.length,
      todayCalories
    };
  }, [records]);

  const handleAddRecord = (record: DrinkRecord) => {
    storage.addRecord(record);
    setRecords(prev => [record, ...prev]);
    setIsModalOpen(false);
  };

  const handleDeleteRecord = (id: string) => {
    storage.deleteRecord(id);
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcf8f1] text-[#2C1810]">
      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-6 pb-40 pt-safe">
        <Routes>
          <Route path="/" element={<Dashboard stats={stats} records={records} />} />
          <Route path="/history" element={<History records={records} onDelete={handleDeleteRecord} />} />
          <Route path="/insights" element={<AIInsights records={records} />} />
        </Routes>
      </main>

      {/* Floating Add Button */}
      <div className="fixed bottom-[calc(76px+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group relative bg-orange-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-[0_12px_24px_-5px_rgba(249,115,22,0.4)] border-4 border-white active:scale-90 active:bg-orange-600 transition-all duration-200"
          style={{ touchAction: 'manipulation' }}
        >
          <Plus size={28} strokeWidth={3} />
        </button>
      </div>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-orange-50 px-2 pt-2 pb-[env(safe-area-inset-bottom)] grid grid-cols-3 items-center shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.05)] z-[45]">
        <NavButton 
          active={location.pathname === '/'} 
          to="/"
          icon={<CupSoda size={22} />}
          label="概览"
        />
        
        <NavButton 
          active={location.pathname === '/history'} 
          to="/history"
          icon={<HistoryIcon size={22} />}
          label="足迹"
        />
        
        <NavButton 
          active={location.pathname === '/insights'} 
          to="/insights"
          icon={<Sparkles size={22} />}
          label="AI 洞察"
        />
      </nav>

      {/* Modals */}
      {isModalOpen && (
        <AddDrinkModal 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleAddRecord} 
        />
      )}
    </div>
  );
};

const NavButton: React.FC<{ active: boolean, to: string, icon: React.ReactNode, label: string }> = ({ active, to, icon, label }) => (
  <Link 
    to={to}
    className={`flex flex-col items-center justify-center py-2 transition-all duration-300 active:scale-95 ${active ? 'text-orange-600' : 'text-gray-400'}`}
    style={{ touchAction: 'manipulation' }}
  >
    <div className={`p-1.5 rounded-xl transition-colors mb-0.5 ${active ? 'bg-orange-50' : 'bg-transparent'}`}>
      {icon}
    </div>
    <span className={`text-[10px] font-bold tracking-tight whitespace-nowrap ${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
  </Link>
);

export default App;
