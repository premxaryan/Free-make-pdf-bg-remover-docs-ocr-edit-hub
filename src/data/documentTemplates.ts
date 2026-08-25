import { DocumentFormData, DocumentType } from '../types.ts';

export const INITIAL_FORM_DATA: DocumentFormData = {
  docType: 'resume',
  language: 'en',
  theme: 'classic',
  
  fullName: 'Rahul Kumar Sharma',
  fatherName: 'Shri Rameshwar Sharma',
  motherName: 'Smt. Geeta Sharma',
  dob: '1998-05-15',
  gender: 'Male',
  maritalStatus: 'Unmarried',
  nationality: 'Indian',
  religion: 'Hindu',
  category: 'OBC',
  
  phone: '+91 98765 43210',
  email: 'rahul.sharma98@email.com',
  address: 'H.No. 42, Ward No. 8, Near Durga Temple, Civil Lines',
  city: 'Jaipur',
  district: 'Jaipur',
  state: 'Rajasthan',
  pincode: '302006',
  
  jobTitleOrPosition: 'Computer Operator & Data Entry Specialist',
  appliedPost: 'Assistant Office Clerk / Computer Operator',
  companyOrOrg: 'District Administration / Private Limited Co.',
  targetDepartment: 'Administrative & Customer Relations Dept.',
  objective: 'To secure a challenging position in a reputable organization where I can utilize my administrative, computer operations, and data management skills to contribute towards organizational efficiency.',
  
  education: [
    {
      id: 'edu_1',
      course: 'Bachelor of Computer Applications (BCA)',
      boardOrUniv: 'University of Rajasthan',
      passingYear: '2020',
      percentageOrCgpa: '74.5%',
      division: 'First'
    },
    {
      id: 'edu_2',
      course: 'Senior Secondary (10+2 - Science / Math)',
      boardOrUniv: 'RBSE Ajmer Board',
      passingYear: '2017',
      percentageOrCgpa: '78.2%',
      division: 'First'
    },
    {
      id: 'edu_3',
      course: 'Secondary School Examination (10th)',
      boardOrUniv: 'RBSE Ajmer Board',
      passingYear: '2015',
      percentageOrCgpa: '81.0%',
      division: 'First with Distinction'
    }
  ],
  
  experience: [
    {
      id: 'exp_1',
      jobTitle: 'Senior Data Entry & Office Assistant',
      companyName: 'Apex Infotech Solutions',
      duration: 'July 2021 – Present (3+ Years)',
      description: 'Managed database entries, billing records, customer documentation, MS Excel MIS reporting, and online correspondence with 99% accuracy.'
    },
    {
      id: 'exp_2',
      jobTitle: 'Computer Operator Intern',
      companyName: 'Shree Balaji Digital Services',
      duration: 'Aug 2020 – June 2021 (1 Year)',
      description: 'Assisted in online portal submissions, Hindi/English typing, Aadhaar/PAN documentation, and report generation.'
    }
  ],
  
  skills: 'MS Office (Word, Excel, PowerPoint), Fast Typing (English 40 WPM / Hindi 35 WPM), Tally Prime, Photoshop Basics, Internet Portals, Hindi & English Correspondence',
  languagesKnown: 'Hindi (Fluent), English (Working Professional), Rajasthani (Native)',
  hobbies: 'Reading tech blogs, Typing practice, Social service, Cricket',
  
  applicationSubject: 'Application for the post of Computer Operator / Clerk',
  reasonOrDetails: 'As per the advertisement published in daily newspaper regarding the vacancy, I possess the required educational qualifications and 3+ years of practical work experience.',
  fromDate: '2026-08-25',
  toDate: '2026-08-28',
  policeStation: 'Civil Lines Police Station',
  notaryPlace: 'Jaipur, Rajasthan',
  gapPeriod: 'June 2020 to May 2022 (2 Years)',
  gapReason: 'Preparation for competitive civil services examinations and assisting family in agricultural affairs. During this time, I was not involved in any unlawful activity.',
  oldName: 'Rahul Sharma',
  newName: 'Rahul Kumar Sharma',
  annualIncome: 'Rs. 1,40,000/- (One Lakh Forty Thousand Only)',
  witness1: 'Suresh Verma, S/o Shri M. L. Verma, R/o Civil Lines',
  witness2: 'Dinesh Meena, S/o Shri Ramswaroop Meena, R/o Ward 8',
  
  cscCenterName: 'Digital Seva CSC & Cyber Point',
  operatorContact: '+91 94140 XXXXX'
};

