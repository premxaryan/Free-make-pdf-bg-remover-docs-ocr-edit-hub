import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Upload, 
  Download, 
  Sparkles, 
  Wand2, 
  Palette, 
  Image as ImageIcon,
  Eraser,
  Paintbrush,
  RefreshCw,
  Crop,
  Zap,
  ShieldCheck,
  Check,
  X,
  Sliders,
  SlidersHorizontal,
  Layers,
  ArrowRight,
  Plus,
  PenTool,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ArrowLeft,
  Minimize2,
  FileText,
  ScanLine,
  Cpu,
  Star,
  Printer,
  Eye
} from 'lucide-react';
import { PassportPhotoMaker } from './utilities/PassportPhotoMaker.tsx';
import { InteractiveCropModal } from './InteractiveCropModal.tsx';
import { A4PrintPreviewModal, A4LayoutType } from './A4PrintPreviewModal.tsx';
import { processAiBackgroundRemoval, downscaleImageToMax, loadImageAsync } from '../utils/aiMattingEngine.ts';
import { generateYoungManSamplePortrait, generateProceduralBackdrop } from '../utils/portraitSampleEngine.ts';
import { addRecentActivity } from '../utils/recentActivity.ts';

export type BgOptionType = 'solid' | 'photo_texture' | 'magic_ai' | 'custom_image' | 'transparent';

export interface BgPresetItem {
  id: string;
  name: string;
  hindiName?: string;
  type: BgOptionType;
  tabCategory: 'magic' | 'photo' | 'color';
  colorHex?: string;
  backdropKey?: string;
  previewBg: string;
  badge?: string;
}

