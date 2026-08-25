import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Crop, 
  Upload, 
  Download, 
  Sliders, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Layers, 
  Maximize2, 
  Info, 
  RefreshCw,
  Sparkles,
  FileCheck
} from 'lucide-react';
import { PORTAL_PRESETS } from '../data/portalPresets.ts';
import { PortalPreset } from '../types.ts';

export const SizeCalculator: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('ssc');
  const [activeMode, setActiveMode] = useState<'photo' | 'signature'>('photo');
  
  // Image Resizer & Compressor State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalFileSize, setOriginalFileSize] = useState<number>(0);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [fileName, setFileName] = useState<string>('customer_photo');
  
  // Adjustments
  const [targetWidth, setTargetWidth] = useState<number>(350);
  const [targetHeight, setTargetHeight] = useState<number>(450);
  const [targetDpi, setTargetDpi] = useState<number>(300);
  const [quality, setQuality] = useState<number>(0.85);
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(10);
  const [isGrayscale, setIsGrayscale] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  
  // Output result
  const [processedDataUrl, setProcessedDataUrl] = useState<string | null>(null);
  const [processedFileSize, setProcessedFileSize] = useState<number>(0);

  // Unit Converter Math Matrix State
  const [calcCmWidth, setCalcCmWidth] = useState<number>(3.5);
  const [calcCmHeight, setCalcCmHeight] = useState<number>(4.5);
  const [calcDpi, setCalcDpi] = useState<number>(300);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentPreset = useMemo(() => {
    return PORTAL_PRESETS.find(p => p.id === selectedPresetId) || PORTAL_PRESETS[0];
  }, [selectedPresetId]);

  // Apply preset dimensions & specs to the compressor
  const handleApplyPreset = (preset: PortalPreset, mode: 'photo' | 'signature') => {
    setSelectedPresetId(preset.id);
    setActiveMode(mode);

    if (mode === 'photo') {
      if (preset.id === 'pan') {
        setTargetWidth(213);
        setTargetHeight(213);
        setTargetDpi(300);
        setQuality(0.75);
        setIsGrayscale(false);
      } else if (preset.id === 'upsc') {
        setTargetWidth(500);
        setTargetHeight(500);
        setTargetDpi(300);
        setQuality(0.85);
        setIsGrayscale(false);
      } else if (preset.id === 'ibps') {
        setTargetWidth(200);
        setTargetHeight(230);
        setTargetDpi(200);
        setQuality(0.8);
        setIsGrayscale(false);
      } else {
        // Standard 3.5 x 4.5 cm (approx 350x450 px or 413x531 px at 300 DPI)
        setTargetWidth(350);
        setTargetHeight(450);
        setTargetDpi(300);
        setQuality(0.82);
        setIsGrayscale(false);
      }
    } else {
      // Signature mode
      if (preset.id === 'pan') {
        setTargetWidth(400);
        setTargetHeight(200);
        setTargetDpi(300);
        setQuality(0.75);
        setIsGrayscale(true);
        setContrast(40); // high contrast for clean B&W
      } else if (preset.id === 'ibps') {
        setTargetWidth(140);
        setTargetHeight(60);
        setTargetDpi(200);
        setQuality(0.8);
        setIsGrayscale(true);
      } else {
        // Standard 4.0 x 2.0 cm signature
        setTargetWidth(400);
        setTargetHeight(200);
        setTargetDpi(300);
        setQuality(0.8);
        setIsGrayscale(true);
        setContrast(30);
      }
    }
  };

  // Handle image upload
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setOriginalFileSize(file.size);
    setFileName(file.name.replace(/\.[^/.]+$/, ''));

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
        setImageSrc(result);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  // Create Sample Placeholder if no image uploaded yet
  useEffect(() => {
    // Generate a default demo photo for immediate testing
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 750;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 750);
      grad.addColorStop(0, '#f1f5f9');
      grad.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 600, 750);

      // Simple avatar outline
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(300, 280, 120, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.ellipse(300, 580, 200, 160, 0, 0, Math.PI * 2);
      ctx.fill();

      // Text label
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Sample Passport Photo', 300, 700);

      const demoData = canvas.toDataURL('image/jpeg', 0.9);
      setImageSrc(demoData);
      setOriginalDimensions({ width: 600, height: 750 });
      setOriginalFileSize(185000); // 185 KB
    }
  }, []);

  // Process & render image through Canvas with resizing, filters, DPI
  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Handle rotation and canvas transform
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);

      // Draw image scaled
      const drawWidth = rotation % 180 === 0 ? canvas.width : canvas.height;
      const drawHeight = rotation % 180 === 0 ? canvas.height : canvas.width;
      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();

      // Apply brightness, contrast & grayscale pixel manipulation
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Brightness
        r += brightness;
        g += brightness;
        b += brightness;

        // Contrast
        r = contrastFactor * (r - 128) + 128;
        g = contrastFactor * (g - 128) + 128;
        b = contrastFactor * (b - 128) + 128;

        // Grayscale (for signatures & black/white uploads)
        if (isGrayscale) {
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          r = gray;
          g = gray;
          b = gray;
        }

        // Clamp
        data[i] = Math.min(255, Math.max(0, r));
        data[i + 1] = Math.min(255, Math.max(0, g));
        data[i + 2] = Math.min(255, Math.max(0, b));
      }

      ctx.putImageData(imgData, 0, 0);

      // Export JPEG with current quality slider
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      setProcessedDataUrl(dataUrl);

      // Calculate approximate byte size from Base64
      const head = 'data:image/jpeg;base64,';
      const base64Str = dataUrl.substring(head.length);
      const byteSize = Math.round((base64Str.length * 3) / 4);
      setProcessedFileSize(byteSize);
    };
    img.src = imageSrc;
  }, [imageSrc, targetWidth, targetHeight, quality, brightness, contrast, isGrayscale, rotation]);

  // Download the processed JPEG file
  const handleDownload = () => {
    if (!processedDataUrl) return;
    const link = document.createElement('a');
    link.href = processedDataUrl;
    link.download = `${fileName}_${selectedPresetId}_${activeMode}_${Math.round(processedFileSize / 1024)}KB.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Unit Converter Math
  const calculatedPixelsWidth = Math.round((calcCmWidth / 2.54) * calcDpi);
  const calculatedPixelsHeight = Math.round((calcCmHeight / 2.54) * calcDpi);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Crop className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Size & Format Calculator & Live Photo Compressor
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live in-browser image resizer, signature contrast enhancer, and exact KB size compressor for SSC, UPSC, PAN & IBPS portals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Quick Target:</span>
            <select
              value={selectedPresetId}
              onChange={(e) => {
                const p = PORTAL_PRESETS.find(x => x.id === e.target.value);
                if (p) handleApplyPreset(p, activeMode);
              }}
              className="text-xs font-bold py-1.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-indigo-600 dark:text-indigo-400"
            >
              {PORTAL_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mode Selector Tabs (Photo vs Signature) */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-3">
          <button
            onClick={() => handleApplyPreset(currentPreset, 'photo')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeMode === 'photo'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            📸 Passport Photo Mode (20-50 KB)
          </button>
          <button
            onClick={() => handleApplyPreset(currentPreset, 'signature')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeMode === 'signature'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            ✍️ Signature Mode (10-20 KB B&W)
          </button>
        </div>
      </div>

      {/* Main Studio Area: Controls on Left, Live Canvas Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Image Controls & Sliders */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            
            {/* Upload Area */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Upload Customer Photo / Signature
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                }}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-xl p-4 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-750/50 transition-colors"
              >
                <Upload className="w-6 h-6 mx-auto text-indigo-500 mb-1.5" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Click to select or drag & drop image
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Supports JPEG, PNG, WEBP from customer phone/WhatsApp
                </p>
              </div>
            </div>

            {/* Target Dimensions & Quality Sliders */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700/60">
              
              {/* Quality & KB Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Compression Quality (Target Size)</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">{Math.round(quality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.02"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Dimensions Inputs */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Width (px)</label>
                  <input
                    type="number"
                    value={targetWidth}
                    onChange={(e) => setTargetWidth(parseInt(e.target.value) || 100)}
                    className="w-full text-xs p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Height (px)</label>
                  <input
                    type="number"
                    value={targetHeight}
                    onChange={(e) => setTargetHeight(parseInt(e.target.value) || 100)}
                    className="w-full text-xs p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Target DPI</label>
                  <select
                    value={targetDpi}
                    onChange={(e) => setTargetDpi(parseInt(e.target.value))}
                    className="w-full text-xs p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                  >
                    <option value={72}>72 DPI (Web)</option>
                    <option value={150}>150 DPI (Fast)</option>
                    <option value={200}>200 DPI (Govt)</option>
                    <option value={300}>300 DPI (HQ/PAN)</option>
                  </select>
                </div>
              </div>

              {/* Contrast & Brightness Enhancement */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    <span>Brightness</span>
                    <span>{brightness}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    <span>Contrast (Signature)</span>
                    <span>{contrast}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="100"
                    value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>

              {/* Toggles: Grayscale & Rotate */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGrayscale}
                    onChange={(e) => setIsGrayscale(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Convert to B&W / Grayscale</span>
                </label>

                <button
                  type="button"
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Rotate 90°
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Live Output Preview, Verification Badge & 1-Click Download */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Real-time Portal Verification Preview
                </h3>
                <p className="text-[11px] text-slate-500">
                  Preset: {currentPreset.shortName} • {activeMode.toUpperCase()}
                </p>
              </div>

              {/* Verification Status Pill */}
              <div className="flex items-center gap-1.5">
                {activeMode === 'photo' ? (
                  (processedFileSize >= 20480 && processedFileSize <= 51200) || currentPreset.id === 'pan' && processedFileSize < 30720 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Size Approved ({Math.round(processedFileSize / 1024)} KB)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      <AlertTriangle className="w-3.5 h-3.5" /> Current: {Math.round(processedFileSize / 1024)} KB (Adjust Slider)
                    </span>
                  )
                ) : (
                  (processedFileSize >= 10240 && processedFileSize <= 20480) || processedFileSize < 30720 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Sign Approved ({Math.round(processedFileSize / 1024)} KB)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      <AlertTriangle className="w-3.5 h-3.5" /> Sign: {Math.round(processedFileSize / 1024)} KB
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Canvas / Image Output Frame */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-6 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 min-h-[260px]">
              {processedDataUrl ? (
                <div className="relative group">
                  <img
                    src={processedDataUrl}
                    alt="Processed Output"
                    className="max-h-60 max-w-[280px] object-contain shadow-lg border-2 border-white dark:border-slate-700 rounded-sm bg-white"
                  />
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow">
                    {targetWidth} × {targetHeight} px
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400">
                  <Crop className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Select or upload an image to process</p>
                </div>
              )}

              {/* Specs Comparison Card */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2 text-xs w-full sm:w-60">
                <div className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700 pb-1.5">
                  Output File Telemetry
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Original Size:</span>
                  <span className="font-mono">{Math.round(originalFileSize / 1024)} KB</span>
                </div>
                <div className="flex justify-between font-bold text-indigo-600 dark:text-indigo-400">
                  <span>Processed Size:</span>
                  <span className="font-mono">{Math.round(processedFileSize / 1024)} KB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Output Resolution:</span>
                  <span className="font-mono">{targetWidth} × {targetHeight} px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target DPI:</span>
                  <span className="font-mono">{targetDpi} DPI</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Format:</span>
                  <span className="font-mono font-semibold">Standard JPEG</span>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                id="download-processed-img-btn"
                onClick={handleDownload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Optimized {activeMode === 'photo' ? 'Photo' : 'Signature'} (JPG)</span>
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Official Government Exam Portals Presets Directory Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Official Portal Guidelines & Dimensions Database
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click "Use Preset" to automatically configure the photo or signature tool above.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold">
                <th className="p-3">Portal / Exam Name</th>
                <th className="p-3">Photograph Specs</th>
                <th className="p-3">Signature Specs</th>
                <th className="p-3">Documents / PDF</th>
                <th className="p-3 text-right">Quick Apply</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-300">
              {PORTAL_PRESETS.map((preset) => (
                <tr key={preset.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750/50 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    <div>{preset.name}</div>
                    <span className="text-[10px] font-normal text-slate-400">{preset.category}</span>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-emerald-600 dark:text-emerald-400">{preset.photoSpecs.fileSizeRange}</div>
                    <div className="text-[11px] text-slate-500">{preset.photoSpecs.dimensions}</div>
                    <div className="text-[10px] text-slate-400">{preset.photoSpecs.background}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-blue-600 dark:text-blue-400">{preset.signatureSpecs.fileSizeRange}</div>
                    <div className="text-[11px] text-slate-500">{preset.signatureSpecs.dimensions}</div>
                    <div className="text-[10px] text-slate-400">{preset.signatureSpecs.inkColor}</div>
                  </td>
                  <td className="p-3">
                    {preset.docSpecs ? (
                      <div>
                        <span className="font-mono font-semibold">{preset.docSpecs.maxSize}</span>
                        <div className="text-[10px] text-slate-400">{preset.docSpecs.dpi}</div>
                      </div>
                    ) : (
                      <span className="text-slate-400">N/A</span>
                    )}
                  </td>
                  <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => handleApplyPreset(preset, 'photo')}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 cursor-pointer"
                    >
                      Photo
                    </button>
                    <button
                      onClick={() => handleApplyPreset(preset, 'signature')}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 cursor-pointer"
                    >
                      Sign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic DPI <-> Centimeter <-> Pixel Math Matrix Converter */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-md">
        <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Real-time DPI & Physical Dimensions (CM/Inches) to Pixels Matrix
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Calculate exact required pixel dimensions for any physical print size at any scanning DPI using formula: <code className="font-mono text-indigo-300">Pixels = (cm ÷ 2.54) × DPI</code>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Width (cm)</label>
            <input
              type="number"
              step="0.1"
              value={calcCmWidth}
              onChange={(e) => setCalcCmWidth(parseFloat(e.target.value) || 1)}
              className="w-full text-xs p-2 rounded bg-slate-800 border border-slate-700 text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Height (cm)</label>
            <input
              type="number"
              step="0.1"
              value={calcCmHeight}
              onChange={(e) => setCalcCmHeight(parseFloat(e.target.value) || 1)}
              className="w-full text-xs p-2 rounded bg-slate-800 border border-slate-700 text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Scanning DPI</label>
            <select
              value={calcDpi}
              onChange={(e) => setCalcDpi(parseInt(e.target.value))}
              className="w-full text-xs p-2 rounded bg-slate-800 border border-slate-700 text-white font-mono"
            >
              <option value={72}>72 DPI (Standard Web)</option>
              <option value={100}>100 DPI</option>
              <option value={150}>150 DPI (Fast Scan)</option>
              <option value={200}>200 DPI (Govt Standard)</option>
              <option value={300}>300 DPI (Passport / PAN)</option>
              <option value={600}>600 DPI (Ultra Fine)</option>
            </select>
          </div>
          <div className="flex flex-col justify-center bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Calculated Exact Pixels:</span>
            <span className="text-sm font-bold font-mono text-emerald-400">
              {calculatedPixelsWidth} × {calculatedPixelsHeight} px
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
