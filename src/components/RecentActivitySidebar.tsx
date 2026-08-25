import React, { useState, useEffect } from 'react';
import { 
  History, 
  Download, 
  Trash2, 
  X, 
  FileText, 
  Image as ImageIcon, 
  FileCheck, 
  ExternalLink,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  HardDrive
} from 'lucide-react';
import { 
  RecentFileItem, 
  getRecentActivities, 
  deleteRecentActivity, 
  clearRecentActivities, 
  triggerFileDownload,
  addRecentActivity,
  formatTimeAgo,
  RECENT_ACTIVITY_EVENT 
} from '../utils/recentActivity.ts';

interface RecentActivitySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecentActivitySidebar: React.FC<RecentActivitySidebarProps> = ({
  isOpen,
  onClose
}) => {
  const [activities, setActivities] = useState<RecentFileItem[]>([]);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  // Load activities on mount and subscribe to update events
  useEffect(() => {
    const refreshList = () => {
      setActivities(getRecentActivities());
    };

    refreshList();

    window.addEventListener(RECENT_ACTIVITY_EVENT, refreshList);
    window.addEventListener('storage', refreshList);

    return () => {
      window.removeEventListener(RECENT_ACTIVITY_EVENT, refreshList);
      window.removeEventListener('storage', refreshList);
    };
  }, []);

  // Handle re-download action
  const handleReDownload = (item: RecentFileItem) => {
    triggerFileDownload(item);
    setDownloadSuccessId(item.id);
    setTimeout(() => {
      setDownloadSuccessId(null);
    }, 2000);
  };

  // Seed sample demo items if user wants to test
  const handleSeedDemoData = () => {
    // Generate a simple demo photo data URL
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(0, 0, 300, 300);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PASSPORT PHOTO DEMO', 150, 150);
      ctx.font = '14px sans-serif';
      ctx.fillText('3.5 x 4.5 cm (300 DPI)', 150, 180);
    }
    const sampleImgData = canvas.toDataURL('image/jpeg');

    const sampleItems: Omit<RecentFileItem, 'id' | 'timestamp'>[] = [
      {
        name: 'passport_grid_8_copies.jpg',
        type: 'image',
        category: 'Passport Photo Grid',
        sizeLabel: '340 KB',
        downloadUrl: sampleImgData,
        previewUrl: sampleImgData
      },
      {
        name: 'optimized_student_photo_45kb.jpg',
        type: 'image',
        category: 'KB Photo Compressor',
        sizeLabel: '44.8 KB',
        downloadUrl: sampleImgData,
        previewUrl: sampleImgData
      },
      {
        name: 'merged_aadhaar_marksheet.pdf',
        type: 'pdf',
        category: 'PDF Multi-Merge',
        sizeLabel: '1.2 MB',
        downloadUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxCj4+CmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9QYXJlbnQgMiAwIFIKL01lZGlhQm94IFswIDAgNTk1IDg0Ml0KL0NvbnRlbnRzIDQgMCBSCj4+CmVuZG9iago0IDAgb2JqCjw8Ci9MZW5ndGggNTAKPj4Kc3RyZWFtCkJUCi9GMSAxOCBUZgoxMDAgNzUwIFRkCihDZXJlYnJhbCBDU0MgRG9jdW1lbnQgRGVtbikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTggMDAwMDAgbiAKMDAwMDAwMDA3NyAwMDAwMCBuIAowMDAwMDAwMTM0IDAwMDAwIG4gCjAwMDAwMDAyMjkgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA1Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgoxMzMwCiUlRU9GCg=='
      }
    ];

    clearRecentActivities();
    sampleItems.forEach(item => addRecentActivity(item));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay on mobile */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 transition-opacity"
        aria-hidden="true"
      />

      {/* Sidebar Panel */}
      <aside 
        id="recent-activity-sidebar"
        className="fixed top-0 right-0 bottom-0 w-full sm:w-96 max-w-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col transition-transform transform translate-x-0 duration-200 ease-in-out font-sans"
        role="dialog"
        aria-label="Recent Processed Files Activity"
      >
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Recent Activity</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                  {activities.length}/5 Files
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                हालिया प्रोसेस्ड फाइल्स (1-क्लिक डाउनलोड)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {activities.length > 0 && (
              <button
                id="clear-all-recent-btn"
                onClick={() => {
                  if (window.confirm('Clear all recent files history? / क्या आप पूरी हिस्ट्री हटाना चाहते हैं?')) {
                    clearRecentActivities();
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors text-xs"
                title="Clear all recent history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              id="close-recent-sidebar-btn"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content list area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activities.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-500 dark:text-slate-400">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700/60">
                <HardDrive className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  No Recent Files Yet
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">
                  Whenever you merge/compress PDFs, edit passport photos, or generate documents, your last 5 files will appear here for instant re-download.
                </p>
              </div>
              <button
                onClick={handleSeedDemoData}
                className="mt-3 px-4 py-2 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-xl border border-blue-200 dark:border-blue-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Demo Items (डेमो फाइलें देखें)</span>
              </button>
            </div>
          ) : (
            <>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1 flex items-center justify-between">
                <span>Last Processed (Max 5)</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">Auto-saved</span>
              </div>

              {activities.map((item, index) => {
                const isPdf = item.type === 'pdf';
                const isSuccess = downloadSuccessId === item.id;

                return (
                  <div
                    key={item.id || index}
                    id={`recent-item-${item.id || index}`}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-2xs group flex flex-col justify-between space-y-2.5"
                  >
                    {/* Top Row: Icon + File Details */}
                    <div className="flex items-start gap-3">
                      {/* Thumbnail / Icon */}
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700 flex items-center justify-center border border-slate-300 dark:border-slate-600">
                        {item.previewUrl ? (
                          <img 
                            src={item.previewUrl} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : isPdf ? (
                          <FileText className="w-5 h-5 text-rose-500" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-blue-500" />
                        )}
                      </div>

                      {/* File Metadata */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono">
                            {item.category || (isPdf ? 'PDF Tool' : 'Photo')}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-0.5 font-mono">
                            <Clock className="w-2.5 h-2.5" />
                            {formatTimeAgo(item.timestamp)}
                          </span>
                        </div>

                        <h4 
                          className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate mt-1" 
                          title={item.name}
                        >
                          {item.name}
                        </h4>

                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="font-mono">{item.sizeLabel || 'Ready'}</span>
                          <span>•</span>
                          <span className="uppercase text-[10px] font-semibold">{item.type}</span>
                        </div>
                      </div>

                      {/* Single Item Delete */}
                      <button
                        onClick={() => deleteRecentActivity(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1 rounded transition-opacity"
                        title="Remove from history"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Bottom Action: 1-Click Re-Download */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {isSuccess ? 'Downloaded!' : 'Saved in storage'}
                      </span>

                      <button
                        id={`redownload-btn-${item.id}`}
                        onClick={() => handleReDownload(item)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
                          isSuccess
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {isSuccess ? (
                          <>
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Saved</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Re-Download</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-center">
          <span>Browser local storage • Max 5 recent items</span>
        </div>
      </aside>
    </>
  );
};
