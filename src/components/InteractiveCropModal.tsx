import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Crop,
  Maximize2,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Check,
  X,
  Layers,
  Zap,
  Download,
  Sliders,
  Sparkles,
  Info,
  RefreshCw,
  Grid,
  Move,
  Printer
} from 'lucide-react';

export interface CropPreset {
  id: string;
  name: string;
  hindiName: string;
  category: 'id_passport' | 'print_paper' | 'social_aspect' | 'custom';
  ratio?: number; // width / height (null for freeform)
  widthMm?: number;
  heightMm?: number;
  pixelWidthAt300Dpi?: number;
  pixelHeightAt300Dpi?: number;
  unitLabel: string;
  badge: string;
}

export const CROP_PRESETS: CropPreset[] = [
  // 1. PASSPORT & ID PRESETS
  {
    id: 'passport_in_35x45',
    name: 'India Passport / SSC / UPSC',
    hindiName: 'भारतीय पासपोर्ट / सरकारी फॉर्म (3.5 × 4.5 सेमी)',
    category: 'id_passport',
    ratio: 35 / 45,
    widthMm: 35,
    heightMm: 45,
    pixelWidthAt300Dpi: 413,
    pixelHeightAt300Dpi: 531,
    unitLabel: '3.5 × 4.5 cm',
    badge: 'Standard 35×45mm',
  },
  {
    id: 'passport_us_2x2',
    name: 'US / Global Visa (2×2")',
    hindiName: 'यूएस / ग्लोबल वीज़ा (5.08 × 5.08 सेमी)',
    category: 'id_passport',
    ratio: 1,
    widthMm: 50.8,
    heightMm: 50.8,
    pixelWidthAt300Dpi: 600,
    pixelHeightAt300Dpi: 600,
    unitLabel: '2 × 2 in (5×5 cm)',
    badge: 'US Visa 2×2"',
  },
  {
    id: 'pan_card_25x35',
    name: 'PAN Card / NSDL Photo',
    hindiName: 'पैन कार्ड फोटो (2.5 × 3.5 सेमी)',
    category: 'id_passport',
    ratio: 25 / 35,
    widthMm: 25,
    heightMm: 35,
    pixelWidthAt300Dpi: 295,
    pixelHeightAt300Dpi: 413,
    unitLabel: '2.5 × 3.5 cm',
    badge: 'PAN Card',
  },
  {
    id: 'stamp_size_20x25',
    name: 'Stamp Size Photo',
    hindiName: 'स्टैम्प साइज फोटो (2.0 × 2.5 सेमी)',
    category: 'id_passport',
    ratio: 20 / 25,
    widthMm: 20,
    heightMm: 25,
    pixelWidthAt300Dpi: 236,
    pixelHeightAt300Dpi: 295,
    unitLabel: '2.0 × 2.5 cm',
    badge: 'Stamp Size',
  },
  {
    id: 'id_square_1x1',
    name: 'Aadhaar / Driving License (1:1)',
    hindiName: 'आधार / ड्राइविंग लाइसेंस स्क्वायर',
    category: 'id_passport',
    ratio: 1,
    widthMm: 35,
    heightMm: 35,
    pixelWidthAt300Dpi: 413,
    pixelHeightAt300Dpi: 413,
    unitLabel: '3.5 × 3.5 cm',
    badge: 'Square ID',
  },

  // 2. PRINT PAPER & SHEET PRESETS
  {
    id: 'paper_a4',
    name: 'A4 Document Page',
    hindiName: 'A4 पेपर शीट (210 × 297 मिमी)',
    category: 'print_paper',
    ratio: 210 / 297,
    widthMm: 210,
    heightMm: 297,
    pixelWidthAt300Dpi: 2480,
    pixelHeightAt300Dpi: 3508,
    unitLabel: '210 × 297 mm (A4)',
    badge: 'A4 Standard',
  },
  {
    id: 'paper_a5',
    name: 'A5 Notebook Page',
    hindiName: 'A5 शीट (148 × 210 मिमी)',
    category: 'print_paper',
    ratio: 148 / 210,
    widthMm: 148,
    heightMm: 210,
    pixelWidthAt300Dpi: 1748,
    pixelHeightAt300Dpi: 2480,
    unitLabel: '148 × 210 mm (A5)',
    badge: 'A5 Half-Sheet',
  },
  {
    id: 'photo_4x6',
    name: '4 × 6" Postcard Photo',
    hindiName: '4×6 इंच फोटो स्टूडियो पेपर',
    category: 'print_paper',
    ratio: 4 / 6,
    widthMm: 101.6,
    heightMm: 152.4,
    pixelWidthAt300Dpi: 1200,
    pixelHeightAt300Dpi: 1800,
    unitLabel: '4 × 6 in (10×15 cm)',
    badge: '4×6 Studio Postcard',
  },
  {
    id: 'photo_5x7',
    name: '5 × 7" Studio Portrait',
    hindiName: '5×7 इंच फ्रेम पोर्ट्रेट',
    category: 'print_paper',
    ratio: 5 / 7,
    widthMm: 127,
    heightMm: 177.8,
    pixelWidthAt300Dpi: 1500,
    pixelHeightAt300Dpi: 2100,
    unitLabel: '5 × 7 in (13×18 cm)',
    badge: '5×7 Frame',
  },

  // 3. SOCIAL & ASPECT RATIOS
  {
    id: 'ratio_1_1',
    name: '1:1 Square (WhatsApp / Insta DP)',
    hindiName: '1:1 चौकोर प्रोफाइल फोटो',
    category: 'social_aspect',
    ratio: 1,
    unitLabel: '1:1 Square',
    badge: '1:1 DP',
  },
  {
    id: 'ratio_4_5',
    name: '4:5 Portrait (Instagram Feed)',
    hindiName: '4:5 वर्टिकल इंस्टाग्राम पोस्ट',
    category: 'social_aspect',
    ratio: 4 / 5,
    unitLabel: '4:5 Portrait',
    badge: '4:5 Feed',
  },
  {
    id: 'ratio_9_16',
    name: '9:16 Fullscreen (Reels / Story)',
    hindiName: '9:16 स्टोरी / रील्स / शॉर्ट्स',
    category: 'social_aspect',
    ratio: 9 / 16,
    unitLabel: '9:16 Story',
    badge: '9:16 Story',
  },
  {
    id: 'ratio_16_9',
    name: '16:9 Landscape (Thumbnails / Web)',
    hindiName: '16:9 लैंडस्केप यूट्यूब थंबनेल',
    category: 'social_aspect',
    ratio: 16 / 9,
    unitLabel: '16:9 Landscape',
    badge: '16:9 Wide',
  },
  {
    id: 'ratio_3_4',
    name: '3:4 Classic Portrait',
    hindiName: '3:4 क्लासिक वर्टिकल',
    category: 'social_aspect',
    ratio: 3 / 4,
    unitLabel: '3:4 Classic',
    badge: '3:4 Portrait',
  },
  {
    id: 'freeform',
    name: 'Freeform (Custom Drag)',
    hindiName: 'फ्री क्रॉप (कस्टम साइज)',
    category: 'custom',
    ratio: undefined,
    unitLabel: 'Freeform',
    badge: 'Freeform',
  },
];

