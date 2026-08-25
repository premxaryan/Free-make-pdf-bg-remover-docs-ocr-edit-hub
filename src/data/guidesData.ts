import { ToolGuide } from '../types.ts';

export const TOOL_GUIDES: ToolGuide[] = [
  {
    id: 'ps_passport_crop',
    title: 'Photoshop: Crop & Resize Passport Photo to 3.5×4.5 cm & 20-50 KB',
    hindiTitle: 'फोटोशॉप: पासपोर्ट फोटो को 3.5×4.5 सेमी और 20-50 KB में क्रॉप और रीसाइज़ करें',
    tool: 'photoshop',
    category: 'resize',
    summary: 'Standard industry technique to create exact 3.5 x 4.5 cm passport photos with 300 DPI and exact 20-50 KB file size for SSC, UPSC, and State Govt forms.',
    difficulty: 'Easy',
    targetSpecs: 'Width: 3.5 cm, Height: 4.5 cm, Resolution: 300 DPI, Size: 20-50 KB',
    steps: [
      'Open the photo in Adobe Photoshop (Ctrl + O).',
      'Select the Crop Tool by pressing the "C" key.',
      'In the top options bar, enter: Width: 3.5 cm | Height: 4.5 cm | Resolution: 300 Pixels/Inch.',
      'Position the crop box so the person’s face occupies about 70%–80% of the frame with both shoulders balanced.',
      'Press Enter to apply the crop.',
      'To make the background clean white: Use the Magic Wand Tool (W) or Quick Selection Tool (W) to select the background, press Delete with Background Color set to White (#FFFFFF).',
      'Adjust brightness & contrast: Press Ctrl + M (Curves) or Ctrl + L (Levels) to make the face bright and natural.',
      'Press Ctrl + Shift + Alt + S (Save for Web & Devices).',
      'In the Save for Web dialog, select Preset: JPEG, Quality: High (adjust slider between 50 to 75 to keep file size at 35–45 KB).',
      'Click Save and choose destination folder.'
    ],
    tips: [
      'Never upscale a tiny WhatsApp low-res photo without AI enhancement first, as exam portals reject pixelated images.',
      'Use 300 DPI for crystal clear biometric validation.',
      'Record an Action in Photoshop (Window > Actions > Record) so you can do 1-click 3.5x4.5cm cropping for future customers!'
    ],
    shortcuts: [
      { key: 'C', action: 'Select Crop Tool' },
      { key: 'Ctrl + M', action: 'Open Curves adjustment' },
      { key: 'Ctrl + L', action: 'Open Levels adjustment' },
      { key: 'Ctrl + Shift + Alt + S', action: 'Save for Web (Optimized KB size)' }
    ]
  },
  {
    id: 'ps_pan_card_spec',
    title: 'Photoshop: Exact 213×213 px 300 DPI Photo & 400×200 px Signature for PAN NSDL/UTI',
    hindiTitle: 'फोटोशॉप: पैन कार्ड NSDL/UTI हेतु 213×213 px 300 DPI फोटो एवं 400×200 px हस्ताक्षर',
    tool: 'photoshop',
    category: 'resize',
    summary: 'Master the mandatory 213x213 pixels at 300 DPI specification required by NSDL Protean and UTIITSL PAN card upload modules.',
    difficulty: 'Medium',
    targetSpecs: 'Photo: 213×213 px, 300 DPI, <30 KB | Sign: 400×200 px, 300 DPI, <30 KB',
    steps: [
      'Open the scanned photo in Photoshop.',
      'Go to Image > Image Size (Ctrl + Alt + I).',
      'First set Resolution to 300 Pixels/Inch (uncheck Resample if needed or set to Bicubic Sharper).',
      'Set Width: 213 Pixels and Height: 213 Pixels.',
      'If aspect ratio stretches the face: Create a new file (Ctrl + N) with Width: 213 px, Height: 213 px, Resolution: 300 DPI, and paste the cropped square face inside it.',
      'Save as JPEG: Press Ctrl + Shift + S, choose JPEG, set Quality to 5 or 6 so file size is between 15 KB and 28 KB (Strictly under 30 KB).',
      'For Signature: Create new document with Width: 400 px, Height: 200 px, Resolution: 300 DPI. Paste scanned signature, press Ctrl + Shift + U to make Grayscale, adjust Levels (Ctrl + L) to make background pure white, and save under 30 KB.'
    ],
    tips: [
      'UTIITSL and NSDL portals strictly validate pixel dimensions and DPI header metadata.',
      'Do not save as progressive JPEG; choose Baseline (Standard).'
    ],
    shortcuts: [
      { key: 'Ctrl + Alt + I', action: 'Image Size dialog' },
      { key: 'Ctrl + Shift + U', action: 'Desaturate (Convert to Grayscale)' },
      { key: 'Ctrl + N', action: 'Create New Canvas' }
    ]
  },
  {
    id: 'acrobat_edit_text',
    title: 'Acrobat Pro: Edit Text, Fix Typos & Change Details in Scanned/Digital PDFs',
    hindiTitle: 'एक Acrobat प्रो: पीडीएफ में टेक्स्ट एडिट करना, वर्तनी सुधारना एवं विवरण बदलना',
    tool: 'acrobat',
    category: 'edit_pdf',
    summary: 'Directly modify text, numbers, dates, addresses, or replace pictures inside existing PDF files with matching fonts and OCR.',
    difficulty: 'Easy',
    steps: [
      'Open the PDF file in Adobe Acrobat Pro DC.',
      'In the right-hand Tools sidebar, click on "Edit PDF" (or go to Tools > Edit PDF).',
      'If the document is a scanned image, Acrobat will automatically trigger OCR (Optical Character Recognition) to convert image text into editable text.',
      'Click on any text box, heading, or paragraph to edit. Type the new text.',
      'Use the Format panel on the right to change font family, font size, text color, bold/italic, and text alignment.',
      'To add new text or signature image: Click "Add Text" or "Add Image" from the top toolbar.',
      'To delete unwanted elements: Click on the object/text frame and press Delete.',
      'Save the PDF: File > Save (Ctrl + S) or File > Save As to create a new copy.'
    ],
    tips: [
      'For Hindi documents with Kruti Dev or Mangal font, ensure proper unicode Hindi keyboard input is active.',
      'If Acrobat font matching fails, select Arial, Times New Roman, or Kruti Dev 010 manually from font dropdown.'
    ],
    shortcuts: [
      { key: 'Ctrl + E', action: 'Quick Edit PDF toggle' },
      { key: 'Ctrl + S', action: 'Save document' }
    ]
  },
  {
    id: 'acrobat_compress_merge',
    title: 'Acrobat Pro: Merge Multiple Marksheets & Compress to under 200 KB',
    hindiTitle: 'एक्रोबैट प्रो: एकाधिक मार्कशीट को एक में जोड़ना और 200 KB से कम में कंप्रेस करना',
    tool: 'acrobat',
    category: 'edit_pdf',
    summary: 'Combine 10th, 12th, Graduation degrees, Aadhaar card, and Caste certificates into a single lightweight PDF compliant with exam portals.',
    difficulty: 'Easy',
    targetSpecs: 'Multi-page single PDF < 200 KB or < 300 KB',
    steps: [
      'Open Adobe Acrobat Pro.',
      'Click on Tools > Combine Files.',
      'Click "Add Files" and select all scanned marksheets/documents in chronological order.',
      'Drag and drop thumbnails to reorder pages if needed.',
      'Click the blue "Combine" button in the top right corner.',
      'To compress the combined file: Go to Tools > Optimize PDF > Reduce File Size (or File > Save as Other > Reduced Size PDF).',
      'For advanced compression: Choose "Advanced Optimization", set color image downsampling to 150 DPI with Medium JPEG quality, discard embedded thumbnail fonts.',
      'Click OK and Save. Check file size in Windows Explorer.'
    ],
    tips: [
      'Keep text crisp by not reducing DPI below 150.',
      'Black & white text documents can be converted to 1-bit monochome with CCITT Group 4 compression for ultra-small file size (under 50KB for 5 pages!).'
    ]
  },
  {
    id: 'naps2_bulk_scan',
    title: 'NAPS2: Multi-Page Scanner Setup with Auto-Deskew & Crisp 200 DPI PDF',
    hindiTitle: 'NAPS2: मल्टी-पेज स्कैनर सेटअप, ऑटो-सीधा करना और 200 DPI साफ पीडीएफ बनाना',
    tool: 'naps2',
    category: 'scanning',
    summary: 'The best lightweight open-source scanning software for CSC centers and Cyber Cafes to replace slow printer default software.',
    difficulty: 'Easy',
    steps: [
      'Download and open NAPS2 (Not Another PDF Scanner 2).',
      'Click "Profiles" > "New".',
      'Select your scanner (Epson, Canon, HP, Brother) using WIA or TWAIN driver.',
      'Configure Default Profile settings: Page Size: A4, Resolution: 200 DPI, Color: Grayscale (or Color for Certificates), Auto Deskew: Enabled.',
      'Click OK. Place documents on scanner bed or ADF feeder and click "Scan".',
      'Preview scanned pages. Rotate any upside-down pages with Rotate buttons.',
      'Click "Save PDF". Enter filename and select target location.',
      'NAPS2 generates ultra-optimized, crystal clear, portal-friendly PDFs with built-in OCR.'
    ],
    tips: [
      'Set Grayscale 200 DPI as default profile: guarantees 1-page Aadhaar scans remain between 60KB to 120KB without needing any extra compression tool!',
      'Enable "Auto Deskew" so even crookedly placed customer papers get automatically straightened perfectly.'
    ],
    shortcuts: [
      { key: 'Ctrl + S', action: 'Save Scanned PDF' },
      { key: 'Ctrl + R', action: 'Rotate Page 90°' }
    ]
  },
  {
    id: 'remini_ai_restore',
    title: 'Remini & AI Photo Enhancers: Fix Old, Blurry, or Low-Light Customer Photos',
    hindiTitle: 'रेमिनी व एआई टूल: पुरानी, धुंधली या कम रोशनी वाली ग्राहक की फोटो को एचडी बनाना',
    tool: 'remini',
    category: 'enhancement',
    summary: 'Quickly restore faded, scratched, or out-of-focus mobile photos brought by customers on WhatsApp into clear passport portraits.',
    difficulty: 'Easy',
    steps: [
      'Upload the customer photo to Remini Web / App or VanceAI / Pixelcut.',
      'Apply Face Restoration / Enhance filter.',
      'Download the enhanced ultra-HD image.',
      'Open the enhanced photo in Photoshop to balance skin tone and remove artifact halos.',
      'Crop to standard 3.5×4.5 cm with Crop Tool (Resolution 300 DPI).',
      'Export as optimized JPEG for online application.'
    ],
    tips: [
      'Always inspect pupil reflection and ear shapes after AI enhancement to ensure genuine resemblance for government identity checks.'
    ]
  },
  {
    id: 'tinypng_compression',
    title: 'TinyPNG / Squoosh: Instant Smart Web Compression for JPEGs & PNGs',
    hindiTitle: 'TinyPNG / Squoosh: फोटो व हस्ताक्षर को बिना क्वालिटी गिराए कंप्रेस करना',
    tool: 'tinypng',
    category: 'resize',
    summary: 'Reduce photo and signature file sizes by 70% with zero visible quality loss in 3 seconds.',
    difficulty: 'Easy',
    steps: [
      'Visit TinyPNG.com or Squoosh.app in browser.',
      'Drag and drop your exported JPEG or PNG photos/signatures.',
      'The engine automatically compresses the image using smart lossy quantization.',
      'Click "Download" to get the lightweight file.',
      'Verify the file size in the status bar matches the portal requirement (e.g., between 20KB and 50KB).'
    ],
    tips: [
      'For signatures, use Squoosh MozJPEG with Quality 75 and Chroma Subsampling 4:2:0.'
    ]
  },
  {
    id: 'pvc_id_card_print',
    title: 'Epson L805 / Canon G570: PVC Aadhaar & Ayushman Card Printing Tray Setup',
    hindiTitle: 'एप्सन L805 / कैनन G570: पीवीसी आधार व आयुष्मान कार्ड ट्रे प्रिंटिंग सेटअप',
    tool: 'pvc_printer',
    category: 'pvc_printing',
    summary: 'Step-by-step master guide for direct PVC Card Tray printing with exact CR-80 dimensions (85.6mm × 54mm) on Epson and Canon inkjet printers.',
    difficulty: 'Medium',
    targetSpecs: 'Card Size: 85.6 mm × 54.0 mm (CR80) at 300 DPI (1012 × 638 pixels)',
    steps: [
      'Prepare the Aadhaar / Voter / E-Shram / Ayushman Card file in Photoshop.',
      'Crop the Front side to 85.6 mm × 54.0 mm at 300 DPI. Crop Back side to identical 85.6 mm × 54.0 mm at 300 DPI.',
      'Open your PVC Card Tray Template (e.g. Epson 2-Card Tray Template).',
      'Paste Front side on Card Slot 1 (Left) and Back side on Card Slot 2 (Right).',
      'Go to File > Print (Ctrl + P).',
      'In Printer Properties / Preferences: Paper Source: "CD/DVD Tray" or "PVC Card Tray", Media Type: "Epson Matte" or "Premium Glossy", Quality: "High" or "Best Photo".',
      'Ensure "Fit to Printable Area" is UNCHECKED (Print at 100% scale).',
      'Insert blank PVC inkjet printable cards into the tray, push tray into printer aligned with arrow marks, and hit Print.'
    ],
    tips: [
      'Always use Inkjet-coated printable PVC cards (Dragon Sheet or direct tray printable cards), never plain thermal plastic cards on an inkjet printer.',
      'Allow 2 minutes for ink dry time or use a cold lamination protective film for 5-year scratch resistance.'
    ],
    shortcuts: [
      { key: 'Ctrl + P', action: 'Open Print Dialog' }
    ]
  }
];
