import { Patient, ProgressNote } from "@/types/progressNote";

export const samplePatient: Patient = {
  _id: "patient_1",
  firstName: "Galina",
  lastName: "Ibragimova",
  dateOfBirth: "1960-06-13",
  mrn: "E168253",
  gender: "female",
  phone: "917-838-9871",
  primaryCareProvider: "Felix Cohen",
};

export const sampleProgressNote: ProgressNote = {
  _id: "note_1",
  patientId: "patient_1",
  encounterId: "enc_001",
  encounterDate: "2025-11-25",
  noteType: "CARDIOLOGY AMBULATORY PROGRESS NOTE",
  status: "signed",

  provider: {
    name: "Jeffrey Bander",
    title: "MD",
    specialty: "Cardiology",
    contactInfo: {
      phone: "(212) 241-7114",
      fax: "(646) 537-9691",
      email: "jeffrey.bander@mountsinai.org",
    },
  },

  scribe: {
    name: "Zoe Ozols",
    title: "Scribe",
  },

  historyOfPresentIllness: `Galina Ibragimova is a 65 y.o. female with history significant for hyperlipidemia, prediabetes. She presents today to establish cardiovascular care. Galina reports shortness of breath and chest pain walking up a flight of stairs which resolves with rest. Galina denies palpitations. Galina is not currently on any cardiac medications. Of note, Galina is a pediatrician.`,

  pastMedicalHistory: [
    { diagnosis: "Hyperlipidemia" },
    { diagnosis: "Prediabetes" },
  ],

  pastSurgicalHistory: [],

  familyHistory: [
    { relation: "Father", condition: "had fatal MI", ageAtOnset: "58" },
  ],

  socialHistory: {
    tobacco: "None",
    alcohol: "Occasional alcohol use",
    drugs: "None",
    supportSystem: "Lives with family",
  },

  allergies: [],

  currentMedications: [],

  reviewOfSystems: {
    general: "ROS: Reviewed and comprehensively negative, except as indicated in HPI",
  },

  physicalExam: {
    vitals: {
      bloodPressure: "142/82",
      bloodPressureLocation: "Left Arm",
      bloodPressurePosition: "Sitting",
      heartRate: "71",
      height: "5' 3\" (1.6 m)",
      weight: "61.2 kg (135 lb)",
      bmi: "23.91 kg/m²",
    },
    constitutional: "Awake, alert, and in no acute distress. Appears stated age, is well developed/nourished.",
    eyes: "Anicteric sclera. Intact extraocular movements.",
    enmt: "Moist mucous membranes. Throat clear.",
    neck: "Supple. Jugular venous pressure was normal. There were no carotid bruits.",
    cardiovascular: "Heart sounds were regular, with normal S1 and S2, and no rubs, gallops or murmurs.",
    respiratory: "Lungs were clear bilaterally, without wheezing or crackles",
    gastrointestinal: "Normal bowel sounds. Soft, non-tender and non-distended.",
    extremities: "Legs were warm and well perfused, with no cyanosis, clubbing or edema.",
    skin: "No rashes",
    neurologic: "Orientated to time, place and person. Grossly non-focal motor examination. Normal speech.",
    psychiatric: "Appropriate mood and affect.",
  },

  diagnostics: {
    labs: [
      {
        date: "10/31/2025",
        results: "WBC 6.2 H/H 13.1/39.9 Gluc 64 Na 139 K 5.3 BUN 16 Creat 0.75 TC 274 TG 91 HDL 101 LDL 158 HgbA1c 5.7 TSH 1.45",
      },
    ],
    ekg: [
      {
        date: "11/24/2025",
        findings: "normal sinus rhythm",
      },
    ],
  },

  assessment: `Galina is a 65 y.o. female who has a history significant for hyperlipidemia and prediabetes`,

  plan: [
    {
      problem: "her DOE and cardiac work up",
      details: `- EKG [11/24/2025] - normal sinus rhythm
- We will check a coronary CT to assist with coronary artery disease risk stratification and to assess for any underlying coronary lesions which may be contributing to her symptoms.`,
    },
    {
      problem: "her hyperlipidemia",
      details: `- Recent LDL was 158 [10/2025] which is not at recommended range of less than 100, though we discussed a lower LDL below 70 aids with further risk reduction for the development coronary artery disease.
- We will consider starting Galina on a statin pending review of CCTA
- We advised/continue lifestyle modifications including dietary changes and regular exercise.`,
    },
    {
      details: `Her blood pressure today was borderline elevated at 142/82 mmHg on arrival.

We discussed exercising for 30-45 minutes on most days of the week, maintaining a healthy weight and following a low-salt, heart-healthy diet. Otherwise, we will see Galina back to review the results of her CCTA.`,
    },
  ],

  ordersPlaced: [
    "BASIC METABOLIC PANEL",
    "CTA HEART CORONARY W IV CONTRAST",
    "ELECTROCARDIOGRAM, COMPLETE",
  ],

  visitDiagnoses: [
    "Hyperlipidemia, unspecified hyperlipidemia type",
    "Prediabetes",
    "Dyspnea on exertion",
    "Other chest pain",
    "Abnormal findings on diagnostic imaging of heart and coronary circulation",
  ],

  medicationChanges: [],

  attestation: {
    scribeAttestation: {
      text: "By signing my name below, I, Zoe Ozols, attest that this documentation has been prepared under the direction and in the presence of Jeffrey Bander, MD.",
      signedBy: "Zoe Ozols, Scribe",
      signedAt: "11/25/2025",
    },
    providerAttestation: {
      text: "I, Jeffrey Bander, MD personally performed the services in this documentation. All medical record entries made by the scribe were at my direction and in my presence. I have reviewed the chart and agree that the record reflects my personal performance and is accurate and complete.",
      signedBy: "Jeffrey Bander, MD",
      signedAt: "11/25/2025",
    },
    cosignedBy: {
      name: "Jeffrey Bander, MD",
      signedAt: "11/30/25 0210",
    },
  },

  createdAt: "2025-11-25T10:00:00Z",
  updatedAt: "2025-11-30T02:10:00Z",
};

