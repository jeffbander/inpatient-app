export interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  mrn: string;
  gender: string;
  phone?: string;
  email?: string;
  primaryCareProvider?: string;
}

export interface Provider {
  name: string;
  title: string;
  specialty: string;
  credentials?: string;
  contactInfo?: {
    phone?: string;
    fax?: string;
    email?: string;
  };
}

export interface Scribe {
  name: string;
  title: string;
}

export interface Diagnosis {
  diagnosis: string;
  date?: string;
  notes?: string;
}

export interface Procedure {
  procedure: string;
  laterality?: string;
  date?: string;
  notes?: string;
}

export interface FamilyHistoryItem {
  relation: string;
  condition: string;
  ageAtOnset?: string;
  notes?: string;
}

export interface SocialHistory {
  tobacco?: string;
  alcohol?: string;
  drugs?: string;
  occupation?: string;
  supportSystem?: string;
  other?: string;
}

export interface Allergy {
  allergen: string;
  reaction?: string;
}

export interface Medication {
  name: string;
  dose?: string;
  frequency?: string;
}

export interface ReviewOfSystems {
  general?: string;
  constitutional?: string;
  cardiovascular?: string;
  respiratory?: string;
  gastrointestinal?: string;
  genitourinary?: string;
  musculoskeletal?: string;
  skin?: string;
  neurologic?: string;
  psychiatric?: string;
  endocrine?: string;
  hematologic?: string;
  allergicImmunologic?: string;
  other?: string;
}

export interface Vitals {
  bloodPressure?: string;
  bloodPressureLocation?: string;
  bloodPressurePosition?: string;
  heartRate?: string;
  respiratoryRate?: string;
  temperature?: string;
  oxygenSaturation?: string;
  height?: string;
  weight?: string;
  bmi?: string;
}

export interface PhysicalExam {
  vitals?: Vitals;
  constitutional?: string;
  eyes?: string;
  enmt?: string;
  neck?: string;
  cardiovascular?: string;
  respiratory?: string;
  gastrointestinal?: string;
  extremities?: string;
  skin?: string;
  neurologic?: string;
  psychiatric?: string;
}

export interface LabResult {
  date: string;
  results: string;
}

export interface ImagingResult {
  type: string;
  date: string;
  findings: string;
}

export interface EKGResult {
  date: string;
  findings: string;
}

export interface OtherDiagnostic {
  type: string;
  date: string;
  findings: string;
}

export interface Diagnostics {
  labs?: LabResult[];
  imaging?: ImagingResult[];
  ekg?: EKGResult[];
  other?: OtherDiagnostic[];
}

export interface PlanItem {
  problem?: string;
  details: string;
}

export interface Attestation {
  scribeAttestation?: {
    text: string;
    signedBy: string;
    signedAt: string;
  };
  providerAttestation?: {
    text: string;
    signedBy: string;
    signedAt: string;
  };
  cosignedBy?: {
    name: string;
    signedAt: string;
  };
}

export interface ProgressNote {
  _id: string;
  patientId: string;
  encounterId?: string;
  encounterDate: string;
  noteType: string;
  status: "draft" | "signed" | "cosigned";

  provider: Provider;
  scribe?: Scribe;
  referringProvider?: string;
  cardiologist?: string;

  historyOfPresentIllness: string;
  pastMedicalHistory?: Diagnosis[];
  pastSurgicalHistory?: Procedure[];
  familyHistory?: FamilyHistoryItem[];
  socialHistory?: SocialHistory;
  allergies?: Allergy[];
  currentMedications?: Medication[];
  reviewOfSystems?: ReviewOfSystems;
  physicalExam: PhysicalExam;
  diagnostics?: Diagnostics;
  assessment: string;
  plan: PlanItem[];

  ordersPlaced?: string[];
  visitDiagnoses?: string[];
  medicationChanges?: string[];

  attestation?: Attestation;

  createdAt: string;
  updatedAt: string;
}

// Helper to calculate age from DOB
export function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Helper to format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}