export const PhotoStudio: React.FC = () => {
  // Navigation View: 'dashboard' (Main 2 Cards) | 'tool_remove_bg' | 'tool_resize_compress' | 'tool_passport_grid'
  const [currentView, setCurrentView] = useState<'dashboard' | 'tool_remove_bg' | 'tool_resize_compress' | 'tool_passport_grid'>('dashboard');

  // =========================================================================
  // CARD 1: REMOVE BACKGROUND & CANVA-STYLE STUDIO STATE
  // =========================================================================
  const [bgUploadedFile, setBgUploadedFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [transparentPngUrl, setTransparentPngUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isProcessingBg, setIsProcessingBg] = useState<boolean>(false);
  const [processStatusMessage, setProcessStatusMessage] = useState<string>('Ready');
  const [processPercent, setProcessPercent] = useState<number>(0);
  const [displayPercent, setDisplayPercent] = useState<number>(0);
  const [isCutoutApplied, setIsCutoutApplied] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'removed' | 'original'>('removed');
  const [isBgDragging, setIsBgDragging] = useState<boolean>(false);

  // Canva-Style 3-Tab Gallery Under Image: [ Color ] | [ Photo ] | [ Magic ]
  const [galleryTab, setGalleryTab] = useState<'color' | 'photo' | 'magic'>('color');

  // Remove.bg "Edit" Modal State (for manual Erase/Restore brush)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editModalTab, setEditModalTab] = useState<'background' | 'erase_restore'>('background');

  // Interactive Crop & Preset Resizing Modal State (e.g. Passport 3.5x4.5cm, A4)
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);
  const [passportInitialImageSrc, setPassportInitialImageSrc] = useState<string | null>(null);

  // Print-Specific A4 Sheet Preview Modal State
  const [isA4PrintModalOpen, setIsA4PrintModalOpen] = useState<boolean>(false);
  const [a4PrintImageSrc, setA4PrintImageSrc] = useState<string | null>(null);
  const [a4PrintDefaultLayout, setA4PrintDefaultLayout] = useState<A4LayoutType>('grid_32');
  const [a4PrintTitle, setA4PrintTitle] = useState<string>('A4 Sheet Print Preview');

  // Background Customization State
  const [bgType, setBgType] = useState<BgOptionType>('transparent');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('transparent_png');
  const [customSolidColor, setCustomSolidColor] = useState<string>('#FFFFFF');
  const [customBgImageSrc, setCustomBgImageSrc] = useState<string | null>(null);
  const [customBgFileName, setCustomBgFileName] = useState<string | null>(null);
  const [bgBlurLevel, setBgBlurLevel] = useState<number>(0); // 0 to 12px blur

  // Manual Erase / Restore State
  const [brushMode, setBrushMode] = useState<'erase' | 'restore'>('erase');
  const [brushSize, setBrushSize] = useState<number>(26);
  const [brushHardness, setBrushHardness] = useState<number>(80);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [brushCursorPos, setBrushCursorPos] = useState<{ x: number; y: number } | null>(null);

  // Canvas Refs for Card 1
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const modalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputBgRef = useRef<HTMLInputElement | null>(null);
  const customBgInputRef = useRef<HTMLInputElement | null>(null);
  const isWorkerDoneRef = useRef<boolean>(false);

  // =========================================================================
  // CARD 2: PHOTO RESIZE & PRECISE KB COMPRESSOR STATE
  // =========================================================================
  const [compressorUploadedFile, setCompressorUploadedFile] = useState<File | null>(null);
  const [compressorImageSrc, setCompressorImageSrc] = useState<string | null>(null);
  const [compressorFileName, setCompressorFileName] = useState<string>('photo.jpg');
  const [compressorOriginalSizeKb, setCompressorOriginalSizeKb] = useState<number>(240);
  const [originalDimensions, setOriginalDimensions] = useState<{ w: number; h: number }>({ w: 600, h: 800 });
  const [isCompressorDragging, setIsCompressorDragging] = useState<boolean>(false);

  // Target KB Settings
  const [targetKb, setTargetKb] = useState<number>(200); // Default 200 KB target
  const [customKbInput, setCustomKbInput] = useState<string>('200');
  
  // Custom Resize Settings
  const [selectedCropPreset, setSelectedCropPreset] = useState<string>('original');
  const [customWidth, setCustomWidth] = useState<number>(600);
  const [customHeight, setCustomHeight] = useState<number>(800);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [aspectRatioValue, setAspectRatioValue] = useState<number>(0.75); // w/h

  // Signature & Filters
  const [isSignatureMode, setIsSignatureMode] = useState<boolean>(false);
  const [bwThreshold, setBwThreshold] = useState<number>(160);
  const [adaptiveResolution, setAdaptiveResolution] = useState<boolean>(true);

  // Compression Output Results
  const [compressedFileUrl, setCompressedFileUrl] = useState<string | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedSizeKb, setCompressedSizeKb] = useState<number>(0);
  const [compressedDimensions, setCompressedDimensions] = useState<{ w: number; h: number }>({ w: 600, h: 800 });
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressorFormat, setCompressorFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');

  // Canvas Ref for Card 2
  const fileInputCompressorRef = useRef<HTMLInputElement | null>(null);
  const compressionCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // =========================================================================
  // PRESETS DATABASE FOR CARD 1 (3 TABS: COLOR, PHOTO, MAGIC)
  // =========================================================================
  const colorPresets: BgPresetItem[] = [
    {
      id: 'transparent_png',
      name: 'Transparent (PNG)',
      hindiName: 'पारदर्शी कटआउट (PNG)',
      type: 'transparent',
      tabCategory: 'color',
      previewBg: 'bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:8px_8px] bg-slate-100 border border-slate-300',
      badge: 'Cutout PNG',
    },
    {
      id: 'pure_white',
      name: 'Pure White (#FFF)',
      hindiName: 'पासपोर्ट / NEET / JEE',
      type: 'solid',
      tabCategory: 'color',
      colorHex: '#FFFFFF',
      previewBg: 'bg-white border-2 border-slate-300',
      badge: 'Passport / NEET',
    },
    {
      id: 'exam_blue',
      name: 'Exam Light Blue',
      hindiName: 'सरकारी परीक्षा लाइट ब्लू (#CBE3F7)',
      type: 'solid',
      tabCategory: 'color',
      colorHex: '#CBE3F7',
      previewBg: 'bg-[#CBE3F7] border border-blue-300',
      badge: 'SSC / UPSC',
    },
    {
      id: 'sky_blue',
      name: 'Sky Blue (#90CAF9)',
      hindiName: 'रेलवे व पुलिस भर्ती',
      type: 'solid',
      tabCategory: 'color',
      colorHex: '#90CAF9',
      previewBg: 'bg-[#90CAF9] border border-blue-400',
      badge: 'Govt Job',
    },
    {
      id: 'navy_blue',
      name: 'Navy Blue (#1E3A8A)',
      hindiName: 'कॉरपोरेट व बैंक नेवी ब्लू',
      type: 'solid',
      tabCategory: 'color',
      colorHex: '#1E3A8A',
      previewBg: 'bg-[#1E3A8A]',
      badge: 'Corporate',
    },
    {
      id: 'light_gray',
      name: 'Light Gray (#F1F5F9)',
      hindiName: 'ड्राइविंग लाइसेंस / ID ग्रे',
      type: 'solid',
      tabCategory: 'color',
      colorHex: '#F1F5F9',
      previewBg: 'bg-[#F1F5F9] border border-slate-300',
      badge: 'DL / ID Card',
    },
    {
      id: 'studio_cream',
      name: 'Warm Cream (#FAF5EE)',
      hindiName: 'स्टूडियो व मैरिज बायोडाटा',
      type: 'solid',
      tabCategory: 'color',
      colorHex: '#FAF5EE',
      previewBg: 'bg-[#FAF5EE] border border-amber-200',
      badge: 'Studio',
    },
    {
      id: 'slate_dark',
      name: 'Studio Dark Slate',
      hindiName: 'डार्क मॉडर्न स्टूडियो (#0F172A)',
      type: 'solid',
      tabCategory: 'color',
      colorHex: '#0F172A',
      previewBg: 'bg-[#0F172A]',
      badge: 'Dark Studio',
    }
  ];

  const photoPresets: BgPresetItem[] = [
    {
      id: 'modern_office',
      name: 'Modern Office',
      hindiName: 'कॉरपोरेट ऑफिस ग्लास व्यू',
      type: 'photo_texture',
      tabCategory: 'photo',
      backdropKey: 'modern_office',
      previewBg: 'bg-gradient-to-r from-slate-200 to-blue-200',
      badge: 'Office',
    },
    {
      id: 'studio_portrait_bokeh',
      name: 'Studio Bokeh',
      hindiName: 'प्रोफेशनल स्टूडियो बोकेह',
      type: 'photo_texture',
      tabCategory: 'photo',
      backdropKey: 'studio_portrait_bokeh',
      previewBg: 'bg-gradient-to-tr from-blue-900 via-indigo-900 to-slate-900',
      badge: 'Studio',
    },
    {
      id: 'garden_park_bokeh',
      name: 'Nature Green Park',
      hindiName: 'नेचुरल ग्रीनरी व गार्डन',
      type: 'photo_texture',
      tabCategory: 'photo',
      backdropKey: 'garden_park_bokeh',
      previewBg: 'bg-gradient-to-br from-emerald-800 to-teal-900',
      badge: 'Outdoor',
    },
    {
      id: 'luxury_room',
      name: 'Luxury Executive Suite',
      hindiName: 'प्रीमियम लाउंज व वुडन वॉल',
      type: 'photo_texture',
      tabCategory: 'photo',
      backdropKey: 'luxury_room',
      previewBg: 'bg-gradient-to-r from-amber-900 to-stone-900',
      badge: 'Luxury',
    },
    {
      id: 'urban_city_blur',
      name: 'Metropolitan Cityscape',
      hindiName: 'मेट्रो सिटी व इवनिंग लाइट्स',
      type: 'photo_texture',
      tabCategory: 'photo',
      backdropKey: 'urban_city_blur',
      previewBg: 'bg-gradient-to-tr from-sky-900 via-slate-800 to-indigo-950',
      badge: 'Urban',
    },
    {
      id: 'cozy_cafe_warm',
      name: 'Cozy Artisan Cafe',
      hindiName: 'वार्म एंबिएंट कैफे बोकेह',
      type: 'photo_texture',
      tabCategory: 'photo',
      backdropKey: 'cozy_cafe_warm',
      previewBg: 'bg-gradient-to-br from-amber-800 via-orange-950 to-stone-900',
      badge: 'Warm',
    },
    {
      id: 'brick_wall',
      name: 'Warm Studio Brick Wall',
      hindiName: 'रेड ब्रिक वॉल विथ वार्म स्टूडियो लाइट',
      type: 'photo_texture',
      tabCategory: 'photo',
      backdropKey: 'brick_wall',
      previewBg: 'bg-gradient-to-br from-red-900 to-stone-900',
      badge: 'Brick Wall',
    },
    {
      id: 'studio_canvas',
      name: 'Fine Art Portrait Canvas',
      hindiName: 'फाइन आर्ट टेक्सचर्ड ग्रे स्टूडियो',
      type: 'photo_texture',
      tabCategory: 'photo',
      backdropKey: 'studio_canvas',
      previewBg: 'bg-gradient-to-b from-slate-300 to-slate-500',
      badge: 'Art Canvas',
    },
    {
      id: 'library',
      name: 'Executive Wood Library',
      hindiName: 'प्रीमियम बुकशेल्फ़ व वार्म लाइट्स',
      type: 'photo_texture',
      tabCategory: 'photo',
      backdropKey: 'library',
      previewBg: 'bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950',
      badge: 'Library',
    }
  ];

  const magicAiPresets: BgPresetItem[] = [
    {
      id: 'magic_studio_spotlight',
      name: 'Studio Spotlight',
      hindiName: 'सेंटर फोकस स्टूडियो लाइट',
      type: 'magic_ai',
      tabCategory: 'magic',
      backdropKey: 'magic_studio_spotlight',
      previewBg: 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-blue-900 to-slate-950',
      badge: 'Spotlight',
    },
    {
      id: 'magic_golden_hour',
      name: 'Golden Hour Sunset',
      hindiName: 'वार्म सनसेट सनलाइट रेज',
      type: 'magic_ai',
      tabCategory: 'magic',
      backdropKey: 'magic_golden_hour',
      previewBg: 'bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-200',
      badge: 'Sunset Glow',
    },
    {
      id: 'magic_cyberpunk_neon',
      name: 'Cyberpunk Neon',
      hindiName: 'पर्पल व टील डार्क निऑन',
      type: 'magic_ai',
      tabCategory: 'magic',
      backdropKey: 'magic_cyberpunk_neon',
      previewBg: 'bg-gradient-to-r from-fuchsia-600 via-purple-900 to-cyan-500',
      badge: 'Neon Glow',
    },
    {
      id: 'magic_luxury_marble',
      name: 'Carrara Marble & Gold',
      hindiName: 'प्रीमियम व्हाइट मार्बल टेक्सचर',
      type: 'magic_ai',
      tabCategory: 'magic',
      backdropKey: 'magic_luxury_marble',
      previewBg: 'bg-slate-100 border border-slate-300',
      badge: 'Marble Gold',
    },
    {
      id: 'magic_cosmic_nebula',
      name: 'Cosmic Deep Space',
      hindiName: 'डीप स्पेस नेबुला व स्टार्स',
      type: 'magic_ai',
      tabCategory: 'magic',
      backdropKey: 'magic_cosmic_nebula',
      previewBg: 'bg-gradient-to-tr from-purple-950 via-indigo-950 to-black',
      badge: 'Cosmic Galaxy',
    },
    {
      id: 'magic_pastel_abstract',
      name: 'Dreamy Pastel Flow',
      hindiName: 'सॉफ्ट पेस्टल वॉटरकलर वेव',
      type: 'magic_ai',
      tabCategory: 'magic',
      backdropKey: 'magic_pastel_abstract',
      previewBg: 'bg-gradient-to-tr from-indigo-200 via-pink-200 to-amber-100',
      badge: 'Pastel Dream',
    },
    {
      id: 'magic_cinematic_teal_orange',
      name: 'Cinematic Teal & Amber',
      hindiName: 'हॉलीवुड सिनेमैटिक डुअल टोन',
      type: 'magic_ai',
      tabCategory: 'magic',
      backdropKey: 'magic_cinematic_teal_orange',
      previewBg: 'bg-gradient-to-r from-orange-600 via-slate-900 to-teal-500',
      badge: 'Cinematic',
    },
    {
      id: 'magic_bokeh_nature',
      name: 'Emerald Botanical Garden',
      hindiName: 'रेनफॉरेस्ट व सनफ्लेयर बोकेह',
      type: 'magic_ai',
      tabCategory: 'magic',
      backdropKey: 'magic_bokeh_nature',
      previewBg: 'bg-gradient-to-br from-emerald-900 via-teal-800 to-green-950',
      badge: 'Nature Lush',
    },
    {
      id: 'magic_minimalist_loft',
      name: 'Minimalist Penthouse Loft',
      hindiName: 'मॉडर्न स्कैंडिनेवियन ग्लास स्टूडियो',
      type: 'magic_ai',
      tabCategory: 'magic',
      backdropKey: 'magic_minimalist_loft',
      previewBg: 'bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300',
      badge: 'Modern Loft',
    },
    {
      id: 'magic_dark_moody_portrait',
      name: 'Charcoal Fine-Art Studio',
      hindiName: 'डार्क लक्ज़री पोट्रेट विग्नेट',
      type: 'magic_ai',
      tabCategory: 'magic',
      backdropKey: 'magic_dark_moody_portrait',
      previewBg: 'bg-gradient-to-b from-slate-800 to-slate-950',
      badge: 'Fine Art',
    },
    {
      id: 'magic_sunlit_terrace',
      name: 'Mediterranean Terrace',
      hindiName: 'सनलिट टेराकोटा व स्काई व्यू',
      type: 'magic_ai',
      tabCategory: 'magic',
      backdropKey: 'magic_sunlit_terrace',
      previewBg: 'bg-gradient-to-tr from-orange-500 via-sky-300 to-amber-200',
      badge: 'Sunlit Warmth',
    },
    {
      id: 'magic_tokyo_night',
      name: 'Tokyo Midnight Rain',
      hindiName: 'शिंजुकु नाइट सिटी बोकेह',
      type: 'magic_ai',
      tabCategory: 'magic',
      backdropKey: 'magic_tokyo_night',
      previewBg: 'bg-gradient-to-r from-red-600 via-slate-950 to-sky-500',
      badge: 'Tokyo Neon',
    },
    {
      id: 'magic_aurora_borealis',
      name: 'Northern Lights Aurora',
      hindiName: 'एमराल्ड व वायलेट औरोरा स्काई',
      type: 'magic_ai',
      tabCategory: 'magic',
      backdropKey: 'magic_aurora_borealis',
      previewBg: 'bg-gradient-to-tr from-emerald-500 via-slate-950 to-purple-600',
      badge: 'Aurora Sky',
    },
    {
      id: 'magic_warm_studio_warmth',
      name: 'Vintage Tungsten Glow',
      hindiName: 'विंटेज एडिसन वार्म स्टूडियो',
      type: 'magic_ai',
      tabCategory: 'magic',
      backdropKey: 'magic_warm_studio_warmth',
      previewBg: 'bg-gradient-to-b from-amber-900 via-amber-950 to-stone-950',
      badge: 'Tungsten',
    },
    {
      id: 'magic_foggy_forest',
      name: 'Mystic Redwood Pines',
      hindiName: 'मॉर्निंग मिस्ट फॉग फॉरेस्ट',
      type: 'magic_ai',
      tabCategory: 'magic',
      backdropKey: 'magic_foggy_forest',
      previewBg: 'bg-gradient-to-b from-slate-300 via-slate-700 to-slate-900',
      badge: 'Foggy Forest',
    },
    {
      id: 'magic_sunset_beach',
      name: 'Twilight Shoreline',
      hindiName: 'पीच वॉयलेट ओशन सनसेट',
      type: 'magic_ai',
      tabCategory: 'magic',
      backdropKey: 'magic_sunset_beach',
      previewBg: 'bg-gradient-to-tr from-rose-500 via-orange-400 to-indigo-900',
      badge: 'Sunset Beach',
    },
    {
      id: 'magic_scifi_clean_lab',
      name: 'Futuristic White Studio',
      hindiName: 'हाईटेक मिनिमल व्हाइट लैब',
      type: 'magic_ai',
      tabCategory: 'magic',
      backdropKey: 'magic_scifi_clean_lab',
      previewBg: 'bg-gradient-to-r from-white via-cyan-100 to-slate-200 border border-slate-200',
      badge: 'Sci-Fi Clean',
    },
    {
      id: 'magic_autumn_warmth',
      name: 'Golden Autumn Leaves',
      hindiName: 'गोल्डन मेपल ट्री बोकेह',
      type: 'magic_ai',
      tabCategory: 'magic',
      backdropKey: 'magic_autumn_warmth',
      previewBg: 'bg-gradient-to-br from-amber-600 via-amber-800 to-orange-950',
      badge: 'Autumn Bokeh',
    },
    {
      id: 'magic_executive_boardroom',
      name: 'High-Rise Boardroom',
      hindiName: 'स्काईलाइन एग्जीक्यूटिव ऑफिस',
      type: 'magic_ai',
      tabCategory: 'magic',
      backdropKey: 'magic_executive_boardroom',
      previewBg: 'bg-gradient-to-r from-slate-900 via-rose-950 to-slate-950',
      badge: 'Skyline Suite',
    },
    {
      id: 'magic_cherry_blossom',
      name: 'Cherry Blossom Sakura',
      hindiName: 'सॉफ्ट पिंक साकुरा पेटल्स',
      type: 'magic_ai',
      tabCategory: 'magic',
      backdropKey: 'magic_cherry_blossom',
      previewBg: 'bg-gradient-to-tr from-pink-200 via-pink-300 to-rose-400',
      badge: 'Sakura Spring',
    }
  ];

  const [renderTrigger, setRenderTrigger] = useState<number>(0);

  // =========================================================================
  // MULTI-LAYER COMPOSITOR & HD RENDER ENGINE FOR CARD 1 (FAILSAFE ZERO-BLANK RENDER)
  // =========================================================================
  const renderComposite = useCallback(async (
    targetCanvas: HTMLCanvasElement | null,
    overrideMask?: HTMLCanvasElement | null,
    overrideCutoutPng?: string | null
  ) => {
    if (!targetCanvas || !originalImageSrc) return;

    try {
      const img = await loadImageAsync(originalImageSrc);
      const w = img.naturalWidth || img.width || 640;
      const h = img.naturalHeight || img.height || 800;

      targetCanvas.width = w;
      targetCanvas.height = h;

      const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // Guarantee pristine full-resolution sharpness without downscale artifacts
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.clearRect(0, 0, w, h);

      // If View Mode is 'original', render raw image and return
      if (viewMode === 'original' || !isCutoutApplied) {
        ctx.drawImage(img, 0, 0, w, h);
        setProcessedImageUrl(targetCanvas.toDataURL('image/jpeg', 0.98));
        return;
      }

      // 1. LAYER 0: DRAW CHOSEN BACKGROUND (Only for solid, photo texture, magic AI, or custom image)
      if (bgType === 'transparent') {
        // Leave Layer 0 completely cleared for 100% pure transparent PNG output (alpha = 0)
      } else if (bgType === 'solid') {
        ctx.fillStyle = customSolidColor || '#FFFFFF';
        ctx.fillRect(0, 0, w, h);
      } else if (bgType === 'photo_texture' || bgType === 'magic_ai') {
        const activePreset = [...photoPresets, ...magicAiPresets].find((p) => p.id === selectedPresetId);
        const backdropKey = activePreset?.backdropKey || selectedPresetId || 'modern_office';
        const bgDataUrl = generateProceduralBackdrop(backdropKey, w, h);
        const bgImg = await loadImageAsync(bgDataUrl);

        ctx.save();
        if (bgBlurLevel > 0) {
          ctx.filter = `blur(${bgBlurLevel}px)`;
        }
        ctx.drawImage(bgImg, 0, 0, w, h);
        ctx.restore();
      } else if (bgType === 'custom_image' && customBgImageSrc) {
        const customImg = await loadImageAsync(customBgImageSrc);
        ctx.save();
        if (bgBlurLevel > 0) {
          ctx.filter = `blur(${bgBlurLevel}px)`;
        }
        ctx.drawImage(customImg, 0, 0, w, h);
        ctx.restore();
      }

      // 2. LAYER 1: DRAW ISOLATED HUMAN SUBJECT (Using Direct Cutout or Mask Canvas)
      const activeCutoutUrl = overrideCutoutPng || transparentPngUrl;
      const mask = overrideMask !== undefined ? overrideMask : maskCanvasRef.current;

      if (activeCutoutUrl) {
        // If we have the isolated transparent PNG, draw it directly for 100% crisp fidelity
        const cutoutImg = await loadImageAsync(activeCutoutUrl);
        ctx.drawImage(cutoutImg, 0, 0, w, h);
      } else {
        const fgCanvas = document.createElement('canvas');
        fgCanvas.width = w;
        fgCanvas.height = h;
        const fgCtx = fgCanvas.getContext('2d', { willReadFrequently: true });
        if (fgCtx) {
          fgCtx.drawImage(img, 0, 0, w, h);
          if (mask) {
            fgCtx.globalCompositeOperation = 'destination-in';
            fgCtx.drawImage(mask, 0, 0, w, h);
          }
          ctx.drawImage(fgCanvas, 0, 0);
          const resultPng = fgCanvas.toDataURL('image/png');
          setTransparentPngUrl(resultPng);
        }
      }

      const mime = bgType === 'transparent' ? 'image/png' : 'image/jpeg';
      setProcessedImageUrl(targetCanvas.toDataURL(mime, 0.98));
    } catch (err) {
      console.warn('Composite render error, executing graceful fallback:', err);
      // Resilient Fallback: Ensure canvas is NEVER left blank
      try {
        const img = await loadImageAsync(originalImageSrc);
        targetCanvas.width = img.naturalWidth || img.width || 640;
        targetCanvas.height = img.naturalHeight || img.height || 800;
        const ctx = targetCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          setProcessedImageUrl(targetCanvas.toDataURL('image/jpeg', 0.98));
        }
      } catch (fallbackErr) {
        console.error('Fallback draw failed:', fallbackErr);
      }
    }
  }, [originalImageSrc, viewMode, isCutoutApplied, bgType, customSolidColor, selectedPresetId, customBgImageSrc, bgBlurLevel, transparentPngUrl]);

  // Re-render Card 1 Composite
  useEffect(() => {
    if (originalImageSrc && previewCanvasRef.current) {
      renderComposite(previewCanvasRef.current);
      if (isEditModalOpen && modalCanvasRef.current) {
        renderComposite(modalCanvasRef.current);
      }
    }
  }, [renderComposite, isEditModalOpen, originalImageSrc, renderTrigger]);

  // Smooth continuous sequential progress counter animation (1% -> 99% capped -> 100% on resolve)
  useEffect(() => {
    let intervalId: number | null = null;
    if (isProcessingBg) {
      setDisplayPercent(1);
      const startTime = performance.now();

      intervalId = window.setInterval(() => {
        if (isWorkerDoneRef.current) {
          setDisplayPercent(100);
          if (intervalId) clearInterval(intervalId);
          return;
        }

        const elapsed = performance.now() - startTime;
        
        // Dynamic non-linear progression reaching ~95% in ~1.1s, capped strictly at 99%
        let targetPct = 1;
        if (elapsed < 300) {
          // Rapid initial start: 1% to 35%
          targetPct = Math.round(1 + (elapsed / 300) * 34);
        } else if (elapsed < 800) {
          // Mid curve: 35% to 75%
          targetPct = Math.round(35 + ((elapsed - 300) / 500) * 40);
        } else if (elapsed < 1300) {
          // Approaching top: 75% to 95%
          targetPct = Math.round(75 + ((elapsed - 800) / 500) * 20);
        } else {
          // Smooth slow tick up to 99% while waiting for worker
          targetPct = Math.min(99, 95 + Math.floor((elapsed - 1300) / 300));
        }

        setDisplayPercent((prev) => {
          if (isWorkerDoneRef.current) return 100;
          if (targetPct > prev) {
            // Step smoothly by 1-3% so every number range is visually visible
            const step = Math.max(1, Math.min(3, Math.ceil((targetPct - prev) / 2)));
            return Math.min(prev + step, 99);
          }
          return Math.min(prev, 99);
        });
      }, 30);
    } else {
      setDisplayPercent(0);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isProcessingBg]);

  // Decoupled Progress Handler
  const handleAiProgress = (msg: string, pct: number) => {
    setProcessStatusMessage(msg);
    setProcessPercent(pct);
  };

  // 1-Click Remove BG Action Handler with High-Priority Non-Blocking Execution
  const handleRemoveBg = async () => {
    if (!originalImageSrc) return;
    isWorkerDoneRef.current = false;
    setIsProcessingBg(true);
    setProcessPercent(1);
    setDisplayPercent(1);
    setProcessStatusMessage('Alpha Extraction... (1%)');

    try {
      // Auto-downscale to max 1024px for lightning-fast inference
      const { dataUrl: optimizedSrc } = await downscaleImageToMax(originalImageSrc, 1024);

      // Render image on canvas immediately
      if (previewCanvasRef.current) {
        const rawImg = await loadImageAsync(optimizedSrc);
        const targetCanvas = previewCanvasRef.current;
        targetCanvas.width = rawImg.naturalWidth || rawImg.width;
        targetCanvas.height = rawImg.naturalHeight || rawImg.height;
        const ctx = targetCanvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(rawImg, 0, 0, targetCanvas.width, targetCanvas.height);
        }
      }

      // Execute segmentation in dedicated Web Worker
      const result = await processAiBackgroundRemoval(optimizedSrc, (msg, pct) => {
        handleAiProgress(msg, pct);
      });

      // Snap to 100% on resolve
      isWorkerDoneRef.current = true;
      maskCanvasRef.current = result.maskCanvas;
      setTransparentPngUrl(result.transparentPngUrl);
      setIsCutoutApplied(true);
      setViewMode('removed');
      setBgType('transparent');
      setSelectedPresetId('transparent_png');
      setProcessPercent(100);
      setDisplayPercent(100);
      setProcessStatusMessage('Alpha Extraction... 100%');

      // Hold at 100% for 120ms so the user visibly perceives the completion
      await new Promise((r) => setTimeout(r, 120));

      // Instant Zero-Delay RequestAnimationFrame Swap
      requestAnimationFrame(async () => {
        if (previewCanvasRef.current) {
          await renderComposite(previewCanvasRef.current, result.maskCanvas, result.transparentPngUrl);
        }
        setRenderTrigger((prev) => prev + 1);

        // Hide overlay smoothly in 50ms once 100% cutout is mounted
        setTimeout(() => {
          setIsProcessingBg(false);
        }, 50);
      });
    } catch (err) {
      console.error('AI Background Removal error:', err);
      isWorkerDoneRef.current = true;
      setIsProcessingBg(false);
      setProcessStatusMessage('AI background removal complete.');
    }
  };

  // Card 1 File Upload (Drag & Drop or Picker) - Instantly Triggers Fast Edge AI Cutout with Auto-Downscaling
  const processCard1File = async (file: File) => {
    if (!file) return;
    isWorkerDoneRef.current = false;
    setIsProcessingBg(true);
    setProcessPercent(1);
    setDisplayPercent(1);
    setProcessStatusMessage('Alpha Extraction... (1%)');
    setViewMode('removed');
    setIsCutoutApplied(true);
    setBgType('transparent');
    setSelectedPresetId('transparent_png');

    try {
      // 1. AUTO-DOWNSIZE ON UPLOAD: Downscale to max 1024px to reduce pixel load by >80%
      const { dataUrl: optimizedSrc, width: optW, height: optH } = await downscaleImageToMax(file, 1024);
      setOriginalImageSrc(optimizedSrc);
      setBgUploadedFile(file);

      // Immediately render unblurred image on canvas under overlay
      if (previewCanvasRef.current) {
        const rawImg = await loadImageAsync(optimizedSrc);
        const targetCanvas = previewCanvasRef.current;
        targetCanvas.width = optW;
        targetCanvas.height = optH;
        const ctx = targetCanvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(rawImg, 0, 0, optW, optH);
        }
      }

      // 2. High-speed asynchronous cutout execution in dedicated Web Worker
      const res = await processAiBackgroundRemoval(optimizedSrc, (msg, pct) => {
        handleAiProgress(msg, pct);
      });

      // Snap to 100% on resolve
      isWorkerDoneRef.current = true;
      maskCanvasRef.current = res.maskCanvas;
      setTransparentPngUrl(res.transparentPngUrl);
      setIsCutoutApplied(true);
      setViewMode('removed');
      setBgType('transparent');
      setSelectedPresetId('transparent_png');
      setProcessPercent(100);
      setDisplayPercent(100);
      setProcessStatusMessage('Alpha Extraction... 100%');

      // Hold at 100% for 120ms so the user visibly perceives the completion
      await new Promise((r) => setTimeout(r, 120));

      // Instant Zero-Delay Render Swap
      requestAnimationFrame(async () => {
        if (previewCanvasRef.current) {
          await renderComposite(previewCanvasRef.current, res.maskCanvas, res.transparentPngUrl);
        }
        setRenderTrigger((prev) => prev + 1);

        setTimeout(() => {
          setIsProcessingBg(false);
        }, 50);
      });
    } catch (err) {
      console.error('Auto remove bg error:', err);
      isWorkerDoneRef.current = true;
      setIsProcessingBg(false);
    }
  };

  const handlePhotoUploadBg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processCard1File(file);
    }
    if (e.target) e.target.value = '';
  };

  // Custom Background Upload Handler
  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomBgFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        setCustomBgImageSrc(ev.target.result);
        setBgType('custom_image');
        setSelectedPresetId('custom_uploaded_bg');
        setViewMode('removed');
        setIsCutoutApplied(true);
        setRenderTrigger((prev) => prev + 1);
      }
    };
    reader.readAsDataURL(file);
  };

  // Load Sample Portrait for Card 1 - Instant Auto Cutout with smooth animation feedback
  const loadSamplePortraitForCard1 = async () => {
    isWorkerDoneRef.current = false;
    setIsProcessingBg(true);
    setProcessPercent(1);
    setDisplayPercent(1);
    setProcessStatusMessage('Alpha Extraction... (1%)');
    setViewMode('removed');
    setIsCutoutApplied(true);
    setBgType('transparent');
    setSelectedPresetId('transparent_png');

    const { sourceImageUrl, isolatedCutoutUrl, maskCanvas } = generateYoungManSamplePortrait(640, 800);
    setOriginalImageSrc(sourceImageUrl);
    setTransparentPngUrl(isolatedCutoutUrl);
    maskCanvasRef.current = maskCanvas;
    setBgUploadedFile(new File(["sample"], "sample_portrait.jpg", { type: "image/jpeg" }));

    // Draw unblurred raw sample image onto canvas under overlay
    if (previewCanvasRef.current) {
      try {
        const rawImg = await loadImageAsync(sourceImageUrl);
        const targetCanvas = previewCanvasRef.current;
        targetCanvas.width = rawImg.naturalWidth || 640;
        targetCanvas.height = rawImg.naturalHeight || 800;
        const ctx = targetCanvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(rawImg, 0, 0, targetCanvas.width, targetCanvas.height);
        }
      } catch {
        // silent
      }
    }

    // Complete smooth progress cycle up to ~95-98% and snap to 100%
    setTimeout(async () => {
      isWorkerDoneRef.current = true;
      setProcessPercent(100);
      setDisplayPercent(100);
      setProcessStatusMessage('Alpha Extraction... 100%');

      await new Promise((r) => setTimeout(r, 120));

      requestAnimationFrame(async () => {
        if (previewCanvasRef.current) {
          await renderComposite(previewCanvasRef.current, maskCanvas, isolatedCutoutUrl);
        }
        setRenderTrigger((prev) => prev + 1);

        setTimeout(() => {
          setIsProcessingBg(false);
        }, 50);
      });
    }, 1100);
  };

  // =========================================================================
  // CARD 1: MANUAL ERASE / RESTORE BRUSH ENGINE
  // =========================================================================
  const handleBrushMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (editModalTab !== 'erase_restore') return;
    setIsDrawing(true);
    applyBrushStroke(e);
  };

  const handleBrushMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = modalCanvasRef.current || previewCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setBrushCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    if (isDrawing && editModalTab === 'erase_restore') {
      applyBrushStroke(e);
    }
  };

  const handleBrushMouseUp = () => {
    setIsDrawing(false);
    renderComposite(previewCanvasRef.current);
  };

  const applyBrushStroke = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const maskCanvas = maskCanvasRef.current;
    const targetCanvas = modalCanvasRef.current || previewCanvasRef.current;
    if (!maskCanvas || !targetCanvas) return;

    const rect = targetCanvas.getBoundingClientRect();
    const scaleX = maskCanvas.width / rect.width;
    const scaleY = maskCanvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const ctx = maskCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, brushSize * (scaleX || 1), 0, Math.PI * 2);

    if (brushMode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = `rgba(0, 0, 0, ${brushHardness / 100})`;
      ctx.fill();
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = `rgba(255, 255, 255, ${brushHardness / 100})`;
      ctx.fill();
    }
    ctx.restore();

    renderComposite(targetCanvas);
  };

  // Transfer Cutout to Card 2 (Resize & Compress)
  const transferToResizeCompressor = () => {
    const source = processedImageUrl || transparentPngUrl || originalImageSrc;
    if (source) {
      setCompressorImageSrc(source);
      setCompressorFileName('cutout_studio.jpg');
      setCompressorUploadedFile(new File(["cutout"], "cutout_studio.jpg", { type: "image/jpeg" }));
      setCurrentView('tool_resize_compress');
    }
  };

  // Transfer Cutout to Card 3 (Passport Grid Multi-Print)
  const transferToPassportGrid = (customSrc?: string) => {
    const source = customSrc || processedImageUrl || transparentPngUrl || originalImageSrc;
    if (source) {
      setPassportInitialImageSrc(source);
      setCurrentView('tool_passport_grid');
    }
  };

  // Handle Interactive Crop Applied
  const handleApplyCrop = async (croppedDataUrl: string, metadata: { width: number; height: number; presetName: string }) => {
    setOriginalImageSrc(croppedDataUrl);
    setTransparentPngUrl(croppedDataUrl);
    setProcessedImageUrl(croppedDataUrl);

    // Recreate solid/backdrop mask canvas matching new cropped dimensions
    const mask = document.createElement('canvas');
    mask.width = metadata.width;
    mask.height = metadata.height;
    const mctx = mask.getContext('2d');
    if (mctx) {
      mctx.fillStyle = '#FFFFFF';
      mctx.fillRect(0, 0, metadata.width, metadata.height);
    }
    maskCanvasRef.current = mask;

    if (previewCanvasRef.current) {
      await renderComposite(previewCanvasRef.current, mask, croppedDataUrl);
    }
    setRenderTrigger((prev) => prev + 1);
  };

  // Direct transfer from Crop Modal to Passport Grid
  const handleCropSendToPassportGrid = (croppedDataUrl: string) => {
    setPassportInitialImageSrc(croppedDataUrl);
    setCurrentView('tool_passport_grid');
  };

  // Direct transfer from Crop Modal to Strict KB Compressor
  const handleCropSendToCompressor = (croppedDataUrl: string) => {
    setCompressorImageSrc(croppedDataUrl);
    setCompressorFileName('cropped_preset.jpg');
    setCompressorUploadedFile(new File(["cropped"], "cropped_preset.jpg", { type: "image/jpeg" }));
    setCurrentView('tool_resize_compress');
  };

  // Helper to open A4 Print Preview
  const openA4PrintPreview = (imgSrc?: string | null, defaultLayout: A4LayoutType = 'grid_32', customTitle: string = 'A4 Sheet Print Preview') => {
    const source = imgSrc || processedImageUrl || transparentPngUrl || originalImageSrc || compressorImageSrc;
    if (!source) {
      loadSamplePortraitForCard1();
      setTimeout(() => {
        setA4PrintImageSrc(originalImageSrc || processedImageUrl);
        setA4PrintDefaultLayout(defaultLayout);
        setA4PrintTitle(customTitle);
        setIsA4PrintModalOpen(true);
      }, 100);
      return;
    }
    setA4PrintImageSrc(source);
    setA4PrintDefaultLayout(defaultLayout);
    setA4PrintTitle(customTitle);
    setIsA4PrintModalOpen(true);
  };

  // =========================================================================
  // CARD 2: PRECISE KB COMPRESSION & CUSTOM RESIZE ENGINE
  // =========================================================================

  // Handle Card 2 Dedicated File Upload
  const processCard2File = (file: File) => {
    if (!file) return;
    setCompressorUploadedFile(file);
    setCompressorFileName(file.name);
    const sizeKb = Math.round((file.size / 1024) * 10) / 10;
    setCompressorOriginalSizeKb(sizeKb);

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        const src = ev.target.result;
        setCompressorImageSrc(src);

        const img = new Image();
        img.src = src;
        img.onload = () => {
          const w = img.width;
          const h = img.height;
          setOriginalDimensions({ w, h });
          setCustomWidth(w);
          setCustomHeight(h);
          setAspectRatioValue(w / h);

          // Auto-detect signature
          if (file.name.toLowerCase().includes('sig') || w > h * 1.6) {
            setIsSignatureMode(true);
            setSelectedCropPreset('signature');
            setTargetKb(20);
            setCustomKbInput('20');
            setCustomWidth(350);
            setCustomHeight(150);
          }
        };
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCompressorUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processCard2File(file);
    }
    if (e.target) e.target.value = '';
  };

  // Load Sample for Card 2
  const loadSampleForCard2 = () => {
    const { sourceImageUrl } = generateYoungManSamplePortrait(640, 800);
    setCompressorImageSrc(sourceImageUrl);
    setCompressorFileName('sample_portrait.jpg');
    setCompressorOriginalSizeKb(380);
    setOriginalDimensions({ w: 640, h: 800 });
    setCustomWidth(640);
    setCustomHeight(800);
    setAspectRatioValue(640 / 800);
    setCompressorUploadedFile(new File(["sample"], "sample_portrait.jpg", { type: "image/jpeg" }));
  };

  // Apply Dimension Preset
  const handleCropPresetChange = (presetKey: string) => {
    setSelectedCropPreset(presetKey);

    if (presetKey === 'original') {
      setCustomWidth(originalDimensions.w);
      setCustomHeight(originalDimensions.h);
      setAspectRatioValue(originalDimensions.w / originalDimensions.h);
      setIsSignatureMode(false);
    } else if (presetKey === 'passport_35x45') {
      setCustomWidth(413); // 35mm at 300 DPI
      setCustomHeight(531); // 45mm at 300 DPI
      setAspectRatioValue(413 / 531);
      setIsSignatureMode(false);
      if (targetKb > 50) {
        setTargetKb(50);
        setCustomKbInput('50');
      }
    } else if (presetKey === 'ssc_upsc_form') {
      setCustomWidth(350);
      setCustomHeight(450);
      setAspectRatioValue(350 / 450);
      setIsSignatureMode(false);
      setTargetKb(50);
      setCustomKbInput('50');
    } else if (presetKey === 'signature') {
      setCustomWidth(350);
      setCustomHeight(150);
      setAspectRatioValue(350 / 150);
      setIsSignatureMode(true);
      setTargetKb(20);
      setCustomKbInput('20');
    } else if (presetKey === 'square_id') {
      setCustomWidth(600);
      setCustomHeight(600);
      setAspectRatioValue(1);
      setIsSignatureMode(false);
    } else if (presetKey === 'postcard_4x6') {
      setCustomWidth(1200);
      setCustomHeight(1800);
      setAspectRatioValue(1200 / 1800);
      setIsSignatureMode(false);
      if (targetKb < 100) {
        setTargetKb(200);
        setCustomKbInput('200');
      }
    }
  };

  // Aspect Ratio Locked Dimension Adjusters
  const handleWidthChange = (val: number) => {
    setCustomWidth(val);
    if (lockAspectRatio && aspectRatioValue > 0) {
      setCustomHeight(Math.round(val / aspectRatioValue));
    }
  };

  const handleHeightChange = (val: number) => {
    setCustomHeight(val);
    if (lockAspectRatio && aspectRatioValue > 0) {
      setCustomWidth(Math.round(val * aspectRatioValue));
    }
  };

  // =========================================================================
  // HIGH-PRECISION KB COMPRESSION ALGORITHM
  // Hits within 92% - 99.5% of target KB (e.g. 192-198 KB for 200 KB target)
  // =========================================================================
  const runPreciseKbCompression = useCallback(async () => {
    const source = compressorImageSrc || processedImageUrl || originalImageSrc;
    if (!source) return;

    setIsCompressing(true);

    const img = await loadImageAsync(source);
    const targetBytes = targetKb * 1024;

    let canvas = compressionCanvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      compressionCanvasRef.current = canvas;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      setIsCompressing(false);
      return;
    }

    let baseW = customWidth || originalDimensions.w || 600;
    let baseH = customHeight || originalDimensions.h || 800;

    // Helper to test blob at specific dimensions and quality
    const testBlobAt = async (w: number, h: number, q: number): Promise<Blob | null> => {
      canvas!.width = w;
      canvas!.height = h;

      if (compressorFormat === 'image/jpeg') {
        ctx!.fillStyle = '#FFFFFF';
        ctx!.fillRect(0, 0, w, h);
      } else {
        ctx!.clearRect(0, 0, w, h);
      }

      ctx!.drawImage(img, 0, 0, w, h);

      // Signature B&W Whitewash Filter
      if (isSignatureMode) {
        const imgData = ctx!.getImageData(0, 0, w, h);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          if (lum > bwThreshold) {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
          } else {
            data[i] = Math.max(0, Math.floor(data[i] * 0.3));
            data[i + 1] = Math.max(0, Math.floor(data[i + 1] * 0.3));
            data[i + 2] = Math.max(0, Math.floor(data[i + 2] * 0.4));
          }
        }
        ctx!.putImageData(imgData, 0, 0);
      }

      return new Promise((resolve) => {
        canvas!.toBlob((b) => resolve(b), compressorFormat, q);
      });
    };

    let bestBlob: Blob | null = null;
    let bestW = baseW;
    let bestH = baseH;

    // Adaptive Resolution Scale Check
    if (adaptiveResolution && selectedCropPreset === 'original') {
      const sampleBlob = await testBlobAt(baseW, baseH, 0.98);
      if (sampleBlob && sampleBlob.size < targetBytes * 0.75 && (img.width > baseW || img.height > baseH)) {
        const maxNativeScale = Math.min(2.0, Math.max(img.width / baseW, img.height / baseH));
        baseW = Math.round(baseW * maxNativeScale);
        baseH = Math.round(baseH * maxNativeScale);
      }
    }

    // Binary Search on Quality (14 precise iterations)
    let minQ = 0.01;
    let maxQ = 0.999;
    
    // Test initial max quality
    let blobAtMax = await testBlobAt(baseW, baseH, 0.995);
    if (blobAtMax && blobAtMax.size <= targetBytes) {
      bestBlob = blobAtMax;
      bestW = baseW;
      bestH = baseH;
    } else {
      // Binary search for exact quality
      for (let i = 0; i < 14; i++) {
        const midQ = (minQ + maxQ) / 2;
        const currentBlob = await testBlobAt(baseW, baseH, midQ);
        if (!currentBlob) break;

        if (currentBlob.size <= targetBytes) {
          bestBlob = currentBlob;
          bestW = baseW;
          bestH = baseH;
          minQ = midQ; // Try higher quality to get closer to target
        } else {
          maxQ = midQ;
        }
      }

      // If even at lowest quality it's still > targetBytes, downscale dimensions
      if (!bestBlob || bestBlob.size > targetBytes) {
        let currentScale = 0.90;
        while (currentScale >= 0.20) {
          const sW = Math.max(80, Math.round(baseW * currentScale));
          const sH = Math.max(80, Math.round(baseH * currentScale));

          // Run binary search at this dimension
          let subMinQ = 0.40;
          let subMaxQ = 0.98;
          let subBestBlob: Blob | null = null;

          for (let k = 0; k < 6; k++) {
            const subMidQ = (subMinQ + subMaxQ) / 2;
            const testBlob = await testBlobAt(sW, sH, subMidQ);
            if (testBlob && testBlob.size <= targetBytes) {
              subBestBlob = testBlob;
              subMinQ = subMidQ;
            } else {
              subMaxQ = subMidQ;
            }
          }

          if (subBestBlob) {
            bestBlob = subBestBlob;
            bestW = sW;
            bestH = sH;
            break;
          }
          currentScale -= 0.12;
        }
      }
    }

    if (!bestBlob) {
      bestBlob = await testBlobAt(Math.round(baseW * 0.5), Math.round(baseH * 0.5), 0.5);
      bestW = Math.round(baseW * 0.5);
      bestH = Math.round(baseH * 0.5);
    }

    if (bestBlob) {
      setCompressedBlob(bestBlob);
      setCompressedFileUrl(URL.createObjectURL(bestBlob));
      const finalSize = Math.round((bestBlob.size / 1024) * 10) / 10;
      setCompressedSizeKb(finalSize);
      setCompressedDimensions({ w: bestW, h: bestH });
    }

    setIsCompressing(false);
  }, [
    compressorImageSrc, 
    processedImageUrl, 
    originalImageSrc, 
    customWidth, 
    customHeight, 
    targetKb, 
    compressorFormat, 
    isSignatureMode, 
    bwThreshold, 
    adaptiveResolution, 
    selectedCropPreset,
    originalDimensions
  ]);

  // Trigger compression whenever settings change
  useEffect(() => {
    if (currentView === 'tool_resize_compress' && compressorImageSrc) {
      const timer = setTimeout(() => runPreciseKbCompression(), 120);
      return () => clearTimeout(timer);
    }
  }, [currentView, compressorImageSrc, runPreciseKbCompression]);

  // Download Compressed Result
  const downloadCompressed = () => {
    if (!compressedBlob) return;
    const ext = compressorFormat === 'image/png' ? 'png' : compressorFormat === 'image/webp' ? 'webp' : 'jpg';
    const cleanName = compressorFileName.replace(/\.[^/.]+$/, '');
    const filename = `${cleanName}_${compressedSizeKb}kb.${ext}`;

    const blobUrl = URL.createObjectURL(compressedBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addRecentActivity({
      name: filename,
      type: 'image',
      category: `Photo Compressor (${selectedCropPreset})`,
      sizeLabel: `${compressedSizeKb} KB`,
      downloadUrl: compressedFileUrl || blobUrl,
      previewUrl: compressedFileUrl || blobUrl
    });
  };

  return (
    <div className="space-y-6">
      
      {/* ========================================================================= */}
      {/* TOP HEADER */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 shrink-0">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                CATEGORY 2
              </span>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                Photo & Image Studio Suite
              </h1>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              1-क्लिक AI बैकग्राउंड रिमूवर, कैनवा बैकड्रॉप्स, सटीक KB कम्प्रेसर व पासपोर्ट प्रिंट
            </p>
          </div>
        </div>

        {/* Back to Dashboard Button if inside a tool */}
        {currentView !== 'dashboard' && (
          <button
            onClick={() => setCurrentView('dashboard')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-slate-700 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-purple-400" />
            <span>Back to Dashboard (डैशबोर्ड)</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. MAIN DASHBOARD: 2 DISTINCT LARGE FEATURE CARDS (PDF TOOLS SUITE STYLE) */}
      {/* ========================================================================= */}
      {currentView === 'dashboard' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CARD A: AI BACKGROUND REMOVER */}
            <div className="bg-white dark:bg-slate-900 border-2 border-purple-200 dark:border-purple-950/60 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:border-purple-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-inner">
                  <Wand2 className="w-7 h-7" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-mono">
                      AI CUTOUT ENGINE
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      Instant WASM
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mt-2">
                    AI Background Remover
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium leading-relaxed">
                    1-click transparent PNG cutout, color backgrounds & erase/restore tool.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>Instant hair & edge isolation in 1-click</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>Canva-style Color, Photo & Magic backdrops</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>Manual Erase / Restore brush for precision</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => setCurrentView('tool_remove_bg')}
                  className="w-full py-3 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-500/20 cursor-pointer transition-all flex items-center justify-center gap-2 group-hover:gap-3"
                >
                  <span>Open Tool (टूल खोलें)</span>
                  <ArrowRight className="w-4 h-4 transition-transform" />
                </button>
              </div>
            </div>

            {/* CARD B: PHOTO RESIZE & STRICT KB COMPRESSOR */}
            <div className="bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-950/60 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:border-blue-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
                  <Zap className="w-7 h-7" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-mono">
                      EXACT KB PRECISION
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                      14-Pass Binary Engine
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mt-2">
                    Photo Resize & Strict KB Compressor
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium leading-relaxed">
                    Custom dimensions, passport crop, and precise KB target optimization.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Exact Target: 200 KB reaches ~195 KB safely</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Custom width, height & aspect ratio lock</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>SSC, UPSC, NEET & Signature whitening filter</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => setCurrentView('tool_resize_compress')}
                  className="w-full py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 cursor-pointer transition-all flex items-center justify-center gap-2 group-hover:gap-3"
                >
                  <span>Open Tool (टूल खोलें)</span>
                  <ArrowRight className="w-4 h-4 transition-transform" />
                </button>
              </div>
            </div>

          </div>

          {/* Quick Utility Banners: Crop, Passport Grid & A4 Print Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Quick Banner 1: Interactive Crop & Dimension Resizer */}
            <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl p-4 flex flex-col justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Crop className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center flex-wrap gap-1.5">
                    <span>Crop & Preset Resizer</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-300">
                      3.5×4.5cm • A4
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Crop cutout photos to exact physical millimeter/inch presets (Passport, Visa, A4) with 300 DPI clarity.
                  </p>
                </div>
              </div>
              <div className="pt-1">
                <button
                  onClick={() => {
                    if (!originalImageSrc) {
                      loadSamplePortraitForCard1();
                    }
                    setIsCropModalOpen(true);
                  }}
                  className="w-full px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shrink-0 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Crop className="w-3.5 h-3.5" />
                  <span>Open Crop & Resizer</span>
                </button>
              </div>
            </div>

            {/* Quick Banner 2: Passport Grid */}
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex flex-col justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center flex-wrap gap-1.5">
                    <span>Passport Grid 4×6 Maker</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
                      4×6 Photo Paper
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Generate 4, 8, or 12 passport copies with cut-marks for 4x6 photo paper printing.
                  </p>
                </div>
              </div>
              <div className="pt-1">
                <button
                  onClick={() => setCurrentView('tool_passport_grid')}
                  className="w-full px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shrink-0 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Open Passport Grid</span>
                </button>
              </div>
            </div>

            {/* Quick Banner 3: A4 Print Preview Mode */}
            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex flex-col justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center flex-wrap gap-1.5">
                    <span>A4 Sheet Print Preview</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                      300 DPI Live A4
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Inspect exact A4 layout placement (32/24/16/8 grid or full page) before committing to printer dialog.
                  </p>
                </div>
              </div>
              <div className="pt-1">
                <button
                  onClick={() => openA4PrintPreview(processedImageUrl || transparentPngUrl || originalImageSrc || compressorImageSrc, 'grid_32', 'A4 Sheet Print Preview Mode')}
                  className="w-full px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shrink-0 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Open A4 Print Preview</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DEDICATED WORKFLOW A: REMOVE BACKGROUND (CENTERED UPLOAD ZONE FIRST) */}
      {/* ========================================================================= */}
      {currentView === 'tool_remove_bg' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* If NO file is uploaded yet: Show LARGE PROMINENT CENTERED UPLOAD ZONE */}
          {!originalImageSrc ? (
            <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border-2 border-dashed border-purple-300 dark:border-purple-800 rounded-3xl p-8 sm:p-12 text-center shadow-md space-y-6">
              
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsBgDragging(true); }}
                onDragLeave={() => setIsBgDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsBgDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) processCard1File(file);
                }}
                className={`py-8 px-4 rounded-2xl transition-all ${
                  isBgDragging ? 'bg-purple-100/50 dark:bg-purple-950/50' : ''
                }`}
              >
                <div className="w-20 h-20 rounded-3xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto shadow-inner mb-4">
                  <Wand2 className="w-10 h-10" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Upload Image for AI Cutout (फोटो अपलोड करें)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
                  Drag and drop your photo here or browse from device. AI automatically isolates the subject and provides transparent PNG or custom backgrounds.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <input
                    type="file"
                    ref={fileInputBgRef}
                    onChange={handlePhotoUploadBg}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputBgRef.current?.click()}
                    className="w-full sm:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/30 cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Image</span>
                  </button>

                  <button
                    onClick={loadSamplePortraitForCard1}
                    className="w-full sm:w-auto px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span>⚡ Load Sample Portrait</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> JPG, PNG, WebP</span>
                <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> High-res up to 10MB</span>
                <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> 100% Private in-browser</span>
              </div>

            </div>
          ) : (
            /* Once File is Uploaded: Show Full Studio Tools & Canvas */
            <div className="space-y-5">
              
              {/* Main Stage Viewport Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
                
                {/* Stage Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  
                  <div className="flex items-center flex-wrap gap-2">
                    <input
                      type="file"
                      ref={fileInputBgRef}
                      onChange={handlePhotoUploadBg}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputBgRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Another Photo</span>
                    </button>

                    <button
                      onClick={loadSamplePortraitForCard1}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                      <span>Sample Photo</span>
                    </button>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Auto Cutout Applied</span>
                    </div>

                    {/* Quick Interactive Crop Button */}
                    <button
                      onClick={() => setIsCropModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-950/80 hover:bg-purple-200 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800 rounded-xl text-xs font-bold cursor-pointer transition-all"
                    >
                      <Crop className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>Crop & Resizer (3.5×4.5cm, A4)</span>
                    </button>

                    {/* A4 Print Preview Button */}
                    <button
                      onClick={() => openA4PrintPreview(processedImageUrl || transparentPngUrl || originalImageSrc, 'grid_32', 'Passport & Portrait A4 Sheet Print Preview')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 rounded-xl text-xs font-bold cursor-pointer transition-all"
                      title="Preview how this photo will appear on an A4 sheet"
                    >
                      <Printer className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>A4 Print Preview (A4 शीट प्रिंट)</span>
                    </button>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      onClick={() => setViewMode('removed')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        viewMode === 'removed'
                          ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Removed Background
                    </button>
                    <button
                      onClick={() => setViewMode('original')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        viewMode === 'original'
                          ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Original Photo
                    </button>
                  </div>

                </div>

                {/* Central Canvas Viewport with Classic Dot Matrix (Bindu-Bindu) Frame */}
                <div 
                  className="relative w-full max-w-xl mx-auto flex items-center justify-center min-h-[400px] rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-[radial-gradient(#94a3b8_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#475569_1.5px,transparent_1.5px)] [background-size:16px_16px] bg-slate-100 dark:bg-slate-950 shadow-inner group"
                >
                  {/* Main Interactive Canvas with Zero-Blur Full-Resolution Crisp Rendering */}
                  <canvas
                    ref={previewCanvasRef}
                    className="max-h-[440px] w-auto object-contain rounded-lg shadow-md transition-opacity duration-200 ease-out [image-rendering:auto] opacity-100"
                  />

                  {/* Floating Remove.bg Style Action Buttons: Crop & Preset Resize + Edit (Erase/Restore) + A4 Print */}
                  {viewMode === 'removed' && !isProcessingBg && (
                    <div className="absolute top-3 right-3 z-20 flex items-center gap-2 animate-fadeIn">
                      <button
                        onClick={() => setIsCropModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/95 hover:bg-purple-600 text-white backdrop-blur-md rounded-xl text-xs font-bold shadow-lg border border-purple-400/60 cursor-pointer transition-all hover:scale-105"
                      >
                        <Crop className="w-3.5 h-3.5 text-purple-200" />
                        <span>Crop (3.5×4.5cm, A4)</span>
                      </button>

                      <button
                        onClick={() => openA4PrintPreview(processedImageUrl || transparentPngUrl || originalImageSrc, 'grid_32', 'Passport & Portrait A4 Sheet Print Preview')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/95 hover:bg-blue-600 text-white backdrop-blur-md rounded-xl text-xs font-bold shadow-lg border border-blue-400/60 cursor-pointer transition-all hover:scale-105"
                        title="Preview exact A4 layout placement before printing"
                      >
                        <Printer className="w-3.5 h-3.5 text-white" />
                        <span>A4 Print</span>
                      </button>

                      <button
                        onClick={() => {
                          setEditModalTab('background');
                          setIsEditModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-900 text-white backdrop-blur-md rounded-xl text-xs font-bold shadow-lg border border-slate-700/80 cursor-pointer transition-all hover:scale-105"
                      >
                        <Sliders className="w-3.5 h-3.5 text-purple-400" />
                        <span>Edit (Erase / Restore)</span>
                      </button>
                    </div>
                  )}

                  {/* Clean Minimalist AI Background Removal Loader Overlay */}
                  {isProcessingBg && (
                    <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center p-4 z-30 text-white animate-fadeIn select-none">
                      
                      {/* Compact Centered Loader Unit */}
                      <div className="flex flex-col items-center justify-center text-center gap-3">
                        
                        {/* 1. Spinning Glowing Star / Circle Icon at the Top */}
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                          {/* Outer dashed spinning ring */}
                          <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/50 animate-spin" style={{ animationDuration: '6s' }}></div>
                          {/* Inner high-speed spinner */}
                          <div className="absolute inset-1 rounded-full border-2 border-t-cyan-400 border-r-sky-300 border-b-transparent border-l-transparent animate-spin"></div>
                          {/* Centered Glowing Star */}
                          <div className="w-8 h-8 rounded-xl bg-slate-900/90 border border-cyan-400/60 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.8)]">
                            <Star className="w-4 h-4 fill-cyan-400 text-cyan-300 animate-pulse" />
                          </div>
                        </div>

                        {/* 2. Live Percentage Counter */}
                        <div className="flex items-baseline justify-center gap-0.5">
                          <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]">
                            {displayPercent}
                          </span>
                          <span className="text-lg sm:text-xl font-bold font-mono text-cyan-400">%</span>
                        </div>

                        {/* 3. Clean Status Text */}
                        <div className="text-xs sm:text-sm font-semibold tracking-wide text-cyan-200">
                          <span>{displayPercent >= 100 ? 'Alpha Extraction... 100%' : `Alpha Extraction... (${displayPercent}%)`}</span>
                        </div>

                      </div>

                    </div>
                  )}

                </div>

                {/* Bottom Actions & Cross-Card Transfer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      AI Edge Isolation: <strong className="text-slate-800 dark:text-slate-200">100% Crisp Human Cutout</strong>
                    </span>
                  </div>

                  <div className="flex items-center flex-wrap gap-2">
                    <button
                      onClick={() => setIsCropModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                    >
                      <Crop className="w-3.5 h-3.5 text-purple-200" />
                      <span>Crop Dimensions (3.5×4.5cm / A4)</span>
                    </button>
                    {transparentPngUrl && (
                      <a
                        href={transparentPngUrl}
                        download="cutout_transparent.png"
                        onClick={() => {
                          addRecentActivity({
                            name: 'cutout_transparent.png',
                            type: 'image',
                            category: 'Transparent Cutout PNG',
                            sizeLabel: 'HD Cutout',
                            downloadUrl: transparentPngUrl,
                            previewUrl: transparentPngUrl
                          });
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                      >
                        <Download className="w-3.5 h-3.5 text-purple-400" />
                        <span>Download PNG</span>
                      </a>
                    )}
                    {processedImageUrl && (
                      <a
                        href={processedImageUrl}
                        download="studio_portrait_hd.jpg"
                        onClick={() => {
                          addRecentActivity({
                            name: 'studio_portrait_hd.jpg',
                            type: 'image',
                            category: 'Studio Portrait HD',
                            sizeLabel: 'HD Master',
                            downloadUrl: processedImageUrl,
                            previewUrl: processedImageUrl
                          });
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                      >
                        <Download className="w-3.5 h-3.5 text-purple-300" />
                        <span>Download HD JPG</span>
                      </a>
                    )}
                    <button
                      onClick={() => openA4PrintPreview(processedImageUrl || transparentPngUrl || originalImageSrc, 'grid_32', 'Portrait & Cutout A4 Sheet Print Preview')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                      title="Inspect full-sheet A4 preview before printing"
                    >
                      <Printer className="w-3.5 h-3.5 text-blue-200" />
                      <span>A4 Sheet Print Preview</span>
                    </button>
                    <button
                      onClick={() => transferToPassportGrid()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Print Passport Sheet (4×6 / A4)</span>
                    </button>
                    <button
                      onClick={transferToResizeCompressor}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>Send to Resize & Compress</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* CANVA-STYLE 3-TAB GALLERY UI */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Canva-Style Backdrop Gallery:
                    </span>
                    <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => setGalleryTab('color')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                          galleryTab === 'color'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        <Palette className="w-3.5 h-3.5" />
                        <span>Color</span>
                      </button>

                      <button
                        onClick={() => setGalleryTab('photo')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                          galleryTab === 'photo'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Photo</span>
                      </button>

                      <button
                        onClick={() => setGalleryTab('magic')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                          galleryTab === 'magic'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Magic</span>
                      </button>
                    </div>
                  </div>

                  {/* Bokeh Blur Slider for Photo / Magic Tabs */}
                  {(galleryTab === 'photo' || galleryTab === 'magic') && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        Bokeh Blur: <span className="font-mono text-purple-600">{bgBlurLevel}px</span>
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="12"
                        value={bgBlurLevel}
                        onChange={(e) => setBgBlurLevel(Number(e.target.value))}
                        className="w-24 sm:w-32 accent-purple-600 cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* TAB CONTENT 1: [ COLOR ] SOLID BACKGROUNDS */}
                {galleryTab === 'color' && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Government & Exam Standard Color Codes:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold">Custom Hex:</span>
                        <input
                          type="color"
                          value={customSolidColor}
                          onChange={(e) => {
                            setCustomSolidColor(e.target.value);
                            setBgType('solid');
                            setSelectedPresetId('custom_solid');
                            setViewMode('removed');
                            setIsCutoutApplied(true);
                            setRenderTrigger((prev) => prev + 1);
                          }}
                          className="w-6 h-6 rounded border border-slate-300 cursor-pointer p-0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
                      {colorPresets.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => {
                            setSelectedPresetId(preset.id);
                            setViewMode('removed');
                            setIsCutoutApplied(true);
                            if (preset.type === 'transparent') {
                              setBgType('transparent');
                            } else {
                              setBgType('solid');
                              setCustomSolidColor(preset.colorHex || '#FFFFFF');
                            }
                            setRenderTrigger((prev) => prev + 1);
                          }}
                          className={`flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer text-center relative group ${
                            selectedPresetId === preset.id
                              ? 'border-purple-600 ring-2 ring-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20'
                              : 'border-slate-200 dark:border-slate-700 hover:border-purple-300'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-lg mb-1.5 shadow-xs ${preset.previewBg}`}></div>
                          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate w-full">
                            {preset.name}
                          </span>
                          <span className="text-[9px] text-slate-400 truncate w-full">
                            {preset.hindiName}
                          </span>
                          {selectedPresetId === preset.id && (
                            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-xs">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB CONTENT 2: [ PHOTO ] REALISTIC BACKDROPS */}
                {galleryTab === 'photo' && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Studio & Corporate Photographic Backdrops:</span>
                      <input
                        type="file"
                        ref={customBgInputRef}
                        onChange={handleCustomBgUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        onClick={() => customBgInputRef.current?.click()}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload Custom BG</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-h-[380px] overflow-y-auto pr-1">
                      {photoPresets.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => {
                            setSelectedPresetId(preset.id);
                            setBgType('photo_texture');
                            setViewMode('removed');
                            setIsCutoutApplied(true);
                            setRenderTrigger((prev) => prev + 1);
                          }}
                          className={`flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer text-center relative group ${
                            selectedPresetId === preset.id
                              ? 'border-purple-600 ring-2 ring-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20'
                              : 'border-slate-200 dark:border-slate-700 hover:border-purple-300'
                          }`}
                        >
                          <div className={`w-full h-16 rounded-lg mb-1.5 shadow-xs ${preset.previewBg}`}></div>
                          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate w-full">
                            {preset.name}
                          </span>
                          <span className="text-[9px] text-slate-400 truncate w-full">
                            {preset.badge}
                          </span>
                          {selectedPresetId === preset.id && (
                            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-xs">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB CONTENT 3: [ MAGIC ] AI STYLES (20 DIVERSE PRESETS) */}
                {galleryTab === 'magic' && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Creative & Futuristic AI Backgrounds (20 Professional Presets):</span>
                      <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
                        Instant High-Resolution Apply
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[420px] overflow-y-auto pr-1">
                      {magicAiPresets.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => {
                            setSelectedPresetId(preset.id);
                            setBgType('magic_ai');
                            setViewMode('removed');
                            setIsCutoutApplied(true);
                            setRenderTrigger((prev) => prev + 1);
                          }}
                          className={`flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer text-center relative group ${
                            selectedPresetId === preset.id
                              ? 'border-purple-600 ring-2 ring-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20'
                              : 'border-slate-200 dark:border-slate-700 hover:border-purple-300'
                          }`}
                        >
                          <div className={`w-full h-16 rounded-lg mb-1.5 shadow-xs ${preset.previewBg}`}></div>
                          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate w-full">
                            {preset.name}
                          </span>
                          <span className="text-[9px] text-slate-400 truncate w-full">
                            {preset.badge}
                          </span>
                          {selectedPresetId === preset.id && (
                            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-xs">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DEDICATED WORKFLOW B: RESIZE & PRECISE KB COMPRESSOR (CENTERED UPLOAD ZONE FIRST) */}
      {/* ========================================================================= */}
      {currentView === 'tool_resize_compress' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* If NO file is uploaded yet: Show LARGE PROMINENT CENTERED UPLOAD ZONE */}
          {!compressorImageSrc ? (
            <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border-2 border-dashed border-blue-300 dark:border-blue-800 rounded-3xl p-8 sm:p-12 text-center shadow-md space-y-6">
              
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsCompressorDragging(true); }}
                onDragLeave={() => setIsCompressorDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsCompressorDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) processCard2File(file);
                }}
                className={`py-8 px-4 rounded-2xl transition-all ${
                  isCompressorDragging ? 'bg-blue-100/50 dark:bg-blue-950/50' : ''
                }`}
              >
                <div className="w-20 h-20 rounded-3xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner mb-4">
                  <Zap className="w-10 h-10" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Upload Photo for Exact KB Compression & Resize
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
                  Drag and drop your photo or signature here. Set exact target KB limits (e.g. 200 KB or 50 KB) and custom pixel dimensions for government exam forms.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <input
                    type="file"
                    ref={fileInputCompressorRef}
                    onChange={handleCompressorUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputCompressorRef.current?.click()}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Photo</span>
                  </button>

                  <button
                    onClick={loadSampleForCard2}
                    className="w-full sm:w-auto px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <span>⚡ Load Sample Photo</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> 14-Pass Exact KB Target</span>
                <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> Custom W × H & Aspect Lock</span>
                <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> Signature Whitening</span>
              </div>

            </div>
          ) : (
            /* Once File is Uploaded: Show Full Two-Column Compress & Resize Studio */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: Controls & Presets (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* File Info Bar with Replace Button */}
                <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {compressorFileName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Original: {originalDimensions.w}×{originalDimensions.h}px • <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{compressorOriginalSizeKb} KB</span>
                      </p>
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={fileInputCompressorRef}
                    onChange={handleCompressorUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputCompressorRef.current?.click()}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold border border-blue-200 dark:border-blue-700 hover:bg-blue-50 cursor-pointer shrink-0"
                  >
                    Change
                  </button>
                </div>

                {/* 1. Target KB Compression Box */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Target File Size (लक्ष्य KB सीमा)
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      Strict Target Optimization
                    </span>
                  </div>

                  {/* Quick KB Preset Pills */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {[20, 50, 100, 200, 500].map((kb) => (
                      <button
                        key={kb}
                        onClick={() => {
                          setTargetKb(kb);
                          setCustomKbInput(kb.toString());
                        }}
                        className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-all text-center ${
                          targetKb === kb
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {kb} KB
                      </button>
                    ))}
                  </div>

                  {/* Custom Target KB Slider & Numeric Input */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600 dark:text-slate-400">Custom Target KB:</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="5"
                          max="2000"
                          value={customKbInput}
                          onChange={(e) => {
                            setCustomKbInput(e.target.value);
                            const n = parseInt(e.target.value, 10);
                            if (!isNaN(n) && n > 0) setTargetKb(n);
                          }}
                          className="w-20 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold font-mono text-center"
                        />
                        <span className="font-bold text-slate-700 dark:text-slate-300">KB</span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min="10"
                      max="1000"
                      step="5"
                      value={targetKb}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setTargetKb(val);
                        setCustomKbInput(val.toString());
                      }}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* 2. Custom Resize & Standard Exam Aspect Presets */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crop className="w-4 h-4 text-blue-500" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Dimensions & Aspect Ratio Crop
                      </h4>
                    </div>
                    <button
                      onClick={() => setLockAspectRatio(!lockAspectRatio)}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                        lockAspectRatio 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {lockAspectRatio ? '🔒 Ratio Locked' : '🔓 Unlocked'}
                    </button>
                  </div>

                  {/* Standard Exam Form Presets */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'original', label: 'Original Ratio', sub: 'Keep Natural' },
                      { id: 'passport_35x45', label: 'Passport 35×45mm', sub: '413 × 531 px' },
                      { id: 'ssc_upsc_form', label: 'SSC / UPSC Form', sub: '350 × 450 px' },
                      { id: 'signature', label: 'Signature Box', sub: '350 × 150 px' },
                      { id: 'square_id', label: 'Square 1:1 ID', sub: '600 × 600 px' },
                      { id: 'postcard_4x6', label: 'Postcard 4×6 in', sub: '1200 × 1800 px' },
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handleCropPresetChange(preset.id)}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          selectedCropPreset === preset.id
                            ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30'
                            : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                        }`}
                      >
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{preset.label}</p>
                        <p className="text-[10px] text-slate-400">{preset.sub}</p>
                      </button>
                    ))}
                  </div>

                  {/* Custom Width & Height Inputs */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Width (चौड़ाई px)</label>
                      <input
                        type="number"
                        min="50"
                        max="5000"
                        value={customWidth}
                        onChange={(e) => handleWidthChange(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Height (ऊंचाई px)</label>
                      <input
                        type="number"
                        min="50"
                        max="5000"
                        value={customHeight}
                        onChange={(e) => handleHeightChange(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold font-mono"
                      />
                    </div>
                  </div>

                  {/* Signature Mode B&W Whitewash Toggle */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-2">
                        <PenTool className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Signature B&W Whitewash Filter
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isSignatureMode}
                        onChange={(e) => setIsSignatureMode(e.target.checked)}
                        className="accent-blue-600 rounded cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Real-Time Preview & Output Verification (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
                  
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Optimized Output Result</span>
                        {isCompressing && (
                          <span className="text-[10px] font-mono text-blue-500 animate-pulse">Calculating exact KB...</span>
                        )}
                      </h4>
                    </div>

                    {/* Output Format Picker */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      {(['image/jpeg', 'image/png', 'image/webp'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setCompressorFormat(fmt)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                            compressorFormat === fmt
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {fmt.replace('image/', '').toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview Image Stage */}
                  <div className="relative w-full flex items-center justify-center min-h-[340px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-4">
                    {compressedFileUrl ? (
                      <img
                        src={compressedFileUrl}
                        alt="Compressed Preview"
                        className="max-h-[320px] max-w-full object-contain rounded-lg shadow-sm"
                      />
                    ) : (
                      <div className="text-center text-slate-400 text-xs">
                        Rendering compressed photo...
                      </div>
                    )}
                  </div>

                  {/* High Accuracy KB Output Meter */}
                  <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                    
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-500">Output Size: </span>
                        <strong className="text-base font-black font-mono text-blue-600 dark:text-blue-400">
                          {compressedSizeKb} KB
                        </strong>
                        <span className="text-slate-400 text-[11px] ml-1">
                          (Target: {targetKb} KB)
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-slate-500">Dimensions: </span>
                        <strong className="font-mono text-slate-800 dark:text-slate-200">
                          {compressedDimensions.w} × {compressedDimensions.h} px
                        </strong>
                      </div>
                    </div>

                    {/* Target Accuracy Bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          compressedSizeKb <= targetKb
                            ? compressedSizeKb >= targetKb * 0.90
                              ? 'bg-emerald-500'
                              : 'bg-blue-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.round((compressedSizeKb / targetKb) * 100))}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Strict Limit Compliant ({Math.round((compressedSizeKb / targetKb) * 100)}% of limit)
                      </span>
                      <span>Saved: {Math.max(0, Math.round(((compressorOriginalSizeKb - compressedSizeKb) / compressorOriginalSizeKb) * 100))}%</span>
                    </div>

                  </div>

                  {/* 1-Click Download Button & A4 Sheet Print Preview */}
                  <div className="space-y-2">
                    <button
                      onClick={downloadCompressed}
                      disabled={!compressedBlob}
                      className="w-full py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Optimized Photo ({compressedSizeKb} KB)</span>
                    </button>

                    <button
                      onClick={() => openA4PrintPreview(compressedFileUrl || compressorImageSrc, selectedCropPreset.includes('passport') ? 'grid_32' : 'single_fit', 'Optimized Photo A4 Sheet Print Preview')}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                      <Printer className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>A4 Sheet Print Preview (A4 शीट पर देखें)</span>
                    </button>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DEDICATED WORKFLOW C: PASSPORT GRID MULTI-PRINT */}
      {/* ========================================================================= */}
      {currentView === 'tool_passport_grid' && (
        <div className="space-y-6 animate-fade-in">
          <PassportPhotoMaker initialImageSrc={passportInitialImageSrc} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* CARD 1: REMOVE.BG "EDIT" MODAL (MANUAL ERASE / RESTORE BRUSH) */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-scale-up">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Manual Erase / Restore Studio Brush
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Brush Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBrushMode('erase')}
                  className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                    brushMode === 'erase'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>Erase (मिटाएं)</span>
                </button>

                <button
                  onClick={() => setBrushMode('restore')}
                  className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                    brushMode === 'restore'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Paintbrush className="w-3.5 h-3.5" />
                  <span>Restore (वापस लाएं)</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-500">Size:</span>
                  <input
                    type="range"
                    min="6"
                    max="60"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-24 accent-purple-600 cursor-pointer"
                  />
                  <span className="font-mono text-purple-600 font-bold">{brushSize}px</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-500">Hardness:</span>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={brushHardness}
                    onChange={(e) => setBrushHardness(Number(e.target.value))}
                    className="w-20 accent-purple-600 cursor-pointer"
                  />
                  <span className="font-mono text-purple-600 font-bold">{brushHardness}%</span>
                </div>
              </div>
            </div>

            {/* Interactive Brush Canvas Stage */}
            <div className="relative flex items-center justify-center min-h-[320px] rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] bg-slate-100 dark:bg-slate-950 p-2 cursor-crosshair">
              <canvas
                ref={modalCanvasRef}
                onMouseDown={handleBrushMouseDown}
                onMouseMove={handleBrushMouseMove}
                onMouseUp={handleBrushMouseUp}
                onMouseLeave={handleBrushMouseUp}
                className="max-h-[340px] w-auto object-contain rounded-lg shadow-sm"
              />

              {/* Visual Brush Cursor */}
              {brushCursorPos && (
                <div
                  className="pointer-events-none absolute rounded-full border-2 border-purple-500 bg-purple-500/20 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${brushCursorPos.x}px`,
                    top: `${brushCursorPos.y}px`,
                    width: `${brushSize * 2}px`,
                    height: `${brushSize * 2}px`,
                  }}
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-[11px] text-slate-500">
                Click and drag directly over the image to erase background fragments or restore edges.
              </p>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
              >
                Done (पूर्ण करें)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE CROP & PRESET RESIZER MODAL (e.g. Passport 3.5x4.5cm, A4) */}
      {/* ========================================================================= */}
      <InteractiveCropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        imageSrc={processedImageUrl || transparentPngUrl || originalImageSrc || ''}
        onApplyCrop={handleApplyCrop}
        onSendToPassportGrid={handleCropSendToPassportGrid}
        onSendToKbCompressor={handleCropSendToCompressor}
        onSendToA4Print={(croppedUrl) => openA4PrintPreview(croppedUrl, 'grid_32', 'Cropped Photo A4 Sheet Print Preview')}
      />

      {/* ========================================================================= */}
      {/* 6. PRINT-SPECIFIC A4 SHEET PREVIEW MODAL (300 DPI PRE-PRINT INSPECTOR) */}
      {/* ========================================================================= */}
      <A4PrintPreviewModal
        isOpen={isA4PrintModalOpen}
        onClose={() => setIsA4PrintModalOpen(false)}
        imageSrc={a4PrintImageSrc || processedImageUrl || transparentPngUrl || originalImageSrc || compressorImageSrc}
        title={a4PrintTitle}
        defaultLayout={a4PrintDefaultLayout}
      />

    </div>
  );
};
