import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Printer,
  Download,
  X,
  Layers,
  RotateCcw,
  Sliders,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  Scissors,
  Eye,
  Sparkles,
  Calendar,
  Type,
  FileDown,
  Grid,
  Square,
  LayoutGrid
} from 'lucide-react';
import { jsPDF } from 'jspdf';

export type A4LayoutType = 
  | 'single_fit' 
  | 'single_fill'
  | 'passport_35x45'
  | 'stamp_25x35'
  | 'photo_4x6'
  | 'photo_5x7'
  | 'half_page'
  | 'grid_32'
  | 'grid_24'
  | 'grid_16'
  | 'grid_8'
  | 'grid_6'
  | 'grid_4';

export interface A4PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  title?: string;
  defaultLayout?: A4LayoutType;
  initialCandidateName?: string;
  initialPhotoDate?: string;
}

export const A4PrintPreviewModal: React.FC<A4PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  title = 'A4 Sheet Print Preview',
  defaultLayout = 'grid_32',
  initialCandidateName = '',
  initialPhotoDate = new Date().toISOString().slice(0, 10),
}) => {
  // Layout & Sheet State
  const [layout, setLayout] = useState<A4LayoutType>(defaultLayout);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [marginMm, setMarginMm] = useState<number>(10); // 0, 5, 10, 15, 20 mm
  const [zoomLevel, setZoomLevel] = useState<number>(100); // 60%, 80%, 100%, 120%

  // Finishing & Cut Marks
  const [showCutLines, setShowCutLines] = useState<boolean>(true);
  const [borderWidth, setBorderWidth] = useState<number>(1); // 0, 1, 2 px border
  const [showStudioHeader, setShowStudioHeader] = useState<boolean>(true);
  const [studioName, setStudioName] = useState<string>('CSC DIGITAL SEVA KENDRA • LIVE PRINT DESK');
  
  // Name & Date on Photo
  const [includeNameDate, setIncludeNameDate] = useState<boolean>(false);
  const [candidateName, setCandidateName] = useState<string>(initialCandidateName);
  const [photoDate, setPhotoDate] = useState<string>(initialPhotoDate);

  // Print Adjustments
  const [colorMode, setColorMode] = useState<'color' | 'grayscale' | 'high_contrast'>('color');
  const [brightness, setBrightness] = useState<number>(100); // 80 - 130%
  const [contrast, setContrast] = useState<number>(100); // 80 - 130%

  // Canvas Refs
  const sheetCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Sync default layout when opened
  useEffect(() => {
    if (isOpen) {
      setLayout(defaultLayout);
    }
  }, [isOpen, defaultLayout]);

  // High-Resolution 300 DPI A4 Canvas Render Pipeline
  // Standard A4 at 300 DPI: 2480 × 3508 pixels (210mm × 297mm)
  const renderA4Sheet = useCallback(async () => {
    if (!sheetCanvasRef.current || !imageSrc) return;

    const canvas = sheetCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    setIsGenerating(true);

    const isPortrait = orientation === 'portrait';
    const a4W = isPortrait ? 2480 : 3508;
    const a4H = isPortrait ? 3508 : 2480;

    canvas.width = a4W;
    canvas.height = a4H;

    // 1. Draw Clean White Paper Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, a4W, a4H);

    // Convert Millimeters to Pixels at 300 DPI: (mm / 25.4) * 300
    const mmToPx = 300 / 25.4; // approx 11.811 px per mm
    const marginPx = Math.round(marginMm * mmToPx);

    // Printable Bounds
    const printAreaX = marginPx;
    const printAreaY = marginPx;
    const printAreaW = a4W - marginPx * 2;
    const printAreaH = a4H - marginPx * 2;

    // Load Source Image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load preview image'));
      img.src = imageSrc;
    });

    // Helper: Create single processed photo canvas (with filters, border, and name/date stamp)
    const createSinglePhotoCanvas = (targetW: number, targetH: number): HTMLCanvasElement => {
      const pCanvas = document.createElement('canvas');
      pCanvas.width = targetW;
      pCanvas.height = targetH;
      const pCtx = pCanvas.getContext('2d')!;

      // Background fill behind photo
      pCtx.fillStyle = '#FFFFFF';
      pCtx.fillRect(0, 0, targetW, targetH);

      // Save context for filter rendering
      pCtx.save();

      // Apply brightness/contrast
      let filterString = `brightness(${brightness}%) contrast(${contrast}%)`;
      if (colorMode === 'grayscale') {
        filterString += ' grayscale(100%)';
      } else if (colorMode === 'high_contrast') {
        filterString += ' grayscale(100%) contrast(160%)';
      }
      pCtx.filter = filterString;

      // Draw photo fitted to dimensions
      pCtx.imageSmoothingEnabled = true;
      pCtx.imageSmoothingQuality = 'high';
      pCtx.drawImage(img, 0, 0, targetW, targetH);

      pCtx.restore();

      // Name & Date Stamp at bottom (if enabled)
      if (includeNameDate && (candidateName || photoDate)) {
        const stampH = Math.max(36, Math.round(targetH * 0.13));
        pCtx.fillStyle = '#FFFFFF';
        pCtx.fillRect(0, targetH - stampH, targetW, stampH);

        pCtx.strokeStyle = '#000000';
        pCtx.lineWidth = 1;
        pCtx.beginPath();
        pCtx.moveTo(0, targetH - stampH);
        pCtx.lineTo(targetW, targetH - stampH);
        pCtx.stroke();

        pCtx.fillStyle = '#000000';
        pCtx.textAlign = 'center';

        if (candidateName && photoDate) {
          const nameFontSize = Math.max(12, Math.round(stampH * 0.38));
          const dateFontSize = Math.max(10, Math.round(stampH * 0.30));

          pCtx.font = `bold ${nameFontSize}px sans-serif`;
          pCtx.fillText(candidateName.toUpperCase(), targetW / 2, targetH - stampH + Math.round(stampH * 0.44));

          pCtx.font = `600 ${dateFontSize}px sans-serif`;
          pCtx.fillText(`DOP: ${photoDate}`, targetW / 2, targetH - Math.round(stampH * 0.16));
        } else if (candidateName) {
          const fontSize = Math.max(13, Math.round(stampH * 0.48));
          pCtx.font = `bold ${fontSize}px sans-serif`;
          pCtx.fillText(candidateName.toUpperCase(), targetW / 2, targetH - Math.round(stampH * 0.30));
        } else if (photoDate) {
          const fontSize = Math.max(12, Math.round(stampH * 0.44));
          pCtx.font = `600 ${fontSize}px sans-serif`;
          pCtx.fillText(`DOP: ${photoDate}`, targetW / 2, targetH - Math.round(stampH * 0.30));
        }
      }

      // Border outline
      if (borderWidth > 0) {
        pCtx.strokeStyle = '#000000';
        pCtx.lineWidth = borderWidth * 2;
        pCtx.strokeRect(0, 0, targetW, targetH);
      }

      return pCanvas;
    };

    // Helper: Draw cutting marks around a bounding box
    const drawCutMarks = (x: number, y: number, w: number, h: number) => {
      if (!showCutLines) return;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);

      const markLen = 16;

      // Top-Left Cross
      ctx.beginPath();
      ctx.moveTo(x - markLen, y);
      ctx.lineTo(x + w + markLen, y);
      ctx.stroke();

      // Bottom-Left Cross
      ctx.beginPath();
      ctx.moveTo(x - markLen, y + h);
      ctx.lineTo(x + w + markLen, y + h);
      ctx.stroke();

      // Top-Left Vertical
      ctx.beginPath();
      ctx.moveTo(x, y - markLen);
      ctx.lineTo(x, y + h + markLen);
      ctx.stroke();

      // Top-Right Vertical
      ctx.beginPath();
      ctx.moveTo(x + w, y - markLen);
      ctx.lineTo(x + w, y + h + markLen);
      ctx.stroke();

      ctx.setLineDash([]);
    };

    // 2. RENDER LAYOUTS
    if (layout === 'single_fit') {
      // Fit single photo within printable area maintaining aspect ratio
      const imgRatio = (img.naturalWidth || img.width) / (img.naturalHeight || img.height);
      let drawW = printAreaW;
      let drawH = Math.round(drawW / imgRatio);

      if (drawH > printAreaH) {
        drawH = printAreaH;
        drawW = Math.round(drawH * imgRatio);
      }

      const posX = printAreaX + Math.round((printAreaW - drawW) / 2);
      const posY = printAreaY + Math.round((printAreaH - drawH) / 2);

      const singleCanvas = createSinglePhotoCanvas(drawW, drawH);
      ctx.drawImage(singleCanvas, posX, posY);
      drawCutMarks(posX, posY, drawW, drawH);

    } else if (layout === 'single_fill') {
      // Fill full printable area
      const singleCanvas = createSinglePhotoCanvas(printAreaW, printAreaH);
      ctx.drawImage(singleCanvas, printAreaX, printAreaY);

    } else if (layout === 'passport_35x45') {
      // Indian standard 3.5cm x 4.5cm centered on A4 sheet
      const photoW = Math.round(35 * mmToPx); // approx 413px
      const photoH = Math.round(45 * mmToPx); // approx 531px
      const posX = Math.round((a4W - photoW) / 2);
      const posY = Math.round((a4H - photoH) / 2);

      const singleCanvas = createSinglePhotoCanvas(photoW, photoH);
      ctx.drawImage(singleCanvas, posX, posY);
      drawCutMarks(posX, posY, photoW, photoH);

    } else if (layout === 'stamp_25x35') {
      // Stamp size: 2.5cm x 3.5cm centered
      const photoW = Math.round(25 * mmToPx);
      const photoH = Math.round(35 * mmToPx);
      const posX = Math.round((a4W - photoW) / 2);
      const posY = Math.round((a4H - photoH) / 2);

      const singleCanvas = createSinglePhotoCanvas(photoW, photoH);
      ctx.drawImage(singleCanvas, posX, posY);
      drawCutMarks(posX, posY, photoW, photoH);

    } else if (layout === 'photo_4x6') {
      // 4x6 inch photo centered on A4
      const photoW = Math.round(4 * 300); // 1200px
      const photoH = Math.round(6 * 300); // 1800px
      const posX = Math.round((a4W - photoW) / 2);
      const posY = Math.round((a4H - photoH) / 2);

      const singleCanvas = createSinglePhotoCanvas(photoW, photoH);
      ctx.drawImage(singleCanvas, posX, posY);
      drawCutMarks(posX, posY, photoW, photoH);

    } else if (layout === 'photo_5x7') {
      // 5x7 inch photo centered on A4
      const photoW = Math.round(5 * 300); // 1500px
      const photoH = Math.round(7 * 300); // 2100px
      const posX = Math.round((a4W - photoW) / 2);
      const posY = Math.round((a4H - photoH) / 2);

      const singleCanvas = createSinglePhotoCanvas(photoW, photoH);
      ctx.drawImage(singleCanvas, posX, posY);
      drawCutMarks(posX, posY, photoW, photoH);

    } else if (layout === 'half_page') {
      // A5 size (Half Page A4) centered
      const photoW = Math.round(a4W * 0.70);
      const photoH = Math.round(photoW * 1.414);
      const posX = Math.round((a4W - photoW) / 2);
      const posY = Math.round((a4H - photoH) / 2);

      const singleCanvas = createSinglePhotoCanvas(photoW, photoH);
      ctx.drawImage(singleCanvas, posX, posY);
      drawCutMarks(posX, posY, photoW, photoH);

    } else {
      // GRID LAYOUTS (Multi-Photo Matrix on A4 Sheet)
      let cols = 4;
      let rows = 8;
      let photoW = Math.round(35 * mmToPx); // 35mm
      let photoH = Math.round(45 * mmToPx); // 45mm

      if (layout === 'grid_32') {
        cols = 4;
        rows = 8;
        photoW = Math.round(35 * mmToPx);
        photoH = Math.round(45 * mmToPx);
      } else if (layout === 'grid_24') {
        cols = 4;
        rows = 6;
        photoW = Math.round(38 * mmToPx);
        photoH = Math.round(48 * mmToPx);
      } else if (layout === 'grid_16') {
        cols = 4;
        rows = 4;
        photoW = Math.round(42 * mmToPx);
        photoH = Math.round(54 * mmToPx);
      } else if (layout === 'grid_8') {
        cols = 2;
        rows = 4;
        photoW = Math.round(65 * mmToPx);
        photoH = Math.round(85 * mmToPx);
      } else if (layout === 'grid_6') {
        cols = 2;
        rows = 3;
        photoW = Math.round(85 * mmToPx);
        photoH = Math.round(110 * mmToPx);
      } else if (layout === 'grid_4') {
        cols = 2;
        rows = 2;
        photoW = Math.round(95 * mmToPx);
        photoH = Math.round(125 * mmToPx);
      }

      const totalPhotosW = cols * photoW;
      const totalPhotosH = rows * photoH;

      const gapX = Math.max(16, Math.floor((printAreaW - totalPhotosW) / (cols + 1)));
      const gapY = Math.max(16, Math.floor((printAreaH - totalPhotosH) / (rows + 1)));

      const singleCanvas = createSinglePhotoCanvas(photoW, photoH);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const posX = printAreaX + gapX + c * (photoW + gapX);
          const posY = printAreaY + gapY + r * (photoH + gapY);

          ctx.drawImage(singleCanvas, posX, posY);
          drawCutMarks(posX, posY, photoW, photoH);
        }
      }
    }

    // 3. Top Margin Studio Header Branding
    if (showStudioHeader) {
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'left';
      const headerY = Math.max(30, Math.round(marginPx * 0.7));
      ctx.fillText(studioName, printAreaX, headerY);

      ctx.textAlign = 'right';
      const dateStr = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      ctx.fillText(`A4 Sheet 300 DPI • ${dateStr}`, a4W - marginPx, headerY);
    }

    // 4. Subtle Millimeter Margin Guideline Border on Desk Canvas
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.strokeRect(printAreaX, printAreaY, printAreaW, printAreaH);
    ctx.setLineDash([]);

    setIsGenerating(false);
  }, [
    imageSrc,
    layout,
    orientation,
    marginMm,
    showCutLines,
    borderWidth,
    showStudioHeader,
    studioName,
    includeNameDate,
    candidateName,
    photoDate,
    colorMode,
    brightness,
    contrast,
  ]);

  // Trigger render on state changes
  useEffect(() => {
    if (isOpen && imageSrc) {
      const timer = setTimeout(() => {
        renderA4Sheet();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, imageSrc, renderA4Sheet]);

  // 1. DIRECT BROWSER PRINT TRIGGER
  const handlePrintToSystem = () => {
    if (!sheetCanvasRef.current) return;
    const dataUrl = sheetCanvasRef.current.toDataURL('image/jpeg', 0.96);

    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('Please allow popups to open the system print dialog.');
      return;
    }

    const isPortrait = orientation === 'portrait';

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - CSC Studio Pro</title>
          <style>
            @page {
              size: ${isPortrait ? 'A4 portrait' : 'A4 landscape'};
              margin: 0;
            }
            *, *::before, *::after {
              box-sizing: border-box;
            }
            body, html {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              background: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }
            img {
              width: 100%;
              height: 100%;
              object-fit: contain;
              display: block;
              margin: 0 auto;
            }
            @media print {
              body, html {
                margin: 0;
                padding: 0;
                background: transparent;
              }
              img {
                width: 100vw;
                height: 100vh;
                object-fit: contain;
              }
            }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="setTimeout(() => { window.print(); window.close(); }, 200);" />
        </body>
      </html>
    `);
    printWin.document.close();
  };

  // 2. DOWNLOAD HIGH-RES A4 PDF (300 DPI)
  const handleDownloadPdf = () => {
    if (!sheetCanvasRef.current) return;
    const isPortrait = orientation === 'portrait';
    const pdf = new jsPDF({
      orientation: isPortrait ? 'portrait' : 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const imgData = sheetCanvasRef.current.toDataURL('image/jpeg', 0.95);
    const pdfW = isPortrait ? 210 : 297;
    const pdfH = isPortrait ? 297 : 210;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH, undefined, 'FAST');
    pdf.save(`a4_print_sheet_${layout}_${orientation}.pdf`);
  };

  // 3. DOWNLOAD 300 DPI MASTER IMAGE
  const handleDownloadImage = () => {
    if (!sheetCanvasRef.current) return;
    const link = document.createElement('a');
    link.download = `a4_sheet_300dpi_${layout}_${orientation}.jpg`;
    link.href = sheetCanvasRef.current.toDataURL('image/jpeg', 0.96);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-6xl w-full max-h-[96vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* ========================================================================= */}
        {/* TOP MODAL HEADER */}
        {/* ========================================================================= */}
        <div className="bg-slate-900 text-white p-4 sm:px-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 uppercase">
                  A4 PRINT PREVIEW
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  300 DPI Studio Output
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {title} (A4 शीट प्रिंट पूर्वावलोकन)
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintToSystem}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Commit & Print (Ctrl+P)</span>
              <span className="sm:hidden">Print</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODAL BODY (TWO COLUMNS: PREVIEW STAGE + CONTROLS PANEL) */}
        {/* ========================================================================= */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden min-h-0">
          
          {/* LEFT/CENTER: A4 SHEET PREVIEW DESK (7 COLS) */}
          <div className="lg:col-span-7 bg-slate-950/90 p-4 sm:p-6 flex flex-col items-center justify-center relative overflow-y-auto border-r border-slate-200 dark:border-slate-800">
            
            {/* Stage Zoom & Mode Bar */}
            <div className="w-full flex items-center justify-between gap-2 mb-3 text-xs text-slate-400 z-10">
              <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800">
                <span className="font-mono text-[11px] font-bold text-purple-400">
                  {orientation === 'portrait' ? 'A4 Portrait (210×297 mm)' : 'A4 Landscape (297×210 mm)'}
                </span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-[10px] text-slate-400">2480 × 3508 px (300 DPI)</span>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setZoomLevel((prev) => Math.max(50, prev - 15))}
                  className="p-1 hover:bg-slate-800 rounded text-slate-300 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-1.5 font-mono text-[10px] font-bold text-white">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((prev) => Math.min(130, prev + 15))}
                  className="p-1 hover:bg-slate-800 rounded text-slate-300 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(100)}
                  className="px-1.5 py-0.5 text-[9px] bg-slate-800 hover:bg-slate-700 text-purple-300 rounded font-bold cursor-pointer"
                >
                  Fit
                </button>
              </div>
            </div>

            {/* Simulated Desk Stage with True A4 Sheet Shadow */}
            <div className="w-full flex-1 flex items-center justify-center p-2">
              <div 
                className="relative bg-white shadow-2xl rounded-xs transition-transform duration-150 origin-center border border-slate-200"
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  maxWidth: orientation === 'portrait' ? '360px' : '480px',
                  width: '100%',
                }}
              >
                {/* Visual A4 Aspect Ratio Container (1 : 1.4142) */}
                <div 
                  className="w-full relative overflow-hidden"
                  style={{
                    paddingTop: orientation === 'portrait' ? '141.42%' : '70.71%',
                  }}
                >
                  <canvas
                    ref={sheetCanvasRef}
                    className="absolute inset-0 w-full h-full object-contain"
                  />

                  {/* Corner Page Fold Accent */}
                  <div className="absolute top-0 right-0 w-4 h-4 bg-gradient-to-bl from-slate-300 to-transparent pointer-events-none opacity-40"></div>
                </div>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="w-full flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800/80">
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Exact physical print coordinates preview</span>
              </span>
              <span>Ready for Laser / Inkjet Studio Print</span>
            </div>

          </div>

          {/* RIGHT COLUMN: CONTROLS & PRINT SETTINGS (5 COLS) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
            
            {/* 1. LAYOUT PRESETS ON A4 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Grid className="w-3.5 h-3.5 text-purple-600" />
                  <span>A4 Sheet Print Layout (लेआउट चुनें)</span>
                </label>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                  Preset Options
                </span>
              </div>

              {/* Multi-Photo Passport Grids on A4 */}
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Multi-Photo Passport Grids:
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'grid_32' as const, label: '32 Photos', sub: '4×8 Grid Full A4' },
                  { id: 'grid_24' as const, label: '24 Photos', sub: '4×6 Grid' },
                  { id: 'grid_16' as const, label: '16 Photos', sub: '4×4 Grid' },
                  { id: 'grid_8' as const, label: '8 Photos', sub: '2×4 Grid' },
                  { id: 'grid_6' as const, label: '6 Postcards', sub: '2×3 Grid' },
                  { id: 'grid_4' as const, label: '4 Photos', sub: '2×2 Grid' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setLayout(item.id)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      layout === item.id
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-purple-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <p className="font-bold text-xs">{item.label}</p>
                    <p className="text-[9px] text-slate-400">{item.sub}</p>
                  </button>
                ))}
              </div>

              {/* Single Photo / Document Layouts */}
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pt-1">
                Single Photo / Certificate Sizing:
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'single_fit' as const, label: 'Fit to Page', sub: 'Safe Margins' },
                  { id: 'single_fill' as const, label: 'Full Bleed', sub: 'Fill Whole A4' },
                  { id: 'passport_35x45' as const, label: '1× Passport', sub: '3.5×4.5 cm' },
                  { id: 'photo_4x6' as const, label: '4×6 Photo', sub: '10×15 cm' },
                  { id: 'photo_5x7' as const, label: '5×7 Photo', sub: '13×18 cm' },
                  { id: 'half_page' as const, label: 'Half Page', sub: 'A5 on A4' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setLayout(item.id)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      layout === item.id
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-purple-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <p className="font-bold text-xs">{item.label}</p>
                    <p className="text-[9px] text-slate-400">{item.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. ORIENTATION & PAGE MARGINS */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              {/* Orientation */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Sheet Orientation:
                </label>
                <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setOrientation('portrait')}
                    className={`py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                      orientation === 'portrait'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Portrait (लंबवत)
                  </button>
                  <button
                    onClick={() => setOrientation('landscape')}
                    className={`py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                      orientation === 'landscape'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Landscape
                  </button>
                </div>
              </div>

              {/* Margins */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Paper Margin: <span className="font-mono text-purple-600 font-bold">{marginMm}mm</span>
                </label>
                <div className="grid grid-cols-4 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  {[0, 5, 10, 15].map((mm) => (
                    <button
                      key={mm}
                      onClick={() => setMarginMm(mm)}
                      className={`py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                        marginMm === mm
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {mm === 0 ? 'None' : `${mm}mm`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. FINISHING CONTROLS (CUT LINES, BORDERS, STUDIO HEADER) */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print Guides & Studio Marks</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Cut Lines Toggle */}
                <label className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCutLines}
                    onChange={(e) => setShowCutLines(e.target.checked)}
                    className="accent-purple-600 rounded"
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Scissors Cut Marks</span>
                </label>

                {/* Border Width */}
                <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Photo Border:</span>
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((b) => (
                      <button
                        key={b}
                        onClick={() => setBorderWidth(b)}
                        className={`w-6 h-6 rounded text-xs font-bold cursor-pointer ${
                          borderWidth === b
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                        }`}
                      >
                        {b === 0 ? '0' : `${b}px`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Studio Header Stamp */}
              <div className="space-y-1.5 pt-1">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Include Studio Branding on Margin:
                  </span>
                  <input
                    type="checkbox"
                    checked={showStudioHeader}
                    onChange={(e) => setShowStudioHeader(e.target.checked)}
                    className="accent-purple-600 rounded"
                  />
                </label>
                {showStudioHeader && (
                  <input
                    type="text"
                    value={studioName}
                    onChange={(e) => setStudioName(e.target.value)}
                    placeholder="Enter CSC / Studio Name"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold"
                  />
                )}
              </div>
            </div>

            {/* 4. NAME & DATE STAMP (FOR SSC / GOVT JOBS) */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
              <label className="flex items-center justify-between cursor-pointer font-bold text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-purple-600" />
                  <span>Name & Date Stamp (SSC/Govt Exam)</span>
                </span>
                <input
                  type="checkbox"
                  checked={includeNameDate}
                  onChange={(e) => setIncludeNameDate(e.target.checked)}
                  className="accent-purple-600 rounded"
                />
              </label>

              {includeNameDate && (
                <div className="grid grid-cols-2 gap-2 pt-1 animate-fade-in">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Candidate Name</label>
                    <input
                      type="text"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      placeholder="e.g. RAHUL KUMAR"
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Date of Photo (DOP)</label>
                    <input
                      type="date"
                      value={photoDate}
                      onChange={(e) => setPhotoDate(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 5. COLOR & TONAL ADJUSTMENTS FOR PRINTER */}
            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="font-bold">Color Profile & Brightness:</span>
                <div className="flex items-center gap-1">
                  {(['color', 'grayscale', 'high_contrast'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setColorMode(mode)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                        colorMode === mode
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {mode === 'color' ? 'Color' : mode === 'grayscale' ? 'B&W' : 'High Contrast'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500">Lightness:</span>
                  <input
                    type="range"
                    min="80"
                    max="125"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500">Contrast:</span>
                  <input
                    type="range"
                    min="80"
                    max="125"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 6. PRIMARY ACTIONS (PRINT & EXPORT OPTIONS) */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <button
                onClick={handlePrintToSystem}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-500/20 cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Open System Print Dialog (Ctrl+P)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleDownloadPdf}
                  className="py-2.5 px-3 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download A4 PDF</span>
                </button>

                <button
                  onClick={handleDownloadImage}
                  className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-purple-500" />
                  <span>Download 300 DPI JPG</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
