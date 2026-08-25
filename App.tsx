import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { PdfSuite } from './components/PdfSuite.tsx';
import { PhotoStudio } from './components/PhotoStudio.tsx';
import { DocTemplatesStudio } from './components/DocTemplatesStudio.tsx';
import { ImageOcrExtractor } from './components/utilities/ImageOcrExtractor.tsx';
import { AiAssistant } from './components/AiAssistant.tsx';
import { RecentActivitySidebar } from './components/RecentActivitySidebar.tsx';
import { getRecentActivities, RECENT_ACTIVITY_EVENT } from './utils/recentActivity.ts';
import { ActiveTab } from './types.ts';
import { History } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('pdf_suite');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isRecentActivityOpen, setIsRecentActivityOpen] = useState<boolean>(false);
  const [recentCount, setRecentCount] = useState<number>(() => {
    return getRecentActivities().length;
  });

  // Synchronize dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Keep track of recent activities count in real-time
  useEffect(() => {
    const updateCount = () => {
      setRecentCount(getRecentActivities().length);
    };

    window.addEventListener(RECENT_ACTIVITY_EVENT, updateCount);
    window.addEventListener('storage', updateCount);

    return () => {
      window.removeEventListener(RECENT_ACTIVITY_EVENT, updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-150 selection:bg-blue-600 selection:text-white relative">
      
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onOpenRecentActivity={() => setIsRecentActivityOpen(true)}
        recentCount={recentCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-5 lg:px-6 py-5">
        {activeTab === 'pdf_suite' && <PdfSuite />}
        {activeTab === 'photo_studio' && <PhotoStudio />}
        {activeTab === 'doc_templates' && <DocTemplatesStudio />}
        {activeTab === 'ocr_extractor' && (
          <div className="space-y-6">
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                <span className="text-xl">🔍</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    CATEGORY 4
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                    Image & Certificate OCR Extractor
                  </h2>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  10वीं/12वीं मार्कशीट, आधार, पैन व प्रमाण-पत्र से विवरण स्वतः निकालें व सीधे कॉपी करें
                </p>
              </div>
            </div>
            <ImageOcrExtractor />
          </div>
        )}
        {activeTab === 'ai_assistant' && (
          <div className="space-y-6">
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                    CATEGORY 5
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                    AI Cyber Cafe Assistant
                  </h2>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  फोटो साइजिंग नियम, बायोमेट्रिक RD सर्विस एरर फिक्स और सरकारी फॉर्म्स संबंधी त्वरित सहायता
                </p>
              </div>
            </div>
            <AiAssistant />
          </div>
        )}
      </main>

      {/* Floating Recent Activity Quick Trigger */}
      <button
        id="floating-recent-activity-btn"
        onClick={() => setIsRecentActivityOpen(true)}
        className="fixed bottom-12 right-4 sm:right-6 z-30 px-3 py-2 bg-slate-900/90 dark:bg-slate-800/90 hover:bg-slate-900 text-white rounded-full shadow-lg border border-slate-700/80 backdrop-blur-xs flex items-center gap-2 cursor-pointer transition-all hover:scale-105 group print:hidden"
        title="View recent processed files"
        aria-label="Recent Processed Files Activity"
      >
        <div className="relative">
          <History className="w-4 h-4 text-blue-400 group-hover:rotate-12 transition-transform" />
          {recentCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          )}
        </div>
        <span className="text-xs font-bold hidden sm:inline">Recent Activity</span>
        <span className="px-1.5 py-0.2 rounded-full bg-blue-950 text-blue-300 font-mono text-[10px] font-bold border border-blue-800">
          {recentCount}/5
        </span>
      </button>

      {/* Slide-over Recent Activity Sidebar */}
      <RecentActivitySidebar
        isOpen={isRecentActivityOpen}
        onClose={() => setIsRecentActivityOpen(false)}
      />

      {/* High Density Status Footer */}
      <footer className="h-9 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 text-[11px] text-slate-600 dark:text-slate-400 font-medium print:hidden">
        <div className="flex items-center gap-2 truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>1-Click 5-Suite Architecture • PDF Suite • Photo Studio • Document Generator • OCR Extractor • AI Assistant</span>
        </div>
        <div className="hidden md:flex items-center space-x-4 font-mono text-[10px]">
          <span className="bg-slate-200/80 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">A4 / 4×6 300 DPI</span>
          <span>MS Word (.docx) & PDF Ready</span>
          <span>Ctrl+P: Direct Print</span>
        </div>
      </footer>

    </div>
  );
}
