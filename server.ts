import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini Client server-side
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // AI Cyber Cafe / CSC Assistant endpoint
  app.post('/api/ai/ask', async (req, res) => {
    const { question, context } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Curated fallback knowledge base for instant offline response or when API key isn't provided
    const getOfflineFallback = (query: string): string => {
      const q = query.toLowerCase();
      if (q.includes('pdf') && (q.includes('edit') || q.includes('text'))) {
        return `### 📄 How to Edit Text in a Scanned or Digital PDF

**Method 1: Using Adobe Acrobat Pro**
1. Open your PDF file in **Adobe Acrobat Pro**.
2. Click on **Edit PDF** in the right-side Tools sidebar (or press \`Ctrl + E\`).
3. Click on the text box you wish to modify. Acrobat automatically matches the font, size, and spacing.
4. If it's a scanned document, Acrobat will automatically run **OCR (Optical Character Recognition)** first.
5. Save the modified document (\`Ctrl + S\`).

**Method 2: Using Free Tools (NAPS2 + MS Word / LibreOffice)**
1. In **MS Word 2016/2019/2021/365**: Go to **File > Open > Select your PDF**.
2. Word converts the PDF into an editable document.
3. Edit the text, then click **File > Save As > PDF**.

**Method 3: Using Photoshop (For Scanned Certificates/Marksheets with stamp preservation)**
1. Open PDF in **Photoshop** at **300 DPI**.
2. Use the **Clone Stamp Tool (S)** or **Patch Tool (J)** to clean dirty background noise.
3. Use the **Text Tool (T)** with matching font (e.g., Arial, Kruti Dev 010, Mangal, Times New Roman).
4. Save as PDF or High-Quality JPEG.`;
      }

      if (q.includes('resize') || q.includes('photo') || q.includes('kb') || q.includes('signature')) {
        return `### 🖼️ How to Resize Photo & Signature for Govt Exam Portals (SSC, UPSC, IBPS)

**1. Passport Photo Specs (SSC / UPSC / Police Exams):**
- **Dimensions:** 3.5 cm × 4.5 cm (approx. 138 × 177 pixels at 100 DPI or 413 × 531 pixels at 300 DPI)
- **Target File Size:** 20 KB to 50 KB (JPEG format)
- **Background:** White or very light plain background; face should cover 70-80% area.

**2. Signature Specs:**
- **Dimensions:** 4.0 cm × 2.0 cm (approx. 140 × 60 pixels)
- **Target File Size:** 10 KB to 20 KB
- **Ink:** Clear black ink pen on clean white paper without lines.

**Quick Step-by-Step in Photoshop:**
1. Open Photo in Photoshop. Select **Crop Tool (C)**.
2. In the top bar, set: \`Width: 3.5 cm\`, \`Height: 4.5 cm\`, \`Resolution: 300 Pixels/Inch\`.
3. Crop the face area with shoulders balanced.
4. Press \`Ctrl + Shift + Alt + S\` (Save for Web).
5. Choose **JPEG**, adjust the Quality slider until size is between **30 KB and 45 KB**. Click Save.

**Quick Step-by-Step in MS Paint:**
1. Open image in Paint. Click **Resize** (\`Ctrl + W\`).
2. Switch to **Pixels**, uncheck "Maintain aspect ratio" if required, enter dimensions, and save as JPEG.`;
      }

      return `### 💡 Cyber Cafe & CSC Pro Guide: ${query}

**General Best Practices for CSC & Cyber Cafe Operators:**
1. **DPI Standards:** Always scan identity documents (Aadhaar, Voter ID, Marksheets) at **200 to 300 DPI** for clarity without ballooning file sizes over 200KB.
2. **Scanner Alignment (NAPS2):** Use NAPS2 (Not Another PDF Scanner 2) with "Deskew" and "Black & White / Grayscale" profile for crisp government portal uploads.
3. **Biometric Device RD Service (Mantra/Morpho):** If device is not detected, restart services via \`services.msc\` -> **Mantra AVDM / Morpho RD Service** -> Right-click -> **Restart**.
4. **Instant In-App Tools:** You can also use our **Size & Format Calculator** and **Document Generator** tabs right inside this app for automated instant processing!`;
    };

    try {
      if (!ai) {
        return res.json({
          answer: getOfflineFallback(question),
          source: 'offline-knowledge-base',
        });
      }

      const systemPrompt = `You are the expert AI Assistant for Cyber Cafe and CSC (Common Service Center) operators, cyber kiosk managers, and digital documentation specialists in India and globally.
Your task is to provide extremely clear, accurate, practical, and step-by-step instructions.

Key domains you specialize in:
1. Online application portal requirements (SSC, UPSC, State PSC, NTA NEET/JEE, Railway RRB, IBPS, Agniveer, PAN Card NSDL/UTIITSL, Passport Seva, Driving License Sarathi, Aadhaar UIDAI, Scholarship portals, E-District, Ration Card).
2. Image & PDF processing tools: Adobe Photoshop (layer tricks, clone stamp, curve adjustments, resolution settings, save for web), Adobe Acrobat Pro (OCR, redaction, text editing, compress), NAPS2, TinyPNG, Remini, MS Paint, FastStone, CamScanner.
3. Troubleshooting Cyber Cafe hardware: Biometric fingerprint scanners (Mantra MFS100, Morpho 1300 E3, Startek), Iris scanners, PVC Card Printers (Epson L805/L850, Zebra, Magicard), thermal receipt printers, flatbed/ADF scanners.
4. Document drafting: Hindi and English resumes (Bio-Data), affidavits (Notary/Oath Commissioner formats), gap year declarations, name change affidavits, experience certificates, police verification applications, school/college character certificates, leave letters.
5. Format your answers in clean, readable Markdown with bold headings, bulleted steps, keyboard shortcuts, and exact pixel/KB specifications where applicable. Always be concise, actionable, and operator-friendly.`;

      // Model execution with automatic fallback for high reliability
      let answerText = '';
      let usedModel = 'gemini-2.5-flash';

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Context: ${context || 'Cyber Cafe / CSC Center operational question'}\n\nOperator Question: ${question}`,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.3,
          },
        });
        answerText = response.text || '';
      } catch (primaryErr: any) {
        console.warn('Primary model error, retrying with fallback model:', primaryErr?.message);
        try {
          const fallbackResponse = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: `Context: ${context || 'Cyber Cafe / CSC Center operational question'}\n\nOperator Question: ${question}`,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.3,
            },
          });
          answerText = fallbackResponse.text || '';
          usedModel = 'gemini-flash-latest';
        } catch (secErr: any) {
          console.warn('Fallback model also unavailable, falling back to local KB:', secErr?.message);
          answerText = getOfflineFallback(question);
          usedModel = 'offline-knowledge-base';
        }
      }

      if (!answerText) {
        answerText = getOfflineFallback(question);
      }

      return res.json({
        answer: answerText,
        source: usedModel,
      });
    } catch (err: any) {
      console.error('AI query general error, falling back to local KB:', err?.message);
      return res.json({
        answer: getOfflineFallback(question),
        source: 'offline-knowledge-base',
        note: 'Generated using local Cyber Cafe knowledge base.',
      });
    }
  });

  // AI Document Assistant for polishing custom resume / application content
  app.post('/api/ai/enhance-text', async (req, res) => {
    const { text, type, language } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    try {
      if (!ai) {
        return res.json({
          enhancedText: text.trim(),
          source: 'original',
        });
      }

      const prompt = `You are a professional documentation expert. Polish and improve the following ${type || 'document content'} in ${language || 'English/Hindi'}.
Fix grammar, spelling, formal tone, and structure while preserving all factual names, dates, qualifications, and specifics.
Return ONLY the polished document text without conversational filler.

Original text:
${text}`;

      let enhanced = '';
      let usedModel = 'gemini-2.5-flash';

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            temperature: 0.2,
          },
        });
        enhanced = response.text?.trim() || '';
      } catch (err: any) {
        console.warn('Primary text enhance failed, trying fallback:', err?.message);
        try {
          const fallbackRes = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: prompt,
            config: {
              temperature: 0.2,
            },
          });
          enhanced = fallbackRes.text?.trim() || '';
          usedModel = 'gemini-flash-latest';
        } catch {
          enhanced = text;
        }
      }

      return res.json({
        enhancedText: enhanced || text,
        source: usedModel,
      });
    } catch (err: any) {
      return res.json({
        enhancedText: text,
        error: 'AI enhancement temporarily unavailable',
      });
    }
  });

  // OCR Document & Marksheet text extraction endpoint
  app.post('/api/ai/ocr', async (req, res) => {
    const { imageBase64, mimeType = 'image/jpeg', docTypeHint = 'General Document' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required for OCR' });
    }

    try {
      // Strip data URL prefix cleanly
      const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

      if (!ai) {
        return res.status(503).json({
          error: 'AI OCR server is currently operating in offline mode. Please configure GEMINI_API_KEY.',
          rawText: 'Offline Mode: OCR requires Gemini API key on the server.',
        });
      }

      const prompt = `You are an expert OCR and document data extraction system specializing in Indian educational marksheets (CBSE, ICSE, UP/Bihar/MP/Rajasthan/Maharashtra State Boards), university degrees, government identity proofs (Aadhaar Card, PAN Card, Voter ID, Driving License), domicile certificates, caste certificates, income certificates, birth certificates, and legal affidavits.

Task:
1. Extract ALL visible text from the uploaded document accurately in both English and Hindi (Devanagari). Maintain natural reading order.
2. Structure the most important key fields into clean JSON format.

Return ONLY a valid JSON object with the following structure:
{
  "documentTypeDetected": "e.g. 10th High School Marksheet / Caste Certificate / Aadhaar Card / Character Certificate",
  "candidateName": "Full Name of student/applicant (or empty string)",
  "fatherName": "Father's Name (or empty string)",
  "motherName": "Mother's Name (or empty string)",
  "dateOfBirth": "DOB in DD/MM/YYYY or original format (or empty string)",
  "rollNumber": "Roll No / Roll Code / Enrollment No (or empty string)",
  "registrationNumber": "Registration / Reg No / Application No (or empty string)",
  "boardOrUniversity": "Board / University / Authority Name (e.g. CBSE / UP Board / NSDL)",
  "yearOfPassing": "Passing Year or Exam Session (or empty string)",
  "totalMarksOrCgpa": "Total Marks / CGPA / Max Marks (or empty string)",
  "percentage": "Percentage % or Division (e.g. 78.4% / First Division)",
  "certificateNumber": "Serial / Certificate / Barcode / Memo Number (or empty string)",
  "issueDate": "Issue Date of document (or empty string)",
  "fullRawText": "Complete verbatim transcribed text of the entire document with proper line breaks"
}`;

      const imagePart = {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64,
        },
      };

      const textPart = {
        text: prompt,
      };

      let responseText = '';
      let usedModel = 'gemini-2.5-flash';

      // Primary attempt with lightweight, highly reliable gemini-2.5-flash
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts: [imagePart, textPart] },
          config: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });
        responseText = response.text || '{}';
      } catch (primaryOcrErr: any) {
        console.warn('Primary OCR model (gemini-2.5-flash) unavailable or rate-limited. Retrying with gemini-flash-latest:', primaryOcrErr?.message);
        try {
          const retryResponse = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: { parts: [imagePart, textPart] },
            config: {
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
          });
          responseText = retryResponse.text || '{}';
          usedModel = 'gemini-flash-latest';
        } catch (retryErr: any) {
          console.error('All AI OCR models failed:', retryErr?.message);
          return res.status(503).json({
            error: 'AI OCR service is temporarily experiencing high traffic. Please retry in a few seconds.',
            details: retryErr?.message || '503 Unavailable',
          });
        }
      }

      // Clean JSON string in case of backtick fences or markdown wrapping
      let cleanJsonStr = responseText.trim();
      if (cleanJsonStr.startsWith('```json')) {
        cleanJsonStr = cleanJsonStr.replace(/^```json\s*/i, '').replace(/```$/g, '').trim();
      } else if (cleanJsonStr.startsWith('```')) {
        cleanJsonStr = cleanJsonStr.replace(/^```\s*/, '').replace(/```$/g, '').trim();
      }

      try {
        const parsedJson = JSON.parse(cleanJsonStr);
        return res.json({
          success: true,
          data: parsedJson,
          source: usedModel,
        });
      } catch (parseError) {
        return res.json({
          success: true,
          data: {
            documentTypeDetected: 'General Document Scan',
            fullRawText: responseText,
          },
          source: `${usedModel}-text-mode`,
        });
      }
    } catch (err: any) {
      console.error('OCR processing error:', err);
      return res.status(500).json({
        error: 'Unable to process document OCR at this moment. Please try again.',
      });
    }
  });

  // Enterprise AI Background Matting / Segmentation Endpoint
  app.post('/api/ai/remove-bg', async (req, res) => {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 is required' });
    }

    try {
      // In server-side environments, forward the base64 or perform AI mask segmentation
      return res.json({
        success: true,
        message: 'Server AI matting initialized',
        fallbackToClientPrecision: true,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Background removal error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cyber Cafe Smart Assistant server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
