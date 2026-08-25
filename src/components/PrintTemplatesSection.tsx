import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, 
  FileText, 
  Receipt, 
  ShoppingBag, 
  Briefcase, 
  DollarSign, 
  Truck, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Download, 
  Copy, 
  Check, 
  Eye, 
  Save, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  QrCode, 
  Scissors, 
  Sparkles, 
  Layers, 
  SlidersHorizontal,
  Maximize2,
  Minimize2,
  FileCheck2,
  Clock,
  Calendar,
  User,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { 
  CommercialTemplateType,
  PaperSizeOption,
  PrintThemeOption,
  BusinessProfile,
  VisitReceiptData,
  CashMemoData,
  JobOrderData,
  PaymentReceiptData,
  DeliveryChallanData,
  LineItem,
  JobOrderItem,
  DEFAULT_BUSINESS_PROFILE,
  SAMPLE_VISIT_RECEIPT,
  SAMPLE_CASH_MEMO,
  SAMPLE_JOB_ORDER,
  SAMPLE_PAYMENT_RECEIPT,
  SAMPLE_DELIVERY_CHALLAN
} from '../data/commercialPrintTemplates.ts';
import { numberToIndianWords } from '../utils/numberToWords.ts';
import { jsPDF } from 'jspdf';
import { addRecentActivity } from '../utils/recentActivity.ts';

const STORAGE_KEY_BUSINESS = 'doc_studio_business_profile';

