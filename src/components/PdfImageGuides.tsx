import React, { useState, useMemo } from 'react';
import { 
  Wrench, 
  Search, 
  Layers, 
  FileText, 
  Sparkles, 
  Printer, 
  Check, 
  Copy, 
  ExternalLink, 
  BookOpen,
  Keyboard,
  ShieldAlert,
  Sliders
} from 'lucide-react';
import { ToolGuide } from '../types.ts';
import { TOOL_GUIDES } from '../data/guidesData.ts';

export const PdfImageGuides: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTool, setSelectedTool] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>('ps_passport_crop');

  const categories = [
    { id: 'all', label: 'All Guides (सभी गाइड)' },
    { id: 'resize', label: 'Photo & Sign Resizing (फोटो व हस्ताक्षर)' },
    { id: 'edit_pdf', label: 'PDF Text Edit & OCR (पीडीएफ संपादन)' },
    { id: 'scanning', label: 'Multi-Page Scanning (स्कैनिंग)' },
    { id: 'enhancement', label: 'AI Photo Restore (फोटो सुधार)' },
    { id: 'pvc_printing', label: 'PVC Card Printing (स्मार्ट कार्ड प्रिंट)' },
  ];

  const tools = [
    { id: 'all', label: 'All Software' },
    { id: 'photoshop', label: 'Adobe Photoshop' },
    { id: 'acrobat', label: 'Adobe Acrobat Pro' },
    { id: 'naps2', label: 'NAPS2 Scanner' },
    { id: 'remini', label: 'Remini / AI Enhancer' },
    { id: 'tinypng', label: 'TinyPNG / Squoosh' },
    { id: 'pvc_printer', label: 'Epson/Canon PVC Tray' },
  ];

  const filteredGuides = useMemo(() => {
    return TOOL_GUIDES.filter((guide) => {
      const matchesSearch = 
        guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.hindiTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.steps.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory;
      const matchesTool = selectedTool === 'all' || guide.tool === selectedTool;

      return matchesSearch && matchesCategory && matchesTool;
    });
  }, [searchQuery, selectedCategory, selectedTool]);

  const handleCopyGuide = (guide: ToolGuide) => {
    const text = `${guide.title}\n${guide.hindiTitle}\n\nSpecs: ${guide.targetSpecs || 'Standard'}\n\nStep-by-step Guide:\n${guide.steps.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}\n\nPro Tips:\n${guide.tips.map(t => `• ${t}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(guide.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              PDF & Image Software Mastery Hub
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tested workflow guides for Photoshop, Acrobat Pro, NAPS2, TinyPNG, and PVC Card tray printers.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="guide-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guide (e.g. edit text, 3.5x4.5cm, PAN 213px)..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-700/60 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Filter Categories */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Software Tool Chips */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 mr-1">Software:</span>
          {tools.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTool(t.id)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md border transition-all cursor-pointer ${
                selectedTool === t.id
                  ? 'border-slate-800 dark:border-slate-300 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-bold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Guides Grid */}
      <div className="space-y-4">
        {filteredGuides.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">No step-by-step guide found for "{searchQuery}".</p>
            <p className="text-xs text-slate-400 mt-1">Try asking our Smart AI Assistant in the 4th tab for instant custom help!</p>
          </div>
        ) : (
          filteredGuides.map((guide) => {
            const isExpanded = expandedId === guide.id;
            const isCopied = copiedId === guide.id;

            return (
              <div 
                key={guide.id}
                id={`guide-card-${guide.id}`}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs transition-all overflow-hidden"
              >
                {/* Header Row */}
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : guide.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-750 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        guide.tool === 'photoshop' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800' :
                        guide.tool === 'acrobat' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-800' :
                        guide.tool === 'naps2' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                        guide.tool === 'pvc_printer' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800' :
                        'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                      }`}>
                        {guide.tool.toUpperCase()}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        Difficulty: {guide.difficulty}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {guide.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {guide.hindiTitle}
                    </p>
                  </div>

                  {/* Actions & Target Badge */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {guide.targetSpecs && (
                      <span className="hidden md:inline-block text-[11px] font-mono px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                        {guide.targetSpecs}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyGuide(guide);
                      }}
                      className="p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
                      title="Copy Step-by-step Instructions"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Step-by-step Body */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/40 dark:bg-slate-800/40 space-y-4 animate-fadeIn">
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                      {guide.summary}
                    </p>

                    {/* Step-by-step List */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        Step-by-Step Procedure (विस्तृत कार्यविधि)
                      </h4>
                      <ol className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                        {guide.steps.map((step, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex-shrink-0 flex items-center justify-center font-bold text-[10px] mt-0.5">
                              {sIdx + 1}
                            </span>
                            <span className="leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Pro Tips Box */}
                    {guide.tips.length > 0 && (
                      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-1">
                        <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          Operator Pro Tips:
                        </span>
                        <ul className="list-disc pl-5 text-xs text-amber-950 dark:text-amber-300 space-y-0.5">
                          {guide.tips.map((tip, tIdx) => (
                            <li key={tIdx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Keyboard Shortcuts Pills */}
                    {guide.shortcuts && guide.shortcuts.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5 flex items-center gap-1">
                          <Keyboard className="w-3.5 h-3.5" /> Keyboard Shortcuts:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {guide.shortcuts.map((sc, scIdx) => (
                            <div key={scIdx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs">
                              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded border border-slate-300 dark:border-slate-600 shadow-2xs">
                                {sc.key}
                              </kbd>
                              <span className="text-[11px] text-slate-600 dark:text-slate-300">{sc.action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Cyber Cafe Quick Keyboard Shortcut Cheatsheet Footer */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-md">
        <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
          <Keyboard className="w-4 h-4 text-indigo-400" />
          Essential Windows & Graphic Design Shortcuts for Cyber Cafe Operators
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
            <kbd className="font-mono text-indigo-300 font-bold">Win + Shift + S</kbd>
            <p className="text-[11px] text-slate-300 mt-1">Instant Region Snipping Tool</p>
          </div>
          <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
            <kbd className="font-mono text-indigo-300 font-bold">Ctrl + Shift + Alt + S</kbd>
            <p className="text-[11px] text-slate-300 mt-1">Photoshop Save for Web (KB)</p>
          </div>
          <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
            <kbd className="font-mono text-indigo-300 font-bold">Ctrl + Alt + I</kbd>
            <p className="text-[11px] text-slate-300 mt-1">Photoshop Image Size & DPI</p>
          </div>
          <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
            <kbd className="font-mono text-indigo-300 font-bold">Ctrl + Shift + U</kbd>
            <p className="text-[11px] text-slate-300 mt-1">Desaturate to Grayscale (B&W)</p>
          </div>
          <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
            <kbd className="font-mono text-indigo-300 font-bold">Ctrl + L / Ctrl + M</kbd>
            <p className="text-[11px] text-slate-300 mt-1">Levels & Curves Brightness</p>
          </div>
          <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
            <kbd className="font-mono text-indigo-300 font-bold">services.msc</kbd>
            <p className="text-[11px] text-slate-300 mt-1">Restart Mantra / Morpho RD</p>
          </div>
          <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
            <kbd className="font-mono text-indigo-300 font-bold">Ctrl + P</kbd>
            <p className="text-[11px] text-slate-300 mt-1">Print Preview Dialog</p>
          </div>
          <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
            <kbd className="font-mono text-indigo-300 font-bold">Ctrl + Shift + N</kbd>
            <p className="text-[11px] text-slate-300 mt-1">New Clean Layer / Incognito</p>
          </div>
        </div>
      </div>
    </div>
  );
};
