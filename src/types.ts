export type ActiveTab = 'pdf_suite' | 'photo_studio' | 'doc_templates' | 'ocr_extractor' | 'ai_assistant';

export interface QuickPrintTemplate {
  id: string;
  title: string;
  hindiTitle: string;
  category: 'admission' | 'civil' | 'affidavit' | 'ration' | 'certificate';
  description: string;
  defaultLanguage: 'hi' | 'en' | 'bilingual';
  paperSize: 'A4' | 'Legal';
  orientation: 'portrait' | 'landscape';
  fields: {
    key: string;
    label: string;
    hindiLabel: string;
    defaultValue: string;
    placeholder: string;
    type?: 'text' | 'textarea' | 'date' | 'select';
    options?: string[];
  }[];
  contentTemplate: (data: Record<string, string>) => {
    headerTitle?: string;
    headerSubtitle?: string;
    refNo?: string;
    date?: string;
    photoBox?: boolean;
    sections: {
      title?: string;
      hindiTitle?: string;
      content: string; // supports multiline or paragraphs
      table?: {
        headers: string[];
        rows: string[][];
      };
    }[];
    declaration?: string;
    signatures: {
      label: string;
      subLabel?: string;
      position: 'left' | 'center' | 'right';
    }[];
    officialNote?: string;
  };
}

export type DocumentType = 
  | 'resume'
  | 'job_application_en'
  | 'job_application_hi'
  | 'affidavit_gap'
  | 'affidavit_name'
  | 'affidavit_income'
  | 'leave_letter_en'
  | 'leave_letter_hi'
  | 'experience_cert'
  | 'character_cert';

export type DocumentTheme = 'classic' | 'modern' | 'executive' | 'govt_standard';

export interface EducationItem {
  id: string;
  course: string;
  boardOrUniv: string;
  passingYear: string;
  percentageOrCgpa: string;
  division: string;
}

export interface ExperienceItem {
  id: string;
  jobTitle: string;
  companyName: string;
  duration: string;
  description: string;
}

export interface DocumentFormData {
  docType: DocumentType;
  language: 'en' | 'hi';
  theme: DocumentTheme;
  
  // Personal Info
  fullName: string;
  fatherName: string;
  motherName: string;
  dob: string;
  gender: string;
  maritalStatus: string;
  nationality: string;
  religion: string;
  category: string; // Gen, OBC, SC, ST, EWS
  
  // Contact
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  
  // Profile / Objective
  jobTitleOrPosition: string;
  appliedPost: string;
  companyOrOrg: string;
  targetDepartment: string;
  objective: string;
  
  // Lists
  education: EducationItem[];
  experience: ExperienceItem[];
  skills: string;
  languagesKnown: string;
  hobbies: string;
  
  // Custom / Affidavit / Letter Specific Fields
  applicationSubject: string;
  reasonOrDetails: string;
  fromDate: string;
  toDate: string;
  policeStation: string;
  notaryPlace: string;
  gapPeriod: string;
  gapReason: string;
  oldName: string;
  newName: string;
  annualIncome: string;
  witness1: string;
  witness2: string;
  
  // Cyber Cafe footer note
  cscCenterName: string;
  operatorContact: string;
}

export interface ToolGuide {
  id: string;
  title: string;
  hindiTitle: string;
  tool: 'photoshop' | 'acrobat' | 'naps2' | 'tinypng' | 'remini' | 'paint' | 'pvc_printer';
  category: 'resize' | 'edit_pdf' | 'ocr' | 'scanning' | 'enhancement' | 'pvc_printing';
  summary: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  steps: string[];
  tips: string[];
  shortcuts?: { key: string; action: string }[];
  targetSpecs?: string;
}

export interface PortalPreset {
  id: string;
  name: string;
  shortName: string;
  category: 'Exam' | 'Banking' | 'ID Card' | 'Govt Scheme' | 'Transport';
  photoSpecs: {
    dimensions: string;
    pixels: string;
    fileSizeRange: string;
    fileFormat: string;
    background: string;
    specialNotes: string;
  };
  signatureSpecs: {
    dimensions: string;
    pixels: string;
    fileSizeRange: string;
    fileFormat: string;
    inkColor: string;
    specialNotes: string;
  };
  docSpecs?: {
    format: string;
    maxSize: string;
    dpi: string;
    notes: string;
  };
  portalUrl?: string;
}

export interface QuickServiceItem {
  id: string;
  name: string;
  hindiName: string;
  defaultPrice: number;
  unit: string;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
  quickActions?: string[];
}