export const DOC_PRESET_TEMPLATES: Record<DocumentType, Partial<DocumentFormData>> = {
  resume: {
    docType: 'resume',
    language: 'en',
    jobTitleOrPosition: 'Computer Operator & Executive Assistant',
    appliedPost: 'Office Assistant / Data Entry Operator',
    objective: 'Seeking a dynamic role in a growth-oriented organization where my technical typing, administrative, and problem-solving skills will add high value to operations.'
  },
  job_application_en: {
    docType: 'job_application_en',
    language: 'en',
    applicationSubject: 'Application for the post of Junior Accountant / Data Operator',
    companyOrOrg: 'The Branch Manager / HR Director, ABC Corporation Pvt Ltd',
    reasonOrDetails: 'I am writing to express my eager interest in the advertised position. Having completed my Bachelor degree with distinction and equipped with 3 years of computer operations experience, I am confident in handling day-to-day office administrative tasks with utmost diligence.'
  },
  job_application_hi: {
    docType: 'job_application_hi',
    language: 'hi',
    applicationSubject: 'कंप्यूटर ऑपरेटर / लिपिक पद हेतु आवेदन पत्र',
    companyOrOrg: 'श्रीमान शाखा प्रबंधक / सक्षम प्राधिकारी महोदय',
    reasonOrDetails: 'सविनय निवेदन है कि मुझे आपके प्रतिष्ठित कार्यालय में रिक्त कंप्यूटर ऑपरेटर / लिपिक पद के संबंध में विज्ञापन के माध्यम से जानकारी प्राप्त हुई है। मैं इस पद हेतु निर्धारित सभी शैक्षणिक योग्यता एवं 3 वर्ष का कार्यानुभव रखता हूँ। मेरी हिंदी व अंग्रेजी टाइपिंग गति उत्कृष्ट है। अतः आपसे विनम्र निवेदन है कि मुझे साक्षात्कार का अवसर प्रदान करने की कृपा करें।'
  },
  affidavit_gap: {
    docType: 'affidavit_gap',
    language: 'en',
    notaryPlace: 'District Court / Sub-Divisional Magistrate Office',
    gapPeriod: '2021 to 2023 (2 Years)',
    gapReason: 'Preparing for competitive civil services & state recruitment examinations while staying at permanent residence. During this gap period, I did not enroll in any other university or indulge in any criminal/illegal act.'
  },
  affidavit_name: {
    docType: 'affidavit_name',
    language: 'en',
    oldName: 'Rahul Sharma',
    newName: 'Rahul Kumar Sharma',
    reasonOrDetails: 'That both names Rahul Sharma and Rahul Kumar Sharma pertain to one and the same person, i.e., the deponent myself, and in all future records my correct name shall be written as Rahul Kumar Sharma.'
  },
  affidavit_income: {
    docType: 'affidavit_income',
    language: 'hi',
    annualIncome: '1,20,000/- (एक लाख बीस हजार रुपये मात्र)',
    reasonOrDetails: 'यह कि प्रार्थी/शपथकर्ता के परिवार की समस्त स्रोतों (कृषि, मजदूरी एवं निजी कार्य) से कुल वार्षिक आय 1,20,000/- रुपये है। यह शपथ पत्र छात्रवृत्ति / ईडब्ल्यूएस प्रमाण पत्र हेतु प्रस्तुत किया जा रहा है।'
  },
  leave_letter_en: {
    docType: 'leave_letter_en',
    language: 'en',
    applicationSubject: 'Application for 4 Days Casual / Medical Leave',
    companyOrOrg: 'To The Respected Principal / Branch Head',
    reasonOrDetails: 'Respectfully, I wish to state that due to sudden high fever and viral illness (as per medical advice) / unavoidable domestic commitment, I will be unable to attend office/classes from 25th Aug to 28th Aug. Kindly grant me leave for 4 days.'
  },
  leave_letter_hi: {
    docType: 'leave_letter_hi',
    language: 'hi',
    applicationSubject: 'अस्वस्थता / आवश्यक कार्य हेतु 3 दिन के अवकाश हेतु प्रार्थना पत्र',
    companyOrOrg: 'सेवा में, श्रीमान प्रधानाचार्य / कार्यालय प्रभारी महोदय',
    reasonOrDetails: 'सविनय निवेदन है कि प्रार्थी को अचानक तीव्र ज्वर एवं स्वास्थ्य संबंधी अस्वस्थता होने के कारण चिकित्सक द्वारा 3 दिन के पूर्ण विश्राम की सलाह दी गई है। अतः प्रार्थी दिनांक 25 अगस्त से 28 अगस्त तक उपस्थित होने में असमर्थ है। कृपया उक्त तिथियों का अवकाश स्वीकृत करने की महती कृपा करें।'
  },
  experience_cert: {
    docType: 'experience_cert',
    language: 'en',
    companyOrOrg: 'Sunrise Technologies & Services Pvt. Ltd.',
    jobTitleOrPosition: 'Senior Operations Executive & Data Specialist',
    reasonOrDetails: 'During his tenure with us from 1st July 2021 to 15th August 2024, we found him sincere, hardworking, dedicated, and of exemplary moral character. We wish him all success in his future endeavors.'
  },
  character_cert: {
    docType: 'character_cert',
    language: 'hi',
    companyOrOrg: 'कार्यालय ग्राम पंचायत / स्थानीय पार्षद / संस्था प्रधान',
    reasonOrDetails: 'प्रमाणित किया जाता है कि श्री राहुल कुमार शर्मा सुपुत्र श्री रामेश्वर शर्मा, निवासी वार्ड 8, सिविल लाइंस, को मैं विगत 5 वर्षों से भली-भाँति जानता हूँ। इनका चरित्र उत्तम एवं निष्कलंक है तथा इनका व्यवहार समाज में सौम्य एवं अनुकरणीय है।'
  }
};
