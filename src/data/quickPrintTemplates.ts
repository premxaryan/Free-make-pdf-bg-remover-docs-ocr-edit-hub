import { QuickPrintTemplate } from '../types.ts';

export const QUICK_PRINT_TEMPLATES: QuickPrintTemplate[] = [
  {
    id: 'admission_form',
    title: 'School / College Admission Form',
    hindiTitle: 'विद्यालय / महाविद्यालय प्रवेश आवेदन प्रपत्र',
    category: 'admission',
    description: 'Standard institutional admission form layout with student details, academic history, parent info, photo box, and parent-student declaration.',
    defaultLanguage: 'bilingual',
    paperSize: 'A4',
    orientation: 'portrait',
    fields: [
      { key: 'institutionName', label: 'School / College Name', hindiLabel: 'संस्थान का नाम', defaultValue: 'SARASWATI VIDYA MANDIR SENIOR SECONDARY SCHOOL', placeholder: 'e.g. Govt Model College, Patna' },
      { key: 'affiliation', label: 'Affiliation / Board / Reg No.', hindiLabel: 'संबद्धता / बोर्ड', defaultValue: 'Affiliated to CBSE / State Board (Reg. No: SCH-2024/9821)', placeholder: 'e.g. CBSE / State Board' },
      { key: 'academicSession', label: 'Academic Session', hindiLabel: 'शैक्षणिक सत्र', defaultValue: '2024 - 2025', placeholder: 'e.g. 2024-25' },
      { key: 'classApplied', label: 'Class / Course Applied For', hindiLabel: 'प्रवेश हेतु कक्षा / संकाय', defaultValue: 'Class XI (Science - PCM with Computer)', placeholder: 'e.g. Class 11th / B.Com 1st Year' },
      { key: 'studentName', label: 'Student Full Name (Capital)', hindiLabel: 'छात्र / छात्रा का पूरा नाम', defaultValue: 'AMIT KUMAR SHARMA', placeholder: 'Candidate Full Name' },
      { key: 'fatherName', label: "Father's Name & Occupation", hindiLabel: 'पिता का नाम व व्यवसाय', defaultValue: 'Shri Rajesh Sharma (Govt. Employee)', placeholder: "Father's Name" },
      { key: 'motherName', label: "Mother's Name", hindiLabel: 'माता का नाम', defaultValue: 'Smt. Sunita Sharma (Homemaker)', placeholder: "Mother's Name" },
      { key: 'dob', label: 'Date of Birth (DD/MM/YYYY)', hindiLabel: 'जन्म तिथि', defaultValue: '15/08/2008', placeholder: 'DD/MM/YYYY' },
      { key: 'gender', label: 'Gender', hindiLabel: 'लिंग', defaultValue: 'Male (पुरुष)', placeholder: 'Male / Female / Other' },
      { key: 'category', label: 'Social Category', hindiLabel: 'वर्ग / श्रेणी', defaultValue: 'OBC (Non-Creamy Layer)', placeholder: 'General / OBC / SC / ST / EWS' },
      { key: 'aadhaarNo', label: 'Student Aadhaar Number', hindiLabel: 'आधार संख्या', defaultValue: '7845-XXXX-9812', placeholder: '12-digit Aadhaar' },
      { key: 'contactNo', label: 'Parent Mobile Number', hindiLabel: 'अभिभावक मोबाइल नंबर', defaultValue: '+91 98765 43210', placeholder: '10-digit mobile' },
      { key: 'email', label: 'Email ID', hindiLabel: 'ईमेल', defaultValue: 'amit.sharma2008@gmail.com', placeholder: 'student/parent email' },
      { key: 'permanentAddress', label: 'Permanent Residential Address', hindiLabel: 'स्थायी पता', defaultValue: 'House No. 42, Ward No. 08, Near Shiv Mandir, Civil Lines, Gorakhpur (U.P.) - 273001', placeholder: 'Full Postal Address' },
      { key: 'previousSchool', label: 'Last Attended School & Board', hindiLabel: 'पूर्व विद्यालय का नाम व बोर्ड', defaultValue: 'St. Xavier Public High School, Gorakhpur (Passed 10th with 88.4%)', placeholder: 'Previous School details' },
    ],
    contentTemplate: (data) => ({
      headerTitle: data.institutionName || 'INSTITUTION ADMISSION FORM',
      headerSubtitle: `${data.affiliation || ''} • SESSION: ${data.academicSession || '2024-25'}`,
      refNo: `ADM-${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString('en-IN'),
      photoBox: true,
      sections: [
        {
          title: '1. APPLICATION & APPLICANT DETAILS (आवेदक विवरण)',
          content: `Course / Class Applied For: **${data.classApplied}**
Full Name of Student (in Capital Letters): **${data.studentName}**
Date of Birth: **${data.dob}** | Gender: **${data.gender}** | Category: **${data.category}**
Student Aadhaar No: **${data.aadhaarNo}** | Blood Group: **B+**`,
        },
        {
          title: '2. PARENT / GUARDIAN INFORMATION (अभिभावक विवरण)',
          content: `Father's Full Name: **${data.fatherName}**
Mother's Full Name: **${data.motherName}**
Primary Contact Mobile No: **${data.contactNo}** | Alternate Mobile: **+91 94150 XXXXX**
Email ID: **${data.email}**
Permanent Address: **${data.permanentAddress}**`,
        },
        {
          title: '3. PREVIOUS ACADEMIC RECORD (पूर्व शैक्षणिक योग्यता)',
          content: `Previous School / College: **${data.previousSchool}**`,
          table: {
            headers: ['Examination', 'Board / Univ', 'Year', 'Marks Obtained', 'Percentage / CGPA', 'Result'],
            rows: [
              ['Class 10th / Secondary', 'CBSE Board', '2024', '442 / 500', '88.40%', 'PASSED (1st Div)'],
              ['Class 8th / Middle', 'State Board', '2022', '410 / 500', '82.00%', 'PASSED (1st Div)']
            ]
          }
        },
        {
          title: '4. ENCLOSED DOCUMENTS CHECKLIST (संलग्नक सूची)',
          content: `[ ✓ ] 10th / Previous Class Marksheet Copy  •  [ ✓ ] Transfer Certificate (T.C.) & Migration Original
[ ✓ ] Student & Parent Aadhaar Card Photocopy  •  [ ✓ ] Caste / Category Certificate (if applicable)
[ ✓ ] 4 Passport Size Recent Photographs  •  [ ✓ ] Character Certificate from previous institution`
        }
      ],
      declaration: 'I hereby solemnly declare that all particulars stated in this application form are true, complete, and correct to the best of my knowledge and belief. I agree to abide by all the rules and regulations of the institution.',
      signatures: [
        { label: 'Signature of Student', subLabel: '(छात्र / छात्रा के हस्ताक्षर)', position: 'left' },
        { label: 'Signature of Parent / Guardian', subLabel: '(अभिभावक के हस्ताक्षर)', position: 'center' },
        { label: 'Principal / Admission Incharge', subLabel: '(सील एवं हस्ताक्षर)', position: 'right' }
      ],
      officialNote: 'FOR OFFICE USE ONLY: Application received on .................... Verified all certificates. Fee receipt no: .................... Admission Granted in Class: ....................'
    })
  },
  {
    id: 'birth_cert_request',
    title: 'Birth Certificate Request / Application',
    hindiTitle: 'जन्म प्रमाण पत्र हेतु आवेदन पत्र (नगर निगम / ग्राम पंचायत)',
    category: 'civil',
    description: 'Formal application format addressed to the Registrar of Births and Deaths (Nagar Nigam / Gram Panchayat) for issuing a new or duplicate birth certificate.',
    defaultLanguage: 'hi',
    paperSize: 'A4',
    orientation: 'portrait',
    fields: [
      { key: 'authorityName', label: 'Designation of Officer', hindiLabel: 'पदाधिकारी का पदनाम', defaultValue: 'सेवा में, श्रीमान जन्म एवं मृत्यु निबंधक / रजिस्ट्रार महोदय', placeholder: 'Registrar Designation' },
      { key: 'department', label: 'Municipal Body / Panchayat Office', hindiLabel: 'नगर निगम / नगर पालिका / ग्राम पंचायत', defaultValue: 'नगर निगम कार्यालय, सिविल लाइन्स, प्रयागराज (उ.प्र.)', placeholder: 'e.g. Nagar Nigam, Lucknow' },
      { key: 'applicantName', label: 'Applicant Full Name', hindiLabel: 'आवेदक का नाम (पिता/अभिभावक)', defaultValue: 'संजय कुमार सिंह (पुत्र श्री रामेश्वर सिंह)', placeholder: 'Applicant Name' },
      { key: 'childName', label: 'Child Full Name', hindiLabel: 'बच्चे का पूरा नाम', defaultValue: 'आरव सिंह (Master Aarav Singh)', placeholder: 'Full Name of Child' },
      { key: 'dob', label: 'Date of Birth of Child', hindiLabel: 'जन्म तिथि', defaultValue: '12/04/2021 (बारह अप्रैल दो हजार इक्कीस)', placeholder: 'DD/MM/YYYY' },
      { key: 'birthTime', label: 'Time of Birth (if known)', hindiLabel: 'जन्म का समय', defaultValue: 'प्रातः 06:45 AM', placeholder: 'e.g. 06:45 AM' },
      { key: 'gender', label: 'Gender of Child', hindiLabel: 'लिंग', defaultValue: 'पुरुष (बालक / Male)', placeholder: 'Male / Female' },
      { key: 'birthPlace', label: 'Exact Place of Birth / Hospital', hindiLabel: 'जन्म स्थान / अस्पताल का नाम', defaultValue: 'डफरिन महिला चिकित्सालय, राजापुर, प्रयागराज (Hospital Discharge Slip Enclosed)', placeholder: 'Hospital name or Home address' },
      { key: 'fatherName', label: "Father's Full Name & Aadhaar", hindiLabel: 'पिता का नाम व आधार', defaultValue: 'संजय कुमार सिंह (आधार: XXXX-XXXX-4512)', placeholder: "Father's Name & Aadhaar" },
      { key: 'motherName', label: "Mother's Full Name & Aadhaar", hindiLabel: 'माता का नाम व आधार', defaultValue: 'श्रीमती पूजा सिंह (आधार: XXXX-XXXX-8923)', placeholder: "Mother's Name & Aadhaar" },
      { key: 'addressAtBirth', label: 'Address at time of Child Birth', hindiLabel: 'जन्म के समय माता-पिता का पता', defaultValue: 'मकान नं. 112/A, टैगोर टाउन, प्रयागराज - 211002', placeholder: 'Address during delivery' },
      { key: 'mobile', label: 'Contact Phone Number', hindiLabel: 'मोबाइल नंबर', defaultValue: '+91 94500 XXXXX', placeholder: '10-digit mobile' },
      { key: 'reason', label: 'Purpose of Certificate', hindiLabel: 'प्रमाण पत्र की आवश्यकता का कारण', defaultValue: 'विद्यालय में प्रथम कक्षा प्रवेश एवं आधार कार्ड बनवाने हेतु।', placeholder: 'e.g. School Admission & Aadhaar' },
    ],
    contentTemplate: (data) => ({
      headerTitle: 'जन्म प्रमाण पत्र जारी करने हेतु प्रार्थना पत्र',
      headerSubtitle: 'APPLICATION FOR ISSUANCE OF BIRTH CERTIFICATE UNDER ACT 1969',
      refNo: `BIRTH-APP/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toLocaleDateString('hi-IN'),
      photoBox: false,
      sections: [
        {
          title: 'सेवा में प्रेषित (TO THE REGISTRAR):',
          content: `${data.authorityName}
${data.department}

**विषय: बालक/बालिका ${data.childName} का जन्म प्रमाण पत्र जारी करने के संबंध में।**`
        },
        {
          title: 'महोदय (RESPECTED SIR),',
          content: `सविनय निवेदन है कि प्रार्थी/प्रार्थिया **${data.applicantName}** का/की निवासी हूँ। मेरे परिवार में बालक/बालिका का जन्म हुआ है, जिसका विवरण निम्नलिखित रूप से प्रमाणित है:

1. बालक/बालिका का पूरा नाम: **${data.childName}**
2. जन्म की तिथि: **${data.dob}** (समय: **${data.birthTime}**)
3. लिंग: **${data.gender}**
4. जन्म स्थान: **${data.birthPlace}**
5. पिता का पूरा नाम: **${data.fatherName}**
6. माता का पूरा नाम: **${data.motherName}**
7. जन्म के समय माता-पिता का स्थायी पता: **${data.addressAtBirth}**
8. प्रमाण पत्र की आवश्यकता का कारण: **${data.reason}**`
        },
        {
          title: 'संलग्न किए गए आवश्यक दस्तावेज (ENCLOSED DOCUMENTS):',
          content: `1. अस्पताल / प्रसूति गृह का डिस्चार्ज कार्ड एवं जन्म रिपोर्ट पर्ची (मूल व छायाप्रति)
2. माता एवं पिता के आधार कार्ड व निवास प्रमाण पत्र की स्वप्रमाणित छायाप्रति
3. राशन कार्ड / परिवार रजिस्टर नकल की प्रति
4. शपथ पत्र (यदि 21 दिन से अधिक विलंब हो - संलग्न)`
        }
      ],
      declaration: 'प्रार्थना: अतः श्रीमान जी से सादर करबद्ध निवेदन है कि उपर्युक्त विवरणों का विभागीय रिकॉर्ड से मिलान कर बालक/बालिका का विधिवत जन्म प्रमाण पत्र निर्गत करने की कृपा करें। इस हेतु प्रार्थी आपका सदैव आभारी रहेगा।',
      signatures: [
        { label: 'हस्ताक्षर / निशानी अंगूठा आवेदक', subLabel: `(${data.applicantName})`, position: 'right' },
        { label: 'मोबाइल नंबर:', subLabel: data.mobile, position: 'left' }
      ],
      officialNote: 'कार्यालयी टिप्पणी (OFFICE USE): संबंधित वार्ड इंस्पेक्टर / स्वास्थ्य अधिकारी द्वारा सत्यापन रिपोर्ट संलग्न। पंजीकरण संख्या ................... दिनांक ................... को दर्ज कर प्रमाण पत्र जारी किया गया।'
    })
  },
  {
    id: 'identity_affidavit',
    title: 'Identity & Address Notary Affidavit',
    hindiTitle: 'पहचान व स्थायी निवास शपथ पत्र (नोटरी प्रारूप)',
    category: 'affidavit',
    description: 'Official legal notary sworn affidavit layout for identity declaration, address confirmation, and name consistency for government/banking schemes.',
    defaultLanguage: 'hi',
    paperSize: 'Legal',
    orientation: 'portrait',
    fields: [
      { key: 'courtPlace', label: 'Court / Notary Jurisdiction Place', hindiLabel: 'न्यायालय / नोटरी कार्यक्षेत्र', defaultValue: 'समक्ष: श्रीमान नोटरी पब्लिक / कार्यपालक दंडाधिकारी, कानपुर नगर', placeholder: 'e.g. Before Notary Public, Delhi' },
      { key: 'deponentName', label: 'Deponent Full Name (शपथी का नाम)', hindiLabel: 'शपथी का नाम', defaultValue: 'राकेश कुमार वर्मा', placeholder: 'Full Name of Deponent' },
      { key: 'fatherName', label: "Father's / Husband's Name", hindiLabel: 'पिता / पति का नाम', defaultValue: 'श्री बद्री प्रसाद वर्मा', placeholder: "Father's Name" },
      { key: 'age', label: 'Age (in Years)', hindiLabel: 'आयु (वर्षों में)', defaultValue: '34 वर्ष', placeholder: 'e.g. 28 वर्ष' },
      { key: 'occupation', label: 'Occupation', hindiLabel: 'व्यवसाय', defaultValue: 'कृषि एवं निजी व्यवसाय', placeholder: 'e.g. Private Service' },
      { key: 'address', label: 'Permanent Address', hindiLabel: 'स्थायी पता', defaultValue: 'ग्राम व पोस्ट - सचेंडी, थाना - सचेंडी, जनपद - कानपुर नगर (उ.प्र.) - 209304', placeholder: 'Full Address' },
      { key: 'aadhaarNo', label: 'Aadhaar Card No.', hindiLabel: 'आधार कार्ड संख्या', defaultValue: '9845-XXXX-1234', placeholder: '12-digit Aadhaar' },
      { key: 'purpose', label: 'Purpose of Affidavit', hindiLabel: 'शपथ पत्र का प्रयोजन', defaultValue: 'नवीन राशन कार्ड बनवाने, गैस कनेक्शन एवं बैंक खाता सत्यापन हेतु।', placeholder: 'e.g. Ration Card / Bank KYC' },
      { key: 'aliasName', label: 'Known By Other Name (if any)', hindiLabel: 'उपनाम / अन्य नाम (यदि हो)', defaultValue: 'राकेश वर्मा उर्फ रॉकी वर्मा (दोनों एक ही व्यक्ति हैं)', placeholder: 'Alias name if applicable' },
    ],
    contentTemplate: (data) => ({
      headerTitle: 'शपथ पत्र (AFFIDAVIT)',
      headerSubtitle: `${data.courtPlace} (रु 10/100 के गैर-न्यायिक ई-स्टाम्प पेपर हेतु)`,
      refNo: `NOTARY/AFF-${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString('hi-IN'),
      photoBox: true,
      sections: [
        {
          title: 'शपथी का परिचय व बयान (DECLARATION OF DEPONENT):',
          content: `मैं, **${data.deponentName}**, सुपुत्र/सुपुत्री **${data.fatherName}**, आयु लगभग **${data.age}**, व्यवसाय **${data.occupation}**, निवासी **${data.address}**, आधार कार्ड संख्या **${data.aadhaarNo}**, सत्यनिष्ठापूर्वक निम्न कथन की शपथ लेता/लेती हूँ:`
        },
        {
          title: 'शपथ के मुख्य बिंदु (TERMS OF AFFIDAVIT):',
          content: `1. यह कि शपथी उपरोक्त पते का स्थायी एवं मूल निवासी है और इस पते पर विगत कई वर्षों से सपरिवार निवास कर रहा है।
2. यह कि शपथी की पहचान हेतु आधार कार्ड संख्या **${data.aadhaarNo}** संलग्न है और यह पूर्णतः वैध एवं प्रामाणिक है।
3. यह कि शपथी के नाम में **${data.aliasName}** से भी जाना जाता है, उक्त दोनों नाम एक ही व्यक्ति अर्थात् मुझ शपथी के हैं।
4. यह कि यह शपथ पत्र **${data.purpose}** हेतु प्रस्तुत किया जा रहा है।
5. यह कि यदि भविष्य में मेरे द्वारा दिया गया उपरोक्त विवरण या कोई भी साक्ष्य असत्य अथवा भ्रामक पाया जाता है तो उसके विरुद्ध भारतीय न्याय संहिता के अंतर्गत किसी भी कानूनी कार्रवाई के लिए शपथी पूर्णतः स्वयं जिम्मेदार होगा।`
        }
      ],
      declaration: 'सत्यापन (VERIFICATION): मैं शपथी सत्यनिष्ठा से सत्यापित करता/करती हूँ कि इस शपथ पत्र की समस्त धाराएं 1 से 5 तक मेरी निजी जानकारी व विश्वास के अनुसार सत्य एवं सही हैं। इसमें कोई तथ्य छुपाया नहीं गया है। ईश्वर मेरी मदद करे।',
      signatures: [
        { label: 'स्थान:', subLabel: 'कानपुर नगर', position: 'left' },
        { label: 'दिनांक:', subLabel: new Date().toLocaleDateString('hi-IN'), position: 'center' },
        { label: 'हस्ताक्षर शपथी (DEPONENT)', subLabel: `(${data.deponentName})`, position: 'right' }
      ],
      officialNote: 'NOTARY PUBLIC ATTESTATION: Sworn and signed before me by the deponent who is identified by Shri ......................... Advocate. Entry made in Register at Serial No. ......... / Page .........'
    })
  },
  {
    id: 'income_declaration',
    title: 'Income & Asset Self Declaration',
    hindiTitle: 'पारिवारिक वार्षिक आय स्व-घोषणा प्रपत्र',
    category: 'certificate',
    description: 'Self-declaration form for annual family income from all sources (agriculture, business, wages) required for scholarship and government welfare schemes.',
    defaultLanguage: 'hi',
    paperSize: 'A4',
    orientation: 'portrait',
    fields: [
      { key: 'headName', label: 'Head of Family / Applicant Name', hindiLabel: 'मुखिया / आवेदक का नाम', defaultValue: 'दिनेश कुमार मौर्या', placeholder: 'Head of Family Name' },
      { key: 'fatherOrHusband', label: "Father's / Husband's Name", hindiLabel: 'पिता / पति का नाम', defaultValue: 'श्री बाबूलाल मौर्या', placeholder: "Father's Name" },
      { key: 'village', label: 'Village / Ward / Street', hindiLabel: 'ग्राम / मोहल्ला', defaultValue: 'ग्राम - रामपुर माफी, पोस्ट - सोहावल', placeholder: 'Village or Ward' },
      { key: 'block', label: 'Tehsil / Block & District', hindiLabel: 'तहसील / ब्लॉक व जनपद', defaultValue: 'तहसील - सदर, जनपद - अयोध्या (उ.प्र.)', placeholder: 'Tehsil and District' },
      { key: 'agricultureIncome', label: 'Annual Income from Agriculture (कृषि आय)', hindiLabel: 'वार्षिक कृषि आय (₹)', defaultValue: '24,000/-', placeholder: 'e.g. 25,000' },
      { key: 'wageIncome', label: 'Annual Income from Labor/Wages (मजदूरी/श्रम)', hindiLabel: 'मजदूरी व अन्य आय (₹)', defaultValue: '36,000/-', placeholder: 'e.g. 35,000' },
      { key: 'totalAnnualIncome', label: 'Total Annual Family Income (कुल वार्षिक आय)', hindiLabel: 'कुल वार्षिक पारिवारिक आय (₹)', defaultValue: '60,000/- (साठ हजार रुपये मात्र)', placeholder: 'Total Income in Words' },
      { key: 'familyMembersCount', label: 'Total Family Members Dependent', hindiLabel: 'आश्रित पारिवारिक सदस्यों की संख्या', defaultValue: '05 (पाँच)', placeholder: 'Count of dependents' },
      { key: 'schemeName', label: 'Scheme / Scholarship Name', hindiLabel: 'योजना / छात्रवृत्ति का नाम', defaultValue: 'उत्तर प्रदेश दशमोत्तर छात्रवृत्ति एवं शुल्क प्रतिपूर्ति योजना', placeholder: 'Scheme Name' },
    ],
    contentTemplate: (data) => ({
      headerTitle: 'पारिवारिक वार्षिक आय स्व-प्रमाणित घोषणा पत्र',
      headerSubtitle: 'SELF DECLARATION OF ANNUAL FAMILY INCOME FOR SCHOLARSHIPS & WELFARE SCHEMES',
      refNo: `INC-DEC/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString('hi-IN'),
      photoBox: true,
      sections: [
        {
          title: 'आवेदक का व्यक्तिगत विवरण (APPLICANT PARTICULARS):',
          content: `मैं, **${data.headName}**, सुपुत्र/पत्नी **${data.fatherOrHusband}**, निवासी **${data.village}**, **${data.block}** सत्यनिष्ठा से घोषणा करता/करती हूँ कि:`
        },
        {
          title: 'आय के स्रोतों का विवरण (INCOME SOURCES BREAKDOWN):',
          content: `1. आवेदक के परिवार में कुल **${data.familyMembersCount}** सदस्य हैं जो पूर्णतः मेरे ऊपर आश्रित हैं।
2. परिवार के समस्त स्रोतों से होने वाली अनुमानित वार्षिक आय का ब्योरा निम्न प्रकार है:`,
          table: {
            headers: ['क्र.', 'आय का स्रोत (Source of Income)', 'वार्षिक अनुमानित आय (INR)', 'टिप्पणी'],
            rows: [
              ['1.', 'कृषि भूमि / बटाई से प्राप्त आय', `₹ ${data.agricultureIncome}`, 'तहसीलदार रिकॉर्ड अनुसार'],
              ['2.', 'दैनिक मजदूरी / पारिश्रमिक / लघु व्यवसाय', `₹ ${data.wageIncome}`, 'असंगठित क्षेत्र'],
              ['3.', 'पेंशन / किराया / अन्य स्रोत', '₹ 0.00', 'शून्य'],
              ['कुल', 'समस्त स्रोतों से कुल वार्षिक आय', `₹ ${data.totalAnnualIncome}`, 'वार्षिक शुद्ध आय']
            ]
          }
        },
        {
          title: 'प्रयोजन एवं सहमति (PURPOSE):',
          content: `यह घोषणा पत्र विशेष रूप से **${data.schemeName}** का लाभ प्राप्त करने हेतु प्रस्तुत किया जा रहा है। परिवार में कोई भी सदस्य आयकर दाता (Income Tax Payee) नहीं है।`
        }
      ],
      declaration: 'घोषणा: मैं प्रमाणित करता हूँ कि उपरोक्त विवरण मेरे सर्वोत्तम ज्ञान एवं विश्वास में पूर्णतः सत्य है। यदि कोई जानकारी असत्य पाई जाती है तो मुझे योजना के लाभ से वंचित करते हुए मेरे विरुद्ध दंडात्मक कार्रवाई की जा सकती है।',
      signatures: [
        { label: 'हस्ताक्षर / मुहर ग्राम प्रधान / सभासद', subLabel: '(सत्यापनकर्ता)', position: 'left' },
        { label: 'हस्ताक्षर घोषणाकर्ता (मुखिया/आवेदक)', subLabel: `(${data.headName})`, position: 'right' }
      ],
      officialNote: 'सत्यापन रिपोर्ट: आवेदक की पारिवारिक स्थिति व आय का स्थलीय सत्यापन किया गया, विवरण सही पाया गया। राजस्व लेखपाल / कानूनगो हस्ताक्षर .................. दिनांक ..................'
    })
  },
  {
    id: 'ration_card_addition',
    title: 'Ration Card Member Addition Form',
    hindiTitle: 'राशन कार्ड में नवीन सदस्य का नाम जोड़ने हेतु प्रपत्र',
    category: 'ration',
    description: 'Official application format addressed to the District Supply Officer (DSO) / Supply Inspector for adding newly married spouse or newborn child in National Food Security Act (NFSA) Ration Card.',
    defaultLanguage: 'hi',
    paperSize: 'A4',
    orientation: 'portrait',
    fields: [
      { key: 'supplyOffice', label: 'Supply Office / DSO Office', hindiLabel: 'खाद्य एवं रसद आपूर्ति कार्यालय', defaultValue: 'सेवा में, श्रीमान पूर्ति निरीक्षक / जिला पूर्ति अधिकारी महोदय', placeholder: 'Supply Inspector Designation' },
      { key: 'district', label: 'Tehsil & District', hindiLabel: 'तहसील व जनपद', defaultValue: 'खाद्य एवं नागरिक आपूर्ति विभाग, तहसील - बिलासपुर, जनपद - रामपुर', placeholder: 'District Office' },
      { key: 'rationCardNo', label: 'Existing Ration Card Number', hindiLabel: 'विद्यमान डिजिटल राशन कार्ड संख्या', defaultValue: '213456789012 (NFSA पात्र गृहस्थी)', placeholder: '12-digit Ration Card No' },
      { key: 'headName', label: 'Head of Family Name (महिला मुखिया का नाम)', hindiLabel: 'राशन कार्ड मुखिया का नाम', defaultValue: 'श्रीमती कमलावती देवी (पति: श्री रामसेवक)', placeholder: 'Head of Family (Female)' },
      { key: 'fpsDealer', label: 'Fair Price Shop (FPS) Dealer Name & Code', hindiLabel: 'उचित दर विक्रेता का नाम व दुकान कोड', defaultValue: 'दुकानदार: श्री सतीश कुमार (दुकान कोड: 3421)', placeholder: 'Kotedar Name & Code' },
      { key: 'newMemberName', label: 'New Member Name to Add', hindiLabel: 'जोड़े जाने वाले नए सदस्य का नाम', defaultValue: 'सीमा देवी (Seema Devi) - पुत्रवधू', placeholder: 'Name of new member' },
      { key: 'memberGender', label: 'New Member Gender & DOB', hindiLabel: 'लिंग व जन्म तिथि', defaultValue: 'महिला (Female) | DOB: 10/05/2001', placeholder: 'Gender & DOB' },
      { key: 'memberFatherOrHusband', label: "New Member's Husband / Father Name", hindiLabel: 'पिता / पति का नाम', defaultValue: 'श्री मनोज कुमार (पुत्र)', placeholder: 'Father or Husband name' },
      { key: 'memberAadhaar', label: 'New Member Aadhaar Number', hindiLabel: 'नए सदस्य का आधार नंबर', defaultValue: '6543-XXXX-7890', placeholder: 'Aadhaar Number' },
      { key: 'reason', label: 'Reason for Addition (विवाह / जन्म)', hindiLabel: 'नाम जोड़ने का कारण', defaultValue: 'विवाह उपरांत मायके के राशन कार्ड से नाम कटने के बाद ससुराल राशन कार्ड में नाम दर्ज कराने हेतु।', placeholder: 'Marriage or Birth' }
    ],
    contentTemplate: (data) => ({
      headerTitle: 'राशन कार्ड में नाम जोड़ने / संशोधन हेतु आवेदन प्रपत्र',
      headerSubtitle: 'FOOD & CIVIL SUPPLIES DEPARTMENT • NFSA RATION CARD MEMBER MODIFICATION',
      refNo: `RATION-ADD/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toLocaleDateString('hi-IN'),
      photoBox: true,
      sections: [
        {
          title: 'सेवा में प्रेषित (TO THE SUPPLY INSPECTOR):',
          content: `${data.supplyOffice}
${data.district}

**विषय: राशन कार्ड संख्या ${data.rationCardNo} में नए सदस्य का नाम शामिल करने हेतु।**`
        },
        {
          title: 'विद्यमान राशन कार्ड का विवरण (CURRENT RATION CARD DETAILS):',
          content: `1. राशन कार्ड संख्या: **${data.rationCardNo}**
2. परिवार की मुखिया का नाम: **${data.headName}**
3. उचित दर विक्रेता (कोटेदार) का नाम व कोड: **${data.fpsDealer}**`
        },
        {
          title: 'जोड़े जाने वाले नए सदस्य का संपूर्ण विवरण (NEW MEMBER DETAILS):',
          content: `निम्न सदस्य का नाम इस राशन कार्ड में दर्ज करने की कृपा करें:`,
          table: {
            headers: ['क्र.', 'सदस्य का नाम', 'पिता/पति का नाम', 'मुखिया से संबंध', 'जन्म तिथि/आयु', 'आधार कार्ड संख्या'],
            rows: [
              ['1.', data.newMemberName, data.memberFatherOrHusband, 'पुत्रवधू / Daughter-in-law', data.memberGender, data.memberAadhaar]
            ]
          }
        },
        {
          title: 'नाम जोड़ने का कारण एवं संलग्न साक्ष्य (REASON & ENCLOSURES):',
          content: `कारण: **${data.reason}**

संलग्नक:
1. नए सदस्य के आधार कार्ड की स्वप्रमाणित छायाप्रति
2. मायके के राशन कार्ड से नाम विलोपन / समर्पण प्रमाण पत्र (Surrender Certificate / Marriage Certificate)
3. मूल राशन कार्ड की छायाप्रति एवं परिवार के मुखिया का आधार कार्ड`
        }
      ],
      declaration: 'प्रार्थना: अतः महोदय से सादर अनुरोध है कि प्रस्तुत साक्ष्यों की जांचोपरांत उक्त नए सदस्य का नाम ऑनलाइन खाद्य पोर्टल पर दर्ज कर राशन यूनिट बढ़ाने की कृपा करें।',
      signatures: [
        { label: 'उचित दर विक्रेता (कोटेदार) संतुति', subLabel: '(सील एवं हस्ताक्षर)', position: 'left' },
        { label: 'हस्ताक्षर / निशानी अंगूठा राशन कार्ड मुखिया', subLabel: `(${data.headName})`, position: 'right' }
      ],
      officialNote: 'आपूर्ति निरीक्षक आख्या: प्रस्तुत आवेदन एवं संलग्न विलोपन प्रमाण पत्र का ऑनलाइन सत्यापन किया गया। यूनिट वृद्धि अनुमोदित की जाती है। हस्ताक्षर ................... दिनांक ...................'
    })
  },
  {
    id: 'character_certificate_proforma',
    title: 'Character & Conduct Verification Certificate',
    hindiTitle: 'चरित्र एवं आचरण प्रमाण पत्र प्रारूप (जनप्रतिनिधि / अधिकारी)',
    category: 'certificate',
    description: 'Proforma for character and conduct verification issued by Gazetted Officer, School Principal, Ward Councillor (Nagar Parishad), or Village Pradhan for job applications and police verification.',
    defaultLanguage: 'bilingual',
    paperSize: 'A4',
    orientation: 'portrait',
    fields: [
      { key: 'issuingAuthority', label: 'Issuing Authority / Office Title', hindiLabel: 'जारीकर्ता कार्यालय / प्राधिकारी', defaultValue: 'कार्यालय: ग्राम पंचायत / वार्ड पार्षद / राजपत्रित अधिकारी', placeholder: 'Office / Gazetted Officer' },
      { key: 'candidateName', label: 'Candidate Full Name', hindiLabel: 'उम्मीदवार का पूरा नाम', defaultValue: 'दीपक कुमार प्रजापति (Deepak Kumar)', placeholder: 'Candidate Full Name' },
      { key: 'fatherName', label: "Father's Full Name", hindiLabel: 'पिता का पूरा नाम', defaultValue: 'श्री छोटेलाल प्रजापति', placeholder: "Father's Name" },
      { key: 'residentOf', label: 'Full Residential Address', hindiLabel: 'निवास स्थान', defaultValue: 'ग्राम - मिर्जापुर, पोस्ट - चकिया, जनपद - वाराणसी (उ.प्र.) - 221001', placeholder: 'Full Postal Address' },
      { key: 'knownSince', label: 'Known Period (in Years)', hindiLabel: 'परिचित अवधि (वर्षों में)', defaultValue: 'विगत 08 (आठ) वर्षों से', placeholder: 'e.g. 5 Years' },
      { key: 'conduct', label: 'Conduct & Moral Character Status', hindiLabel: 'आचरण व चरित्र स्थिति', defaultValue: 'उत्तम, निष्कलंक एवं संतोषप्रद (Good Moral Character)', placeholder: 'Good / Excellent' },
      { key: 'criminalRecord', label: 'Criminal Record Statement', hindiLabel: 'आपराधिक रिकॉर्ड स्थिति', defaultValue: 'इनके विरुद्ध थाने अथवा न्यायालय में कोई आपराधिक मामला संज्ञान में नहीं है।', placeholder: 'No criminal records' },
      { key: 'purpose', label: 'Purpose of Certificate', hindiLabel: 'जारी करने का उद्देश्य', defaultValue: 'सरकारी सेवा / पुलिस भर्ती / बैंक सत्यापन हेतु।', placeholder: 'e.g. Govt Job Verification' }
    ],
    contentTemplate: (data) => ({
      headerTitle: 'चरित्र एवं आचरण प्रमाण पत्र',
      headerSubtitle: 'CHARACTER & GOOD CONDUCT CERTIFICATE',
      refNo: `CHAR-CERT/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toLocaleDateString('hi-IN'),
      photoBox: true,
      sections: [
        {
          title: 'प्रमाणीकरण (TO WHOMSOEVER IT MAY CONCERN):',
          content: `प्रमाणित किया जाता है कि मैं **${data.candidateName}**, सुपुत्र/सुपुत्री **${data.fatherName}**, निवासी **${data.residentOf}** को व्यक्तिगत रूप से **${data.knownSince}** भली-भाँति जानता एवं पहचानता हूँ।

मेरी जानकारी एवं विश्वास के अनुसार इनका नैतिक चरित्र एवं सामाजिक आचरण **${data.conduct}** है।

यह भी प्रमाणित किया जाता है कि **${data.criminalRecord}**

ये मेरी किसी भी व्यक्तिगत रिश्तेदारी अथवा पारिवारिक संबंध में नहीं हैं। यह प्रमाण पत्र इनके अनुरोध पर **${data.purpose}** जारी किया जा रहा है।

मैं इनके उज्ज्वल एवं सफल भविष्य की मंगल कामना करता हूँ।`
        }
      ],
      declaration: 'टिप्पणी: यह प्रमाण पत्र जारी होने की तिथि से आगामी 6 (छह) माह तक मान्य रहेगा।',
      signatures: [
        { label: 'स्थान:', subLabel: 'वाराणसी', position: 'left' },
        { label: 'दिनांक:', subLabel: new Date().toLocaleDateString('hi-IN'), position: 'center' },
        { label: 'हस्ताक्षर एवं मुहर सक्षम अधिकारी / जनप्रतिनिधि', subLabel: '(Signature & Official Seal with Name/Designation)', position: 'right' }
      ],
      officialNote: 'कार्यालय पंजीयन क्रमांक ..................... पर दर्ज किया गया। मोहर (OFFICIAL STAMP): [                                      ]'
    })
  }
];
