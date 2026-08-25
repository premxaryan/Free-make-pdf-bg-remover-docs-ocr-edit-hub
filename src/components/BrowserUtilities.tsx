import React, { useState } from 'react';
import { 
  Layers, 
  Zap, 
  FileText, 
  Crop, 
  Sparkles, 
  Check, 
  Camera, 
  PenTool, 
  Calculator,
  Sliders,
  Scan
} from 'lucide-react';
import { PassportPhotoMaker } from './utilities/PassportPhotoMaker.tsx';
import { ImageOcrExtractor } from './utilities/ImageOcrExtractor.tsx';
import { ImageKbCompressor } from './utilities/ImageKbCompressor.tsx';
import { PdfTools } from './utilities/PdfTools.tsx';
import { SizeCalculator } from './SizeCalculator.tsx';

export type UtilitySubTab = 'passport' | 'ocr' | 'compressor' | 'pdf' | 'calculator';

export const BrowserUtilities: React.FC = () => {
  const [activeUtil, setActiveUtil] = useState<UtilitySubTab>('passport');

  const tools: {
    id: UtilitySubTab;
    title: string;
    hindiTitle: string;
    badge: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    accentColor: string;
  }[] = [
    {
      id: 'passport',
      title: '4x6 Passport Photo Maker',
      hindiTitle: 'पासपोर्ट फोटो 8-ग्रिड + BG चेंजर',
      badge: 'White/Blue BG',
      description: '8 photos on 4x6 paper, 1-click background color switcher (White/Blue), name & DOP stamp.',
      icon: Camera,
      accentColor: 'blue',
    },
    {
      id: 'ocr',
      title: 'Certificate OCR Extractor',
      hindiTitle: 'मार्कशीट टेक्स्ट एक्सट्रैक्टर',
      badge: 'AI Vision OCR',
      description: 'Upload marksheet/certificate to extract Name, Father Name, Roll No, DOB & Marks for instant copy.',
      icon: Scan,
      accentColor: 'purple',
    },
    {
      id: 'compressor',
      title: 'Image & Signature Compressor',
      hindiTitle: 'KB साइज रिड्यूसर',
      badge: '<20KB / <50KB',
      description: 'Instant binary compressor for photos & signatures with B&W white paper boost.',
      icon: Zap,
      accentColor: 'emerald',
    },
    {
      id: 'pdf',
      title: 'PDF Merge & Compress',
      hindiTitle: 'PDF जोड़ें व घटाएं',
      badge: 'Client-Side',
      description: 'Merge multiple marksheets/ID cards or optimize PDF size for portal uploads.',
      icon: FileText,
      accentColor: 'indigo',
    },
    {
      id: 'calculator',
      title: 'DPI & Dimension Calculator',
      hindiTitle: 'पोर्टल साइज़ कैलकुलेटर',
      badge: 'SSC/PAN Specs',
      description: 'Convert cm/inches to exact pixels at 200, 300, 600 DPI for all govt portals.',
      icon: Crop,
      accentColor: 'amber',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tool Selection Header Row */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isSelected = activeUtil === tool.id;
            return (
              <button
                key={tool.id}
                id={`util-btn-${tool.id}`}
                onClick={() => setActiveUtil(tool.id)}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className={`p-1.5 rounded-lg ${
                      isSelected 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-blue-200/80 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {tool.badge}
                    </span>
                  </div>

                  <div className="font-bold text-xs sm:text-sm tracking-tight leading-tight">
                    {tool.title}
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    {tool.hindiTitle}
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed hidden sm:block">
                  {tool.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Utility View */}
      <div className="transition-all duration-150">
        {activeUtil === 'passport' && <PassportPhotoMaker />}
        {activeUtil === 'ocr' && <ImageOcrExtractor />}
        {activeUtil === 'compressor' && <ImageKbCompressor />}
        {activeUtil === 'pdf' && <PdfTools />}
        {activeUtil === 'calculator' && <SizeCalculator />}
      </div>
    </div>
  );
};
