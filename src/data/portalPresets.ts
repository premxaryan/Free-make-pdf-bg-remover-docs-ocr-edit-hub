import { PortalPreset } from '../types.ts';

export const PORTAL_PRESETS: PortalPreset[] = [
  {
    id: 'ssc',
    name: 'SSC (Staff Selection Commission - CGL/CHSL/MTS/GD/Steno)',
    shortName: 'SSC CGL/CHSL',
    category: 'Exam',
    photoSpecs: {
      dimensions: '3.5 cm (width) × 4.5 cm (height)',
      pixels: 'approx. 138 × 177 pixels (min) to 300 × 400 pixels',
      fileSizeRange: '20 KB to 50 KB',
      fileFormat: 'JPEG / JPG',
      background: 'White or very light clean background (No cap/spectacles)',
      specialNotes: 'Recent live webcam capture or crisp studio photo; face must cover 70-80% of photo.'
    },
    signatureSpecs: {
      dimensions: '4.0 cm (width) × 2.0 cm (height)',
      pixels: 'approx. 140 × 60 pixels to 200 × 100 pixels',
      fileSizeRange: '10 KB to 20 KB',
      fileFormat: 'JPEG / JPG',
      inkColor: 'Black ink pen on unruled white paper',
      specialNotes: 'Capital letters signature is rejected; must be continuous running handwriting.'
    },
    docSpecs: {
      format: 'PDF',
      maxSize: '< 200 KB',
      dpi: '150 - 200 DPI',
      notes: '10th certificate/caste certificate must be clear and legible.'
    },
    portalUrl: 'https://ssc.gov.in'
  },
  {
    id: 'upsc',
    name: 'UPSC (Union Public Service Commission - IAS/IPS/NDA/CDS/CAPF)',
    shortName: 'UPSC OTR',
    category: 'Exam',
    photoSpecs: {
      dimensions: '350 × 350 pixels (Min) to 1000 × 1000 pixels (Max)',
      pixels: 'Square / 3:4 aspect ratio',
      fileSizeRange: '20 KB to 300 KB',
      fileFormat: 'JPG / JPEG',
      background: 'Plain white background',
      specialNotes: 'Photo should not be more than 10 days old with name and date of photo printed at bottom if mandated.'
    },
    signatureSpecs: {
      dimensions: '350 × 350 pixels (Min) to 1000 × 1000 pixels (Max)',
      pixels: 'Aspect ratio 1:1 or 2:1',
      fileSizeRange: '20 KB to 300 KB',
      fileFormat: 'JPG / JPEG',
      inkColor: 'Black ink pen on clean white sheet',
      specialNotes: 'Sign inside a clean boundary box without cropping marks.'
    },
    docSpecs: {
      format: 'PDF',
      maxSize: '< 300 KB',
      dpi: '200 DPI',
      notes: 'Photo ID (Aadhaar / Voter ID) in clear PDF.'
    },
    portalUrl: 'https://upsconline.nic.in'
  },
  {
    id: 'ibps',
    name: 'IBPS & SBI (Bank PO / Clerk / Specialist Officer / RRB)',
    shortName: 'IBPS / SBI Bank',
    category: 'Banking',
    photoSpecs: {
      dimensions: '4.5 cm × 3.5 cm (200 × 230 pixels)',
      pixels: '200 × 230 pixels',
      fileSizeRange: '20 KB to 50 KB',
      fileFormat: 'JPG / JPEG',
      background: 'Light-coloured, preferably white background',
      specialNotes: 'Look straight at the camera with a relaxed face; no red eye or flash reflection.'
    },
    signatureSpecs: {
      dimensions: '140 × 60 pixels',
      pixels: '140 × 60 pixels',
      fileSizeRange: '10 KB to 20 KB',
      fileFormat: 'JPG / JPEG',
      inkColor: 'Black ink pen',
      specialNotes: 'Signatures in CAPITAL LETTERS not accepted.'
    },
    docSpecs: {
      format: 'JPG (Thumb & Declaration) / PDF (Certificates)',
      maxSize: 'Thumb: 20-50KB (240x240px) | Declaration: 50-100KB (800x400px)',
      dpi: '200 DPI',
      notes: 'Left thumb impression on white paper with black or blue ink.'
    },
    portalUrl: 'https://ibps.in'
  },
  {
    id: 'nta',
    name: 'NTA (NEET-UG, JEE Main, CUET, UGC-NET)',
    shortName: 'NTA NEET / JEE',
    category: 'Exam',
    photoSpecs: {
      dimensions: 'Passport Size (3.5 × 4.5 cm) & Postcard Size (4" × 6")',
      pixels: 'Passport: 10KB - 200KB | Postcard: 10KB - 200KB',
      fileSizeRange: '10 KB to 200 KB',
      fileFormat: 'JPG / JPEG',
      background: 'White background showing 80% face (ears clearly visible)',
      specialNotes: 'With name of candidate and date of taking photograph.'
    },
    signatureSpecs: {
      dimensions: '3.5 cm × 1.5 cm',
      pixels: 'Running handwriting',
      fileSizeRange: '4 KB to 30 KB',
      fileFormat: 'JPG / JPEG',
      inkColor: 'Black ink pen on white paper',
      specialNotes: 'Running letters only.'
    },
    docSpecs: {
      format: 'PDF',
      maxSize: '50 KB to 300 KB',
      dpi: '200 DPI',
      notes: 'Category/PwD/10th marksheet PDF in crisp scan.'
    },
    portalUrl: 'https://nta.ac.in'
  },
  {
    id: 'pan',
    name: 'PAN Card (NSDL Protean & UTIITSL Online Portal)',
    shortName: 'PAN NSDL/UTI',
    category: 'ID Card',
    photoSpecs: {
      dimensions: '213 × 213 pixels (300 DPI, Color)',
      pixels: '213 × 213 pixels exact',
      fileSizeRange: 'Under 30 KB (less than 30KB)',
      fileFormat: 'JPEG / JPG',
      background: 'White background',
      specialNotes: 'DPI MUST be set to exactly 300 in Photoshop / Image Editor.'
    },
    signatureSpecs: {
      dimensions: '400 × 200 pixels (300 DPI, Grayscale/Black & White)',
      pixels: '400 × 200 pixels exact',
      fileSizeRange: 'Under 30 KB (less than 30KB)',
      fileFormat: 'JPEG / JPG',
      inkColor: 'Dark black ink pen on white unruled paper',
      specialNotes: 'Signature must be cropped tightly inside 400x200 canvas.'
    },
    docSpecs: {
      format: 'PDF',
      maxSize: '< 2 MB (NSDL Form 49A/CR PDF) or < 300 KB (UTIITSL)',
      dpi: '200 DPI Grayscale',
      notes: 'Combined Aadhaar + Form + Proof into single PDF.'
    },
    portalUrl: 'https://onlineservices.nsdl.com/paam/endUserRegisterContact.html'
  },
  {
    id: 'passport',
    name: 'Passport Seva (Ministry of External Affairs)',
    shortName: 'Passport Seva',
    category: 'ID Card',
    photoSpecs: {
      dimensions: '4.5 cm × 3.5 cm (35 mm × 45 mm)',
      pixels: '413 × 531 pixels (300 DPI) or min 350 × 450 pixels',
      fileSizeRange: '10 KB to 300 KB',
      fileFormat: 'JPEG / JPG',
      background: 'Plain white background (Strictly NO colored background)',
      specialNotes: 'Frontal view with both ears visible, neutral expression, no flash reflections on eyes or specs.'
    },
    signatureSpecs: {
      dimensions: '4.5 cm × 2.0 cm',
      pixels: 'Signature or thumb impression',
      fileSizeRange: '10 KB to 300 KB',
      fileFormat: 'JPEG / JPG',
      inkColor: 'Dark black/blue ink on white paper',
      specialNotes: 'Must be within designated box.'
    },
    docSpecs: {
      format: 'PDF',
      maxSize: '< 1 MB per document',
      dpi: '200 DPI',
      notes: 'Birth certificate, Aadhaar, Bank passbook in clear PDF.'
    },
    portalUrl: 'https://passportindia.gov.in'
  },
  {
    id: 'sarathi',
    name: 'Sarathi Parivahan (Driving License, LL, RC, Renewal)',
    shortName: 'Driving License',
    category: 'Transport',
    photoSpecs: {
      dimensions: '35 mm × 45 mm',
      pixels: 'approx. 420 × 525 pixels',
      fileSizeRange: '10 KB to 20 KB (Strict limit on State portals)',
      fileFormat: 'JPEG / JPG',
      background: 'White or plain light background',
      specialNotes: 'Recent passport photograph.'
    },
    signatureSpecs: {
      dimensions: '256 × 64 pixels',
      pixels: '256 × 64 pixels or 4:1 ratio',
      fileSizeRange: '10 KB to 20 KB',
      fileFormat: 'JPEG / JPG',
      inkColor: 'Black ink pen',
      specialNotes: 'Clean cropped signature.'
    },
    docSpecs: {
      format: 'PDF or JPEG',
      maxSize: '< 200 KB (some states < 500 KB)',
      dpi: '150 - 200 DPI',
      notes: 'Form 1-A Medical Certificate, Address Proof, Age Proof.'
    },
    portalUrl: 'https://sarathi.parivahan.gov.in'
  },
  {
    id: 'aadhaar_uidai',
    name: 'UIDAI Aadhaar Document Update / PVC Card',
    shortName: 'Aadhaar UIDAI',
    category: 'ID Card',
    photoSpecs: {
      dimensions: 'Standard Bio-metric Capture at Enrolment / PVC Print',
      pixels: 'PVC Print size: 85.6 mm × 54.0 mm at 300 DPI (1012 × 638 px)',
      fileSizeRange: 'N/A for Online portal; for PVC printing: 300 DPI high-res',
      fileFormat: 'PNG / JPEG / PDF',
      background: 'UIDAI standard blue/white gradient',
      specialNotes: 'For CR80 plastic PVC card printing on Epson L805 / Canon G570.'
    },
    signatureSpecs: {
      dimensions: 'N/A',
      pixels: 'N/A',
      fileSizeRange: 'N/A',
      fileFormat: 'N/A',
      inkColor: 'N/A',
      specialNotes: 'Aadhaar uses biometric finger & iris verification.'
    },
    docSpecs: {
      format: 'PDF / JPEG / PNG',
      maxSize: '< 2 MB (myAadhaar portal limit)',
      dpi: '200 DPI Grayscale or Color',
      notes: 'POI (Proof of Identity) and POA (Proof of Address) update.'
    },
    portalUrl: 'https://myaadhaar.uidai.gov.in'
  },
  {
    id: 'rrb_railway',
    name: 'RRB Railway Recruitment (ALP, NTPC, Group D, Technician)',
    shortName: 'Railway RRB',
    category: 'Exam',
    photoSpecs: {
      dimensions: '35 mm × 45 mm',
      pixels: '320 × 240 pixels (min)',
      fileSizeRange: '20 KB to 50 KB (Live webcam capture on new portal)',
      fileFormat: 'JPEG / JPG',
      background: 'White or very light background',
      specialNotes: 'No cap, no dark glasses; clear lighting on face.'
    },
    signatureSpecs: {
      dimensions: '50 mm × 20 mm',
      pixels: '140 × 60 pixels',
      fileSizeRange: '10 KB to 20 KB',
      fileFormat: 'JPEG / JPG',
      inkColor: 'Black ink on white paper',
      specialNotes: 'Running handwriting.'
    },
    docSpecs: {
      format: 'PDF',
      maxSize: '50 KB to 500 KB',
      dpi: '150 DPI',
      notes: 'SC/ST travel pass certificate PDF in < 500 KB.'
    },
    portalUrl: 'https://rrbapply.gov.in'
  },
  {
    id: 'police_state',
    name: 'State Police Constable & SI (UP Police, Bihar, MP, Rajasthan, Delhi)',
    shortName: 'State Police',
    category: 'Exam',
    photoSpecs: {
      dimensions: '3.5 cm × 4.5 cm',
      pixels: 'approx. 150 × 200 pixels',
      fileSizeRange: '20 KB to 50 KB',
      fileFormat: 'JPEG / JPG',
      background: 'White or light grey background',
      specialNotes: 'Clear frontal face showing full forehead and chin.'
    },
    signatureSpecs: {
      dimensions: '4.0 cm × 2.0 cm',
      pixels: 'approx. 140 × 60 pixels',
      fileSizeRange: '10 KB to 20 KB',
      fileFormat: 'JPEG / JPG',
      inkColor: 'Black ink',
      specialNotes: 'No blur.'
    },
    docSpecs: {
      format: 'PDF or JPG',
      maxSize: '50 KB to 200 KB',
      dpi: '200 DPI',
      notes: 'Domicile / Caste / 10th / 12th certificates.'
    },
    portalUrl: 'https://uppbpb.gov.in'
  }
];