// Second sample - Electrophysiology note
export const samplePatient2: Patient = {
  _id: "patient_2",
  firstName: "Herminia",
  lastName: "Matias",
  dateOfBirth: "1939-06-14",
  mrn: "847124",
  gender: "female",
  phone: "",
  primaryCareProvider: "Prakash Krishnan, MD",
};

export const sampleProgressNote2: ProgressNote = {
  _id: "note_2",
  patientId: "patient_2",
  encounterId: "enc_002",
  encounterDate: "2025-06-13",
  noteType: "ELECTROPHYSIOLOGY OFFICE VISIT",
  status: "signed",

  provider: {
    name: "Mohit K. Turagam",
    title: "M.D.",
    specialty: "Cardiac Arrhythmia Service",
    credentials: "Assistant Clinical Professor of Medicine",
    contactInfo: {
      phone: "(212) 241-7114",
      fax: "(646) 537-9691",
      email: "mohit.turagam@mountsinai.org",
    },
  },

  referringProvider: "Prakash Krishnan, MD",
  cardiologist: "Bander, Jeffrey MD",

  historyOfPresentIllness: `Herminia Matias was seen in the cardiac arrhythmia clinic today. For our records, please allow me to summarize the history and my findings. This pleasant 85 y.o. female with HTN, HFpEF, CAD, PAD, breast cancer, atrial fibrillation with slow ventricular rate, prior PVI and CTI ablation 7/8/2022 with post op pericarditis/pericardial effusion managed medically here for follow-up. She is stable on current treatment plan.

EPS was initially consulted for question regarding intermittent AV block. Patient has a history of sinus bradycardia with 1st degree AV block, not on any nodal blocking agents. Her ECG and telemetry revealed no evidence of high grade AV block but some blocked PACs. She was also noted to be in pAfib with slow ventricular response - started around 4:50 AM and terminated around 6:10AM on 1/13/2022. She was discharged with a 7 day EM to assess further arrhythmias.

Today she reports feeling okay but continues to have chronic fatigue with daily activities. She denies presyncope, chest pain, palpitations, s/s heart failure. She is tolerating therapeutic anticoagulation. She requested Medical clearance for her upcoming cataract surgery.`,

  pastMedicalHistory: [
    { diagnosis: "Breast cancer" },
    { diagnosis: "CAD (coronary artery disease)" },
    { diagnosis: "Constipation" },
    { diagnosis: "Deep vein thrombosis" },
    { diagnosis: "GERD (gastroesophageal reflux disease)" },
    { diagnosis: "Hypertension" },
    { diagnosis: "Hypothyroidism" },
    {
      diagnosis: "PAF (paroxysmal atrial fibrillation)",
      date: "01/2022",
      notes: "CHA2DS2-VASc Score 8 (age, gender, HTN, HFpEF, DVT, PAD/CAD), -s/p Successful pulmonary vein isolation of all 4 PVs with demonstration of entrance block, CTI ablation with Dr. Mohit Turagam, MSH, NY 7/8/2022",
    },
  ],

  pastSurgicalHistory: [
    { procedure: "HX CHOLECYSTECTOMY" },
    { procedure: "HX HYSTERECTOMY", date: "1990" },
    {
      procedure: "HX VARICOSE VEIN SURGERY",
      laterality: "Bilateral",
      date: "2015",
      notes: "Vein stripping (right leg)- '75, Laser bilaterally 2015",
    },
  ],

  socialHistory: {
    tobacco: "Never Smoker",
    alcohol: "No",
  },

  allergies: [
    { allergen: "Atorvastatin", reaction: "myalgias" },
    { allergen: "Codeine", reaction: "Nausea and Vomiting" },
    { allergen: "Influenza Vaccine Tri-Sp 09-10", reaction: "Unknown" },
    { allergen: "Lisinopril", reaction: "Cough" },
  ],

  currentMedications: [
    { name: "artificial tears (REFRESH TEARS)", dose: "0.5% drops" },
    { name: "montelukast (SINGULAIR)", dose: "10 mg tablet" },
    { name: "Blood Pressure Kit Med & Lrg kit" },
    { name: "losartan (COZAAR)", dose: "100 mg tablet" },
    { name: "Cholecalciferol, Vitamin D3", dose: "5,000 unit tablet" },
    { name: "amLODIPine (NORVASC)", dose: "5 mg tablet" },
    { name: "apixaban (ELIQUIS)", dose: "5 mg" },
    { name: "levothyroxine (SYNTHROID)", dose: "100 mcg tablet" },
  ],

  reviewOfSystems: {
    constitutional: "See HPI",
    cardiovascular: "See HPI",
    respiratory: "Negative for sputum production, or wheezing, positive dyspnea on exertion",
    skin: "Denies easy bruising, denies rashes or lesions",
    endocrine: "Positive for history of thyroid disease",
    neurologic: "Negative for loss of consciousness",
  },

  physicalExam: {
    vitals: {
      bloodPressure: "158/62",
      heartRate: "58",
      weight: "76.2 kg (168 lb)",
      bmi: "30.73 kg/m²",
    },
    constitutional: "Well-appearing, in no acute distress.",
    respiratory: "Clear to auscultation. Normal excursion/effort.",
    cardiovascular: "Normal S1 and S2. Regular. No murmurs, rubs, or gallops.",
    gastrointestinal: "Soft, nondistended. No masses/tenderness. Normal bowel sounds.",
    extremities: "Without clubbing, cyanosis, or edema.",
  },

  diagnostics: {
    ekg: [
      { date: "6/13/24", findings: "AF at 58 bpm" },
      { date: "6/28/24", findings: "AF rate 57" },
      { date: "11/11/2022", findings: "Sinus rhythm at 65 bpm, PR 212 ms, QRS 80 ms, QTc 434 ms" },
    ],
    imaging: [
      {
        type: "TTE",
        date: "8/29/2022",
        findings: "normal left ventricular size, normal left ventricular systolic function; ejection fraction (2D) = 60%, normal right ventricular size, normal right ventricular function, mild valvular aortic stenosis; peak velocity = 2.16 m/s; mean gradient = 8 mmHg",
      },
    ],
    other: [
      {
        type: "Event monitor",
        date: "1/14/2022 to 1/20/2022",
        findings: "AF Burden 5% (AF occurred 34 time(s) with HR range of 28 - 111), 19 episodes of Heart Block, the most severe AHB; slowest 28 BPM, PAC burden of 5% and PVC burden of 24%",
      },
    ],
  },

  assessment: "Atrial fibrillation slow response",

  plan: [
    {
      details: `In summary, this 85 year-old female with atrial fibrillation with slow ventricular rate, short intermittent AV block while sleeping, prior PVI and CTI ablation 7/8/2022 with post op pericarditis/pericardial effusion managed medically here for follow-up.

She was doing well without EKG recurrence of AF but today in office EKG showed AF rate controlled in 50s not on any rate control agents due to history of AVB. We discussed with her about managing her AF conservatively with rate control strategy given her prior AF procedural complication and frail state. She will continue anticoagulation at this time given elevated chads2vasc score. She was advised to get medical clearance for her Cataract surgery from her PCP and we will provide a letter that she can hold Eliquis for 3 days before and resume as soon as possible post procedure. She will follow up with me on a prn basis.

Herminia Matias appeared to understand the whole discussion and verbalized that all of her questions were answered to her satisfaction. Thank you for allowing us to be involved in the care of Herminia Matias. Please feel free to contact my office with any questions.`,
    },
  ],

  ordersPlaced: ["ELECTROCARDIOGRAM, COMPLETE"],

  visitDiagnoses: ["Persistent atrial fibrillation"],

  createdAt: "2025-06-13T10:22:00Z",
  updatedAt: "2025-06-13T10:22:00Z",
};