export interface InteractiveCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onApplyCrop: (croppedDataUrl: string, metadata: { width: number; height: number; presetName: string }) => void;
  onSendToPassportGrid?: (croppedDataUrl: string) => void;
  onSendToKbCompressor?: (croppedDataUrl: string) => void;
  onSendToA4Print?: (croppedDataUrl: string) => void;
}

export const InteractiveCropModal: React.FC<InteractiveCropModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  onApplyCrop,
  onSendToPassportGrid,
  onSendToKbCompressor,
  onSendToA4Print,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<CropPreset>(CROP_PRESETS[0]);
  const [activeTab, setActiveTab] = useState<'id_passport' | 'print_paper' | 'social_aspect' | 'custom'>('id_passport');

  // DPI setting for print sizing
  const [selectedDpi, setSelectedDpi] = useState<300 | 200 | 72>(300);

  // Rotation and Flip
  const [rotationDeg, setRotationDeg] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [fineAngle, setFineAngle] = useState<number>(0);

  // Crop Box Normalized Coordinates (0.0 to 1.0 relative to image viewport)
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0.1,
    y: 0.05,
    width: 0.8,
    height: 0.9,
  });

  // Dragging state
  const [isDraggingBox, setIsDraggingBox] = useState<boolean>(false);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; box: typeof cropBox }>({
    mouseX: 0,
    mouseY: 0,
    box: cropBox,
  });

  // Source Image metadata
  const [imgNaturalSize, setImgNaturalSize] = useState<{ w: number; h: number }>({ w: 800, h: 1000 });
  const [previewSize, setPreviewSize] = useState<{ w: number; h: number }>({ w: 400, h: 500 });
  
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Load natural dimensions
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImgNaturalSize({ w: img.naturalWidth || img.width, h: img.naturalHeight || img.height });
      // Reset crop to center with selected preset ratio
      initCropBox(img.naturalWidth || img.width, img.naturalHeight || img.height, selectedPreset);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Function to initialize crop box centered matching aspect ratio
  const initCropBox = useCallback((imgW: number, imgH: number, preset: CropPreset) => {
    const imgRatio = imgW / imgH;
    let targetRatio = preset.ratio;

    if (!targetRatio) {
      // Freeform default: 80% box
      setCropBox({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
      return;
    }

    let boxW = 0.85;
    let boxH = 0.85;

    if (imgRatio > targetRatio) {
      // Image is wider than target ratio: constrain box height first
      boxH = 0.9;
      boxW = (boxH * imgH * targetRatio) / imgW;
      if (boxW > 0.95) {
        boxW = 0.95;
        boxH = (boxW * imgW) / (imgH * targetRatio);
      }
    } else {
      // Image is taller than target ratio: constrain box width first
      boxW = 0.9;
      boxH = (boxW * imgW) / (imgH * targetRatio);
      if (boxH > 0.95) {
        boxH = 0.95;
        boxW = (boxH * imgH * targetRatio) / imgW;
      }
    }

    const x = Math.max(0, (1 - boxW) / 2);
    const y = Math.max(0, (1 - boxH) / 2);

    setCropBox({
      x: Number(x.toFixed(4)),
      y: Number(y.toFixed(4)),
      width: Number(boxW.toFixed(4)),
      height: Number(boxH.toFixed(4)),
    });
  }, []);

  // Preset Selection Handler
  const handleSelectPreset = (preset: CropPreset) => {
    setSelectedPreset(preset);
    initCropBox(imgNaturalSize.w, imgNaturalSize.h, preset);
  };

  // Mouse & Touch interaction for Dragging & Resizing Crop Box
  const handlePointerDown = (e: React.PointerEvent, handle: string | null = null) => {
    e.preventDefault();
    e.stopPropagation();

    const target = containerRef.current;
    if (!target) return;
    const rect = target.getBoundingClientRect();

    setIsDraggingBox(handle === null);
    setActiveHandle(handle);

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      box: { ...cropBox },
    };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingBox && !activeHandle) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const deltaX = (e.clientX - dragStartRef.current.mouseX) / rect.width;
    const deltaY = (e.clientY - dragStartRef.current.mouseY) / rect.height;

    const initial = dragStartRef.current.box;
    const targetRatio = selectedPreset.ratio;
    const imgRatio = imgNaturalSize.w / imgNaturalSize.h;

    let newBox = { ...initial };

    if (isDraggingBox) {
      // Moving entire box
      newBox.x = Math.max(0, Math.min(1 - initial.width, initial.x + deltaX));
      newBox.y = Math.max(0, Math.min(1 - initial.height, initial.y + deltaY));
    } else if (activeHandle) {
      // Resizing via handle
      if (activeHandle.includes('e')) {
        newBox.width = Math.max(0.1, Math.min(1 - initial.x, initial.width + deltaX));
      }
      if (activeHandle.includes('s')) {
        newBox.height = Math.max(0.1, Math.min(1 - initial.y, initial.height + deltaY));
      }
      if (activeHandle.includes('w')) {
        const potentialWidth = initial.width - deltaX;
        if (potentialWidth >= 0.1 && initial.x + deltaX >= 0) {
          newBox.x = initial.x + deltaX;
          newBox.width = potentialWidth;
        }
      }
      if (activeHandle.includes('n')) {
        const potentialHeight = initial.height - deltaY;
        if (potentialHeight >= 0.1 && initial.y + deltaY >= 0) {
          newBox.y = initial.y + deltaY;
          newBox.height = potentialHeight;
        }
      }

      // If locked aspect ratio, enforce it
      if (targetRatio) {
        // Enforce aspect ratio: (width * imgW) / (height * imgH) = targetRatio
        if (activeHandle === 'e' || activeHandle === 'w') {
          newBox.height = (newBox.width * imgNaturalSize.w) / (imgNaturalSize.h * targetRatio);
          if (newBox.y + newBox.height > 1) {
            newBox.height = 1 - newBox.y;
            newBox.width = (newBox.height * imgNaturalSize.h * targetRatio) / imgNaturalSize.w;
          }
        } else {
          newBox.width = (newBox.height * imgNaturalSize.h * targetRatio) / imgNaturalSize.w;
          if (newBox.x + newBox.width > 1) {
            newBox.width = 1 - newBox.x;
            newBox.height = (newBox.width * imgNaturalSize.w) / (imgNaturalSize.h * targetRatio);
          }
        }
      }
    }

    setCropBox({
      x: Number(Math.max(0, Math.min(1 - newBox.width, newBox.x)).toFixed(4)),
      y: Number(Math.max(0, Math.min(1 - newBox.height, newBox.y)).toFixed(4)),
      width: Number(Math.min(1, newBox.width).toFixed(4)),
      height: Number(Math.min(1, newBox.height).toFixed(4)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDraggingBox(false);
    setActiveHandle(null);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  // Generate Cropped High-Resolution Canvas
  const generateCroppedImage = useCallback(async (): Promise<string | null> => {
    if (!imageSrc) return null;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = imageSrc;
    });

    const natW = img.naturalWidth || img.width;
    const natH = img.naturalHeight || img.height;

    // Calculate source crop rectangle in pixels
    const srcX = Math.round(cropBox.x * natW);
    const srcY = Math.round(cropBox.y * natH);
    const srcW = Math.max(10, Math.round(cropBox.width * natW));
    const srcH = Math.max(10, Math.round(cropBox.height * natH));

    // Determine output target resolution
    let outW = srcW;
    let outH = srcH;

    if (selectedPreset.pixelWidthAt300Dpi && selectedPreset.pixelHeightAt300Dpi) {
      // Scale according to selected DPI
      const scaleFactor = selectedDpi / 300;
      outW = Math.round(selectedPreset.pixelWidthAt300Dpi * scaleFactor);
      outH = Math.round(selectedPreset.pixelHeightAt300Dpi * scaleFactor);
    }

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Transformations (Rotation & Flip)
    ctx.save();
    ctx.translate(outW / 2, outH / 2);

    const totalAngle = ((rotationDeg + fineAngle) * Math.PI) / 180;
    ctx.rotate(totalAngle);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    ctx.drawImage(
      img,
      srcX,
      srcY,
      srcW,
      srcH,
      -outW / 2,
      -outH / 2,
      outW,
      outH
    );

    ctx.restore();

    return canvas.toDataURL('image/png');
  }, [imageSrc, cropBox, selectedPreset, selectedDpi, rotationDeg, fineAngle, flipH, flipV]);

  // Action: Apply Crop to Main Studio
  const handleApply = async () => {
    const croppedUrl = await generateCroppedImage();
    if (croppedUrl) {
      const wPx = Math.round(cropBox.width * imgNaturalSize.w);
      const hPx = Math.round(cropBox.height * imgNaturalSize.h);
      onApplyCrop(croppedUrl, {
        width: wPx,
        height: hPx,
        presetName: selectedPreset.name,
      });
      onClose();
    }
  };

  // Action: Download Direct Cropped Image
  const handleDirectDownload = async (format: 'png' | 'jpg') => {
    const croppedUrl = await generateCroppedImage();
    if (!croppedUrl) return;

    const link = document.createElement('a');
    link.href = croppedUrl;
    const cleanPreset = selectedPreset.id.replace(/[^a-zA-Z0-9_]/g, '');
    link.download = `cropped_${cleanPreset}_${selectedDpi}dpi.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Action: Send to Passport Grid Multi-Print
  const handleTransferToPassportGrid = async () => {
    const croppedUrl = await generateCroppedImage();
    if (croppedUrl && onSendToPassportGrid) {
      onSendToPassportGrid(croppedUrl);
      onClose();
    }
  };

  // Action: Send to KB Compressor
  const handleTransferToCompressor = async () => {
    const croppedUrl = await generateCroppedImage();
    if (croppedUrl && onSendToKbCompressor) {
      onSendToKbCompressor(croppedUrl);
      onClose();
    }
  };

  // Action: Send to A4 Print Preview
  const handleTransferToA4Print = async () => {
    const croppedUrl = await generateCroppedImage();
    if (croppedUrl && onSendToA4Print) {
      onSendToA4Print(croppedUrl);
      onClose();
    }
  };

  if (!isOpen) return null;

  // Real-time calculated crop dimensions in pixels and mm
  const currentCropPixels = {
    w: Math.round(cropBox.width * imgNaturalSize.w),
    h: Math.round(cropBox.height * imgNaturalSize.h),
  };

  const currentCropMm = {
    w: Math.round((currentCropPixels.w / selectedDpi) * 25.4 * 10) / 10,
    h: Math.round((currentCropPixels.h / selectedDpi) * 25.4 * 10) / 10,
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        
        {/* MODAL HEADER */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/30">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Interactive Crop & Dimension Preset Resizer
                </h3>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  {selectedPreset.badge}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                पासपोर्ट 3.5×4.5cm, A4, 4×6" व कस्टम आकार में सटीक क्रॉप करें
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MODAL BODY (TWO COLUMN LAYOUT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto min-h-0">
          
          {/* LEFT: PRESETS & DIMENSION CONTROLS (5 COLS) */}
          <div className="lg:col-span-5 p-4 sm:p-5 border-r border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 space-y-4 overflow-y-auto max-h-[480px] lg:max-h-none">
            
            {/* PRESET CATEGORY TABS */}
            <div>
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                <span>Select Preset Category:</span>
                <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                  {selectedPreset.unitLabel}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200 dark:bg-slate-800 rounded-xl">
                <button
                  onClick={() => setActiveTab('id_passport')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer truncate ${
                    activeTab === 'id_passport'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  🇮🇳 Passport & ID
                </button>
                <button
                  onClick={() => setActiveTab('print_paper')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer truncate ${
                    activeTab === 'print_paper'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  📄 A4 & Print
                </button>
                <button
                  onClick={() => setActiveTab('social_aspect')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer truncate ${
                    activeTab === 'social_aspect'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  📱 Social & Web
                </button>
              </div>
            </div>

            {/* PRESET CARDS LIST */}
            <div className="space-y-2">
              {CROP_PRESETS.filter((p) => p.category === activeTab || (activeTab === 'social_aspect' && p.category === 'custom')).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                    selectedPreset.id === preset.id
                      ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-600 ring-2 ring-purple-500/20 text-purple-950 dark:text-purple-100'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-300 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold group-hover:text-purple-600 transition-colors">
                        {preset.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      {preset.hindiName}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      selectedPreset.id === preset.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {preset.unitLabel}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* DPI RESOLUTION PICKER */}
            <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Target Print Quality (DPI):
                </span>
                <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                  {selectedDpi} DPI
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { dpi: 300 as const, label: '300 DPI (Studio Print)', tag: 'Ultra HD' },
                  { dpi: 200 as const, label: '200 DPI (Govt Form)', tag: 'Standard' },
                  { dpi: 72 as const, label: '72 DPI (Fast Web)', tag: 'Web DP' },
                ].map((item) => (
                  <button
                    key={item.dpi}
                    onClick={() => setSelectedDpi(item.dpi)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedDpi === item.dpi
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.dpi} DPI</div>
                    <div className="text-[9px] opacity-80">{item.tag}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* ROTATE & FLIP TOOLS */}
            <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Transform & Orientation:
              </span>
              <div className="flex items-center justify-between gap-1.5">
                <button
                  onClick={() => setRotationDeg((r) => (r - 90 + 360) % 360)}
                  className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                  title="Rotate Left 90°"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>-90°</span>
                </button>
                <button
                  onClick={() => setRotationDeg((r) => (r + 90) % 360)}
                  className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                  title="Rotate Right 90°"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>+90°</span>
                </button>
                <button
                  onClick={() => setFlipH((f) => !f)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                    flipH ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                  title="Flip Horizontal"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>Flip H</span>
                </button>
                <button
                  onClick={() => setFlipV((f) => !f)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                    flipV ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                  title="Flip Vertical"
                >
                  <FlipVertical className="w-3.5 h-3.5" />
                  <span>Flip V</span>
                </button>
              </div>

              {/* Angle Fine Tune Slider */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-500">Straighten:</span>
                <input
                  type="range"
                  min="-25"
                  max="25"
                  value={fineAngle}
                  onChange={(e) => setFineAngle(Number(e.target.value))}
                  className="flex-1 accent-purple-600 cursor-pointer"
                />
                <span className="font-mono text-purple-600 font-bold w-10 text-right">{fineAngle}°</span>
                {fineAngle !== 0 && (
                  <button
                    onClick={() => setFineAngle(0)}
                    className="text-[10px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* LIVE DIMENSION SPECIFICATIONS */}
            <div className="bg-purple-50 dark:bg-purple-950/40 p-3 rounded-2xl border border-purple-200 dark:border-purple-800/80 space-y-1.5 text-xs text-purple-950 dark:text-purple-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500 dark:text-purple-300">Selected Output:</span>
                <strong className="font-mono font-bold text-purple-700 dark:text-purple-300">
                  {currentCropPixels.w} × {currentCropPixels.h} px
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500 dark:text-purple-300">Physical Size ({selectedDpi} DPI):</span>
                <strong className="font-mono font-bold text-purple-700 dark:text-purple-300">
                  {currentCropMm.w} × {currentCropMm.h} mm ({Math.round((currentCropMm.w / 10) * 10) / 10} × {Math.round((currentCropMm.h / 10) * 10) / 10} cm)
                </strong>
              </div>
            </div>

          </div>

          {/* RIGHT: INTERACTIVE CROP CANVAS & VIEWPORT (7 COLS) */}
          <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col justify-between bg-slate-100 dark:bg-slate-950 gap-4">
            
            {/* TOP HELPER MESSAGE */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-purple-500" />
                <span>Drag the crop box or corner handles to reposition</span>
              </span>
              <button
                onClick={() => initCropBox(imgNaturalSize.w, imgNaturalSize.h, selectedPreset)}
                className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Re-center Box</span>
              </button>
            </div>

            {/* INTERACTIVE STAGE VIEWPORT */}
            <div className="relative flex-1 flex items-center justify-center min-h-[340px] max-h-[440px] rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-[radial-gradient(#94a3b8_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#475569_1.5px,transparent_1.5px)] [background-size:16px_16px] bg-slate-200/80 dark:bg-slate-900 select-none">
              
              {/* IMAGE WRAPPER (Bounds for relative crop coordinates) */}
              <div
                ref={containerRef}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="relative max-h-[400px] max-w-full inline-block cursor-default touch-none"
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Crop Source"
                  style={{
                    transform: `rotate(${rotationDeg + fineAngle}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
                    transition: 'transform 0.15s ease-out',
                  }}
                  className="max-h-[380px] w-auto max-w-full object-contain pointer-events-none rounded-lg shadow-sm"
                />

                {/* SEMI-TRANSPARENT DARKENING BACKDROP OUTSIDE CROP */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `
                      linear-gradient(to right, rgba(0,0,0,0.65) ${cropBox.x * 100}%, transparent ${cropBox.x * 100}%),
                      linear-gradient(to left, rgba(0,0,0,0.65) ${(1 - (cropBox.x + cropBox.width)) * 100}%, transparent ${(1 - (cropBox.x + cropBox.width)) * 100}%)
                    `,
                  }}
                />

                {/* THE INTERACTIVE ACTIVE CROP BOX */}
                <div
                  onPointerDown={(e) => handlePointerDown(e, null)}
                  style={{
                    left: `${cropBox.x * 100}%`,
                    top: `${cropBox.y * 100}%`,
                    width: `${cropBox.width * 100}%`,
                    height: `${cropBox.height * 100}%`,
                  }}
                  className="absolute border-2 border-white ring-2 ring-purple-600/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] cursor-move group touch-none"
                >
                  {/* RULE OF THIRDS 3x3 GRID */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity">
                    <div className="border-r border-b border-white/60"></div>
                    <div className="border-r border-b border-white/60"></div>
                    <div className="border-b border-white/60"></div>
                    <div className="border-r border-b border-white/60"></div>
                    <div className="border-r border-b border-white/60"></div>
                    <div className="border-b border-white/60"></div>
                    <div className="border-r border-white/60"></div>
                    <div className="border-r border-white/60"></div>
                    <div></div>
                  </div>

                  {/* CENTER SIZE BADGE */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white text-[10px] font-mono px-2 py-0.5 rounded-full pointer-events-none shadow-md backdrop-blur-xs font-bold border border-white/30 whitespace-nowrap">
                    {selectedPreset.unitLabel} ({currentCropPixels.w}×{currentCropPixels.h})
                  </div>

                  {/* 8 RESIZING HANDLES */}
                  {/* Top-Left */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'nw')}
                    className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-purple-600 rounded-sm shadow-md cursor-nwse-resize"
                  />
                  {/* Top-Right */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'ne')}
                    className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-purple-600 rounded-sm shadow-md cursor-nesw-resize"
                  />
                  {/* Bottom-Left */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'sw')}
                    className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-purple-600 rounded-sm shadow-md cursor-nesw-resize"
                  />
                  {/* Bottom-Right */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'se')}
                    className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-purple-600 rounded-sm shadow-md cursor-nwse-resize"
                  />
                  
                  {/* Edge handles */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'n')}
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-3 bg-white border-2 border-purple-600 rounded-sm shadow-sm cursor-ns-resize"
                  />
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 's')}
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-3 bg-white border-2 border-purple-600 rounded-sm shadow-sm cursor-ns-resize"
                  />
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'w')}
                    className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-6 bg-white border-2 border-purple-600 rounded-sm shadow-sm cursor-ew-resize"
                  />
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'e')}
                    className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-6 bg-white border-2 border-purple-600 rounded-sm shadow-sm cursor-ew-resize"
                  />
                </div>

              </div>

            </div>

            {/* ACTION BUTTONS & WORKFLOW INTEGRATIONS */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              
              {/* PRIMARY APPLY BUTTON */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={handleApply}
                  className="w-full sm:flex-1 py-3 px-5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-purple-500/30 cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply Crop to Photo Studio ({selectedPreset.unitLabel})</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleDirectDownload('png')}
                    className="flex-1 sm:flex-none px-3.5 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    title="Download Cropped PNG"
                  >
                    <Download className="w-3.5 h-3.5 text-purple-400" />
                    <span>Download PNG</span>
                  </button>

                  <button
                    onClick={() => handleDirectDownload('jpg')}
                    className="flex-1 sm:flex-none px-3.5 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    title="Download Cropped JPG"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download JPG</span>
                  </button>
                </div>
              </div>

              {/* QUICK TRANSFER TO PASSPORT GRID, A4 PRINT PREVIEW, OR COMPRESSOR */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  {onSendToA4Print && (
                    <button
                      onClick={handleTransferToA4Print}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>A4 Sheet Print Preview</span>
                    </button>
                  )}

                  {onSendToPassportGrid && (
                    <button
                      onClick={handleTransferToPassportGrid}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-xs"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Print Passport Sheet (4×6)</span>
                    </button>
                  )}
                </div>

                {onSendToKbCompressor && (
                  <button
                    onClick={handleTransferToCompressor}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-xs"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Send to Strict KB Compressor</span>
                  </button>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
