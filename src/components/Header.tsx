import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Sun, 
  Moon, 
  Printer, 
  Camera,
  Layers,
  Scan,
  Zap,
  History
} from 'lucide-react';
import { ActiveTab } from '../types.ts';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onOpenRecentActivity?: () => void;
  recentCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  setIsDarkMode,
  onOpenRecentActivity,
  recentCount = 0,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setDateStr(now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems: { id: ActiveTab; label: string; hindiLabel: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'pdf_suite', label: '1. PDF Tools Suite', hindiLabel: 'PDF टूल्स', icon: Layers },
    { id: 'photo_studio', label: '2. Photo & Image Studio', hindiLabel: 'फोटो स्टूडियो', icon: Camera },
    { id: 'doc_templates', label: '3. Quick Print & Docs', hindiLabel: 'दस्तावेज़ व फॉर्म्स', icon: Printer },
    { id: 'ocr_extractor', label: '4. Certificate OCR', hindiLabel: 'मार्कशीट OCR', icon: Scan },
    { id: 'ai_assistant', label: '5. AI Assistant', hindiLabel: 'एआई सहायक', icon: Sparkles },
  ];

  return (
    <header className="bg-slate-900 text-white shadow-md shrink-0 border-b border-slate-800 print:hidden sticky top-0 z-40">
      {/* Top Banner Row */}
      <div className="h-16 flex items-center justify-between px-4 sm:px-6">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center font-black text-base text-white shadow-md shadow-blue-500/20 border border-blue-400/30">
            C
          </div>
          <div className="flex items-center">
            <h1 className="text-sm sm:text-base lg:text-lg font-black tracking-wider text-white flex items-center uppercase font-sans">
              CYBER CAFE SMART ASSISTANT
              <span className="text-blue-400 text-[10px] font-mono font-bold ml-2 px-2 py-0.5 rounded-full bg-blue-950/90 border border-blue-700/80 normal-case tracking-normal">
                v2.6.0 Pro Studio
              </span>
            </h1>
          </div>
        </div>

        {/* Desktop Segmented High-Density Tab Bar */}
        <nav className="hidden md:flex items-center bg-slate-800/90 p-1 rounded-lg border border-slate-700/60" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-btn-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white border-b-2 border-blue-400 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                <span className={`text-[10px] hidden lg:inline ${isActive ? 'text-blue-300' : 'text-slate-500'}`}>
                  ({item.hindiLabel})
                </span>
              </button>
            );
          })}
        </nav>

        {/* Right Controls & Telemetry Info */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Telemetry Status */}
          <div className="hidden lg:block text-right">
            <div className="text-[10px] text-slate-400 font-mono">Photo Grid / OCR / KB Engine</div>
            <div className="text-xs font-semibold text-emerald-400 flex items-center justify-end gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              System Online
            </div>
          </div>

          {/* Recent Activity Sidebar Trigger */}
          {onOpenRecentActivity && (
            <button
              id="header-recent-activity-btn"
              onClick={onOpenRecentActivity}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs group"
              title="View recent processed files and re-download"
            >
              <History className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-12 transition-transform" />
              <span className="text-xs font-semibold hidden sm:inline">Recent</span>
              {recentCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-mono font-bold leading-tight">
                  {recentCount}
                </span>
              )}
            </button>
          )}

          {/* Dark Mode Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1.5 rounded-md text-slate-400 hover:text-white bg-slate-800 border border-slate-700 transition-all cursor-pointer"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>

          {/* Operator Badge */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-mono text-[10px] sm:text-[11px] font-bold shadow-xs">
            ADM
          </div>
        </div>
      </div>

      {/* Mobile Tab Sub-bar */}
      <div className="md:hidden flex items-center justify-around bg-slate-800/90 border-t border-slate-800 px-2 py-1.5 overflow-x-auto scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 text-white border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className={`w-3 h-3 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
