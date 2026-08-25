import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Plus, 
  Trash2, 
  Languages, 
  Palette, 
  Eye, 
  FileEdit,
  RotateCcw,
  BookOpen,
  Send,
  AlertCircle
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { DocumentFormData, DocumentType, DocumentTheme, EducationItem, ExperienceItem } from '../types.ts';
import { INITIAL_FORM_DATA, DOC_PRESET_TEMPLATES } from '../data/documentTemplates.ts';
import { downloadDocGeneratorAsDocx } from '../utils/docxExport.ts';
import { KrutiDevConverterModal } from './KrutiDevConverterModal.tsx';

export const DocumentGenerator: React.FC = () => {
  const [formData, setFormData] = useState<DocumentFormData>(INITIAL_FORM_DATA);
  const [copied, setCopied] = useState(false);
  const [isAiPolishing, setIsAiPolishing] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState<string | null>(null);
  const [activeFormSection, setActiveFormSection] = useState<'type' | 'personal' | 'contact' | 'education' | 'experience' | 'custom'>('type');
  const [isKrutiDevModalOpen, setIsKrutiDevModalOpen] = useState(false);
  const printPreviewRef = useRef<HTMLDivElement>(null);

  // Handle template selection
  const handleDocTypeChange = (type: DocumentType) => {
    const preset = DOC_PRESET_TEMPLATES[type];
    setFormData(prev => ({
      ...prev,
      docType: type,
      language: preset?.language || prev.language,
      applicationSubject: preset?.applicationSubject || prev.applicationSubject,
      reasonOrDetails: preset?.reasonOrDetails || prev.reasonOrDetails,
      companyOrOrg: preset?.companyOrOrg || prev.companyOrOrg,
      jobTitleOrPosition: preset?.jobTitleOrPosition || prev.jobTitleOrPosition,
      notaryPlace: preset?.notaryPlace || prev.notaryPlace,
      gapPeriod: preset?.gapPeriod || prev.gapPeriod,
      gapReason: preset?.gapReason || prev.gapReason,
      oldName: preset?.oldName || prev.oldName,
      newName: preset?.newName || prev.newName,
      annualIncome: preset?.annualIncome || prev.annualIncome,
    }));
  };

  // Add Education item
  const addEducation = () => {
    const newItem: EducationItem = {
      id: `edu_${Date.now()}`,
      course: 'New Degree / Diploma',
      boardOrUniv: 'Board / University',
      passingYear: '2022',
      percentageOrCgpa: '75%',
      division: 'First'
    };
    setFormData(prev => ({ ...prev, education: [...prev.education, newItem] }));
  };

  // Remove Education item
  const removeEducation = (id: string) => {
    setFormData(prev => ({ ...prev, education: prev.education.filter(item => item.id !== id) }));
  };

  // Update Education item
  const updateEducation = (id: string, field: keyof EducationItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  // Add Experience item
  const addExperience = () => {
    const newItem: ExperienceItem = {
      id: `exp_${Date.now()}`,
      jobTitle: 'Designation / Post',
      companyName: 'Company or Organization',
      duration: '2022 - 2024',
      description: 'Handled day-to-day office and documentation responsibilities.'
    };
    setFormData(prev => ({ ...prev, experience: [...prev.experience, newItem] }));
  };

  // Remove Experience item
  const removeExperience = (id: string) => {
    setFormData(prev => ({ ...prev, experience: prev.experience.filter(item => item.id !== id) }));
  };

  // Update Experience item
  const updateExperience = (id: string, field: keyof ExperienceItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  // Browser Print trigger
  const handlePrint = () => {
    window.print();
  };

  // AI Text Enhancement trigger
  const handleAiEnhance = async () => {
    setIsAiPolishing(true);
    setAiStatusMessage(null);
    try {
      const textToEnhance = formData.docType === 'resume' ? formData.objective : formData.reasonOrDetails;
      const res = await fetch('/api/ai/enhance-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToEnhance,
          type: formData.docType,
          language: formData.language === 'hi' ? 'Hindi' : 'English',
        })
      });
      const data = await res.json();
      if (data.enhancedText) {
        if (formData.docType === 'resume') {
          setFormData(prev => ({ ...prev, objective: data.enhancedText }));
        } else {
          setFormData(prev => ({ ...prev, reasonOrDetails: data.enhancedText }));
        }
        setAiStatusMessage('Content polished successfully with professional grammar!');
      }
    } catch (err) {
      console.error(err);
      setAiStatusMessage('Could not connect to AI service. Using original text.');
    } finally {
      setIsAiPolishing(false);
      setTimeout(() => setAiStatusMessage(null), 4000);
    }
  };

  // Copy Plain text
  const handleCopyText = () => {
    if (!printPreviewRef.current) return;
    const text = printPreviewRef.current.innerText;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Client-side PDF Download using jsPDF
  const handleDownloadPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const margin = 15;
    let y = 20;

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    const title = formData.docType === 'resume' 
      ? (formData.language === 'hi' ? 'बायोडाटा / RESUME' : 'CURRICULUM VITAE / RESUME')
      : (formData.applicationSubject || formData.fullName);
    
    doc.text(title, 105, y, { align: 'center' });
    y += 10;

    // Name & Contact
    doc.setFontSize(14);
    doc.text(formData.fullName || 'Candidate Name', margin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Phone: ${formData.phone} | Email: ${formData.email}`, margin, y);
    y += 5;
    doc.text(`Address: ${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`, margin, y);
    y += 8;

    doc.setLineWidth(0.5);
    doc.line(margin, y, 195, y);
    y += 7;

    // Objective or Reason
    if (formData.docType === 'resume') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('CAREER OBJECTIVE', margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const splitObjective = doc.splitTextToSize(formData.objective, 180);
      doc.text(splitObjective, margin, y);
      y += (splitObjective.length * 4.5) + 5;

      // Education Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('ACADEMIC QUALIFICATIONS', margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      formData.education.forEach(edu => {
        doc.text(`• ${edu.course} - ${edu.boardOrUniv} (${edu.passingYear}) - Marks: ${edu.percentageOrCgpa} [${edu.division}]`, margin, y);
        y += 5;
      });
      y += 4;

      // Experience Section
      if (formData.experience.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('WORK EXPERIENCE', margin, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        formData.experience.forEach(exp => {
          doc.text(`• ${exp.jobTitle} at ${exp.companyName} (${exp.duration})`, margin, y);
          y += 4.5;
          const splitDesc = doc.splitTextToSize(exp.description, 175);
          doc.text(splitDesc, margin + 4, y);
          y += (splitDesc.length * 4) + 2;
        });
        y += 3;
      }

      // Skills & Personal
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('TECHNICAL SKILLS & COMPETENCIES', margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const splitSkills = doc.splitTextToSize(formData.skills, 180);
      doc.text(splitSkills, margin, y);
      y += (splitSkills.length * 4.5) + 5;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('PERSONAL DOSSIER', margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Father's Name: ${formData.fatherName} | DOB: ${formData.dob} | Gender: ${formData.gender}`, margin, y);
      y += 5;
      doc.text(`Nationality: ${formData.nationality} | Marital Status: ${formData.maritalStatus} | Languages: ${formData.languagesKnown}`, margin, y);
      y += 12;

      // Declaration
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.text('Declaration: I hereby declare that all information furnished above is true and complete to the best of my knowledge.', margin, y);
      y += 15;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Date: ______________`, margin, y);
      doc.text(`Signature: ____________________`, 130, y);
      doc.text(`(${formData.fullName})`, 135, y + 5);

    } else {
      // Applications & Affidavits
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`To: ${formData.companyOrOrg || 'The Competent Authority'}`, margin, y);
      y += 7;
      doc.text(`Subject: ${formData.applicationSubject}`, margin, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Respected Sir/Madam,', margin, y);
      y += 6;
      const splitBody = doc.splitTextToSize(formData.reasonOrDetails, 180);
      doc.text(splitBody, margin, y);
      y += (splitBody.length * 5) + 12;

      if (formData.gapPeriod) {
        doc.text(`Gap Period: ${formData.gapPeriod}`, margin, y);
        y += 5;
        doc.text(`Reason: ${formData.gapReason}`, margin, y);
        y += 8;
      }

      doc.text('Yours faithfully / Deponent,', 130, y);
      y += 12;
      doc.setFont('helvetica', 'bold');
      doc.text(`(${formData.fullName})`, 130, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(`Contact: ${formData.phone}`, 130, y);
    }

    doc.save(`${formData.fullName.replace(/\s+/g, '_')}_${formData.docType}.pdf`);
  };

  const handleDownloadDocx = async () => {
    try {
      await downloadDocGeneratorAsDocx(formData);
    } catch (err) {
      console.error('Docx export error:', err);
      alert('Failed to generate MS Word document.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar & Quick Presets */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Document Generator & Resume Studio
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Create instant print-ready English/Hindi Resumes, Job Applications, Notary Affidavits, and Leave Letters.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="doc-print-btn"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print A4 Page</span>
            </button>

            <button
              id="doc-pdf-btn"
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Save PDF</span>
            </button>

            <button
              id="doc-docx-btn"
              onClick={handleDownloadDocx}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
              title="Download editable Microsoft Word .docx file"
            >
              <Download className="w-4 h-4" />
              <span>MS Word (.docx)</span>
            </button>

            <button
              id="doc-copy-btn"
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>

            <button
              id="doc-kruti-btn"
              onClick={() => setIsKrutiDevModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all cursor-pointer"
              title="Convert legacy Kruti Dev Hindi typing to Mangal Unicode"
            >
              <Languages className="w-4 h-4 text-amber-600" />
              <span>Kruti Dev ↔ Mangal</span>
            </button>

            <button
              id="doc-ai-polish-btn"
              onClick={handleAiEnhance}
              disabled={isAiPolishing}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 text-purple-600 dark:text-purple-400 ${isAiPolishing ? 'animate-spin' : ''}`} />
              <span>{isAiPolishing ? 'AI Polishing...' : 'AI Grammar Polish'}</span>
            </button>
          </div>
        </div>

        {aiStatusMessage && (
          <div className="mt-3 p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/80 flex items-center gap-2 text-xs text-purple-800 dark:text-purple-200 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>{aiStatusMessage}</span>
          </div>
        )}

        {/* Document Type Selector Chips */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">Format:</span>
          {[
            { id: 'resume', label: 'Resume / Bio-Data (रिज्यूमे)', type: 'resume' as DocumentType },
            { id: 'job_application_hi', label: 'नौकरी आवेदन पत्र (Hindi)', type: 'job_application_hi' as DocumentType },
            { id: 'job_application_en', label: 'Job Application (English)', type: 'job_application_en' as DocumentType },
            { id: 'affidavit_gap', label: 'Gap Year Affidavit (शपथ पत्र)', type: 'affidavit_gap' as DocumentType },
            { id: 'affidavit_name', label: 'Name Correction Affidavit', type: 'affidavit_name' as DocumentType },
            { id: 'affidavit_income', label: 'Income Self-Declaration (आय शपथ)', type: 'affidavit_income' as DocumentType },
            { id: 'leave_letter_hi', label: 'अवकाश प्रार्थना पत्र (Leave Letter)', type: 'leave_letter_hi' as DocumentType },
            { id: 'experience_cert', label: 'Experience Certificate (अनुभव)', type: 'experience_cert' as DocumentType },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => handleDocTypeChange(item.type)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                formData.docType === item.type
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form Inputs on Left, Live A4 Sheet Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Interactive Multi-Field Form Controls */}
        <div className="lg:col-span-5 space-y-4 print:hidden">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
            
            {/* Form Section Navigation */}
            <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 overflow-x-auto scrollbar-none">
              {[
                { id: 'type', label: 'Type & Style', icon: Palette },
                { id: 'personal', label: 'Personal', icon: FileEdit },
                { id: 'contact', label: 'Contact', icon: BookOpen },
                ...(formData.docType === 'resume' ? [
                  { id: 'education', label: 'Education', icon: Plus },
                  { id: 'experience', label: 'Experience', icon: Plus },
                ] : []),
                { id: 'custom', label: 'Content Body', icon: Send },
              ].map(tab => {
                const Icon = tab.icon;
                const active = activeFormSection === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFormSection(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                      active 
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800' 
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 space-y-4 max-h-[750px] overflow-y-auto">
              
              {/* SECTION: Type & Layout Style */}
              {activeFormSection === 'type' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Visual Design Template
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'classic', title: 'Classic Formal', desc: 'Centered, clean rules' },
                        { id: 'modern', title: 'Modern Two-Column', desc: 'Sidebar bio layout' },
                        { id: 'executive', title: 'Executive Border', desc: 'Bordered clean frame' },
                        { id: 'govt_standard', title: 'Govt Standard Hindi', desc: 'Official Hindi format' },
                      ].map(themeItem => (
                        <button
                          key={themeItem.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, theme: themeItem.id as DocumentTheme }))}
                          className={`p-2.5 text-left rounded-lg border text-xs transition-all cursor-pointer ${
                            formData.theme === themeItem.id
                              ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-500'
                              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                          }`}
                        >
                          <span className="font-bold block">{themeItem.title}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">{themeItem.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Language</label>
                      <select
                        value={formData.language}
                        onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value as 'en' | 'hi' }))}
                        className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                      >
                        <option value="en">English (अंग्रेजी)</option>
                        <option value="hi">Hindi (हिन्दी)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">CSC Cyber Center Note</label>
                      <input
                        type="text"
                        value={formData.cscCenterName}
                        onChange={(e) => setFormData(prev => ({ ...prev, cscCenterName: e.target.value }))}
                        placeholder="CSC Name (optional)"
                        className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: Personal Information */}
              {activeFormSection === 'personal' && (
                <div className="space-y-3 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="e.g. Rahul Kumar Sharma"
                      className="w-full text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Father's Name</label>
                      <input
                        type="text"
                        value={formData.fatherName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fatherName: e.target.value }))}
                        placeholder="Shri ..."
                        className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mother's Name</label>
                      <input
                        type="text"
                        value={formData.motherName}
                        onChange={(e) => setFormData(prev => ({ ...prev, motherName: e.target.value }))}
                        placeholder="Smt. ..."
                        className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">DOB</label>
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                      >
                        <option value="Male">Male (पुरुष)</option>
                        <option value="Female">Female (महिला)</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Marital Status</label>
                      <select
                        value={formData.maritalStatus}
                        onChange={(e) => setFormData(prev => ({ ...prev, maritalStatus: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                      >
                        <option value="Unmarried">Unmarried (अविवाहित)</option>
                        <option value="Married">Married (विवाहित)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                      >
                        <option value="General">General / UR</option>
                        <option value="OBC">OBC (Non-Creamy Layer)</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="EWS">EWS</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nationality</label>
                      <input
                        type="text"
                        value={formData.nationality}
                        onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: Contact & Address */}
              {activeFormSection === 'contact' && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile / Phone *</label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+91 98765 43210"
                        className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="name@email.com"
                        className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Postal Address</label>
                    <textarea
                      rows={2}
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="House No, Ward, Landmark, Village/Colony"
                      className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">City / Tehsil</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">State</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pincode</label>
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: Education List */}
              {activeFormSection === 'education' && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Academic & Professional Qualifications
                    </label>
                    <button
                      type="button"
                      onClick={addEducation}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 rounded-md border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Row
                    </button>
                  </div>

                  {formData.education.map((edu, idx) => (
                    <div key={edu.id} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-750 space-y-2 relative group">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Level {idx + 1}</span>
                        {formData.education.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEducation(edu.id)}
                            className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                            title="Remove Qualification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={edu.course}
                          onChange={(e) => updateEducation(edu.id, 'course', e.target.value)}
                          placeholder="Exam / Course (e.g. 10th / BCA)"
                          className="text-xs p-1.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                        />
                        <input
                          type="text"
                          value={edu.boardOrUniv}
                          onChange={(e) => updateEducation(edu.id, 'boardOrUniv', e.target.value)}
                          placeholder="Board / University"
                          className="text-xs p-1.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={edu.passingYear}
                          onChange={(e) => updateEducation(edu.id, 'passingYear', e.target.value)}
                          placeholder="Year (2020)"
                          className="text-xs p-1.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                        />
                        <input
                          type="text"
                          value={edu.percentageOrCgpa}
                          onChange={(e) => updateEducation(edu.id, 'percentageOrCgpa', e.target.value)}
                          placeholder="% / CGPA"
                          className="text-xs p-1.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                        />
                        <input
                          type="text"
                          value={edu.division}
                          onChange={(e) => updateEducation(edu.id, 'division', e.target.value)}
                          placeholder="Division"
                          className="text-xs p-1.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SECTION: Experience List */}
              {activeFormSection === 'experience' && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Work Experience Records
                    </label>
                    <button
                      type="button"
                      onClick={addExperience}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 rounded-md border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Job
                    </button>
                  </div>

                  {formData.experience.map((exp, idx) => (
                    <div key={exp.id} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-750 space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Position {idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeExperience(exp.id)}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={exp.jobTitle}
                          onChange={(e) => updateExperience(exp.id, 'jobTitle', e.target.value)}
                          placeholder="Job Title"
                          className="text-xs p-1.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                        />
                        <input
                          type="text"
                          value={exp.companyName}
                          onChange={(e) => updateExperience(exp.id, 'companyName', e.target.value)}
                          placeholder="Company / Firm"
                          className="text-xs p-1.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                        />
                      </div>

                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                        placeholder="Duration (e.g., July 2021 – Present)"
                        className="w-full text-xs p-1.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                      />

                      <textarea
                        rows={2}
                        value={exp.description}
                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                        placeholder="Key responsibilities and achievements..."
                        className="w-full text-xs p-1.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* SECTION: Custom Content Body & Specifics */}
              {activeFormSection === 'custom' && (
                <div className="space-y-3 animate-fadeIn">
                  {formData.docType === 'resume' ? (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Career Objective</label>
                        <textarea
                          rows={3}
                          value={formData.objective}
                          onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
                          className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Skills & Computer Knowledge</label>
                        <input
                          type="text"
                          value={formData.skills}
                          onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                          placeholder="MS Office, Typing, Tally, Photoshop..."
                          className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Languages Known</label>
                        <input
                          type="text"
                          value={formData.languagesKnown}
                          onChange={(e) => setFormData(prev => ({ ...prev, languagesKnown: e.target.value }))}
                          placeholder="Hindi, English, etc."
                          className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Addressed To (Company / Authority / Principal)</label>
                        <input
                          type="text"
                          value={formData.companyOrOrg}
                          onChange={(e) => setFormData(prev => ({ ...prev, companyOrOrg: e.target.value }))}
                          placeholder="e.g. सेवा में, श्रीमान..."
                          className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject (विषय)</label>
                        <input
                          type="text"
                          value={formData.applicationSubject}
                          onChange={(e) => setFormData(prev => ({ ...prev, applicationSubject: e.target.value }))}
                          className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Main Body / Statement / Reasons</label>
                        <textarea
                          rows={6}
                          value={formData.reasonOrDetails}
                          onChange={(e) => setFormData(prev => ({ ...prev, reasonOrDetails: e.target.value }))}
                          className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                        />
                      </div>

                      {formData.docType === 'affidavit_gap' && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gap Duration</label>
                            <input
                              type="text"
                              value={formData.gapPeriod}
                              onChange={(e) => setFormData(prev => ({ ...prev, gapPeriod: e.target.value }))}
                              placeholder="2021 to 2023"
                              className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notary Place</label>
                            <input
                              type="text"
                              value={formData.notaryPlace}
                              onChange={(e) => setFormData(prev => ({ ...prev, notaryPlace: e.target.value }))}
                              placeholder="District Court"
                              className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Right Side: Live A4 Printable Sheet Preview */}
        <div className="lg:col-span-7">
          <div className="bg-slate-200 dark:bg-slate-950/70 p-3 sm:p-6 rounded-xl border border-slate-300 dark:border-slate-800 shadow-inner flex flex-col items-center">
            
            {/* Sheet Top Info Pill */}
            <div className="mb-3 text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2 print:hidden">
              <Eye className="w-3.5 h-3.5" />
              <span>A4 Standard Format (210mm × 297mm) • Print Ready</span>
            </div>

            {/* A4 Sheet Container */}
            <div 
              ref={printPreviewRef}
              id="printable-a4-sheet"
              className={`w-full max-w-[700px] bg-white text-slate-900 p-8 sm:p-10 shadow-2xl rounded-sm min-h-[950px] relative transition-all ${
                formData.theme === 'executive' ? 'border-[3px] border-indigo-900 m-1' : ''
              }`}
              style={{ fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}
            >
              
              {/* RENDER: RESUME / BIO-DATA */}
              {formData.docType === 'resume' && (
                <div className="space-y-6">
                  {/* Theme 1 & 4: Header Centered */}
                  <div className="border-b-2 border-slate-800 pb-4 text-center">
                    <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-slate-900">
                      {formData.language === 'hi' ? 'बायोडाटा / RESUME' : 'CURRICULUM VITAE'}
                    </h1>
                    <h2 className="text-lg font-bold text-slate-800 mt-1">{formData.fullName || 'CANDIDATE NAME'}</h2>
                    <p className="text-xs text-slate-600 mt-1 font-medium">
                      {formData.address}, {formData.city}, {formData.state} - {formData.pincode}
                    </p>
                    <p className="text-xs text-slate-700 font-semibold mt-0.5">
                      Mob: {formData.phone} | Email: {formData.email}
                    </p>
                  </div>

                  {/* Career Objective */}
                  {formData.objective && (
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-indigo-900 border-b border-indigo-200 pb-1 mb-2">
                        {formData.language === 'hi' ? 'उद्देश्य / CAREER OBJECTIVE' : 'CAREER OBJECTIVE'}
                      </h3>
                      <p className="text-xs text-slate-700 leading-relaxed text-justify">
                        {formData.objective}
                      </p>
                    </div>
                  )}

                  {/* Academic Qualifications Table */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-indigo-900 border-b border-indigo-200 pb-1 mb-2">
                      {formData.language === 'hi' ? 'शैक्षणिक योग्यता / ACADEMIC QUALIFICATIONS' : 'ACADEMIC QUALIFICATIONS'}
                    </h3>
                    <table className="w-full text-left text-xs border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                          <th className="p-1.5 border-r border-slate-300">Examination</th>
                          <th className="p-1.5 border-r border-slate-300">Board / University</th>
                          <th className="p-1.5 border-r border-slate-300">Year</th>
                          <th className="p-1.5 border-r border-slate-300">% / CGPA</th>
                          <th className="p-1.5">Division</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.education.map((edu, idx) => (
                          <tr key={edu.id || idx} className="border-b border-slate-200">
                            <td className="p-1.5 border-r border-slate-200 font-semibold">{edu.course}</td>
                            <td className="p-1.5 border-r border-slate-200">{edu.boardOrUniv}</td>
                            <td className="p-1.5 border-r border-slate-200">{edu.passingYear}</td>
                            <td className="p-1.5 border-r border-slate-200 font-medium">{edu.percentageOrCgpa}</td>
                            <td className="p-1.5">{edu.division}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Work Experience */}
                  {formData.experience.length > 0 && (
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-indigo-900 border-b border-indigo-200 pb-1 mb-2">
                        {formData.language === 'hi' ? 'कार्यानुभव / WORK EXPERIENCE' : 'WORK EXPERIENCE'}
                      </h3>
                      <div className="space-y-2.5">
                        {formData.experience.map((exp, idx) => (
                          <div key={exp.id || idx} className="text-xs">
                            <div className="flex justify-between items-baseline font-bold text-slate-800">
                              <span>• {exp.jobTitle} - {exp.companyName}</span>
                              <span className="text-[11px] text-slate-500 font-normal">{exp.duration}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 pl-3 mt-0.5">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technical Skills */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-indigo-900 border-b border-indigo-200 pb-1 mb-2">
                      {formData.language === 'hi' ? 'कौशल व दक्षता / SKILLS' : 'SKILLS & COMPETENCIES'}
                    </h3>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {formData.skills}
                    </p>
                  </div>

                  {/* Personal Bio Data */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-indigo-900 border-b border-indigo-200 pb-1 mb-2">
                      {formData.language === 'hi' ? 'व्यक्तिगत विवरण / PERSONAL DOSSIER' : 'PERSONAL DOSSIER'}
                    </h3>
                    <div className="grid grid-cols-2 gap-y-1.5 text-xs text-slate-700">
                      <div><span className="font-semibold">Father's Name:</span> {formData.fatherName}</div>
                      <div><span className="font-semibold">Mother's Name:</span> {formData.motherName}</div>
                      <div><span className="font-semibold">Date of Birth:</span> {formData.dob}</div>
                      <div><span className="font-semibold">Gender:</span> {formData.gender}</div>
                      <div><span className="font-semibold">Marital Status:</span> {formData.maritalStatus}</div>
                      <div><span className="font-semibold">Category:</span> {formData.category}</div>
                      <div><span className="font-semibold">Nationality:</span> {formData.nationality}</div>
                      <div><span className="font-semibold">Languages:</span> {formData.languagesKnown}</div>
                    </div>
                  </div>

                  {/* Declaration Footer */}
                  <div className="pt-4 border-t border-slate-300 text-xs">
                    <p className="italic text-[11px] text-slate-600 mb-6">
                      Declaration: I solemnly declare that all the information furnished above is genuine, true, and correct to the best of my knowledge and belief.
                    </p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p>Date: ______________</p>
                        <p>Place: {formData.city}</p>
                      </div>
                      <div className="text-right">
                        <div className="h-8"></div>
                        <p className="font-bold">({formData.fullName})</p>
                        <p className="text-[10px] text-slate-500">Signature of Candidate</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* RENDER: FORMAL JOB APPLICATION & LEAVE LETTERS (HINDI & ENGLISH) */}
              {(formData.docType.includes('job_application') || formData.docType.includes('leave_letter')) && (
                <div className="space-y-6 text-slate-800 text-xs sm:text-sm leading-relaxed">
                  
                  {/* Top Sender Info */}
                  <div className="flex justify-between items-start border-b border-slate-300 pb-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">{formData.fullName}</h2>
                      <p className="text-xs text-slate-600">{formData.address}, {formData.city}, {formData.state}</p>
                      <p className="text-xs text-slate-600">Mob: {formData.phone} | Email: {formData.email}</p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-semibold">Date: {new Date().toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Recipient */}
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">
                      {formData.language === 'hi' ? 'सेवा में,' : 'To,'}
                    </p>
                    <p className="font-semibold pl-4 text-slate-800">{formData.companyOrOrg}</p>
                    <p className="pl-4 text-slate-600">{formData.city}, {formData.state}</p>
                  </div>

                  {/* Subject */}
                  <div className="py-1">
                    <p className="font-bold text-slate-900">
                      <span className="underline">
                        {formData.language === 'hi' ? 'विषय:' : 'Subject:'} {formData.applicationSubject}
                      </span>
                    </p>
                  </div>

                  {/* Salutation */}
                  <p className="font-bold">
                    {formData.language === 'hi' ? 'महोदय / महोदया,' : 'Respected Sir / Madam,'}
                  </p>

                  {/* Application Body Content */}
                  <div className="text-justify whitespace-pre-line leading-relaxed text-slate-700">
                    {formData.reasonOrDetails}
                  </div>

                  {/* Qualifications summary in Application if present */}
                  {formData.docType.includes('job_application') && (
                    <div className="pt-2">
                      <p className="font-bold text-xs mb-1.5">
                        {formData.language === 'hi' ? 'संक्षिप्त शैक्षणिक योग्यता:' : 'Brief Educational Summary:'}
                      </p>
                      <ul className="list-disc pl-5 text-xs space-y-1 text-slate-700">
                        {formData.education.map((edu, idx) => (
                          <li key={idx}>
                            <strong>{edu.course}</strong> from {edu.boardOrUniv} ({edu.passingYear}) with {edu.percentageOrCgpa}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Closing & Sign-off */}
                  <div className="pt-6 flex justify-between items-end">
                    <div>
                      <p className="text-xs text-slate-600">
                        {formData.language === 'hi' ? 'संलग्नक: स्वप्रमाणित दस्तावेज़ प्रतियां' : 'Enclosures: Self-attested copies of certificates'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="mb-8 font-medium">
                        {formData.language === 'hi' ? 'भवदीय / प्रार्थी' : 'Yours Faithfully,'}
                      </p>
                      <p className="font-bold text-slate-900">({formData.fullName})</p>
                      <p className="text-xs text-slate-600">Mob: {formData.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* RENDER: AFFIDAVITS (GAP YEAR, NAME CORRECTION, INCOME) */}
              {formData.docType.includes('affidavit') && (
                <div className="space-y-6 text-xs sm:text-sm text-slate-800 leading-relaxed">
                  
                  {/* Affidavit Stamp Header */}
                  <div className="text-center border-b-2 border-slate-800 pb-3">
                    <p className="text-[11px] font-mono uppercase text-slate-500 tracking-widest">
                      BEFORE THE NOTARY PUBLIC / EXECUTIVE MAGISTRATE
                    </p>
                    <h1 className="text-xl font-black text-slate-900 mt-1 uppercase">
                      {formData.language === 'hi' ? 'शपथ पत्र / AFFIDAVIT' : 'AFFIDAVIT / DECLARATION'}
                    </h1>
                    <p className="text-xs font-semibold text-slate-600">At {formData.notaryPlace || 'District Court'}</p>
                  </div>

                  {/* Deponent Bio Clause */}
                  <p className="text-justify">
                    I, <strong>{formData.fullName}</strong>, S/o / D/o <strong>{formData.fatherName}</strong>, aged about {new Date().getFullYear() - (formData.dob ? new Date(formData.dob).getFullYear() : 2000)} years, resident of <strong>{formData.address}, {formData.city}, {formData.state} - {formData.pincode}</strong>, do hereby solemnly affirm and state on oath as under:
                  </p>

                  {/* Numbered Clauses */}
                  <div className="space-y-3 text-justify pl-2">
                    <p>
                      <strong>1.</strong> That I am a bona fide citizen of India and permanent resident at the above mentioned address.
                    </p>

                    {formData.docType === 'affidavit_gap' && (
                      <>
                        <p>
                          <strong>2.</strong> That I passed my last examination from recognized Board/University in the year {formData.education[0]?.passingYear || '2021'}.
                        </p>
                        <p>
                          <strong>3.</strong> That there is a gap period of <strong>{formData.gapPeriod}</strong> in my studies due to the following genuine reason: <em>{formData.gapReason}</em>.
                        </p>
                        <p>
                          <strong>4.</strong> That during this aforementioned gap period, I did not take admission in any other college/institution, nor was I involved in any criminal offense or illegal activities.
                        </p>
                      </>
                    )}

                    {formData.docType === 'affidavit_name' && (
                      <>
                        <p>
                          <strong>2.</strong> That in my previous academic/official records, my name was inadvertently recorded as <strong>"{formData.oldName}"</strong>.
                        </p>
                        <p>
                          <strong>3.</strong> That my correct, actual, and verified name is <strong>"{formData.newName}"</strong>.
                        </p>
                        <p>
                          <strong>4.</strong> That both names <em>"{formData.oldName}"</em> and <em>"{formData.newName}"</em> pertain to one and the same person, i.e., myself the deponent.
                        </p>
                      </>
                    )}

                    {formData.docType === 'affidavit_income' && (
                      <>
                        <p>
                          <strong>2.</strong> That the total annual income of my family from all sources (agriculture, labor, business, and employment) is <strong>{formData.annualIncome}</strong>.
                        </p>
                        <p>
                          <strong>3.</strong> That this affidavit is executed to produce before competent authorities for scholarship / fee concession / government scheme verification.
                        </p>
                      </>
                    )}

                    <p>
                      <strong>5.</strong> That the contents of this affidavit are true to my personal knowledge, nothing material has been concealed therefrom.
                    </p>
                  </div>

                  {/* Deponent Signature Box */}
                  <div className="pt-6 flex justify-end">
                    <div className="text-right">
                      <div className="h-10"></div>
                      <p className="font-bold">DEPONENT / शपथकर्ता</p>
                      <p className="text-xs">({formData.fullName})</p>
                    </div>
                  </div>

                  {/* Notary Verification Clause */}
                  <div className="pt-4 border-t border-slate-300">
                    <p className="font-bold text-xs uppercase mb-1">VERIFICATION / सत्यापन:</p>
                    <p className="text-[11px] text-slate-600 text-justify">
                      Verified at {formData.city} on this {new Date().toLocaleDateString('en-IN')} that the contents of above affidavit are true and correct to the best of my knowledge. No part of it is false and nothing has been concealed.
                    </p>
                    <div className="flex justify-between items-end pt-8 text-xs">
                      <div>
                        <p>Identified by Advocate / Witness:</p>
                        <p className="text-[11px] text-slate-500">1. {formData.witness1 || '_____________________'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">DEPONENT</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* RENDER: EXPERIENCE & CHARACTER CERTIFICATES */}
              {(formData.docType === 'experience_cert' || formData.docType === 'character_cert') && (
                <div className="space-y-6 text-xs sm:text-sm text-slate-800 leading-relaxed">
                  <div className="text-center border-b-2 border-slate-800 pb-4">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase">
                      {formData.companyOrOrg || 'ORGANIZATION / FIRM LETTERHEAD'}
                    </h1>
                    <p className="text-xs text-slate-600 font-medium">Ref No: CERT/{new Date().getFullYear()}/{Math.floor(1000 + Math.random() * 9000)}</p>
                    <p className="text-xs text-slate-600">Date: {new Date().toLocaleDateString('en-IN')}</p>
                  </div>

                  <div className="text-center py-2">
                    <span className="text-sm font-black uppercase tracking-wider px-4 py-1 border-b-2 border-indigo-900 text-indigo-900 inline-block">
                      {formData.docType === 'experience_cert' ? 'EXPERIENCE CERTIFICATE' : 'TO WHOMSOEVER IT MAY CONCERN'}
                    </span>
                  </div>

                  <div className="text-justify leading-relaxed whitespace-pre-line text-slate-800">
                    {formData.reasonOrDetails}
                  </div>

                  <div className="pt-16 flex justify-between items-end text-xs">
                    <div>
                      <p className="font-semibold">Place: {formData.city}</p>
                      <p className="text-[11px] text-slate-500">Official Seal / Stamp</p>
                    </div>
                    <div className="text-right">
                      <div className="h-10"></div>
                      <p className="font-bold">Authorized Signatory</p>
                      <p className="text-xs text-slate-600">{formData.companyOrOrg}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Document footer watermark for CSC center */}
              {formData.cscCenterName && (
                <div className="absolute bottom-2 left-6 right-6 text-center text-[9px] text-slate-400 border-t border-slate-100 pt-1">
                  Prepared at {formData.cscCenterName} • Verified Digital Format
                </div>
              )}

            </div>
          </div>
        </div>

      </div>

      {/* Kruti Dev 010 <-> Mangal (Unicode) Font Converter Modal */}
      <KrutiDevConverterModal
        isOpen={isKrutiDevModalOpen}
        onClose={() => setIsKrutiDevModalOpen(false)}
        onInsertText={(converted) => {
          setFormData(prev => ({
            ...prev,
            reasonOrDetails: prev.reasonOrDetails ? `${prev.reasonOrDetails}\n${converted}` : converted,
          }));
        }}
      />
    </div>
  );
};
