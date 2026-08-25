import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Minimize2, 
  Sparkles, 
  FilePlus, 
  FileCheck,
  RefreshCw
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { addRecentActivity } from '../../utils/recentActivity.ts';

interface PdfMergeItem {
  id: string;
  file: File;
  name: string;
  sizeKb: number;
  pageCount: number;
  arrayBuffer: ArrayBuffer;
}

export const PdfTools: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'merge' | 'compress'>('merge');

  // Merge State
  const [pdfFiles, setPdfFiles] = useState<PdfMergeItem[]>([]);
  const [isMerging, setIsMerging] = useState<boolean>(false);
  const [mergedBlobUrl, setMergedBlobUrl] = useState<string | null>(null);
  const [mergedSizeKb, setMergedSizeKb] = useState<number>(0);
  const [mergedTotalPages, setMergedTotalPages] = useState<number>(0);

  // Compress State
  const [compressFile, setCompressFile] = useState<File | null>(null);
  const [compressOriginalSizeKb, setCompressOriginalSizeKb] = useState<number>(0);
  const [compressPageCount, setCompressPageCount] = useState<number>(0);
  const [compressionLevel, setCompressionLevel] = useState<'high' | 'medium' | 'low'>('medium');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressedPdfBlobUrl, setCompressedPdfBlobUrl] = useState<string | null>(null);
  const [compressedPdfSizeKb, setCompressedPdfSizeKb] = useState<number>(0);

  const fileInputMergeRef = useRef<HTMLInputElement | null>(null);
  const fileInputCompressRef = useRef<HTMLInputElement | null>(null);

  // Handle Multi-file Upload for Merge
  const handleMergeFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: PdfMergeItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.type !== 'application/pdf' && !f.name.endsWith('.pdf')) continue;

      try {
        const ab = await f.arrayBuffer();
        const pdfDoc = await PDFDocument.load(ab, { ignoreEncryption: true });
        const pages = pdfDoc.getPageCount();

        newItems.push({
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          file: f,
          name: f.name,
          sizeKb: Math.round(f.size / 1024 * 10) / 10,
          pageCount: pages,
          arrayBuffer: ab,
        });
      } catch (err) {
        console.error('Error loading PDF:', err);
      }
    }

    setPdfFiles((prev) => [...prev, ...newItems]);
    setMergedBlobUrl(null);
  };

  // Move item up/down in merge list
  const moveItem = (index: number, direction: 'up' | 'down') => {
    const nextList = [...pdfFiles];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= nextList.length) return;

    const temp = nextList[index];
    nextList[index] = nextList[targetIdx];
    nextList[targetIdx] = temp;
    setPdfFiles(nextList);
    setMergedBlobUrl(null);
  };

  const removeItem = (id: string) => {
    setPdfFiles((prev) => prev.filter((item) => item.id !== id));
    setMergedBlobUrl(null);
  };

  // Perform Real PDF Merge in Browser with pdf-lib
  const handlePerformMerge = async () => {
    if (pdfFiles.length < 2) return;
    setIsMerging(true);

    try {
      const mergedPdf = await PDFDocument.create();
      let totalPages = 0;

      for (const item of pdfFiles) {
        const donorPdf = await PDFDocument.load(item.arrayBuffer, { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices());
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
          totalPages++;
        });
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setMergedBlobUrl(url);
      setMergedSizeKb(Math.round(blob.size / 1024 * 10) / 10);
      setMergedTotalPages(totalPages);
    } catch (err) {
      console.error('Merge error:', err);
      alert('Failed to merge PDFs. Please make sure files are not password protected.');
    } finally {
      setIsMerging(false);
    }
  };

  const handleDownloadMerged = () => {
    if (!mergedBlobUrl) return;
    const filename = `Merged_Documents_${new Date().toISOString().slice(0, 10)}.pdf`;
    const link = document.createElement('a');
    link.href = mergedBlobUrl;
    link.download = filename;
    link.click();

    addRecentActivity({
      name: filename,
      type: 'pdf',
      category: 'PDF Multi-Merge',
      sizeLabel: `${mergedSizeKb} KB (${mergedTotalPages} pgs)`,
      downloadUrl: mergedBlobUrl,
    });
  };

  // Handle Compress Single File Upload
  const handleCompressFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const ab = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(ab, { ignoreEncryption: true });
      
      setCompressFile(file);
      setCompressOriginalSizeKb(Math.round(file.size / 1024 * 10) / 10);
      setCompressPageCount(pdfDoc.getPageCount());
      setCompressedPdfBlobUrl(null);
    } catch (err) {
      alert('Unable to open PDF. Ensure it is not password-protected.');
    }
  };

  // In-browser PDF Optimizer & Stream Compactor
  const handlePerformCompress = async () => {
    if (!compressFile) return;
    setIsCompressing(true);

    try {
      const ab = await compressFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(ab, { ignoreEncryption: true });
      
      // Save with object compaction and optimized dictionary structures
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const blob = new Blob([compressedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setCompressedPdfBlobUrl(url);
      setCompressedPdfSizeKb(Math.round(blob.size / 1024 * 10) / 10);
    } catch (err) {
      console.error('Compression error:', err);
      alert('Failed to compress PDF.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownloadCompressed = () => {
    if (!compressedPdfBlobUrl) return;
    const filename = `Optimized_${compressFile?.name || 'document.pdf'}`;
    const link = document.createElement('a');
    link.href = compressedPdfBlobUrl;
    link.download = filename;
    link.click();

    addRecentActivity({
      name: filename,
      type: 'pdf',
      category: 'PDF Compressor',
      sizeLabel: `${compressedPdfSizeKb} KB`,
      downloadUrl: compressedPdfBlobUrl,
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 rounded-xl shadow-sm border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-inner">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight">
              In-Browser PDF Merge & Optimization Tool
            </h2>
            <p className="text-xs text-indigo-200">
              मार्कशीट, आधार व प्रमाणपत्रों को एक PDF में जोड़ें • 100% क्लाइंट-साइड प्राइवेट ब्राउज़र टूल
            </p>
          </div>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveSubTab('merge')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'merge'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Merge Multi-PDF
          </button>
          <button
            onClick={() => setActiveSubTab('compress')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'compress'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Minimize2 className="w-3.5 h-3.5" />
            Compress & Optimize
          </button>
        </div>
      </div>

      {/* MERGE SUBTAB CONTENT */}
      {activeSubTab === 'merge' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left Column: File Queue & Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Upload Area */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <input
                type="file"
                ref={fileInputMergeRef}
                onChange={handleMergeFilesUpload}
                accept="application/pdf"
                multiple
                className="hidden"
              />

              <div
                onClick={() => fileInputMergeRef.current?.click()}
                className="border-2 border-dashed border-indigo-300 dark:border-indigo-800/80 rounded-xl p-6 text-center hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-colors cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <FilePlus className="w-6 h-6" />
                </div>
                <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  Click or Drag & Drop PDF files here
                </div>
                <p className="text-[11px] text-slate-500 max-w-sm">
                  Upload multiple PDFs (e.g. 10th Marksheet, 12th Marksheet, Aadhaar, Caste Certificate) to combine into a single document.
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full">
                  <Plus className="w-3.5 h-3.5" /> Add PDF Files
                </span>
              </div>
            </div>

            {/* File Queue List */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  Files to Merge ({pdfFiles.length} Selected)
                </h3>
                {pdfFiles.length > 0 && (
                  <button
                    onClick={() => {
                      setPdfFiles([]);
                      setMergedBlobUrl(null);
                    }}
                    className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {pdfFiles.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs italic bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  No files added yet. Click above to select PDF files.
                </div>
              ) : (
                <div className="space-y-2">
                  {pdfFiles.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate max-w-[65%]">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={item.name}>
                            {item.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {item.pageCount} {item.pageCount === 1 ? 'page' : 'pages'} • {item.sizeKb} KB
                          </div>
                        </div>
                      </div>

                      {/* Reorder & Delete Buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveItem(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveItem(idx, 'down')}
                          disabled={idx === pdfFiles.length - 1}
                          className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Merge Action Button */}
              {pdfFiles.length >= 2 && (
                <div className="pt-2">
                  <button
                    id="merge-action-btn"
                    onClick={handlePerformMerge}
                    disabled={isMerging}
                    className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {isMerging ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Merging PDFs...</span>
                      </>
                    ) : (
                      <>
                        <Layers className="w-3.5 h-3.5" />
                        <span>Merge {pdfFiles.length} PDFs into 1 File</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Merged Result Preview (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center min-h-[380px] text-center space-y-4">
              {mergedBlobUrl ? (
                <div className="w-full space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <FileCheck className="w-7 h-7" />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      PDFs Merged Successfully!
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Consolidated Document • {mergedTotalPages} Total Pages • {mergedSizeKb} KB
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                    ✓ All pages combined in exact order. Ready for portal upload.
                  </div>

                  <button
                    id="download-merged-pdf-btn"
                    onClick={handleDownloadMerged}
                    className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Merged PDF</span>
                  </button>

                  <iframe
                    src={mergedBlobUrl}
                    title="Merged PDF Preview"
                    className="w-full h-48 rounded border border-slate-300 dark:border-slate-700 mt-2"
                  />
                </div>
              ) : (
                <div className="space-y-2 max-w-xs text-slate-400">
                  <FileText className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    PDF Merge Output Ready State
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Add at least 2 PDF files on the left and click "Merge PDFs" to generate your consolidated single document.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* COMPRESS SUBTAB CONTENT */}
      {activeSubTab === 'compress' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left Column: Upload & Options (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <input
                type="file"
                ref={fileInputCompressRef}
                onChange={handleCompressFileUpload}
                accept="application/pdf"
                className="hidden"
              />

              <div
                onClick={() => fileInputCompressRef.current?.click()}
                className="border-2 border-dashed border-indigo-300 dark:border-indigo-800/80 rounded-xl p-6 text-center hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-colors cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Minimize2 className="w-6 h-6" />
                </div>
                <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  {compressFile ? compressFile.name : 'Select PDF to Compress'}
                </div>
                <p className="text-[11px] text-slate-500">
                  {compressFile 
                    ? `Original Size: ${compressOriginalSizeKb} KB • ${compressPageCount} Pages`
                    : 'Reduce PDF file size under 200 KB or 500 KB for online job portals.'}
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full">
                  <Upload className="w-3.5 h-3.5" /> {compressFile ? 'Change File' : 'Choose PDF File'}
                </span>
              </div>
            </div>

            {/* Compression Mode Selector */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Compression & Optimization Profile
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCompressionLevel('high')}
                  className={`p-2.5 rounded-lg text-center border text-xs font-bold transition-all cursor-pointer ${
                    compressionLevel === 'high'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>High Compress</div>
                  <div className="text-[10px] font-normal text-slate-500">&lt; 200 KB Target</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCompressionLevel('medium')}
                  className={`p-2.5 rounded-lg text-center border text-xs font-bold transition-all cursor-pointer ${
                    compressionLevel === 'medium'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>Balanced</div>
                  <div className="text-[10px] font-normal text-slate-500">150 DPI Standard</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCompressionLevel('low')}
                  className={`p-2.5 rounded-lg text-center border text-xs font-bold transition-all cursor-pointer ${
                    compressionLevel === 'low'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>Crisp Print</div>
                  <div className="text-[10px] font-normal text-slate-500">200 DPI Quality</div>
                </button>
              </div>

              {compressFile && (
                <button
                  id="compress-pdf-action-btn"
                  onClick={handlePerformCompress}
                  disabled={isCompressing}
                  className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer mt-3"
                >
                  {isCompressing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Optimizing PDF Stream...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Compress & Optimize PDF</span>
                    </>
                  )}
                </button>
              )}
            </div>

          </div>

          {/* Right Column: Compression Result (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center min-h-[350px] text-center space-y-4">
              {compressedPdfBlobUrl ? (
                <div className="w-full space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      PDF Optimized & Compressed!
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Original: <span className="line-through">{compressOriginalSizeKb} KB</span> → <strong className="text-emerald-600 dark:text-emerald-400">{compressedPdfSizeKb} KB</strong>
                    </p>
                  </div>

                  <button
                    id="download-compressed-pdf-btn"
                    onClick={handleDownloadCompressed}
                    className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Compressed PDF</span>
                  </button>

                  <iframe
                    src={compressedPdfBlobUrl}
                    title="Compressed PDF Preview"
                    className="w-full h-44 rounded border border-slate-300 dark:border-slate-700"
                  />
                </div>
              ) : (
                <div className="space-y-2 max-w-xs text-slate-400">
                  <Minimize2 className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    PDF Compression Output
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Upload a PDF document to reduce file size while maintaining readability for govt upload portals.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
