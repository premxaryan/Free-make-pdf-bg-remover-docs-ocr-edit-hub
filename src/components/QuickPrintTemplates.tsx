import React, { useState, useRef } from 'react';
import { 
  Printer, 
  Copy, 
  RotateCcw, 
  Search, 
  Check, 
  FileText, 
  Sparkles, 
  Eye, 
  SlidersHorizontal,
  Download,
  CheckCircle2,
  FileCheck,
  Building,
  Scale,
  Award,
  BookOpen,
  Info,
  Maximize2,
  Minimize2,
  FileDown
} from 'lucide-react';
import { QUICK_PRINT_TEMPLATES } from '../data/quickPrintTemplates.ts';
import { QuickPrintTemplate } from '../types.ts';
import { downloadTemplateAsDocx } from '../utils/docxExport.ts';
import { jsPDF } from 'jspdf';

export const QuickPrintTemplates: React.FC = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(QUICK_PRINT_TEMPLATES[0].id);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    QUICK_PRINT_TEMPLATES[0].fields.forEach((f) => {
      initial[f.key] = f.defaultValue;
    });
    return initial;
  });
  const [copied, setCopied] = useState<boolean>(false);
  const [isFullScreenPreview, setIsFullScreenPreview] = useState<boolean>(false);
  const [borderStyle, setBorderStyle] = useState<'double' | 'solid' | 'modern' | 'minimal'>('double');
  const [fontSize, setFontSize] = useState<'compact' | 'normal' | 'large'>('normal');
  const [showWatermark, setShowWatermark] = useState<boolean>(false);
  const [watermarkText, setWatermarkText] = useState<string>('OFFICIAL PROFORMA');
  const [cscBranding, setCscBranding] = useState<string>('CSC DIGITAL SEVA KENDRA • LIVE PRINT DESK');

  const printRef = useRef<HTMLDivElement>(null);

  const currentTemplate = QUICK_PRINT_TEMPLATES.find((t) => t.id === selectedTemplateId) || QUICK_PRINT_TEMPLATES[0];

  // Handle template switch
  const handleSelectTemplate = (template: QuickPrintTemplate) => {
    setSelectedTemplateId(template.id);
    const newForm: Record<string, string> = {};
    template.fields.forEach((f) => {
      newForm[f.key] = f.defaultValue;
    });
    setFormData(newForm);
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    const defaultData: Record<string, string> = {};
    currentTemplate.fields.forEach((f) => {
      defaultData[f.key] = f.defaultValue;
    });
    setFormData(defaultData);
  };

  const handleClearAll = () => {
    const cleared: Record<string, string> = {};
    currentTemplate.fields.forEach((f) => {
      cleared[f.key] = '';
    });
    setFormData(cleared);
  };

  const handleFillSample = () => {
    handleReset();
  };

  // Filter templates
  const filteredTemplates = QUICK_PRINT_TEMPLATES.filter((t) => {
    const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch = 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.hindiTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'All Templates (सभी)', icon: FileText, count: QUICK_PRINT_TEMPLATES.length },
    { id: 'admission', label: 'School & College (प्रवेश)', icon: BookOpen, count: QUICK_PRINT_TEMPLATES.filter(t => t.category === 'admission').length },
    { id: 'civil', label: 'Civil & Registry (जन्म/मृत्यु)', icon: Building, count: QUICK_PRINT_TEMPLATES.filter(t => t.category === 'civil').length },
    { id: 'affidavit', label: 'Affidavits & Notary (शपथ पत्र)', icon: Scale, count: QUICK_PRINT_TEMPLATES.filter(t => t.category === 'affidavit').length },
    { id: 'ration', label: 'Ration & Food (खाद्य आपूर्ति)', icon: FileCheck, count: QUICK_PRINT_TEMPLATES.filter(t => t.category === 'ration').length },
    { id: 'certificate', label: 'Income & Character (प्रमाण पत्र)', icon: Award, count: QUICK_PRINT_TEMPLATES.filter(t => t.category === 'certificate').length },
  ];

  const templateContent = currentTemplate.contentTemplate(formData);

  const [isExportingDocx, setIsExportingDocx] = useState<boolean>(false);

  const handleDownloadDocx = async () => {
    try {
      setIsExportingDocx(true);
      await downloadTemplateAsDocx(currentTemplate, formData, cscBranding);
    } catch (err) {
      console.error('Error generating docx:', err);
      alert('Failed to generate MS Word document');
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    try {
      const doc = new jsPDF({
        unit: 'mm',
        format: currentTemplate.paperSize === 'Legal' ? 'legal' : 'a4',
      });
      
      const margin = 16;
      let y = 22;

      // Header Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text((templateContent.headerTitle || currentTemplate.title).toUpperCase(), 105, y, { align: 'center' });
      y += 6;

      if (templateContent.headerSubtitle) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.text(templateContent.headerSubtitle, 105, y, { align: 'center' });
        y += 7;
      }

      // Ref & Date
      if (templateContent.refNo || templateContent.date) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        if (templateContent.refNo) doc.text(`Ref: ${templateContent.refNo}`, margin, y);
        if (templateContent.date) doc.text(`Date: ${templateContent.date}`, 195 - margin, y, { align: 'right' });
        y += 7;
      }

      // Sections
      templateContent.sections.forEach((sec) => {
        if (sec.title) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10.5);
          doc.text(sec.title, margin, y);
          y += 5.5;
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        const cleanText = sec.content.replace(/\*\*/g, '');
        const lines = doc.splitTextToSize(cleanText, 178);
        doc.text(lines, margin, y);
        y += lines.length * 4.8 + 4;

        if (sec.table) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.text(sec.table.headers.join('   |   '), margin + 2, y);
          y += 4.5;
          doc.setFont('helvetica', 'normal');
          sec.table.rows.forEach(r => {
            doc.text(r.join('   |   '), margin + 2, y);
            y += 4.5;
          });
          y += 3;
        }
      });

      // Declaration
      if (templateContent.declaration) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        const declLines = doc.splitTextToSize(`Declaration: ${templateContent.declaration}`, 178);
        doc.text(declLines, margin, y);
        y += declLines.length * 4.2 + 8;
      }

      // Signatures
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Place: ${formData.applicant_place || formData.place || '_______________'}`, margin, y);
      doc.text('Signature of Applicant / Candidate', 195 - margin, y, { align: 'right' });

      // CSC Footer
      doc.setFontSize(7.5);
      doc.setTextColor(130, 130, 130);
      doc.text(`Generated via ${cscBranding}`, 105, 286, { align: 'center' });

      doc.save(`${currentTemplate.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`);
    } catch (pdfErr) {
      console.error('Error generating PDF:', pdfErr);
      alert('Unable to generate PDF document');
    }
  };

  const handleCopyText = () => {
    let text = `${templateContent.headerTitle || ''}\n${templateContent.headerSubtitle || ''}\nRef: ${templateContent.refNo || ''} | Date: ${templateContent.date || ''}\n\n`;
    
    templateContent.sections.forEach((s) => {
      if (s.title) text += `=== ${s.title} ===\n`;
      text += `${s.content.replace(/\*\*/g, '')}\n`;
      if (s.table) {
        text += `[Table: ${s.table.headers.join(' | ')}]\n`;
        s.table.rows.forEach(r => {
          text += `${r.join(' | ')}\n`;
        });
      }
      text += '\n';
    });

    if (templateContent.declaration) {
      text += `DECLARATION:\n${templateContent.declaration}\n\n`;
    }

    templateContent.signatures.forEach((sig) => {
      text += `[${sig.label} ${sig.subLabel || ''}]\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner / Operator Command Strip */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 sm:p-4 shadow-xs print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Quick Print Templates & Official Proformas
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Ready-to-Print A4/Legal
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                तुरंत प्रिंट योग्य आवेदन प्रपत्र, शपथ पत्र व प्रमाण पत्र प्रारूप — Pre-filled Placeholders & Direct 1-Click Print
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleFillSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Fill form with sample data"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Sample Data</span>
            </button>

            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Copy plain text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>

            <button
              id="download-pdf-btn"
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors cursor-pointer"
              title="Download clean printable PDF document"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download PDF</span>
            </button>

            <button
              id="download-docx-btn"
              onClick={handleDownloadDocx}
              disabled={isExportingDocx}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors cursor-pointer disabled:opacity-50"
              title="Download editable Microsoft Word .docx document"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-600" />
              <span>{isExportingDocx ? 'Generating...' : 'MS Word (.docx)'}</span>
            </button>

            <button
              onClick={() => setIsFullScreenPreview(!isFullScreenPreview)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {isFullScreenPreview ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isFullScreenPreview ? 'Exit Fullscreen' : 'Full Preview'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>PRINT A4 (Ctrl+P)</span>
            </button>
          </div>
        </div>

        {/* Categories Bar & Search */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1 rounded ${isActive ? 'bg-blue-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search format, form, affidavit..."
              className="w-full pl-8 pr-3 py-1 text-xs rounded-md bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Left Editor & Selectors | Right A4 Live Preview */}
      <div className={`grid gap-4 ${isFullScreenPreview ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'}`}>
        
        {/* Left Column: Template Picker & Interactive Field Editor (Hidden in full screen mode) */}
        {!isFullScreenPreview && (
          <div className="lg:col-span-5 space-y-4 print:hidden">
            {/* Template Selector Cards */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Select Document Proforma ({filteredTemplates.length})
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">1-Click Switch</span>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {filteredTemplates.map((template) => {
                  const isSelected = template.id === selectedTemplateId;
                  return (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className={`w-full text-left p-2 rounded-md border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-200 ring-1 ring-blue-500/50'
                          : 'bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="font-semibold text-xs leading-snug">
                          {template.title}
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-mono font-bold shrink-0 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {template.paperSize}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {template.hindiTitle}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Print & Format Layout Controls */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Layout & Print Controls
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{currentTemplate.paperSize} Portrait</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-medium text-slate-500 block mb-1">Border Frame</label>
                  <select
                    value={borderStyle}
                    onChange={(e) => setBorderStyle(e.target.value as any)}
                    className="w-full px-2 py-1 text-xs rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  >
                    <option value="double">Classic Double Border</option>
                    <option value="solid">Official Single Solid</option>
                    <option value="modern">Modern Clean Line</option>
                    <option value="minimal">Minimal / None</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-medium text-slate-500 block mb-1">Font Size</label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value as any)}
                    className="w-full px-2 py-1 text-xs rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  >
                    <option value="compact">Compact (Fit 1 Page)</option>
                    <option value="normal">Standard High Readability</option>
                    <option value="large">Spacious Large</option>
                  </select>
                </div>
              </div>

              {/* Watermark & CSC Branding */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showWatermark}
                      onChange={(e) => setShowWatermark(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Print Watermark (जलचिह्न)</span>
                  </label>
                  {showWatermark && (
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="e.g. SAMPLE / ORIGINAL"
                      className="w-36 px-2 py-0.5 text-xs rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    />
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-medium text-slate-500 block mb-0.5">
                    Footer CSC Center / Desk Note (निचली पाद टिप्पणी)
                  </label>
                  <input
                    type="text"
                    value={cscBranding}
                    onChange={(e) => setCscBranding(e.target.value)}
                    placeholder="e.g. Generated at Cyber Cafe Kendra..."
                    className="w-full px-2 py-1 text-xs rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Live Placeholders Input Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Interactive Field Placeholders
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Edit fields below — preview updates instantly in real-time
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleClearAll}
                    className="px-2 py-0.5 text-[10px] rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-2 py-0.5 text-[10px] rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-200 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {currentTemplate.fields.map((field) => (
                  <div key={field.key} className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {field.label}
                      </label>
                      <span className="text-[10px] text-slate-400">{field.hindiLabel}</span>
                    </div>
                    {field.type === 'textarea' ? (
                      <textarea
                        rows={2}
                        value={formData[field.key] || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-2.5 py-1 text-xs rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <input
                        type="text"
                        value={formData[field.key] || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-2.5 py-1 text-xs rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Right Column: Live Printable Sheet Container */}
        <div className={`${isFullScreenPreview ? 'lg:col-span-12' : 'lg:col-span-7'} space-y-3`}>
          
          {/* Top Sheet Header Strip */}
          <div className="flex items-center justify-between bg-slate-800 text-white px-3 py-2 rounded-t-lg text-xs font-mono print:hidden">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-bold text-slate-200">{currentTemplate.title}</span>
              <span className="text-slate-400">({currentTemplate.paperSize} Standard Format)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPdf}
                className="px-2 py-0.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-sans font-semibold text-[11px] cursor-pointer flex items-center gap-1"
                title="Download PDF"
              >
                <Download className="w-3 h-3" /> PDF
              </button>
              <button
                onClick={handleDownloadDocx}
                disabled={isExportingDocx}
                className="px-2 py-0.5 rounded bg-blue-700 hover:bg-blue-600 text-white font-sans font-semibold text-[11px] cursor-pointer flex items-center gap-1 disabled:opacity-50"
                title="Download MS Word (.docx)"
              >
                <FileDown className="w-3 h-3" /> Word
              </button>
              <button
                onClick={handlePrint}
                className="px-2.5 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-sans font-semibold text-[11px] cursor-pointer flex items-center gap-1"
              >
                <Printer className="w-3 h-3" /> Print
              </button>
            </div>
          </div>

          {/* Actual Printable Page Simulation Card */}
          <div className="bg-slate-200 dark:bg-slate-950/80 p-2 sm:p-4 rounded-b-lg border border-slate-300 dark:border-slate-800 flex justify-center overflow-x-auto shadow-inner">
            
            {/* The Print Sheet Target */}
            <div
              id="printable-template-sheet"
              ref={printRef}
              className={`bg-white text-slate-900 shadow-xl transition-all duration-150 relative min-h-[1050px] w-full max-w-[794px] p-6 sm:p-10 font-serif leading-relaxed ${
                borderStyle === 'double' ? 'border-[4px] border-double border-slate-900' :
                borderStyle === 'solid' ? 'border-[2px] border-solid border-slate-900' :
                borderStyle === 'modern' ? 'border-t-4 border-t-slate-900 border-x border-b border-slate-300' :
                'border-0'
              } ${
                fontSize === 'compact' ? 'text-[11px] leading-normal' :
                fontSize === 'large' ? 'text-[14px] leading-loose' :
                'text-[12.5px] leading-relaxed'
              }`}
              style={{ minHeight: currentTemplate.paperSize === 'Legal' ? '1180px' : '1050px' }}
            >
              {/* Optional Watermark Overlay */}
              {showWatermark && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.06] rotate-[-35deg] text-6xl sm:text-7xl font-bold uppercase tracking-widest text-slate-900 z-0">
                  {watermarkText}
                </div>
              )}

              <div className="relative z-10 space-y-4">
                
                {/* Header Section */}
                <div className="text-center border-b-2 border-slate-900 pb-3 relative">
                  
                  {/* Photo Box if required */}
                  {templateContent.photoBox && (
                    <div className="absolute right-0 top-0 w-24 h-28 border border-slate-800 bg-slate-50 flex flex-col items-center justify-center text-center p-1 text-[9px] font-sans text-slate-500">
                      <div className="border border-dashed border-slate-400 w-full h-full flex flex-col items-center justify-center">
                        <span>Passport Size</span>
                        <span>Photograph</span>
                        <span className="text-[8px] text-slate-400 mt-1">(Self Attested)</span>
                      </div>
                    </div>
                  )}

                  <div className={templateContent.photoBox ? 'pr-28' : ''}>
                    <h1 className="text-lg sm:text-xl font-bold uppercase tracking-tight font-sans text-slate-950">
                      {templateContent.headerTitle}
                    </h1>
                    {templateContent.headerSubtitle && (
                      <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mt-0.5">
                        {templateContent.headerSubtitle}
                      </p>
                    )}

                    {/* Ref No and Date */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 mt-3 pt-2 border-t border-slate-300">
                      <span>Ref / Reg No: <strong className="text-slate-900">{templateContent.refNo}</strong></span>
                      <span>Date: <strong className="text-slate-900">{templateContent.date}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Body Content Sections */}
                <div className="space-y-4">
                  {templateContent.sections.map((sec, idx) => (
                    <div key={idx} className="space-y-2">
                      {sec.title && (
                        <div className="font-sans font-bold text-xs bg-slate-100 text-slate-900 px-2 py-0.5 border-l-3 border-slate-900 uppercase">
                          {sec.title}
                        </div>
                      )}

                      {/* Content text with formatted bold tokens */}
                      <div className="whitespace-pre-line text-slate-900">
                        {sec.content.split('\n').map((line, lIdx) => {
                          // Simple parser for **bold** tokens
                          const parts = line.split(/(\*\*.*?\*\*)/g);
                          return (
                            <div key={lIdx} className="min-h-[18px]">
                              {parts.map((p, pIdx) => {
                                if (p.startsWith('**') && p.endsWith('**')) {
                                  return (
                                    <strong key={pIdx} className="font-bold font-sans text-slate-950 underline decoration-slate-300 decoration-1 underline-offset-2">
                                      {p.slice(2, -2)}
                                    </strong>
                                  );
                                }
                                return <span key={pIdx}>{p}</span>;
                              })}
                            </div>
                          );
                        })}
                      </div>

                      {/* Optional Structured Table */}
                      {sec.table && (
                        <div className="mt-2 overflow-x-auto">
                          <table className="w-full border-collapse border border-slate-800 text-left font-sans text-[10px]">
                            <thead>
                              <tr className="bg-slate-100 border-b border-slate-800">
                                {sec.table.headers.map((th, thIdx) => (
                                  <th key={thIdx} className="border-r border-slate-800 px-2 py-1 font-bold text-slate-900">
                                    {th}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {sec.table.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="border-b border-slate-700">
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="border-r border-slate-700 px-2 py-1 font-medium">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Declaration Box */}
                {templateContent.declaration && (
                  <div className="bg-slate-50 border border-slate-300 p-2.5 rounded text-[11px] text-slate-800 mt-4 leading-relaxed font-serif">
                    <strong>घोषणा / DECLARATION: </strong>
                    <span>{templateContent.declaration}</span>
                  </div>
                )}

                {/* Signatures Area */}
                <div className="pt-8 grid grid-cols-3 gap-3 text-center text-xs font-sans mt-6">
                  {templateContent.signatures.map((sig, sIdx) => (
                    <div
                      key={sIdx}
                      className={`flex flex-col items-center justify-end ${
                        sig.position === 'left' ? 'text-left items-start' :
                        sig.position === 'right' ? 'text-right items-end' :
                        'text-center items-center'
                      }`}
                    >
                      <div className="w-36 border-t border-slate-900 pt-1 text-[11px] font-bold text-slate-900">
                        {sig.label}
                      </div>
                      {sig.subLabel && (
                        <div className="text-[10px] text-slate-600 font-normal">
                          {sig.subLabel}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Official Verification / Seal Note Box */}
                {templateContent.officialNote && (
                  <div className="mt-6 pt-2 border-t border-dashed border-slate-400 text-[10px] font-sans text-slate-600">
                    <p>{templateContent.officialNote}</p>
                  </div>
                )}

                {/* Footer Center / CSC Branding strip */}
                {cscBranding && (
                  <div className="pt-4 mt-6 border-t border-slate-200 text-center text-[9px] font-mono text-slate-400">
                    {cscBranding} • Printed on {new Date().toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