export const PrintTemplatesSection: React.FC = () => {
  // Selected Template
  const [selectedTemplate, setSelectedTemplate] = useState<CommercialTemplateType>('visit_receipt');
  
  // Paper & Layout Settings
  const [paperSize, setPaperSize] = useState<PaperSizeOption>('A4');
  const [theme, setTheme] = useState<PrintThemeOption>('classic_border');
  const [dualCopy, setDualCopy] = useState<boolean>(false);
  const [showQrCode, setShowQrCode] = useState<boolean>(true);
  const [showStampBox, setShowStampBox] = useState<boolean>(true);
  const [showTearOffLine, setShowTearOffLine] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [businessSavedToast, setBusinessSavedToast] = useState<boolean>(false);

  // Business Profile
  const [business, setBusiness] = useState<BusinessProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BUSINESS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_BUSINESS_PROFILE;
  });

  // Template Data States
  const [visitReceipt, setVisitReceipt] = useState<VisitReceiptData>(SAMPLE_VISIT_RECEIPT);
  const [cashMemo, setCashMemo] = useState<CashMemoData>(SAMPLE_CASH_MEMO);
  const [jobOrder, setJobOrder] = useState<JobOrderData>(SAMPLE_JOB_ORDER);
  const [paymentReceipt, setPaymentReceipt] = useState<PaymentReceiptData>(SAMPLE_PAYMENT_RECEIPT);
  const [deliveryChallan, setDeliveryChallan] = useState<DeliveryChallanData>(SAMPLE_DELIVERY_CHALLAN);

  // Active Editor Sub-tab
  const [activeEditorTab, setActiveEditorTab] = useState<'content' | 'business' | 'styling'>('content');

  // Save Business Profile to LocalStorage
  const handleSaveBusiness = () => {
    try {
      localStorage.setItem(STORAGE_KEY_BUSINESS, JSON.stringify(business));
      setBusinessSavedToast(true);
      setTimeout(() => setBusinessSavedToast(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  // Reset to default sample for current template
  const handleResetSample = () => {
    if (selectedTemplate === 'visit_receipt') setVisitReceipt({ ...SAMPLE_VISIT_RECEIPT, date: new Date().toISOString().split('T')[0] });
    if (selectedTemplate === 'cash_memo') setCashMemo({ ...SAMPLE_CASH_MEMO, date: new Date().toISOString().split('T')[0] });
    if (selectedTemplate === 'job_order') setJobOrder({ ...SAMPLE_JOB_ORDER, orderDate: new Date().toISOString().split('T')[0] });
    if (selectedTemplate === 'payment_receipt') setPaymentReceipt({ ...SAMPLE_PAYMENT_RECEIPT, date: new Date().toISOString().split('T')[0] });
    if (selectedTemplate === 'delivery_challan') setDeliveryChallan({ ...SAMPLE_DELIVERY_CHALLAN, date: new Date().toISOString().split('T')[0] });
  };

  // Recalculate Cash Memo Totals
  const updateCashMemoItem = (index: number, updatedFields: Partial<LineItem>) => {
    setCashMemo(prev => {
      const newItems = [...prev.items];
      const item = { ...newItems[index], ...updatedFields };
      item.amount = (item.qty * item.rate) - (item.discount || 0);
      newItems[index] = item;

      const subtotal = newItems.reduce((acc, curr) => acc + curr.amount, 0);
      const taxAmount = (subtotal * (prev.taxRatePercent || 0)) / 100;
      const grandTotal = Math.round(subtotal + taxAmount + (prev.otherCharges || 0) - (prev.discountAmount || 0));

      return {
        ...prev,
        items: newItems,
        subtotal,
        taxAmount,
        grandTotal,
        amountInWords: numberToIndianWords(grandTotal)
      };
    });
  };

  const addCashMemoItem = () => {
    setCashMemo(prev => {
      const newItem: LineItem = {
        id: `item-${Date.now()}`,
        description: 'New Service / Item',
        qty: 1,
        unit: 'Pcs',
        rate: 50,
        discount: 0,
        amount: 50
      };
      const newItems = [...prev.items, newItem];
      const subtotal = newItems.reduce((acc, curr) => acc + curr.amount, 0);
      const taxAmount = (subtotal * (prev.taxRatePercent || 0)) / 100;
      const grandTotal = Math.round(subtotal + taxAmount + (prev.otherCharges || 0) - (prev.discountAmount || 0));
      return {
        ...prev,
        items: newItems,
        subtotal,
        taxAmount,
        grandTotal,
        amountInWords: numberToIndianWords(grandTotal)
      };
    });
  };

  const removeCashMemoItem = (index: number) => {
    setCashMemo(prev => {
      if (prev.items.length <= 1) return prev;
      const newItems = prev.items.filter((_, i) => i !== index);
      const subtotal = newItems.reduce((acc, curr) => acc + curr.amount, 0);
      const taxAmount = (subtotal * (prev.taxRatePercent || 0)) / 100;
      const grandTotal = Math.round(subtotal + taxAmount + (prev.otherCharges || 0) - (prev.discountAmount || 0));
      return {
        ...prev,
        items: newItems,
        subtotal,
        taxAmount,
        grandTotal,
        amountInWords: numberToIndianWords(grandTotal)
      };
    });
  };

  // Recalculate Job Order Totals
  const updateJobOrderItem = (index: number, updatedFields: Partial<JobOrderItem>) => {
    setJobOrder(prev => {
      const newItems = [...prev.orderItems];
      newItems[index] = { ...newItems[index], ...updatedFields };
      const estimatedTotal = newItems.reduce((acc, curr) => acc + Number(curr.estimatedCost || 0), 0);
      const balanceDue = Math.max(0, estimatedTotal - prev.advanceReceived);
      return {
        ...prev,
        orderItems: newItems,
        estimatedTotal,
        balanceDue
      };
    });
  };

  const addJobOrderItem = () => {
    setJobOrder(prev => {
      const newItem: JobOrderItem = {
        id: `job-${Date.now()}`,
        serviceCategory: 'General Service',
        taskDescription: 'Work requirement & specifications',
        pagesOrCopies: 1,
        specifications: 'Standard A4',
        estimatedCost: 100
      };
      const newItems = [...prev.orderItems, newItem];
      const estimatedTotal = newItems.reduce((acc, curr) => acc + Number(curr.estimatedCost || 0), 0);
      const balanceDue = Math.max(0, estimatedTotal - prev.advanceReceived);
      return {
        ...prev,
        orderItems: newItems,
        estimatedTotal,
        balanceDue
      };
    });
  };

  const removeJobOrderItem = (index: number) => {
    setJobOrder(prev => {
      if (prev.orderItems.length <= 1) return prev;
      const newItems = prev.orderItems.filter((_, i) => i !== index);
      const estimatedTotal = newItems.reduce((acc, curr) => acc + Number(curr.estimatedCost || 0), 0);
      const balanceDue = Math.max(0, estimatedTotal - prev.advanceReceived);
      return {
        ...prev,
        orderItems: newItems,
        estimatedTotal,
        balanceDue
      };
    });
  };

  // System Print Execution
  const handlePrint = () => {
    window.print();
  };

  // Generate Vector PDF
  const handleDownloadPdf = () => {
    try {
      const isThermal = paperSize === 'THERMAL_80MM';
      const isA5 = paperSize === 'A5';
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: isThermal ? [80, 200] : isA5 ? 'a5' : 'a4'
      });

      const pageWidth = isThermal ? 80 : isA5 ? 148 : 210;
      const margin = isThermal ? 4 : 14;
      let y = isThermal ? 8 : 16;

      // Header Business Name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(isThermal ? 11 : 14);
      doc.text(business.name, pageWidth / 2, y, { align: 'center' });
      y += isThermal ? 4.5 : 6;

      if (business.tagline) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(isThermal ? 7 : 9);
        doc.text(business.tagline, pageWidth / 2, y, { align: 'center' });
        y += isThermal ? 4 : 5;
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(isThermal ? 6.5 : 8);
      doc.text(business.address, pageWidth / 2, y, { align: 'center' });
      y += isThermal ? 3.5 : 4.5;
      doc.text(`Phone: ${business.phone} | GSTIN: ${business.gstin || 'N/A'}`, pageWidth / 2, y, { align: 'center' });
      y += isThermal ? 5 : 7;

      // Divider
      doc.setDrawColor(180, 180, 180);
      doc.line(margin, y, pageWidth - margin, y);
      y += isThermal ? 4 : 6;

      // Template Specific PDF Content
      if (selectedTemplate === 'visit_receipt') {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(isThermal ? 10 : 12);
        doc.text(`VISIT RECEIPT / TOKEN SLIP (${visitReceipt.tokenNo})`, pageWidth / 2, y, { align: 'center' });
        y += isThermal ? 5 : 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(isThermal ? 7.5 : 9);
        doc.text(`Receipt No: ${visitReceipt.receiptNo}`, margin, y);
        doc.text(`Date & Time: ${visitReceipt.date} ${visitReceipt.time}`, pageWidth - margin, y, { align: 'right' });
        y += isThermal ? 4.5 : 6;

        doc.text(`Visitor Name: ${visitReceipt.visitorName}`, margin, y);
        doc.text(`Phone: ${visitReceipt.phone}`, pageWidth - margin, y, { align: 'right' });
        y += isThermal ? 4.5 : 6;

        doc.text(`Purpose: ${visitReceipt.purposeOfVisit}`, margin, y);
        y += isThermal ? 4.5 : 6;

        doc.text(`Desk/Counter: ${visitReceipt.counterNo} (${visitReceipt.departmentOrDesk})`, margin, y);
        doc.text(`Attended By: ${visitReceipt.attendedBy}`, pageWidth - margin, y, { align: 'right' });
        y += isThermal ? 5 : 7;

        doc.setFont('helvetica', 'bold');
        doc.text(`Fee Paid: Rs. ${visitReceipt.feeAmount}/- (${visitReceipt.paymentMode})`, margin, y);
        y += isThermal ? 6 : 9;

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(isThermal ? 6.5 : 8);
        doc.text(`Note: ${visitReceipt.remarks}`, margin, y);
        y += isThermal ? 8 : 14;

        doc.setFont('helvetica', 'normal');
        doc.text('Authorized Seal & Signature', pageWidth - margin, y, { align: 'right' });
      } else if (selectedTemplate === 'cash_memo') {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(isThermal ? 10 : 12);
        doc.text('CASH MEMO / RETAIL INVOICE', pageWidth / 2, y, { align: 'center' });
        y += isThermal ? 5 : 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(isThermal ? 7.5 : 9);
        doc.text(`Memo No: ${cashMemo.memoNo}`, margin, y);
        doc.text(`Date: ${cashMemo.date}`, pageWidth - margin, y, { align: 'right' });
        y += isThermal ? 4.5 : 6;

        doc.text(`Customer: ${cashMemo.customerName} (${cashMemo.customerPhone})`, margin, y);
        y += isThermal ? 5 : 7;

        // Items
        doc.setFont('helvetica', 'bold');
        doc.text('Item Description', margin, y);
        doc.text('Qty', pageWidth - margin - (isThermal ? 22 : 40), y, { align: 'right' });
        doc.text('Amount (Rs)', pageWidth - margin, y, { align: 'right' });
        y += isThermal ? 4 : 5;

        doc.setFont('helvetica', 'normal');
        cashMemo.items.forEach(item => {
          doc.text(item.description.substring(0, isThermal ? 22 : 45), margin, y);
          doc.text(`${item.qty} ${item.unit}`, pageWidth - margin - (isThermal ? 22 : 40), y, { align: 'right' });
          doc.text(`Rs. ${item.amount}`, pageWidth - margin, y, { align: 'right' });
          y += isThermal ? 4 : 5;
        });

        y += 2;
        doc.line(margin, y, pageWidth - margin, y);
        y += isThermal ? 4 : 5;

        doc.setFont('helvetica', 'bold');
        doc.text(`Grand Total: Rs. ${cashMemo.grandTotal}/-`, pageWidth - margin, y, { align: 'right' });
        y += isThermal ? 5 : 6;

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(isThermal ? 6.5 : 8);
        doc.text(`In Words: ${cashMemo.amountInWords}`, margin, y);
      } else {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(isThermal ? 10 : 12);
        doc.text(`DOCUMENT: ${selectedTemplate.toUpperCase().replace('_', ' ')}`, pageWidth / 2, y, { align: 'center' });
        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Customer: ${jobOrder.customerName}`, margin, y);
        y += 5;
        doc.text(`Total Estimate: Rs. ${jobOrder.estimatedTotal} | Advance: Rs. ${jobOrder.advanceReceived} | Due: Rs. ${jobOrder.balanceDue}`, margin, y);
      }

      const filename = `${selectedTemplate}_${Date.now()}.pdf`;
      const pdfDataUrl = doc.output('dataurlstring');
      doc.save(filename);

      addRecentActivity({
        name: filename,
        type: 'pdf',
        category: `Print: ${selectedTemplate.replace('_', ' ').toUpperCase()}`,
        sizeLabel: `${paperSize} Format`,
        downloadUrl: pdfDataUrl,
      });
    } catch (err) {
      console.error('PDF error:', err);
      alert('Failed to generate PDF. Using direct browser print as fallback.');
      window.print();
    }
  };

  // Copy Plain Text for WhatsApp / SMS
  const handleCopyText = () => {
    let text = `*${business.name}*\n${business.address}\nPhone: ${business.phone}\n------------------------------\n`;
    if (selectedTemplate === 'visit_receipt') {
      text += `*VISIT RECEIPT & TOKEN*\nToken No: ${visitReceipt.tokenNo}\nReceipt No: ${visitReceipt.receiptNo}\nDate: ${visitReceipt.date} ${visitReceipt.time}\nVisitor: ${visitReceipt.visitorName}\nPhone: ${visitReceipt.phone}\nPurpose: ${visitReceipt.purposeOfVisit}\nFee Paid: ₹${visitReceipt.feeAmount} (${visitReceipt.paymentMode})\nCounter: ${visitReceipt.counterNo}\n------------------------------\nThank you for visiting!`;
    } else if (selectedTemplate === 'cash_memo') {
      text += `*CASH MEMO / BILL*\nMemo No: ${cashMemo.memoNo}\nDate: ${cashMemo.date}\nCustomer: ${cashMemo.customerName} (${cashMemo.customerPhone})\n------------------------------\n`;
      cashMemo.items.forEach((it, i) => {
        text += `${i + 1}. ${it.description} (${it.qty} ${it.unit} @ ₹${it.rate}) = ₹${it.amount}\n`;
      });
      text += `------------------------------\n*Grand Total: ₹${cashMemo.grandTotal}*\n(${cashMemo.amountInWords})\nPayment Mode: ${cashMemo.paymentMode}\n------------------------------\nThank you! Visit again.`;
    } else if (selectedTemplate === 'job_order') {
      text += `*JOB / SERVICE WORK ORDER*\nOrder No: ${jobOrder.orderNo}\nDate: ${jobOrder.orderDate}\nCustomer: ${jobOrder.customerName} (${jobOrder.customerPhone})\nPromised Delivery: ${jobOrder.promisedDate} at ${jobOrder.promisedTime}\nJob: ${jobOrder.jobDetails}\nEstimated Total: ₹${jobOrder.estimatedTotal}\nAdvance Paid: ₹${jobOrder.advanceReceived}\n*Balance Due: ₹${jobOrder.balanceDue}*\n------------------------------\nPlease bring this slip during delivery.`;
    } else {
      text += `Receipt No: ${paymentReceipt.receiptNo}\nReceived From: ${paymentReceipt.receivedFrom}\nAmount: ₹${paymentReceipt.amount} (${paymentReceipt.amountInWords})\nOn Account of: ${paymentReceipt.onAccountOf}`;
    }

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const templatesList: {
    id: CommercialTemplateType;
    title: string;
    hindiTitle: string;
    badge: string;
    desc: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    {
      id: 'visit_receipt',
      title: 'Visit Receipt & Token Slip',
      hindiTitle: 'विज़िट रसीद / टोकन पर्ची',
      badge: 'Cyber Cafe / Clinic',
      desc: 'Instant visitor tokens for CSC desks, legal consultations, Aadhaar updates, and client counter visits.',
      icon: Receipt,
    },
    {
      id: 'cash_memo',
      title: 'Cash Memo & Retail Bill',
      hindiTitle: 'कैश मेमो / खुदरा बिल',
      badge: 'Auto ₹ In Words',
      desc: 'Itemized billing with dynamic quantity, tax, discount, automatic sum in words, and business branding.',
      icon: ShoppingBag,
    },
    {
      id: 'job_order',
      title: 'Job Order & Service Slip',
      hindiTitle: 'जॉब ऑर्डर / वर्क स्लिप',
      badge: 'With Tear-off Stub',
      desc: 'Track DTP typing, printing, binding, passport/PAN form applications, advance payments, and customer stubs.',
      icon: Briefcase,
    },
    {
      id: 'payment_receipt',
      title: 'Payment / Money Voucher',
      hindiTitle: 'भुगतान रसीद / वाउचर',
      badge: 'Payment Receipt',
      desc: 'Formal money receipt acknowledging payment received for services, rent, or maintenance with official seal.',
      icon: DollarSign,
    },
    {
      id: 'delivery_challan',
      title: 'Delivery Challan & Dispatch',
      hindiTitle: 'डिलीवरी चालान / पावती',
      badge: 'Dispatch Note',
      desc: 'Material dispatch and acknowledgement slip for bulk prints, flex banners, and client certificate handover.',
      icon: Truck,
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Scoped Print-Ready CSS Injection */}
      <style>{`
        @media print {
          /* Hide all application chrome, navbar, toolbars and controls */
          body * {
            visibility: hidden;
          }
          #print-document-target, #print-document-target * {
            visibility: visible;
          }
          #print-document-target {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: ${paperSize === 'THERMAL_80MM' ? '2mm' : '8mm 10mm'} !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
          }
          @page {
            size: ${paperSize === 'THERMAL_80MM' ? '80mm auto' : paperSize === 'A5' ? 'A5 portrait' : 'A4 portrait'};
            margin: ${paperSize === 'THERMAL_80MM' ? '1mm' : '8mm'};
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Template Category Switcher Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {templatesList.map((tpl) => {
          const Icon = tpl.icon;
          const isSelected = selectedTemplate === tpl.id;
          return (
            <button
              key={tpl.id}
              id={`print-template-tab-${tpl.id}`}
              onClick={() => setSelectedTemplate(tpl.id)}
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-950 dark:text-blue-100 ring-2 ring-blue-500/30 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`p-1.5 rounded-lg ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {tpl.badge}
                  </span>
                </div>
                <div className="font-bold text-xs leading-tight line-clamp-1">
                  {tpl.title}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {tpl.hindiTitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Studio Work Area: Left Form Controls & Right Live Visual Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: INTERACTIVE FORM CONTROLS & BRANDING SETTINGS (5 COLS) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Subtabs for Control Panel */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveEditorTab('content')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeEditorTab === 'content'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Document Data</span>
            </button>

            <button
              onClick={() => setActiveEditorTab('business')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeEditorTab === 'business'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Shop & Header</span>
            </button>

            <button
              onClick={() => setActiveEditorTab('styling')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeEditorTab === 'styling'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
              <span>Print Layout</span>
            </button>
          </div>

          {/* TAB 1: DOCUMENT CONTENT EDITOR */}
          {activeEditorTab === 'content' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4.5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Edit {templatesList.find(t => t.id === selectedTemplate)?.title}</span>
                </h3>
                <button
                  onClick={handleResetSample}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Fill Sample Data</span>
                </button>
              </div>

              {/* 1. VISIT RECEIPT FORM */}
              {selectedTemplate === 'visit_receipt' && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Receipt No</label>
                      <input
                        type="text"
                        value={visitReceipt.receiptNo}
                        onChange={(e) => setVisitReceipt({ ...visitReceipt, receiptNo: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Token No (टोकन नं.)</label>
                      <input
                        type="text"
                        value={visitReceipt.tokenNo}
                        onChange={(e) => setVisitReceipt({ ...visitReceipt, tokenNo: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs font-bold text-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date</label>
                      <input
                        type="date"
                        value={visitReceipt.date}
                        onChange={(e) => setVisitReceipt({ ...visitReceipt, date: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Time</label>
                      <input
                        type="text"
                        value={visitReceipt.time}
                        onChange={(e) => setVisitReceipt({ ...visitReceipt, time: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Visitor / Client Name</label>
                      <input
                        type="text"
                        value={visitReceipt.visitorName}
                        onChange={(e) => setVisitReceipt({ ...visitReceipt, visitorName: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                        placeholder="e.g. Ramesh Kumar"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mobile Phone</label>
                      <input
                        type="text"
                        value={visitReceipt.phone}
                        onChange={(e) => setVisitReceipt({ ...visitReceipt, phone: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Purpose of Visit / Service Required</label>
                    <input
                      type="text"
                      value={visitReceipt.purposeOfVisit}
                      onChange={(e) => setVisitReceipt({ ...visitReceipt, purposeOfVisit: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                      placeholder="e.g. Aadhaar Bio Update, PAN Application, Document Verification"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Counter / Desk</label>
                      <input
                        type="text"
                        value={visitReceipt.counterNo}
                        onChange={(e) => setVisitReceipt({ ...visitReceipt, counterNo: e.target.value })}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fee Amount (₹)</label>
                      <input
                        type="number"
                        value={visitReceipt.feeAmount}
                        onChange={(e) => setVisitReceipt({ ...visitReceipt, feeAmount: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Payment Mode</label>
                      <select
                        value={visitReceipt.paymentMode}
                        onChange={(e) => setVisitReceipt({ ...visitReceipt, paymentMode: e.target.value as any })}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                      >
                        <option value="Cash">Cash (नकद)</option>
                        <option value="UPI">UPI / QR (ऑनलाइन)</option>
                        <option value="Card">Debit/Credit Card</option>
                        <option value="Free">Free (निःशुल्क)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Operator / Attended By</label>
                    <input
                      type="text"
                      value={visitReceipt.attendedBy}
                      onChange={(e) => setVisitReceipt({ ...visitReceipt, attendedBy: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Remarks & Instructions</label>
                    <textarea
                      rows={2}
                      value={visitReceipt.remarks}
                      onChange={(e) => setVisitReceipt({ ...visitReceipt, remarks: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* 2. CASH MEMO FORM */}
              {selectedTemplate === 'cash_memo' && (
                <div className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Memo / Bill No</label>
                      <input
                        type="text"
                        value={cashMemo.memoNo}
                        onChange={(e) => setCashMemo({ ...cashMemo, memoNo: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date</label>
                      <input
                        type="date"
                        value={cashMemo.date}
                        onChange={(e) => setCashMemo({ ...cashMemo, date: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Customer / Party Name</label>
                      <input
                        type="text"
                        value={cashMemo.customerName}
                        onChange={(e) => setCashMemo({ ...cashMemo, customerName: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone / Mobile</label>
                      <input
                        type="text"
                        value={cashMemo.customerPhone}
                        onChange={(e) => setCashMemo({ ...cashMemo, customerPhone: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Dynamic Itemized Table */}
                  <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                        Itemized Services / Particulars ({cashMemo.items.length})
                      </label>
                      <button
                        onClick={addCashMemoItem}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[10px] font-bold hover:bg-blue-100 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Row</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {cashMemo.items.map((item, idx) => (
                        <div key={item.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-slate-400">#{idx + 1}</span>
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateCashMemoItem(idx, { description: e.target.value })}
                              placeholder="Item description or service"
                              className="flex-1 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                            />
                            {cashMemo.items.length > 1 && (
                              <button
                                onClick={() => removeCashMemoItem(idx)}
                                className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                            <div>
                              <span className="text-[9px] text-slate-400 block">Qty</span>
                              <input
                                type="number"
                                min="1"
                                value={item.qty}
                                onChange={(e) => updateCashMemoItem(idx, { qty: Number(e.target.value) || 1 })}
                                className="w-full px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                              />
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 block">Unit</span>
                              <input
                                type="text"
                                value={item.unit}
                                onChange={(e) => updateCashMemoItem(idx, { unit: e.target.value })}
                                className="w-full px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                              />
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 block">Rate (₹)</span>
                              <input
                                type="number"
                                value={item.rate}
                                onChange={(e) => updateCashMemoItem(idx, { rate: Number(e.target.value) || 0 })}
                                className="w-full px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-blue-600"
                              />
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 block">Amount (₹)</span>
                              <div className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-bold text-slate-900 dark:text-white text-right">
                                ₹{item.amount}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Calculations Summary */}
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span>Subtotal:</span>
                        <span className="font-mono font-bold">₹{cashMemo.subtotal}</span>
                      </div>
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-blue-200 dark:border-blue-900">
                        <span>Grand Total:</span>
                        <span className="font-mono text-sm text-emerald-600">₹{cashMemo.grandTotal}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 italic pt-0.5">
                        In Words: {cashMemo.amountInWords}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. JOB ORDER FORM */}
              {selectedTemplate === 'job_order' && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Job Order #</label>
                      <input
                        type="text"
                        value={jobOrder.orderNo}
                        onChange={(e) => setJobOrder({ ...jobOrder, orderNo: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Priority</label>
                      <select
                        value={jobOrder.priority}
                        onChange={(e) => setJobOrder({ ...jobOrder, priority: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                      >
                        <option value="Normal">Normal Standard</option>
                        <option value="Urgent">Urgent Priority</option>
                        <option value="Tatkal (Same Day)">Tatkal (Same Day)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Customer Name</label>
                      <input
                        type="text"
                        value={jobOrder.customerName}
                        onChange={(e) => setJobOrder({ ...jobOrder, customerName: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone</label>
                      <input
                        type="text"
                        value={jobOrder.customerPhone}
                        onChange={(e) => setJobOrder({ ...jobOrder, customerPhone: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Promised Delivery Date</label>
                      <input
                        type="date"
                        value={jobOrder.promisedDate}
                        onChange={(e) => setJobOrder({ ...jobOrder, promisedDate: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Delivery Time</label>
                      <input
                        type="text"
                        value={jobOrder.promisedTime}
                        onChange={(e) => setJobOrder({ ...jobOrder, promisedTime: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Service / Task Overview</label>
                    <textarea
                      rows={2}
                      value={jobOrder.jobDetails}
                      onChange={(e) => setJobOrder({ ...jobOrder, jobDetails: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                      placeholder="Details of typing, printing, binding, form filling"
                    />
                  </div>

                  {/* Payment & Advance Breakdown */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase">Estimated Total (₹)</label>
                      <input
                        type="number"
                        value={jobOrder.estimatedTotal}
                        onChange={(e) => {
                          const total = Number(e.target.value) || 0;
                          setJobOrder({ ...jobOrder, estimatedTotal: total, balanceDue: Math.max(0, total - jobOrder.advanceReceived) });
                        }}
                        className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-emerald-600 uppercase">Advance Paid (₹)</label>
                      <input
                        type="number"
                        value={jobOrder.advanceReceived}
                        onChange={(e) => {
                          const adv = Number(e.target.value) || 0;
                          setJobOrder({ ...jobOrder, advanceReceived: adv, balanceDue: Math.max(0, jobOrder.estimatedTotal - adv) });
                        }}
                        className="w-full px-2 py-1 rounded border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 font-bold text-xs text-emerald-700 dark:text-emerald-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-amber-600 uppercase">Balance Due (₹)</label>
                      <div className="px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 font-bold text-xs text-amber-700 dark:text-amber-300 text-right">
                        ₹{jobOrder.balanceDue}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. PAYMENT RECEIPT FORM */}
              {selectedTemplate === 'payment_receipt' && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Receipt No</label>
                      <input
                        type="text"
                        value={paymentReceipt.receiptNo}
                        onChange={(e) => setPaymentReceipt({ ...paymentReceipt, receiptNo: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date</label>
                      <input
                        type="date"
                        value={paymentReceipt.date}
                        onChange={(e) => setPaymentReceipt({ ...paymentReceipt, date: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Received With Thanks From</label>
                    <input
                      type="text"
                      value={paymentReceipt.receivedFrom}
                      onChange={(e) => setPaymentReceipt({ ...paymentReceipt, receivedFrom: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Amount (₹)</label>
                      <input
                        type="number"
                        value={paymentReceipt.amount}
                        onChange={(e) => {
                          const amt = Number(e.target.value) || 0;
                          setPaymentReceipt({ ...paymentReceipt, amount: amt, amountInWords: numberToIndianWords(amt) });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Payment Mode</label>
                      <select
                        value={paymentReceipt.paymentMode}
                        onChange={(e) => setPaymentReceipt({ ...paymentReceipt, paymentMode: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                      >
                        <option value="Cash">Cash (नकद)</option>
                        <option value="UPI">UPI / QR (ऑनलाइन)</option>
                        <option value="Cheque">Cheque</option>
                        <option value="NEFT/RTGS">NEFT / Bank Transfer</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">On Account of / For Purpose</label>
                    <input
                      type="text"
                      value={paymentReceipt.onAccountOf}
                      onChange={(e) => setPaymentReceipt({ ...paymentReceipt, onAccountOf: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* 5. DELIVERY CHALLAN FORM */}
              {selectedTemplate === 'delivery_challan' && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Challan No</label>
                      <input
                        type="text"
                        value={deliveryChallan.challanNo}
                        onChange={(e) => setDeliveryChallan({ ...deliveryChallan, challanNo: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date</label>
                      <input
                        type="date"
                        value={deliveryChallan.date}
                        onChange={(e) => setDeliveryChallan({ ...deliveryChallan, date: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Receiver Name</label>
                      <input
                        type="text"
                        value={deliveryChallan.receiverName}
                        onChange={(e) => setDeliveryChallan({ ...deliveryChallan, receiverName: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone</label>
                      <input
                        type="text"
                        value={deliveryChallan.receiverPhone}
                        onChange={(e) => setDeliveryChallan({ ...deliveryChallan, receiverPhone: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Delivery Address</label>
                    <input
                      type="text"
                      value={deliveryChallan.deliveryAddress}
                      onChange={(e) => setDeliveryChallan({ ...deliveryChallan, deliveryAddress: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SHOP / BUSINESS PROFILE EDITOR */}
          {activeEditorTab === 'business' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4.5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Shop / CSC Header Branding</span>
                </h3>
                <button
                  onClick={handleSaveBusiness}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer shadow-xs"
                >
                  <Save className="w-3 h-3" />
                  <span>Save Default</span>
                </button>
              </div>

              {businessSavedToast && (
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Shop details saved to local browser memory!</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Business / Shop Name</label>
                <input
                  type="text"
                  value={business.name}
                  onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Hindi Sub-Header (हिंदी नाम)</label>
                <input
                  type="text"
                  value={business.hindiName || ''}
                  onChange={(e) => setBusiness({ ...business, hindiName: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tagline / Services Highlight</label>
                <input
                  type="text"
                  value={business.tagline}
                  onChange={(e) => setBusiness({ ...business, tagline: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Shop Address</label>
                <input
                  type="text"
                  value={business.address}
                  onChange={(e) => setBusiness({ ...business, address: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mobile / Phone</label>
                  <input
                    type="text"
                    value={business.phone}
                    onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">GSTIN / Udyam No</label>
                  <input
                    type="text"
                    value={business.gstin || ''}
                    onChange={(e) => setBusiness({ ...business, gstin: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">UPI ID for Payments</label>
                  <input
                    type="text"
                    value={business.upiId || ''}
                    onChange={(e) => setBusiness({ ...business, upiId: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                  <input
                    type="text"
                    value={business.email || ''}
                    onChange={(e) => setBusiness({ ...business, email: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRINT LAYOUT & STYLING */}
          {activeEditorTab === 'styling' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4.5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-purple-600" />
                  <span>Paper Size & Print Preferences</span>
                </h3>
              </div>

              {/* Paper Format Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Paper Format / Printer Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaperSize('A4')}
                    className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                      paperSize === 'A4'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 font-bold text-blue-950 dark:text-blue-200'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs">A4 Standard</div>
                    <div className="text-[10px] text-slate-500">210 × 297 mm Full Page</div>
                  </button>

                  <button
                    onClick={() => setPaperSize('A5')}
                    className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                      paperSize === 'A5'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 font-bold text-blue-950 dark:text-blue-200'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs">A5 Compact</div>
                    <div className="text-[10px] text-slate-500">148 × 210 mm Half Page</div>
                  </button>

                  <button
                    onClick={() => setPaperSize('A4_DUAL')}
                    className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                      paperSize === 'A4_DUAL'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 font-bold text-blue-950 dark:text-blue-200'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs">2-in-1 Dual Copy</div>
                    <div className="text-[10px] text-slate-500">Customer + Office Stub</div>
                  </button>

                  <button
                    onClick={() => setPaperSize('THERMAL_80MM')}
                    className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                      paperSize === 'THERMAL_80MM'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 font-bold text-blue-950 dark:text-blue-200'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs">3" Thermal Slip</div>
                    <div className="text-[10px] text-slate-500">80mm POS Roll Printer</div>
                  </button>
                </div>
              </div>

              {/* Theme Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Border & Header Style</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTheme('classic_border')}
                    className={`p-2 rounded-lg border text-left text-xs cursor-pointer ${
                      theme === 'classic_border' ? 'border-purple-600 bg-purple-50 dark:bg-purple-950 font-bold' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Classic Double Border
                  </button>
                  <button
                    onClick={() => setTheme('modern_slate')}
                    className={`p-2 rounded-lg border text-left text-xs cursor-pointer ${
                      theme === 'modern_slate' ? 'border-purple-600 bg-purple-50 dark:bg-purple-950 font-bold' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Modern Slate Grid
                  </button>
                  <button
                    onClick={() => setTheme('cyber_csc')}
                    className={`p-2 rounded-lg border text-left text-xs cursor-pointer ${
                      theme === 'cyber_csc' ? 'border-purple-600 bg-purple-50 dark:bg-purple-950 font-bold' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Official CSC / Govt Header
                  </button>
                  <button
                    onClick={() => setTheme('minimal_clean')}
                    className={`p-2 rounded-lg border text-left text-xs cursor-pointer ${
                      theme === 'minimal_clean' ? 'border-purple-600 bg-purple-50 dark:bg-purple-950 font-bold' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Clean Minimalist
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showQrCode}
                    onChange={(e) => setShowQrCode(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">Show UPI QR / Barcode Scan Box</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showStampBox}
                    onChange={(e) => setShowStampBox(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">Show Official Seal & Signature Box</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showTearOffLine}
                    onChange={(e) => setShowTearOffLine(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">Show Scissor Tear-off Line on Stubs</span>
                </label>
              </div>
            </div>
          )}

          {/* Action Bar (Print, PDF, WhatsApp Copy) */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">READY TO PRINT</span>
                <h4 className="text-xs font-bold text-white">Direct Print & PDF Export</h4>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {paperSize}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handlePrint}
                className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all hover:scale-[1.02]"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all hover:scale-[1.02]"
              >
                <Download className="w-4 h-4" />
                <span>Save High-Def PDF</span>
              </button>
            </div>

            <button
              onClick={handleCopyText}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors border border-slate-700"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Plain Text (WhatsApp / SMS Receipt)</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: LIVE HIGH-FIDELITY PRINT-READY CANVAS PREVIEW (7 COLS) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-3">
          
          {/* Preview Canvas Bar */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Live 300 DPI Print Preview ({paperSize})
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                <Printer className="w-3 h-3" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* DOCUMENT CANVAS PAPER CONTAINER */}
          <div className="bg-slate-200 dark:bg-slate-950 p-3 sm:p-6 rounded-2xl border border-slate-300 dark:border-slate-800 overflow-x-auto flex justify-center">
            
            {/* The Actual Printable Sheet Target Element */}
            <div 
              id="print-document-target"
              className={`bg-white text-slate-900 shadow-2xl transition-all ${
                paperSize === 'THERMAL_80MM' 
                  ? 'w-[320px] p-3 text-[11px] font-mono leading-tight' 
                  : paperSize === 'A5'
                    ? 'w-[520px] min-h-[700px] p-6 text-xs'
                    : 'w-full max-w-[680px] min-h-[920px] p-8 text-xs'
              } ${
                theme === 'classic_border' 
                  ? 'border-[3px] border-double border-slate-900' 
                  : theme === 'modern_slate'
                    ? 'border-2 border-slate-800 rounded-lg'
                    : theme === 'cyber_csc'
                      ? 'border-t-8 border-t-blue-700 border-x border-b border-slate-300'
                      : 'border border-slate-300'
              }`}
            >
              
              {/* DOCUMENT CONTENT RENDERER */}
              <PrintableContent
                templateType={selectedTemplate}
                business={business}
                visitReceipt={visitReceipt}
                cashMemo={cashMemo}
                jobOrder={jobOrder}
                paymentReceipt={paymentReceipt}
                deliveryChallan={deliveryChallan}
                paperSize={paperSize}
                theme={theme}
                showQrCode={showQrCode}
                showStampBox={showStampBox}
                showTearOffLine={showTearOffLine}
                copyType={paperSize === 'A4_DUAL' ? 'CUSTOMER COPY' : undefined}
              />

              {/* IF DUAL COPY: RENDER SECOND HALF AS OFFICE / COUNTER COPY */}
              {paperSize === 'A4_DUAL' && (
                <div className="mt-6 pt-6 border-t-2 border-dashed border-slate-400 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 flex items-center gap-1.5 text-[10px] font-mono text-slate-500 font-bold uppercase">
                    <Scissors className="w-3 h-3 text-slate-400" />
                    <span>Cut Here • Tear-off Perforation Line</span>
                  </div>

                  <PrintableContent
                    templateType={selectedTemplate}
                    business={business}
                    visitReceipt={visitReceipt}
                    cashMemo={cashMemo}
                    jobOrder={jobOrder}
                    paymentReceipt={paymentReceipt}
                    deliveryChallan={deliveryChallan}
                    paperSize={paperSize}
                    theme={theme}
                    showQrCode={showQrCode}
                    showStampBox={showStampBox}
                    showTearOffLine={false}
                    copyType="OFFICE / COUNTER COPY"
                  />
                </div>
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

// =========================================================================
// SUB-COMPONENT: PURE PRINTABLE DOCUMENT RENDERER
// =========================================================================
interface PrintableContentProps {
  templateType: CommercialTemplateType;
  business: BusinessProfile;
  visitReceipt: VisitReceiptData;
  cashMemo: CashMemoData;
  jobOrder: JobOrderData;
  paymentReceipt: PaymentReceiptData;
  deliveryChallan: DeliveryChallanData;
  paperSize: PaperSizeOption;
  theme: PrintThemeOption;
  showQrCode: boolean;
  showStampBox: boolean;
  showTearOffLine: boolean;
  copyType?: string;
}

const PrintableContent: React.FC<PrintableContentProps> = ({
  templateType,
  business,
  visitReceipt,
  cashMemo,
  jobOrder,
  paymentReceipt,
  deliveryChallan,
  paperSize,
  theme,
  showQrCode,
  showStampBox,
  showTearOffLine,
  copyType
}) => {
  const isThermal = paperSize === 'THERMAL_80MM';

  return (
    <div className="space-y-4">
      
      {/* 1. HEADER SECTION (BUSINESS BRANDING) */}
      <div className="text-center border-b border-slate-800 pb-3">
        {copyType && (
          <div className="text-right">
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 border border-slate-700 bg-slate-100 rounded">
              {copyType}
            </span>
          </div>
        )}

        <h1 className={`${isThermal ? 'text-sm' : 'text-base sm:text-lg'} font-black tracking-tight text-slate-950 uppercase`}>
          {business.name}
        </h1>

        {business.hindiName && (
          <div className={`${isThermal ? 'text-[10px]' : 'text-xs'} font-bold text-slate-700 mt-0.5`}>
            {business.hindiName}
          </div>
        )}

        {business.tagline && (
          <div className={`${isThermal ? 'text-[9px]' : 'text-[11px]'} text-slate-600 font-medium italic mt-0.5`}>
            {business.tagline}
          </div>
        )}

        <div className={`${isThermal ? 'text-[8.5px]' : 'text-[10.5px]'} text-slate-700 mt-1 leading-tight`}>
          <div>{business.address}</div>
          <div className="font-mono mt-0.5">
            Phone: <span className="font-bold">{business.phone}</span>
            {business.gstin && <span> • GSTIN: <span className="font-bold">{business.gstin}</span></span>}
            {business.upiId && <span> • UPI ID: <span className="font-bold">{business.upiId}</span></span>}
          </div>
        </div>
      </div>

      {/* 2. TEMPLATE SPECIFIC CONTENT */}
      
      {/* === TEMPLATE A: VISIT RECEIPT & TOKEN PASS === */}
      {templateType === 'visit_receipt' && (
        <div className="space-y-3">
          {/* Document Banner */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500">Citizen & Client Desk</span>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase">VISIT RECEIPT & TOKEN PASS</h2>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-slate-500 block font-mono">TOKEN NUMBER</span>
              <span className="text-base sm:text-lg font-black font-mono text-slate-950 px-2.5 py-0.5 bg-slate-100 border border-slate-800 rounded">
                {visitReceipt.tokenNo}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px] border border-slate-300 p-2.5 rounded bg-slate-50/60">
            <div>
              <span className="text-slate-500 font-mono text-[9.5px] block">RECEIPT NO:</span>
              <span className="font-mono font-bold">{visitReceipt.receiptNo}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 font-mono text-[9.5px] block">DATE & TIME:</span>
              <span className="font-bold">{visitReceipt.date} • {visitReceipt.time}</span>
            </div>
            <div className="col-span-2 pt-1 border-t border-slate-200">
              <span className="text-slate-500 font-mono text-[9.5px] block">VISITOR / CLIENT NAME:</span>
              <span className="font-bold text-xs text-slate-900">{visitReceipt.visitorName}</span>
              <span className="text-slate-600 ml-2 font-mono">({visitReceipt.phone})</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 font-mono text-[9.5px] block">PURPOSE OF VISIT:</span>
              <span className="font-bold text-slate-800">{visitReceipt.purposeOfVisit}</span>
            </div>
            <div>
              <span className="text-slate-500 font-mono text-[9.5px] block">ASSIGNED DESK / COUNTER:</span>
              <span className="font-bold">{visitReceipt.counterNo}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 font-mono text-[9.5px] block">ATTENDED BY:</span>
              <span className="font-bold">{visitReceipt.attendedBy}</span>
            </div>
          </div>

          {/* Fee & Payment Box */}
          <div className="flex items-center justify-between border-2 border-slate-900 p-2.5 rounded bg-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-600 uppercase">Consultation / Service Fee:</span>
              <div className="text-[10px] text-slate-500">Payment Mode: <span className="font-bold text-slate-900">{visitReceipt.paymentMode}</span></div>
            </div>
            <div className="text-right">
              <span className="text-base sm:text-lg font-black text-slate-950 font-mono">₹{visitReceipt.feeAmount}/-</span>
              <div className="text-[9px] text-emerald-700 font-bold">PAID • धन्यवाद</div>
            </div>
          </div>

          {/* Remarks */}
          {visitReceipt.remarks && (
            <div className="text-[10px] text-slate-600 border-l-2 border-slate-400 pl-2 italic">
              <strong>Instructions/Notes:</strong> {visitReceipt.remarks}
            </div>
          )}

          {/* Tear-off Token Pass at Bottom for Customer */}
          {showTearOffLine && (
            <div className="mt-4 pt-3 border-t border-dashed border-slate-400 text-center space-y-1">
              <div className="text-[9px] font-mono text-slate-500 uppercase flex items-center justify-center gap-1">
                <Scissors className="w-2.5 h-2.5" />
                <span>Customer Counter Token Stub</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono font-bold px-2">
                <span>{visitReceipt.visitorName}</span>
                <span className="text-xs bg-slate-900 text-white px-2 py-0.5 rounded">{visitReceipt.tokenNo}</span>
                <span>{visitReceipt.date}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* === TEMPLATE B: CASH MEMO & RETAIL BILL === */}
      {templateType === 'cash_memo' && (
        <div className="space-y-3">
          {/* Memo Title Bar */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-1.5">
            <div>
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">RETAIL INVOICE</span>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase">CASH MEMO (कैश मेमो)</h2>
            </div>
            <div className="text-right text-[11px] font-mono">
              <div>MEMO NO: <span className="font-bold text-slate-950">{cashMemo.memoNo}</span></div>
              <div className="text-slate-600">DATE: <span className="font-bold">{cashMemo.date}</span></div>
            </div>
          </div>

          {/* Customer Bar */}
          <div className="flex flex-wrap items-center justify-between text-[11px] p-2 bg-slate-50 border border-slate-200 rounded">
            <div>
              <span className="text-slate-500 text-[9.5px] block font-mono">BILLED TO:</span>
              <span className="font-bold text-slate-900">{cashMemo.customerName}</span>
            </div>
            <div className="text-right font-mono">
              <span className="text-slate-500 text-[9.5px] block">MOBILE:</span>
              <span className="font-bold">{cashMemo.customerPhone || 'N/A'}</span>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full border-collapse text-[10.5px] text-left border border-slate-800">
            <thead>
              <tr className="bg-slate-900 text-white font-mono text-[9.5px]">
                <th className="p-1.5 border border-slate-800 w-8 text-center">S.N.</th>
                <th className="p-1.5 border border-slate-800">Particulars / Service Description</th>
                <th className="p-1.5 border border-slate-800 w-12 text-center">Qty</th>
                <th className="p-1.5 border border-slate-800 w-16 text-right">Rate (₹)</th>
                <th className="p-1.5 border border-slate-800 w-20 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {cashMemo.items.map((it, idx) => (
                <tr key={it.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                  <td className="p-1.5 border border-slate-300 text-center font-mono text-[9px]">{idx + 1}</td>
                  <td className="p-1.5 border border-slate-300 font-medium">
                    <div>{it.description}</div>
                    {it.hsnSac && <span className="text-[8.5px] text-slate-400 font-mono">HSN: {it.hsnSac}</span>}
                  </td>
                  <td className="p-1.5 border border-slate-300 text-center font-mono">{it.qty} {it.unit}</td>
                  <td className="p-1.5 border border-slate-300 text-right font-mono">₹{it.rate}</td>
                  <td className="p-1.5 border border-slate-300 text-right font-mono font-bold">₹{it.amount}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold">
                <td colSpan={4} className="p-1.5 border border-slate-800 text-right uppercase text-[9.5px] font-mono">
                  Subtotal:
                </td>
                <td className="p-1.5 border border-slate-800 text-right font-mono">
                  ₹{cashMemo.subtotal}
                </td>
              </tr>
              {cashMemo.discountAmount > 0 && (
                <tr className="text-slate-600">
                  <td colSpan={4} className="p-1 border border-slate-300 text-right text-[9px]">
                    Discount:
                  </td>
                  <td className="p-1 border border-slate-300 text-right font-mono text-emerald-700">
                    -₹{cashMemo.discountAmount}
                  </td>
                </tr>
              )}
              <tr className="bg-slate-900 text-white font-black text-xs">
                <td colSpan={4} className="p-2 border border-slate-900 text-right uppercase tracking-wider font-mono">
                  Grand Total:
                </td>
                <td className="p-2 border border-slate-900 text-right font-mono text-sm">
                  ₹{cashMemo.grandTotal}/-
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Amount In Words & Terms */}
          <div className="p-2 border border-slate-300 rounded bg-slate-50 text-[10px] space-y-1">
            <div>
              <span className="font-bold text-slate-700">Amount in Words: </span>
              <span className="font-semibold text-slate-900">{cashMemo.amountInWords}</span>
            </div>
            <div className="text-[9px] text-slate-500 italic">
              <strong>Terms: </strong> {cashMemo.terms[0]}
            </div>
          </div>
        </div>
      )}

      {/* === TEMPLATE C: JOB ORDER & WORK SLIP === */}
      {templateType === 'job_order' && (
        <div className="space-y-3">
          {/* Order Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-1.5">
            <div>
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">SERVICE WORK ORDER</span>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase">JOB ORDER & ADVANCE SLIP</h2>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono text-slate-500 block">JOB ORDER #</span>
              <span className="text-xs sm:text-sm font-mono font-black text-slate-950 px-2 py-0.5 bg-slate-100 border border-slate-800 rounded">
                {jobOrder.orderNo}
              </span>
            </div>
          </div>

          {/* Client & Date Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px] p-2 bg-slate-50 border border-slate-200 rounded">
            <div>
              <span className="text-slate-500 font-mono text-[9px] block">CLIENT NAME:</span>
              <span className="font-bold text-slate-900">{jobOrder.customerName}</span>
              <div className="font-mono text-[10px] text-slate-600">{jobOrder.customerPhone}</div>
            </div>
            <div className="text-right font-mono">
              <span className="text-slate-500 text-[9px] block">PROMISED DELIVERY:</span>
              <span className="font-bold text-blue-700 text-xs">{jobOrder.promisedDate}</span>
              <div className="text-[10px] text-slate-600">Time: {jobOrder.promisedTime}</div>
            </div>
          </div>

          {/* Job Details & Scope */}
          <div className="p-2.5 border border-slate-300 rounded space-y-1.5 text-[11px]">
            <div>
              <span className="text-[9.5px] font-bold text-slate-500 uppercase font-mono block">SCOPE OF WORK:</span>
              <p className="font-medium text-slate-900">{jobOrder.jobDetails}</p>
            </div>

            {jobOrder.itemsReceived && jobOrder.itemsReceived.length > 0 && (
              <div className="pt-1.5 border-t border-slate-200">
                <span className="text-[9.5px] font-bold text-slate-500 uppercase font-mono block">DOCUMENTS / MATERIALS RECEIVED:</span>
                <ul className="list-disc list-inside text-[10px] text-slate-700">
                  {jobOrder.itemsReceived.map((mat, i) => (
                    <li key={i}>{mat}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Payment Estimate & Balance Table */}
          <div className="grid grid-cols-3 gap-2 text-center p-2.5 rounded border-2 border-slate-900 bg-slate-100 font-mono">
            <div>
              <span className="text-[9px] text-slate-600 font-bold block">ESTIMATED TOTAL</span>
              <span className="text-xs sm:text-sm font-bold text-slate-900">₹{jobOrder.estimatedTotal}/-</span>
            </div>
            <div className="border-x border-slate-300">
              <span className="text-[9px] text-emerald-700 font-bold block">ADVANCE PAID</span>
              <span className="text-xs sm:text-sm font-black text-emerald-700">₹{jobOrder.advanceReceived}/-</span>
            </div>
            <div>
              <span className="text-[9px] text-amber-700 font-bold block">BALANCE DUE</span>
              <span className="text-xs sm:text-sm font-black text-amber-700">₹{jobOrder.balanceDue}/-</span>
            </div>
          </div>

          {/* Tear-off Claim Stub for Customer */}
          {showTearOffLine && (
            <div className="mt-3 pt-2.5 border-t-2 border-dashed border-slate-400 space-y-1">
              <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-500 uppercase">
                <span className="flex items-center gap-1 font-bold">
                  <Scissors className="w-2.5 h-2.5" /> CUSTOMER CLAIM SLIP
                </span>
                <span>Job #{jobOrder.orderNo}</span>
              </div>
              <div className="flex items-center justify-between text-[10.5px] font-mono font-bold bg-slate-50 p-1.5 border border-slate-200 rounded">
                <span>{jobOrder.customerName}</span>
                <span className="text-blue-700">Delivery: {jobOrder.promisedDate}</span>
                <span className="text-amber-800">Due: ₹{jobOrder.balanceDue}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* === TEMPLATE D: PAYMENT RECEIPT === */}
      {templateType === 'payment_receipt' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-1.5">
            <div>
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">OFFICIAL VOUCHER</span>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase">PAYMENT / MONEY RECEIPT (रसीद)</h2>
            </div>
            <div className="text-right text-[11px] font-mono">
              <div>RECEIPT NO: <span className="font-bold">{paymentReceipt.receiptNo}</span></div>
              <div>DATE: <span className="font-bold">{paymentReceipt.date}</span></div>
            </div>
          </div>

          <div className="p-3 border border-slate-300 rounded space-y-2 text-xs leading-relaxed">
            <p>
              Received with thanks from <strong className="text-slate-900 border-b border-dotted border-slate-800 px-2">{paymentReceipt.receivedFrom}</strong> the sum of Rupees <strong className="text-slate-900 border-b border-dotted border-slate-800 px-2">{paymentReceipt.amountInWords}</strong> (₹{paymentReceipt.amount}/-) by <strong className="text-slate-900">{paymentReceipt.paymentMode}</strong>.
            </p>
            <p>
              On account of: <strong className="text-slate-800 border-b border-dotted border-slate-800 px-2">{paymentReceipt.onAccountOf}</strong>.
            </p>
          </div>

          <div className="flex items-center justify-between p-2 bg-slate-100 border border-slate-800 rounded font-mono">
            <span className="text-xs font-bold text-slate-700 uppercase">TOTAL AMOUNT RECEIVED:</span>
            <span className="text-base font-black text-slate-950">₹{paymentReceipt.amount}/-</span>
          </div>
        </div>
      )}

      {/* === TEMPLATE E: DELIVERY CHALLAN === */}
      {templateType === 'delivery_challan' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-1.5">
            <div>
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">DISPATCH VOUCHER</span>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase">DELIVERY CHALLAN (डिलीवरी चालान)</h2>
            </div>
            <div className="text-right text-[11px] font-mono">
              <div>CHALLAN NO: <span className="font-bold">{deliveryChallan.challanNo}</span></div>
              <div>DATE: <span className="font-bold">{deliveryChallan.date}</span></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] p-2 bg-slate-50 border border-slate-200 rounded">
            <div>
              <span className="text-slate-500 text-[9px] font-mono block">CONSIGNEE / DELIVER TO:</span>
              <span className="font-bold text-slate-900">{deliveryChallan.receiverName}</span>
              <div className="text-[10px] text-slate-600">{deliveryChallan.deliveryAddress}</div>
            </div>
            <div className="text-right font-mono">
              <span className="text-slate-500 text-[9px] block">ORDER REF:</span>
              <span className="font-bold">{deliveryChallan.orderRefNo}</span>
              <div className="text-[10px] text-slate-600">{deliveryChallan.vehicleNo}</div>
            </div>
          </div>

          <table className="w-full border-collapse text-[10.5px] border border-slate-800">
            <thead>
              <tr className="bg-slate-900 text-white font-mono text-[9px]">
                <th className="p-1 border border-slate-800 w-8 text-center">S.N.</th>
                <th className="p-1 border border-slate-800 text-left">Item Description</th>
                <th className="p-1 border border-slate-800 w-16 text-center">Qty</th>
                <th className="p-1 border border-slate-800 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {deliveryChallan.items.map((it, idx) => (
                <tr key={it.id} className="border-b border-slate-300">
                  <td className="p-1.5 border border-slate-300 text-center font-mono text-[9px]">{idx + 1}</td>
                  <td className="p-1.5 border border-slate-300 font-medium">{it.description}</td>
                  <td className="p-1.5 border border-slate-300 text-center font-mono font-bold">{it.qty} {it.unit}</td>
                  <td className="p-1.5 border border-slate-300 text-[9.5px] text-slate-600">{it.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. FOOTER SIGNATURE & STAMP BOX */}
      {showStampBox && (
        <div className="pt-4 flex items-end justify-between text-[10.5px]">
          <div className="text-left space-y-1">
            <div className="text-[9px] text-slate-500 uppercase font-mono">CUSTOMER ACKNOWLEDGEMENT</div>
            <div className="w-32 border-b border-slate-400 pt-6"></div>
            <div className="text-[9.5px] text-slate-600">Client / Receiver Signature</div>
          </div>

          {showQrCode && (
            <div className="text-center p-1 border border-slate-300 rounded bg-slate-50">
              <QrCode className="w-9 h-9 mx-auto text-slate-800" />
              <span className="text-[8px] font-mono text-slate-500 block uppercase">UPI Scan / Verify</span>
            </div>
          )}

          <div className="text-right space-y-1">
            <div className="text-[9px] text-slate-500 uppercase font-mono">FOR {business.name}</div>
            <div className="w-36 border-b border-slate-400 pt-6"></div>
            <div className="text-[9.5px] text-slate-800 font-bold">Authorized Signatory / Seal</div>
          </div>
        </div>
      )}

    </div>
  );
};
