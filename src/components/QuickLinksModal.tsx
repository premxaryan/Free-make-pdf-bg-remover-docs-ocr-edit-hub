import React, { useState } from 'react';
import { X, ExternalLink, Search, Globe, Shield, FileText, ArrowUpRight } from 'lucide-react';
import { PORTAL_QUICK_LINKS, PortalQuickLink } from '../data/quickLinks.ts';

interface QuickLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickLinksModal: React.FC<QuickLinksModalProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories = ['all', 'Citizen Services', 'Job Exams', 'Tools & Utilities'];

  const filteredLinks = PORTAL_QUICK_LINKS.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.hindiName.toLowerCase().includes(search.toLowerCase()) ||
      item.desc.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-fadeIn">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Official Portals & Quick CSC Directory
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                प्रमुख सरकारी पोर्टल व साइबर कैफे लिंक्स
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 space-y-3 bg-white dark:bg-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search portal (Aadhaar, PAN, SSC, UPSC, PF, Sarkari Result)..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Portals List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredLinks.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all flex items-center justify-between group block"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.name}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-medium">({item.hindiName})</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>

              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-600 group-hover:text-white text-slate-500 dark:text-slate-300 transition-colors flex-shrink-0 ml-3">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </a>
          ))}
        </div>

      </div>
    </div>
  );
};
