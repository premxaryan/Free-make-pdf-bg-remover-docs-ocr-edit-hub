import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  Printer, 
  RefreshCw, 
  Sliders, 
  Layers, 
  Scissors, 
  Type, 
  Calendar, 
  Check, 
  Maximize2, 
  Sparkles, 
  FileImage,
  HelpCircle,
  Eye
} from 'lucide-react';
import { A4PrintPreviewModal } from '../A4PrintPreviewModal.tsx';
import { addRecentActivity } from '../../utils/recentActivity.ts';

export interface PassportPhotoMakerProps {
  initialImageSrc?: string | null;
}

export const PassportPhotoMaker: React.FC<PassportPhotoMakerProps> = ({ initialImageSrc }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(initialImageSrc || null);
  const [layout, setLayout] = useState<'4x6_8' | '4x6_4' | '4x6_6' | '4x6_12' | 'a4_32' | 'single'>('4x6_8');
  const [borderWidth, setBorderWidth] = useState<number>(1); // 0, 1, 2 px
  const [showCutLines, setShowCutLines] = useState<boolean>(true);
  const [includeNameDate, setIncludeNameDate] = useState<boolean>(false);
  const [candidateName, setCandidateName] = useState<string>('');
  const [photoDate, setPhotoDate] = useState<string>(new Date().toISOString().slice(0, 10));
  
  // Image Adjustment Controls
  const [zoom, setZoom] = useState<number>(1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  
  // Background Switcher State
  const [bgColorMode, setBgColorMode] = useState<'original' | 'white' | 'light_blue' | 'light_gray' | 'sky_blue'>('original');
  const [bgTolerance, setBgTolerance] = useState<number>(32);
  const [isBgProcessing, setIsBgProcessing] = useState<boolean>(false);

  // A4 Print Preview Modal State
  const [isA4ModalOpen, setIsA4ModalOpen] = useState<boolean>(false);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync initialImageSrc when changed
  useEffect(() => {
    if (initialImageSrc) {
      setImageSrc(initialImageSrc);
    }
  }, [initialImageSrc]);

  // Load sample default photo if none uploaded
  useEffect(() => {
    if (initialImageSrc) return;
    // Generate a clean default sample avatar canvas
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 413;
    sampleCanvas.height = 531;
    const ctx = sampleCanvas.getContext('2d');
    if (ctx) {
      // Clean gradient backdrop
      const grad = ctx.createLinearGradient(0, 0, 0, 531);
      grad.addColorStop(0, '#e2e8f0');
      grad.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 413, 531);

      // Subtle Head Silhouette Placeholder
      ctx.fillStyle = '#64748b';
      // Head circle
      ctx.beginPath();
      ctx.arc(206, 190, 85, 0, Math.PI * 2);
      ctx.fill();

      // Shoulders
      ctx.beginPath();
      ctx.ellipse(206, 420, 150, 120, 0, 0, Math.PI * 2);
      ctx.fill();

      // Text placeholder
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CLICK TO UPLOAD PHOTO', 206, 490);
      
      setImageSrc(sampleCanvas.toDataURL('image/jpeg'));
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        setImageSrc(ev.target.result);
        setZoom(1);
        setOffsetX(0);
        setOffsetY(0);
      }
    };
    reader.readAsDataURL(file);
  };

  // Render 300 DPI high resolution sheet
  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      // Standard 300 DPI measurements:
      // 4x6 inch paper = 1200 x 1800 px (or 1800 x 1200 px landscape)
      // Standard Indian passport photo: 3.5cm x 4.5cm = 413 x 531 px at 300 DPI
      
      let sheetW = 1800; // 6 inches
      let sheetH = 1200; // 4 inches
      let cols = 4;
      let rows = 2;

      if (layout === '4x6_8') {
        sheetW = 1800;
        sheetH = 1200;
        cols = 4;
        rows = 2;
      } else if (layout === '4x6_4') {
        sheetW = 1800;
        sheetH = 1200;
        cols = 2;
        rows = 2;
      } else if (layout === '4x6_6') {
        sheetW = 1800;
        sheetH = 1200;
        cols = 3;
        rows = 2;
      } else if (layout === '4x6_12') {
        sheetW = 1800;
        sheetH = 1200;
        cols = 4;
        rows = 3;
      } else if (layout === 'a4_32') {
        sheetW = 2480; // A4 300 DPI width
        sheetH = 3508; // A4 300 DPI height
        cols = 4;
        rows = 8;
      } else {
        // Single photo
        sheetW = 413;
        sheetH = 531;
        cols = 1;
        rows = 1;
      }

      canvas.width = sheetW;
      canvas.height = sheetH;

      // Pure white paper background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, sheetW, sheetH);

      // Create cropped single photo offscreen canvas
      const photoW = 413;
      const photoH = 531;
      const singleCanvas = document.createElement('canvas');
      singleCanvas.width = photoW;
      singleCanvas.height = photoH;
      const sCtx = singleCanvas.getContext('2d');

      if (sCtx) {
        // Apply White background boost if enabled
        sCtx.fillStyle = '#ffffff';
        sCtx.fillRect(0, 0, photoW, photoH);

        // Apply filters
        let filterStr = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
        sCtx.filter = filterStr;

        // Draw image centered with zoom & pan
        const baseAspect = img.width / img.height;
        const targetAspect = photoW / photoH;
        let drawW = photoW;
        let drawH = photoH;

        if (baseAspect > targetAspect) {
          drawH = photoH * zoom;
          drawW = drawH * baseAspect;
        } else {
          drawW = photoW * zoom;
          drawH = drawW / baseAspect;
        }

        const drawX = (photoW - drawW) / 2 + offsetX;
        const drawY = (photoH - drawH) / 2 + offsetY;

        sCtx.drawImage(img, drawX, drawY, drawW, drawH);
        sCtx.filter = 'none';

        // 1-Click Background Color Switcher (Pixel-Level Canvas Edge Replacement)
        if (bgColorMode !== 'original') {
          try {
            const imgData = sCtx.getImageData(0, 0, photoW, photoH);
            const data = imgData.data;
            
            // Sample the background backdrop color from top-left, top-right, and top margin corners
            const samplePoints = [
              [4, 4],
              [photoW - 5, 4],
              [Math.floor(photoW / 4), 4],
              [Math.floor((photoW * 3) / 4), 4],
              [4, Math.floor(photoH / 6)],
              [photoW - 5, Math.floor(photoH / 6)],
            ];

            let sumR = 0, sumG = 0, sumB = 0;
            samplePoints.forEach(([x, y]) => {
              const idx = (y * photoW + x) * 4;
              sumR += data[idx];
              sumG += data[idx + 1];
              sumB += data[idx + 2];
            });

            const bgR = sumR / samplePoints.length;
            const bgG = sumG / samplePoints.length;
            const bgB = sumB / samplePoints.length;

            // Target replacement colors
            let targetR = 255, targetG = 255, targetB = 255;
            if (bgColorMode === 'white') {
              targetR = 255; targetG = 255; targetB = 255;
            } else if (bgColorMode === 'light_blue') {
              targetR = 203; targetG = 227; targetB = 247; // #cbe3f7 Exam light blue
            } else if (bgColorMode === 'light_gray') {
              targetR = 241; targetG = 245; targetB = 249; // #f1f5f9 Light gray
            } else if (bgColorMode === 'sky_blue') {
              targetR = 186; targetG = 230; targetB = 253; // #bae6fd Sky blue
            }

            const tolSq = (bgTolerance * 2.2) ** 2;

            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];

              // Calculate Euclidean color distance from sampled background
              const distSq = (r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2;

              if (distSq < tolSq) {
                // Soft alpha feathering at edge boundary
                const factor = Math.min(1, Math.max(0, 1 - (distSq / tolSq) ** 0.5));
                data[i] = Math.round(r * (1 - factor) + targetR * factor);
                data[i + 1] = Math.round(g * (1 - factor) + targetG * factor);
                data[i + 2] = Math.round(b * (1 - factor) + targetB * factor);
              }
            }

            sCtx.putImageData(imgData, 0, 0);
          } catch (bgErr) {
            console.warn('Canvas background replacement notice:', bgErr);
          }
        }

        // Name & Date Stamp at bottom (SSC/Govt job requirement)
        if (includeNameDate && (candidateName || photoDate)) {
          const stampHeight = 64;
          sCtx.fillStyle = '#ffffff';
          sCtx.fillRect(0, photoH - stampHeight, photoW, stampHeight);
          
          sCtx.strokeStyle = '#000000';
          sCtx.lineWidth = 1;
          sCtx.beginPath();
          sCtx.moveTo(0, photoH - stampHeight);
          sCtx.lineTo(photoW, photoH - stampHeight);
          sCtx.stroke();

          sCtx.fillStyle = '#000000';
          sCtx.textAlign = 'center';
          
          if (candidateName && photoDate) {
            sCtx.font = 'bold 20px sans-serif';
            sCtx.fillText(candidateName.toUpperCase(), photoW / 2, photoH - stampHeight + 24);
            sCtx.font = '600 16px sans-serif';
            sCtx.fillText(`DOP: ${photoDate}`, photoW / 2, photoH - stampHeight + 48);
          } else if (candidateName) {
            sCtx.font = 'bold 22px sans-serif';
            sCtx.fillText(candidateName.toUpperCase(), photoW / 2, photoH - 24);
          } else if (photoDate) {
            sCtx.font = 'bold 20px sans-serif';
            sCtx.fillText(`DOP: ${photoDate}`, photoW / 2, photoH - 24);
          }
        }

        // Border
        if (borderWidth > 0) {
          sCtx.strokeStyle = '#000000';
          sCtx.lineWidth = borderWidth * 2;
          sCtx.strokeRect(0, 0, photoW, photoH);
        }
      }

      // Arrange grid on main sheet
      if (layout === 'single') {
        ctx.drawImage(singleCanvas, 0, 0);
      } else {
        const totalPhotosW = cols * photoW;
        const totalPhotosH = rows * photoH;
        
        const gapX = Math.max(20, Math.floor((sheetW - totalPhotosW) / (cols + 1)));
        const gapY = Math.max(20, Math.floor((sheetH - totalPhotosH) / (rows + 1)));

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const posX = gapX + c * (photoW + gapX);
            const posY = gapY + r * (photoH + gapY);

            ctx.drawImage(singleCanvas, posX, posY);

            // Cut Guidelines
            if (showCutLines) {
              ctx.strokeStyle = '#94a3b8';
              ctx.lineWidth = 1;
              ctx.setLineDash([4, 4]);

              // Top & bottom cross marks
              ctx.beginPath();
              ctx.moveTo(posX - 8, posY);
              ctx.lineTo(posX + photoW + 8, posY);
              ctx.stroke();

              ctx.beginPath();
              ctx.moveTo(posX - 8, posY + photoH);
              ctx.lineTo(posX + photoW + 8, posY + photoH);
              ctx.stroke();

              // Left & right cross marks
              ctx.beginPath();
              ctx.moveTo(posX, posY - 8);
              ctx.lineTo(posX, posY + photoH + 8);
              ctx.stroke();

              ctx.beginPath();
              ctx.moveTo(posX + photoW, posY - 8);
              ctx.lineTo(posX + photoW, posY + photoH + 8);
              ctx.stroke();

              ctx.setLineDash([]);
            }
          }
        }

        // Print header mark
        ctx.fillStyle = '#64748b';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`4x6 Photo Sheet (300 DPI) • 8 Passport Photos (3.5x4.5cm) • CSC Studio Pro`, 30, 20);
      }
    };
  }, [
    imageSrc, 
    layout, 
    borderWidth, 
    showCutLines, 
    includeNameDate, 
    candidateName, 
    photoDate, 
    zoom, 
    offsetX, 
    offsetY, 
    brightness, 
    contrast, 
    saturation, 
    bgColorMode,
    bgTolerance
  ]);

  // Pan interaction
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownloadImage = () => {
    if (!canvasRef.current) return;
    const filename = `passport_photos_${layout}_300dpi.jpg`;
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();

    addRecentActivity({
      name: filename,
      type: 'image',
      category: `Passport Sheet (${layout.replace('_', ' ').toUpperCase()})`,
      sizeLabel: '300 DPI Ready',
      downloadUrl: dataUrl,
      previewUrl: dataUrl
    });
  };

  const handlePrintSheet = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.95);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print');
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Passport Photo Print (4x6 300 DPI)</title>
          <style>
            @page {
              size: ${layout === 'a4_32' ? 'A4 portrait' : '6in 4in landscape'};
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #fff;
            }
            img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print();window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 rounded-xl shadow-sm border border-blue-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-inner">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight">
              Live Passport Photo Grid Maker (4x6 Photo Paper)
            </h2>
            <p className="text-xs text-blue-200">
              पासपोर्ट साइज फोटो शीट (3.5x4.5cm) • 8 फोटो 4x6 शीट पर • 300 DPI HD प्रिंट व कट लाइन्स
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-blue-900 font-bold text-xs shadow-sm hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Photo (फोटो अपलोड करें)
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls, Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Settings & Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Layout Selector */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>Photo Sheet Paper Size</span>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-normal">Standard: 4x6 Inch</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLayout('4x6_8')}
                className={`p-2.5 rounded-lg text-left border text-xs font-semibold transition-all cursor-pointer ${
                  layout === '4x6_8'
                    ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>4x6 (8 Photos)</span>
                  {layout === '4x6_8' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">2 rows × 4 cols (Standard)</div>
              </button>

              <button
                type="button"
                onClick={() => setLayout('4x6_4')}
                className={`p-2.5 rounded-lg text-left border text-xs font-semibold transition-all cursor-pointer ${
                  layout === '4x6_4'
                    ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>4x6 (4 Photos)</span>
                  {layout === '4x6_4' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">2 rows × 2 cols (Spacious)</div>
              </button>

              <button
                type="button"
                onClick={() => setLayout('4x6_12')}
                className={`p-2.5 rounded-lg text-left border text-xs font-semibold transition-all cursor-pointer ${
                  layout === '4x6_12'
                    ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>4x6 (12 Photos)</span>
                  {layout === '4x6_12' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">3 rows × 4 cols (Max Economy)</div>
              </button>

              <button
                type="button"
                onClick={() => setLayout('4x6_6')}
                className={`p-2.5 rounded-lg text-left border text-xs font-semibold transition-all cursor-pointer ${
                  layout === '4x6_6'
                    ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>4x6 (6 Photos)</span>
                  {layout === '4x6_6' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">2 rows × 3 cols</div>
              </button>

              <button
                type="button"
                onClick={() => setLayout('a4_32')}
                className={`p-2.5 rounded-lg text-left border text-xs font-semibold transition-all cursor-pointer ${
                  layout === 'a4_32'
                    ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>A4 (32 Photos)</span>
                  {layout === 'a4_32' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">Full A4 batch print</div>
              </button>

              <button
                type="button"
                onClick={() => setLayout('single')}
                className={`p-2.5 rounded-lg text-left border text-xs font-semibold transition-all cursor-pointer ${
                  layout === 'single'
                    ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>Single 3.5×4.5 cm</span>
                  {layout === 'single' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">Single photo (300 DPI)</div>
              </button>
            </div>
          </div>

          {/* Name & Date of Photo (DOP) Overlay */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-blue-600" />
                Name & Date Stamp (नाम व फोटो की तिथि)
              </label>
              <input
                type="checkbox"
                checked={includeNameDate}
                onChange={(e) => setIncludeNameDate(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
            </div>

            {includeNameDate && (
              <div className="space-y-2 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Candidate Name (नाम)</label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="e.g. RAHUL KUMAR"
                    className="w-full text-xs px-2.5 py-1.5 mt-0.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 uppercase focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Date of Photograph (DOP)</label>
                  <input
                    type="date"
                    value={photoDate}
                    onChange={(e) => setPhotoDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 mt-0.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded border border-amber-200 dark:border-amber-800">
                  Required for SSC CGL/CHSL, Police Bharti, UPSC & Railway forms.
                </div>
              </div>
            )}
          </div>

          {/* 1-Click Background Color Switcher */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                1-Click Background Color Switcher
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                Exam Form Ready
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setBgColorMode('white')}
                className={`p-2 rounded-lg border text-left flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  bgColorMode === 'white'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/50 shadow-xs ring-1 ring-purple-500'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="w-6 h-6 rounded-full border border-slate-300 bg-white shadow-xs" />
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Pure White</span>
                <span className="text-[9px] text-slate-500">SSC / UPSC / NTA</span>
              </button>

              <button
                type="button"
                onClick={() => setBgColorMode('light_blue')}
                className={`p-2 rounded-lg border text-left flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  bgColorMode === 'light_blue'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 shadow-xs ring-1 ring-blue-500'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="w-6 h-6 rounded-full border border-blue-300 bg-[#cbe3f7] shadow-xs" />
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Light Blue</span>
                <span className="text-[9px] text-slate-500">Passport / Visa</span>
              </button>

              <button
                type="button"
                onClick={() => setBgColorMode('light_gray')}
                className={`p-2 rounded-lg border text-left flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  bgColorMode === 'light_gray'
                    ? 'border-slate-600 bg-slate-100 dark:bg-slate-800 shadow-xs ring-1 ring-slate-500'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="w-6 h-6 rounded-full border border-slate-400 bg-[#e2e8f0] shadow-xs" />
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Light Gray</span>
                <span className="text-[9px] text-slate-500">ID / Official Card</span>
              </button>

              <button
                type="button"
                onClick={() => setBgColorMode('original')}
                className={`p-2 rounded-lg border text-left flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  bgColorMode === 'original'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 shadow-xs ring-1 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="w-6 h-6 rounded-full border border-dashed border-slate-400 bg-transparent flex items-center justify-center text-[10px] text-slate-500">
                  Orig
                </div>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Original</span>
                <span className="text-[9px] text-slate-500">No Color Change</span>
              </button>
            </div>

            {bgColorMode !== 'original' && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Cutout Sensitivity & Tolerance:</span>
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{bgTolerance}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={bgTolerance}
                  onChange={(e) => setBgTolerance(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <p className="text-[10px] text-slate-500">
                  Adjust slider if hair edges or clothing shoulders need smoother blending.
                </p>
              </div>
            )}
          </div>

          {/* Border & Cut Guides */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-blue-600" />
              Border & Cutting Lines
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">Photo Border</label>
                <select
                  value={borderWidth}
                  onChange={(e) => setBorderWidth(Number(e.target.value))}
                  className="w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value={0}>No Border</option>
                  <option value={1}>1px Thin Black Border</option>
                  <option value={2}>2px Crisp Border</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">Scissor Cut Marks</label>
                <button
                  type="button"
                  onClick={() => setShowCutLines(!showCutLines)}
                  className={`w-full text-xs p-1.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
                    showCutLines 
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-300'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600'
                  }`}
                >
                  {showCutLines ? '✓ Cut Lines Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>

          {/* Image Positioning & Lighting adjustments */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                Zoom & Lighting Adjustments
              </h3>
              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setOffsetX(0);
                  setOffsetY(0);
                  setBrightness(100);
                  setContrast(100);
                  setSaturation(100);
                }}
                className="text-[10px] text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-2.5 h-2.5" /> Reset
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                  <span>Photo Zoom (Crop scale)</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                  <span>Brightness (चमक)</span>
                  <span>{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="160"
                  step="1"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                  <span>Contrast (कंट्रास्ट)</span>
                  <span>{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="160"
                  step="1"
                  value={contrast}
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="pt-1 text-[11px] text-slate-500 italic">
                Tip: You can click & drag on the preview sheet to reposition the photo.
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Live High-DPI Sheet Preview & Action Bar (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          
          {/* Action Bar */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>4x6 Photo Sheet • 300 DPI Ultra Sharp</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsA4ModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                title="Preview full layout on A4 paper before printing"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>A4 Sheet Preview (A4 शीट देखें)</span>
              </button>

              <button
                id="passport-print-btn"
                onClick={handlePrintSheet}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                title="Print 4x6 Photo Paper directly"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print 4x6 Sheet</span>
              </button>

              <button
                id="passport-download-btn"
                onClick={handleDownloadImage}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                title="Download 300 DPI JPEG for photo lab / printer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download JPEG</span>
              </button>
            </div>
          </div>

          {/* Interactive Sheet Canvas Container */}
          <div 
            className="flex-1 bg-slate-200 dark:bg-slate-950 p-4 sm:p-6 rounded-xl border border-slate-300 dark:border-slate-800 flex items-center justify-center overflow-auto min-h-[420px] select-none cursor-grab active:cursor-grabbing shadow-inner"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <div className="relative shadow-2xl rounded-sm bg-white border border-slate-300 max-w-full">
              {/* Actual High DPI Canvas */}
              <canvas
                ref={canvasRef}
                className="w-full max-w-[540px] h-auto object-contain block mx-auto"
                style={{ imageRendering: 'auto' }}
              />
            </div>
          </div>

          {/* Printing Quick Advice */}
          <div className="bg-slate-100 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
            <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-500" />
              Epson L805 / Canon G570 / Pixma Quick Print Instructions:
            </div>
            <p>
              1. In your printer dialog, select <strong>Paper Size: 4x6 in (10x15 cm)</strong> or <strong>Postcard</strong>.
            </p>
            <p>
              2. Choose <strong>Paper Type: Premium Glossy Photo Paper</strong> and set Quality to <strong>High / Best</strong>.
            </p>
            <p>
              3. Set Margins to <strong>None (Borderless)</strong> or <strong>100% Scale</strong> to avoid clipping.
            </p>
          </div>

        </div>

      </div>

      {/* A4 Sheet Print Preview Modal */}
      <A4PrintPreviewModal
        isOpen={isA4ModalOpen}
        onClose={() => setIsA4ModalOpen(false)}
        imageSrc={imageSrc}
        title="Passport Photo A4 Sheet Print Preview"
        defaultLayout={layout === '4x6_8' ? 'grid_8' : layout === '4x6_4' ? 'grid_4' : layout === '4x6_12' ? 'grid_16' : 'grid_32'}
        initialCandidateName={candidateName}
        initialPhotoDate={photoDate}
      />
    </div>
  );
};
