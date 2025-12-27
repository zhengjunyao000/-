
import React, { useState, useRef, useEffect } from 'react';
import { DrinkRecord } from '../types';
import { X, Sparkles, Loader2, Download, Quote, Image as ImageIcon, RotateCcw } from 'lucide-react';
import { getDrinkQuickComment } from '../services/gemini';
import { toPng } from 'https://esm.sh/html-to-image@1.11.11';

interface Props {
  record: DrinkRecord;
  onClose: () => void;
}

const ShareModal: React.FC<Props> = ({ record, onClose }) => {
  const [comment, setComment] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // 引用 DOM 元素用于截图
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初始化默认评价
  useEffect(() => {
    setComment("生活苦短，奶茶加满！🥤");
  }, []);

  /**
   * 调用 AI 服务生成简短评语
   */
  const generateAIComment = async () => {
    setIsGenerating(true);
    const aiComment = await getDrinkQuickComment(record);
    setComment(aiComment);
    setIsGenerating(false);
  };

  /**
   * 处理封面图片上传并转换为 Base64
   */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('图片太大了，请选择 10MB 以内的图片');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.onerror = () => {
        alert('图片读取失败，请重试');
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * 将 HTML 元素渲染为 PNG 图片并触发下载
   */
  const handleDownloadImage = async () => {
    if (!cardRef.current || isSaving) return;
    
    setIsSaving(true);
    try {
      // 稍微延迟确保 DOM 状态最新
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3, // 高清导出
        style: {
          borderRadius: '0', // 导出时移除圆角，防止某些环境裁剪异常
        },
        backgroundColor: '#ffffff'
      });
      
      const link = document.createElement('a');
      link.download = `奶茶卡片-${record.name}-${new Date().getTime()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to save image:', err);
      alert('卡片生成失败，请尝试手动截图分享');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4 overflow-hidden">
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="bg-white w-full max-w-5xl md:rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative flex flex-col md:flex-row h-full md:h-auto md:max-h-[90vh]">
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-[70] p-2.5 bg-white/20 backdrop-blur-lg md:bg-gray-100 rounded-full text-white md:text-gray-500 hover:bg-orange-500 hover:text-white transition-all shadow-lg md:shadow-none"
        >
          <X size={20} />
        </button>

        {/* 左侧：卡片展示区 */}
        <div className="w-full md:w-3/5 bg-[#fefaf4] p-6 sm:p-10 flex items-center justify-center overflow-y-auto">
          <div className="w-full max-w-sm">
            {/* 这个 div 是截图的目标区域 */}
            <div 
              ref={cardRef}
              className="w-full aspect-[3/4.2] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col border border-orange-100/30"
            >
              {/* 卡片顶部封面 */}
              <div className="h-[45%] relative flex flex-col items-center justify-center text-white overflow-hidden">
                {image ? (
                  <>
                    <img src={image} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-amber-600">
                    <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 scale-[2]">
                      <Sparkles size={120} />
                    </div>
                  </div>
                )}
                
                <div className="relative z-10 flex flex-col items-center p-6 text-center drop-shadow-md">
                  <h3 className="text-3xl font-black truncate max-w-[280px] leading-tight mb-2">{record.name}</h3>
                  <p className="text-xs font-black text-orange-100/90 uppercase tracking-[0.2em]">{record.brand}</p>
                </div>
              </div>
              
              {/* 卡片内容详情 */}
              <div className="flex-1 p-8 bg-white flex flex-col justify-between relative">
                {/* 评价文字 */}
                <div className="relative mt-2">
                  <Quote className="text-orange-100 absolute -top-5 -left-3" size={40} />
                  <p className="text-lg text-gray-700 font-bold leading-relaxed relative z-10 px-4 min-h-[100px] flex items-center">
                    {comment}
                  </p>
                </div>
                
                {/* 底部信息栏 */}
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {[record.sugarLevel, record.iceLevel, `${record.calories}kcal`].map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-black rounded-lg tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-end pt-5 border-t border-dashed border-orange-100">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-gray-300 font-black uppercase tracking-widest italic mb-0.5">Footprint Recorded</span>
                      <span className="text-xs font-black text-orange-500 tracking-tight flex items-center gap-1">
                        <ImageIcon size={10} /> 奶茶足迹 APP
                      </span>
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                      {new Date(record.date.replace('T', ' ')).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="hidden md:block text-[10px] text-orange-300 mt-6 text-center font-black uppercase tracking-[0.3em] opacity-60">Signature Card Preview</p>
          </div>
        </div>

        {/* 右侧：编辑器 */}
        <div className="w-full md:w-2/5 p-6 sm:p-10 flex flex-col bg-white border-t md:border-t-0 md:border-l border-orange-50 overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              分享心情 <Sparkles className="text-orange-400" size={20} />
            </h2>
            <p className="text-xs text-gray-400 mt-1 font-medium">定制专属于这杯奶茶的分享卡片</p>
          </div>

          <div className="space-y-8 flex-1">
            <section>
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-4">卡片封面</label>
              <div className="flex gap-3">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex-1 py-4 px-4 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center gap-2 font-bold text-sm ${
                    image ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-orange-300 hover:bg-orange-50/30'
                  }`}
                >
                  <ImageIcon size={18} />
                  {image ? '更换一张' : '上传照片'}
                </button>
                {image && (
                  <button 
                    onClick={() => setImage(null)}
                    className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors"
                    title="移除图片"
                  >
                    <RotateCcw size={18} />
                  </button>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
            </section>

            <section>
              <div className="flex justify-between items-center mb-4">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">写下感言</label>
                <button 
                  onClick={generateAIComment}
                  disabled={isGenerating}
                  className="text-[10px] text-orange-600 font-black flex items-center gap-1.5 hover:text-orange-700 disabled:opacity-50 px-3 py-1.5 bg-orange-100/50 rounded-full transition-all"
                >
                  {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  AI 润色
                </button>
              </div>
              <textarea 
                className="w-full h-36 p-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-2 focus:ring-orange-200 focus:bg-white text-sm resize-none text-gray-700 leading-relaxed transition-all placeholder:text-gray-300"
                placeholder="这一口，值了！"
                value={comment}
                maxLength={60}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="text-[10px] text-gray-300 mt-2 text-right font-medium">
                {comment.length} / 60
              </div>
            </section>
          </div>

          <div className="mt-10 md:mt-12">
            <button 
              onClick={handleDownloadImage}
              disabled={isSaving}
              className="w-full py-5 rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.97] shadow-2xl shadow-orange-200 bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-70 disabled:pointer-events-none"
            >
              {isSaving ? <Loader2 size={24} className="animate-spin" /> : <Download size={20} />}
              {isSaving ? '生成卡片中...' : '保存卡片分享'}
            </button>
            <p className="text-[10px] text-gray-400 text-center mt-5 font-bold leading-relaxed px-4 opacity-70">
              高清卡片将保存至本地相册<br/>快去分享属于你的奶茶时刻
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
