import { QuickServiceItem } from '../types.ts';

export interface PortalQuickLink {
  id: string;
  name: string;
  hindiName: string;
  category: 'Govt Portal' | 'Job Exams' | 'Citizen Services' | 'Tools & Utilities';
  url: string;
  desc: string;
}

export const PORTAL_QUICK_LINKS: PortalQuickLink[] = [
  {
    id: 'uidai',
    name: 'myAadhaar UIDAI Portal',
    hindiName: 'माय आधार पोर्टल',
    category: 'Citizen Services',
    url: 'https://myaadhaar.uidai.gov.in',
    desc: 'Download E-Aadhaar, Document Update, PVC Order, Lock/Unlock Biometrics'
  },
  {
    id: 'nsdl_pan',
    name: 'NSDL PAN Online Services',
    hindiName: 'एनएसडीएल पैन कार्ड',
    category: 'Citizen Services',
    url: 'https://onlineservices.nsdl.com/paam/endUserRegisterContact.html',
    desc: 'New PAN Card Form 49A, PAN Correction, Reprint PAN'
  },
  {
    id: 'uti_pan',
    name: 'UTIITSL PAN Portal',
    hindiName: 'यूटीआई पैन पोर्टल',
    category: 'Citizen Services',
    url: 'https://www.pan.utiitsl.com',
    desc: 'Apply PAN, Track Status, e-PAN Download'
  },
  {
    id: 'sarathi',
    name: 'Sarathi Parivahan (DL / LL)',
    hindiName: 'सारथी परिवहन (ड्राइविंग लाइसेंस)',
    category: 'Citizen Services',
    url: 'https://sarathi.parivahan.gov.in',
    desc: 'Learner License, Driving License, Renewal, Slot Booking'
  },
  {
    id: 'vahan',
    name: 'Vahan Citizen Portal (RC / Tax)',
    hindiName: 'वाहन सिटीजन पोर्टल',
    category: 'Citizen Services',
    url: 'https://vahan.parivahan.gov.in/vahanservice',
    desc: 'Vehicle RC Status, Transfer, Fitness, Road Tax Payment'
  },
  {
    id: 'ssc',
    name: 'SSC Official Portal',
    hindiName: 'एसएससी कर्मचारी चयन आयोग',
    category: 'Job Exams',
    url: 'https://ssc.gov.in',
    desc: 'CGL, CHSL, MTS, GD Constable Online Forms & Admit Cards'
  },
  {
    id: 'upsc',
    name: 'UPSC Online OTR Portal',
    hindiName: 'यूपीएससी ऑनलाइन पोर्टल',
    category: 'Job Exams',
    url: 'https://upsconline.nic.in',
    desc: 'One Time Registration (OTR), Civil Services, NDA, CDS'
  },
  {
    id: 'sarkari_result',
    name: 'Sarkari Result Info Hub',
    hindiName: 'सरकारी रिजल्ट',
    category: 'Job Exams',
    url: 'https://www.sarkariresult.com',
    desc: 'Latest Government Job Notifications, Admit Cards, Answer Keys'
  },
  {
    id: 'epfo',
    name: 'EPFO Member Passbook & UAN',
    hindiName: 'ईपीएफओ पीएफ पासबुक व यूएएन',
    category: 'Citizen Services',
    url: 'https://passbook.epfindia.gov.in/MemberPassBook/Login',
    desc: 'PF Balance Check, Claim Status, KYC Seed, UAN Activation'
  },
  {
    id: 'digilocker',
    name: 'DigiLocker Issuer / Partner',
    hindiName: 'डिजिलॉकर',
    category: 'Citizen Services',
    url: 'https://www.digilocker.gov.in',
    desc: 'Fetch authentic 10th/12th marksheets, Caste cert, Driving License'
  },
  {
    id: 'tinypng',
    name: 'TinyPNG Image Optimizer',
    hindiName: 'टाइनी पीएनजी कंप्रेसर',
    category: 'Tools & Utilities',
    url: 'https://tinypng.com',
    desc: 'Instant online photo/signature size reduction'
  },
  {
    id: 'ilovepdf',
    name: 'iLovePDF All-in-One PDF Tool',
    hindiName: 'आई लव पीडीएफ',
    category: 'Tools & Utilities',
    url: 'https://www.ilovepdf.com',
    desc: 'Merge, Split, Compress, Convert PDF to Word/JPG'
  }
];

export const DEFAULT_RATE_SERVICES: QuickServiceItem[] = [
  { id: 'bw_print_single', name: 'B&W Print (Single Side A4)', hindiName: 'ब्लैक एंड व्हाइट प्रिंट (एक तरफ)', defaultPrice: 5, unit: 'per page' },
  { id: 'bw_print_double', name: 'B&W Print (Back to Back)', hindiName: 'ब्लैक एंड व्हाइट प्रिंट (दोनों तरफ)', defaultPrice: 8, unit: 'per page' },
  { id: 'color_print', name: 'Color Print (Standard A4)', hindiName: 'कलर प्रिंट (साधारण)', defaultPrice: 10, unit: 'per page' },
  { id: 'photo_print_a4', name: 'Photo Glossy Print (Full A4)', hindiName: 'ग्लॉसी फोटो प्रिंट A4', defaultPrice: 40, unit: 'per sheet' },
  { id: 'passport_photo_8', name: 'Passport Photos (Set of 8)', hindiName: 'पासपोर्ट फोटो (8 फोटो सेट)', defaultPrice: 50, unit: 'per set' },
  { id: 'pvc_card_print', name: 'PVC Smart Card (Aadhaar/Ayushman)', hindiName: 'पीवीसी स्मार्ट कार्ड प्रिंट', defaultPrice: 60, unit: 'per card' },
  { id: 'lamination_a4', name: 'Lamination (A4 Size Hot Roll)', hindiName: 'लेमिनेशन (A4 साइज़)', defaultPrice: 20, unit: 'per doc' },
  { id: 'scanning_pdf', name: 'Scanning & PDF Creation', hindiName: 'स्कैनिंग एवं पीडीएफ बनाना', defaultPrice: 10, unit: 'per doc' },
  { id: 'online_form_normal', name: 'Online Govt Job Form Filling', hindiName: 'ऑनलाइन सरकारी फॉर्म भरना', defaultPrice: 70, unit: 'per form' },
  { id: 'pan_card_apply', name: 'New PAN Card Application', hindiName: 'नया पैन कार्ड आवेदन', defaultPrice: 200, unit: 'complete' },
  { id: 'resume_typing', name: 'Resume / Bio-Data Making (Print included)', hindiName: 'रिज्यूमे / बायोडाटा तैयार करना', defaultPrice: 50, unit: 'per copy' },
  { id: 'affidavit_typing', name: 'Affidavit / Legal Typing on Stamp Paper', hindiName: 'शपथ पत्र / कानूनी टाइपिंग', defaultPrice: 60, unit: 'per page' },
  { id: 'money_transfer', name: 'AEPS Cash Withdrawal / DMT Service', hindiName: 'आधार निकासी / मनी ट्रांसफर', defaultPrice: 20, unit: 'per txn' }
];
