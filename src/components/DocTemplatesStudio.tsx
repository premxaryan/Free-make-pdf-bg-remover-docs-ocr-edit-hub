import React, { useState } from 'react';
import { 
  Printer, 
  FileText, 
  FileCheck, 
  Scale, 
  BookOpen, 
  Languages, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Building,
  FileDown,
  Receipt,
  Briefcase
} from 'lucide-react';
import { QuickPrintTemplates } from './QuickPrintTemplates.tsx';
import { DocumentGenerator } from './DocumentGenerator.tsx';
import { KrutiDevConverterModal } from './KrutiDevConverterModal.tsx';
import { PrintTemplatesSection } from './PrintTemplatesSection.tsx';

export type DocStudioSubTab = 
  | 'print_templates'
  | 'quick_forms' 
  | 'resume_maker' 
  | 'affidavits' 
  | 'hindi_studio';

export const DocTemplatesStudio: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<DocStudioSubTab>('print_templates');
  const [isKrutiDevOpen, setIsKrutiDevOpen] = useState<boolean>(false);

  const subTools: {
    id: DocStudioSubTab;
    title: string;
    hindiTitle: string;
    badge: string;
    desc: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    {
      id: 'print_templates',
      title: 'Print Templates & Receipts',
      hindiTitle: 'विज़िट रसीद, कैश मेमो, जॉब ऑर्डर',
      badge: 'Thermal & A4 Print',
      desc: 'Predefined print-ready layouts for Visit Receipts, Cash Memos, Job Order Forms, and Money Vouchers with live CSS.',
      icon: Receipt,
    },
    {
      id: 'quick_forms',
      title: 'Ready Print Forms & Letters',
      hindiTitle: 'सरकारी व बैंक आवेदन पत्र',
      badge: 'Direct Print A4',
      desc: 'Instant pre-filled application forms for Bank ATM, Passbook, School TC, Police NCR, and Civil Registry.',
      icon: Printer,
    },
    {
      id: 'resume_maker',
      title: 'Resume & CV Maker Studio',
      hindiTitle: 'बायोडाटा / रिज्यूमे मेकर',
      badge: 'A4 & Word (.docx)',
      desc: 'Professional job resumes with education tables, career objective, and 1-click Word (.docx) & PDF exports.',
      icon: FileText,
    },
    {
      id: 'affidavits',
      title: 'Legal Affidavits (शपथ पत्र)',
      hindiTitle: 'गैप ईयर, नाम सुधार शपथ पत्र',
      badge: 'Notary Legal',
      desc: 'Standard court notary affidavits for Name Correction, Education Gap Year, Lost Documents, and Income.',
      icon: Scale,
    },
    {
      id: 'hindi_studio',
      title: 'Hindi Typing & Kruti Dev',
      hindiTitle: 'कृति देव ↔ मंगल फॉन्ट कनवर्टर',
      badge: 'Unicode / Mangal',
      desc: 'Bidirectional Kruti Dev 010 ↔ Mangal Unicode font converter and Hindi typing layout reference.',
      icon: Languages,
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Category Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <Printer className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                CATEGORY 3
              </span>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                Quick Print Templates & Document Generator
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              सरकारी व बैंक आवेदन पत्र • कोर्ट शपथ पत्र • प्रोफेशनल रिज्यूमे मेकर • कृति देव ↔ मंगल फॉन्ट कनवर्टर
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsKrutiDevOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition-colors cursor-pointer"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Kruti Dev ↔ Mangal Converter</span>
          </button>
        </div>
      </div>

      {/* Sub-tools Grid Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {subTools.map((t) => {
          const Icon = t.icon;
          const isSelected = activeSubTab === t.id;
          return (
            <button
              key={t.id}
              id={`doc-tool-btn-${t.id}`}
              onClick={() => setActiveSubTab(t.id)}
              className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/30 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-lg ${
                    isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {t.badge}
                  </span>
                </div>
                <div className="font-bold text-xs leading-tight">
                  {t.title}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {t.hindiTitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Sub-tool Components */}
      {activeSubTab === 'print_templates' && (
        <PrintTemplatesSection />
      )}

      {activeSubTab === 'quick_forms' && (
        <QuickPrintTemplates />
      )}

      {activeSubTab === 'resume_maker' && (
        <DocumentGenerator />
      )}

      {activeSubTab === 'affidavits' && (
        <QuickPrintTemplates />
      )}

      {activeSubTab === 'hindi_studio' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Languages className="w-4 h-4 text-amber-500" />
                Hindi Typing Studio & Kruti Dev 010 ↔ Mangal Unicode Converter
              </h3>
              <p className="text-xs text-slate-500">
                पुराने कृति देव फॉन्ट और सरकारी ऑनलाइन फॉर्म्स (मंगल यूनिकोड) के बीच तुरंत कन्वर्शन करें
              </p>
            </div>

            <button
              onClick={() => setIsKrutiDevOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow-sm cursor-pointer"
            >
              Open Fullscreen Font Converter
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                1. Kruti Dev 010 (रेमिंगटन टाइपराइटर लेआउट)
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                अधिकांश कोर्ट, नोटरी और कोर्ट टाइपिस्ट कृति देव (Kruti Dev 010) फॉन्ट में टाइप करते हैं। यह ऑनलाइन सरकारी पोर्टल्स (SSC, UPSSSC, High Court) पर सही से पेस्ट नहीं होता।
              </p>
            </div>

            <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800 space-y-2">
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                2. Mangal Unicode (मंगल यूनिकोड)
              </h4>
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                मंगल फॉन्ट इंटरनेट और सभी सरकारी ऑनलाइन पोर्टल्स का मानक (Standard) फॉन्ट है। कनवर्टर की मदद से बिना दोबारा टाइप किए 1 सेकंड में टेक्स्ट बदलें।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isKrutiDevOpen && (
        <KrutiDevConverterModal isOpen={isKrutiDevOpen} onClose={() => setIsKrutiDevOpen(false)} />
      )}

    </div>
  );
};
