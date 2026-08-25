import React, { useState } from 'react';
import { 
  Languages, 
  ArrowRightLeft, 
  Copy, 
  Check, 
  X, 
  Sparkles, 
  HelpCircle, 
  RotateCcw, 
  ArrowDown,
  CornerDownRight,
  FileCheck
} from 'lucide-react';
import { convertKrutiDevToUnicode, convertUnicodeToKrutiDev } from '../utils/krutiDevConverter.ts';

interface KrutiDevConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertText?: (text: string) => void;
}

export const KrutiDevConverterModal: React.FC<KrutiDevConverterModalProps> = ({
  isOpen,
  onClose,
  onInsertText,
}) => {
  const [conversionMode, setConversionMode] = useState<'kd_to_uni' | 'uni_to_kd'>('kd_to_uni');
  const [inputText, setInputText] = useState<string>('d`fr nso ls eaxy ;wuhdksM esa cnysaA');
  const [outputText, setOutputText] = useState<string>('कृति देव से मंगल यूनिकोड में बदलें।');
  const [copied, setCopied] = useState<boolean>(false);
  const [inserted, setInserted] = useState<boolean>(false);
  const [showKeyHelper, setShowKeyHelper] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleConvert = (text: string, mode: 'kd_to_uni' | 'uni_to_kd') => {
    setInputText(text);
    if (mode === 'kd_to_uni') {
      setOutputText(convertKrutiDevToUnicode(text));
    } else {
      setOutputText(convertUnicodeToKrutiDev(text));
    }
  };

  const handleModeSwitch = (newMode: 'kd_to_uni' | 'uni_to_kd') => {
    setConversionMode(newMode);
    // Swap input and output
    const prevOut = outputText;
    setInputText(prevOut);
    if (newMode === 'kd_to_uni') {
      setOutputText(convertKrutiDevToUnicode(prevOut));
    } else {
      setOutputText(convertUnicodeToKrutiDev(prevOut));
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = () => {
    if (onInsertText && outputText) {
      onInsertText(outputText);
      setInserted(true);
      setTimeout(() => {
        setInserted(false);
        onClose();
      }, 800);
    }
  };

  const sampleTexts = [
    { label: 'Sample 1 (Name & Address)', kd: "jkes'k dqekj 'kekZ] xzke&jkeiqj", uni: 'रमेश कुमार शर्मा, ग्राम-रामपुर' },
    { label: 'Sample 2 (Affidavit Line)', kd: "eSa 'kir iwoZd c;ku djrk gw¡ fd esjk uke lgh gSA", uni: 'मैं शपथ पूर्वक बयान करता हूँ कि मेरा नाम सही है।' },
    { label: 'Sample 3 (Leave Application)', kd: "lsok esa] Jh eku iz/kkukpk;Z egksn;A", uni: 'सेवा में, श्री मान प्रधानाचार्य महोदय।' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Languages className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Kruti Dev 010 ↔ Mangal (Unicode) Font Converter
              </h2>
              <p className="text-xs text-amber-100">
                कृति देव फॉन्ट व मंगल (यूनिकोड) हिंदी टाइपिंग 2-वे कन्वर्टर
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Mode Switcher Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200/80 dark:border-amber-900/50">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleModeSwitch('kd_to_uni')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  conversionMode === 'kd_to_uni'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                }`}
              >
                Kruti Dev 010 ➔ Mangal (Unicode)
              </button>

              <button
                type="button"
                onClick={() => handleModeSwitch('uni_to_kd')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  conversionMode === 'uni_to_kd'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                }`}
              >
                Mangal (Unicode) ➔ Kruti Dev 010
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowKeyHelper(!showKeyHelper)}
              className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showKeyHelper ? 'Hide Key Map' : 'Kruti Dev Keymap'}</span>
            </button>
          </div>

          {/* Keymap Cheatsheet Helper */}
          {showKeyHelper && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Kruti Dev Remington Key Map Quick Reference:</span>
                <span className="text-[10px] text-slate-400 font-normal">Common Letters</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-[11px] font-mono">
                <div className="p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800"><span className="text-amber-600 font-bold">d</span> = क</div>
                <div className="p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800"><span className="text-amber-600 font-bold">[k</span> = ख</div>
                <div className="p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800"><span className="text-amber-600 font-bold">x</span> = ग</div>
                <div className="p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800"><span className="text-amber-600 font-bold">k</span> = ा (Aa)</div>
                <div className="p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800"><span className="text-amber-600 font-bold">f</span> = ि (i)</div>
                <div className="p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800"><span className="text-amber-600 font-bold">h</span> = ी (ee)</div>
                <div className="p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800"><span className="text-amber-600 font-bold">q</span> = ु (u)</div>
                <div className="p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800"><span className="text-amber-600 font-bold">w</span> = ू (oo)</div>
                <div className="p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800"><span className="text-amber-600 font-bold">s</span> = े (e)</div>
                <div className="p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800"><span className="text-amber-600 font-bold">S</span> = ै (ai)</div>
                <div className="p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800"><span className="text-amber-600 font-bold">Z</span> = र् (Reph)</div>
                <div className="p-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800"><span className="text-amber-600 font-bold">&#123;</span> = क्ष</div>
              </div>
            </div>
          )}

          {/* Two Box Input & Output Editors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Input Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>
                  {conversionMode === 'kd_to_uni' ? 'Input: Kruti Dev 010 Text' : 'Input: Mangal (Unicode) Hindi'}
                </span>
                <button
                  type="button"
                  onClick={() => handleConvert('', conversionMode)}
                  className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Clear
                </button>
              </div>

              <textarea
                rows={7}
                value={inputText}
                onChange={(e) => handleConvert(e.target.value, conversionMode)}
                placeholder={conversionMode === 'kd_to_uni' ? 'Paste Kruti Dev font text here (e.g. jkes\'k)...' : 'यहाँ मंगल यूनिकोड हिंदी टेक्स्ट लिखें या पेस्ट करें...'}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono leading-relaxed focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Output Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>
                  {conversionMode === 'kd_to_uni' ? 'Output: Mangal (Unicode) for Portals' : 'Output: Kruti Dev 010 for DTP'}
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  ✓ Instant Live
                </span>
              </div>

              <textarea
                rows={7}
                readOnly
                value={outputText}
                placeholder="Converted result will appear here..."
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-amber-300 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 text-slate-900 dark:text-slate-100 font-sans leading-relaxed focus:outline-none"
              />
            </div>

          </div>

          {/* Quick Sample Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-500 font-semibold">Quick Samples:</span>
            {sampleTexts.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (conversionMode === 'kd_to_uni') {
                    handleConvert(sample.kd, 'kd_to_uni');
                  } else {
                    handleConvert(sample.uni, 'uni_to_kd');
                  }
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                {sample.label}
              </button>
            ))}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Use converted text directly on SSC, UPSC, UP Police, or Govt Portal forms.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Converted Text!' : 'Copy Converted Text'}</span>
            </button>

            {onInsertText && (
              <button
                type="button"
                onClick={handleInsert}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
              >
                {inserted ? <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" /> : <FileCheck className="w-4 h-4" />}
                <span>Insert into Active Document</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
