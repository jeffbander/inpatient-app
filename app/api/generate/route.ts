import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";

const NOTE_TYPE_PROMPTS: Record<string, string> = {
  progress: `Generate a detailed Progress Note in the following format. Use the exact section headers and structure shown below. Leave sections blank or write "Not documented" if data is not available.

---
**Office Visit**
[Date of Visit]
[Location/Clinic Name]

[Provider Name, Credentials]
[SPECIALTY]    [Primary Diagnosis] +[number] more
Dx    [Visit Type]; Referred by [Referring Provider]
Reason for Visit

---

**Progress Notes**
[Provider Name, Credentials] (Physician) • [SPECIALTY]

[Practice/Hospital Name]

Department of [Specialty]
[Address Line 1]
[City, State ZIP]
Dept Phone: [Phone Number]
[Unit/Location Info]

---

PATIENT:    [Patient Full Name]
MR NO:    [Medical Record Number]
DATE OF BIRTH:    [DOB]
DATE OF VISIT:    [Visit Date]

---

**SUBJECTIVE**

[Patient Name] is a [age] y.o. [gender]

Who presents for [reason for visit]:

PCP: [PCP Name]
Referring provider: [Referring Provider Name and Specialty]

[Previous Visit Date]:
Imp:
[Previous impressions/diagnoses]

Plan:
[Previous plan items]

HPI:
[Chronological HPI entries with dates, formatted as:]
[Date]: [location/context], [clinical narrative]

---

**Past Medical History**

Past Medical History:
| Diagnosis | Date |
|-----------|------|
[List each diagnosis with date]

---

**Allergies**

Allergies:
| Allergen | Reactions |
|----------|-----------|
[List each allergy with reaction]

---

**ROS:**
Pertinent: [relevant review of systems findings, or "see above" if covered in HPI]

---

**Current Medications**

Current Outpatient Medications:
[List each medication with dose, instructions, dispense quantity, and refills]

---

**OBJECTIVE**

**Vitals**

Vitals:
| Parameter | Value |
|-----------|-------|
| BP: | [value] |
| Pulse: | [value] |
| SpO2: | [value] |
| Weight: | [value] |
| Height: | [value] |

**Physical Exam:**
General: [findings]
Neck: [findings]
Heart: [findings]
Lungs: [findings]
Abd: [findings]
Extremities: [findings]

**EKG:** [Date]: [findings]

**Reviewed Cardiac Imaging:**

ECHO date: [Date]
[Echo findings and conclusions]

STRESS date: [Date or blank]
[Stress test findings if available]

CATH date: [Date or blank]
[Cath findings if available]

CCTA date: [Date or blank]
[CCTA findings and conclusions if available]

CMRI date: [Date or blank]
[Cardiac MRI findings if available]

Labs reviewed date: [Date or blank]
[Relevant lab findings]

---

**ASSESSMENT/PLAN**

[Numbered problem list:]
1. [Diagnosis 1]
2. [Diagnosis 2]
3. [Diagnosis 3]
[etc.]

[Brief management summary for medications to continue]

---

**PLAN**

Orders Placed: [List orders or "None" or "No orders of the defined types were placed in this encounter."]

[Numbered problem list repeated with specific plans:]
1. [Diagnosis 1]
2. [Diagnosis 2]
[etc.]

[Detailed plan narrative including:]
- Imaging/test interpretations
- Medication changes
- Specialist referrals
- Lifestyle recommendations
- Follow-up timing

[Provider Name, Credentials]

---

**MDM:**

3rd party Present and providing pertinent history: [Yes/No]

New Illness:
1. [New problems if any]

Chronic illness:
1. [Chronic problems being managed]

Notes reviewed:
PCP outside of my practice: [Yes/No, details]

Tests reviewed: (see above)

Discussion of tests and plan with:
[Patient/Family member]

---

**Instructions**

Return in about [timeframe] (around [approximate date]).

---

**Additional Documentation**

Vitals: [Summary of vitals with all parameters]

Visit Diagnoses:
[List of diagnoses for this visit]

Problem List:
[Active problem list]`,

  hp: `Generate a Pre-Procedural History and Physical (H&P) for Admission with the following structure and sections:

**PATIENT DEMOGRAPHICS:**
- Patient Name, DOB, Age
- Medical Record Number
- Admission Date
- Admitted Via (e.g., Ambulatory, ED, Transfer)
- Information Source
- Outpatient PCP

**SUBJECTIVE/OBJECTIVE:**

**Chief Complaint:** (brief statement of presenting problem)

**History of Present Illness:** (detailed narrative including relevant history, timeline, prior interventions, current presentation)

**Past Medical History:**
(bulleted list of diagnoses including):
- Cardiac conditions (angina, afib, CHF, etc.)
- Chronic conditions (diabetes, hypertension, etc.)
- Prior procedures/surgeries related to current condition

**Past Surgical History:**
(list procedures with laterality if applicable):
- Procedure name | Laterality | Date

**Social History:**
- Marital status
- Tobacco Use: Smoking status, Smokeless tobacco
- Alcohol use
- Drug use
- Occupational History

**Social Drivers of Health:**
- Housing Stability
- Food Insecurity
- Transportation Needs
- Financial Resource Strain

**Family History:**
(table format: Problem | Relation | Age of Onset)
- Cardiac Disease
- Other relevant conditions

**Immunization Hx:** (Known/Unknown)

**Allergies:**
(Allergen | Reaction)

**Medications at Home or Prior to Hospitalization:**
(list home medications)

**Inpatient Medications:**
(Current Facility-Administered Medications)
- Medication | Dose | Route | Frequency

**Review of Systems:**
All systems were reviewed and found to be negative except as per HPI or specified below:
(document pertinent positives/negatives)

**PHYSICAL EXAM:**

**Vital Signs:**
- BP, Pulse, Resp, Temp, SpO2, Weight, Height

**Constitutional:** (NAD, A&Ox3, etc.)
**HEENT:** (supple, FROM, etc.)
**Cardiovascular:** (RRR, murmurs, etc.)
**Respiratory:** (unlabored, breath sounds, etc.)
**Gastrointestinal:** (soft/non-tender, etc.)
**Extremity:** (strength/sensation, pulses, discoloration, edema)
**Neuro:** (language, cranial nerves, mental status)
**Vascular:** (pulse assessment - femoral, DP, PT signals)

**Labs:**
(Component | Value | Date)
- CBC, BMP, Coagulation studies
- Any relevant specialized labs

**Imaging:**
- Study type and date
- Results and interpretation
- Attending physician review statement if applicable

**ASSESSMENT/PLAN:**

Assessment: (Brief summary - age, sex, presenting with condition, key findings)

Plan:
☐ NPO status
☐ IV access/fluids
☐ Anticoagulation plan
☐ Admit to service
☐ OR planning/procedure scheduling
☐ Other interventions

Discussed with Dr. [Attending Name]`,

  consult: `Generate a Surgery Consult H&P in the following format. Use the exact section headers and structure shown below. Leave sections blank or write "Not documented" if data is not available.

---

**[Provider Name, Credentials]**
[Title/Level]
[Specialty]

Consults: [Consult Type]
Cosign Needed: [Yes/No]

Date of Service: [MM/DD/YY HH:MM]
Creation Time: [MM/DD/YY HH:MM]

---

**Surgery Consult H&P**

---

**Patient:** [Patient Full Name]  **DOB:** [MM/DD/YYYY]
**Medical Record Number:** [MRN]  **Admission Date:** [MM/DD/YYYY]

---

**Reason for Consult:** [Brief reason for surgical consultation]

---

**History of Present Illness:**

[Patient Name] is a [age] y.o. [gender] with PMH [relevant past medical history including cardiac history, prior surgeries with dates], admitted to [service] [admission date] - present for [primary diagnosis].

[Detailed clinical narrative including:
- How patient was admitted/transferred
- Initial workup findings (imaging, labs)
- Hospital course and treatment to date
- Current clinical status
- Relevant symptoms and their progression]

[Physical exam findings relevant to consult - e.g., "Patient evaluated at bedside. Says that she is still having pain that is improved with medication but unmanageable without it. Normal BMs. No nausea currently. Denies fever/chills."]

[Current clinical status summary - e.g., "Afebrile, HR 73, BP 135/72. WBC 4.7(6.8), no left shift. Hgb 10.7. Interval imaging findings."]

---

**Past Medical/Surgical History:**

**Past Medical History:**
| Diagnosis | Date |
|-----------|------|
[List each diagnosis with details and date if available]

Examples:
- Arthritis
- CAD (coronary artery disease) with intervention details
- Chest pain
- Choledocholithiasis (with procedure details) | [Date]
- Constipation
- Hyperlipidemia
- Pre-diabetes

---

**Past Surgical History:**
| Procedure | Laterality | Date |
|-----------|------------|------|
[List each surgical procedure with laterality and date]

Examples:
- APPENDECTOMY
- ERCP
- ERCP, INSERT STENT, BILIARY/PANC
- HX CARDIAC STENT PLACEMENT
- TONSILLECTOMY, PRIMARY OR SECONDARY; AGE 12 OR OVER
- US EXTREMITY VEIN STUDY COMP B

---

**Vitals:**

| Parameter | [Date/Time 1] | [Date/Time 2] | [Date/Time 3] | [Date/Time 4] |
|-----------|---------------|---------------|---------------|---------------|
| BP: | [value] | [value] | [value] | [value] |
| Pulse: | [value] | [value] | [value] | [value] |
| Resp: | [value] | [value] | [value] | [value] |
| Temp: | [value] °C (°F) | [value] °C (°F) | [value] °C (°F) | [value] °C (°F) |
| TempSrc: | [Oral/Tympanic] | [Oral/Tympanic] | [Oral/Tympanic] | [Oral/Tympanic] |
| SpO2: | [value]% | [value]% | [value]% | [value]% |
| Weight: | [value] | | | |
| Height: | [value] | | | |

---

**Physical Exam:**

Gen: [General appearance - e.g., NAD (No Acute Distress)]
Pulm: [Pulmonary exam - e.g., breathing comfortably on room air]
Abd: [Abdominal exam - e.g., soft, non distended, TTP diffusely but more acutely in LLQ and RLQ w/ guarding]
Extremities: [Extremity exam - e.g., WWP, moving all extremities]

---

**Input and Output 12Hrs Interval:**

| Date | [Date Range 1] | [Date Range 2] |
|------|----------------|----------------|
| Shift | 0700-1859 | 1900-0659 | 24 Hour Total | 0700-1859 | 1900-0659 | 24 Hour Total |
| **INTAKE** |
| Shift Total (mL/kg) | | | | | | |
| **OUTPUT** |
| Drains | [value] | [value] | | [value] | [value] | |
| Shift Total (mL/kg) | [value] | [value] | | [value] | [value] | |
| **Weight (kg)** | [value] | [value] | | [value] | [value] | |

---

**Laboratory Results Last 24Hrs:**

**BMP (Last 24 hrs):**
| Labs (Last 24 hrs) | [Date/Time] |
|--------------------|-------------|
| GLUCOSE | [value] |
| NA | [value] |
| K | [value] |
| CHLOR | [value] |
| CO2 | [value] |
| BUN | [value] |
| CA | [value] |
| CREAT | [value] |

**CBC (Last 24 hrs):**
| Labs (Last 24 hrs) | [Date/Time] |
|--------------------|-------------|
| WBC | [value] |
| RBC | [value] |
| HGB | [value] |
| HEMATOCRIT | [value] |
| MCV | [value] |
| MCHC | [value] |
| MCHGB | [value] |
| RDW | [value] |
| PLTS | [value] |
| MPV | [value] |

---

**Assessment and Plan:**

[Patient Name] is a [age] y.o. [gender] with PMHx [relevant history], admitted to [service] for [diagnosis].

[Clinical assessment summary - e.g., "Improvement of diverticulitis on interval imaging with resolution of mesenteric free air. However, clinical exam inconsistent with improvement with imaging findings."]

**Recommendations:**
- [Recommendation 1 - e.g., Inc to 2g CTX]
- [Recommendation 2 - e.g., Change flagyl frequency to q8]
- [Recommendation 3 - e.g., Pain/nausea control PRN]
- [Recommendation 4 - e.g., Rest of management per primary team]
- [Recommendation 5 - e.g., Surgery Team IV to follow]

---

Discussed with surgical attending, Dr. [Attending Name].

[Provider Name, Credentials]
[Title - e.g., PGY-2], [Specialty - e.g., Surgery]`,

  discharge: `Generate a Discharge Summary in the following format. Use the exact section headers and structure shown below. Leave sections blank or write "N/A" if data is not available.

---

**Discharge Summary**

**Admitting diagnosis:** [Primary reason for admission]
**Discharge diagnosis:** [Final diagnosis at discharge]
**PCP:** [Primary Care Physician name]
**Code Status:** [FULL CODE / DNR / DNI / etc.]

**Date of Admission:** [MM/DD/YYYY]
**Date of Discharge:** [MM/DD/YYYY]

---

**Chief Complaint:** [Brief presenting complaint]

---

**History of Present Illness:**

[Patient Name] is a [age] [gender] w/PMHx significant for [relevant past medical history] who presented to [hospital/facility] on [date] with [presenting symptoms/complaint].

[Detailed narrative of the presenting illness, including:
- Onset and progression of symptoms
- Associated symptoms
- Relevant prior interventions or treatments
- What prompted the current presentation]

[Include pertinent negatives - e.g., "Otherwise denies fevers, chills, diarrhea, constipation, urinary sx, leg pain and swelling."]

---

**ED Events**
On triage in ED: BP [value] | HR [value] | RR [value] | Temp [value] | SpO2 [value]% on [room air/supplemental O2]

Basic labs notable for:
- CBC: WBC [value], Hgb [value], Plt [value]
- BMP: Na [value], K [value], Cl [value], CO2 [value], BUN [value], Cr [value], Glucose [value]
- HFP: Albumin [value], AST [value], ALT [value], T. Bilirubin [value], Alk phos [value]
- Coags: PT [value], PTT [value]
- VBG: pH [value], pCO2 [value]
- Lipase [value]
- HS-trop [value]

EKG
- [EKG findings - rhythm, rate, notable abnormalities]

Imaging
- [Imaging studies performed in ED with key findings]

[Medications/interventions given in ED]

---

**Hospital Course by Service:**

**[Unit/Service] Course ([Date range]):**
[Detailed narrative of patient's course on this service, including:
- Consultations obtained
- Procedures performed
- Treatment initiated
- Response to treatment
- Complications encountered]

**[Additional Service] Course ([Date range]):**
[Continue with additional services as applicable, documenting:
- Assessments made at bedside
- Changes in clinical status
- Diagnostic workup results
- Treatment modifications
- Progress toward discharge readiness]

[Include relevant clinical decision-making, e.g., "From a surgical perspective, patient is recovering well. Wounds look much improved with imaging showing resolution of the subcutaneous collections."]

[Document functional status assessment if applicable - PT/OT evaluations, mobility, safety for discharge]

---

**Discharge Exam:**
BP [value] (BP Location: [location]) | Pulse [value] | Temp [value] °C ([value] °F) ([method]) | Resp [value] | Ht [value] ([value]) | Wt [value] kg ([value] lb) | SpO2 [value]% | BMI [value] kg/m²

General: [findings - e.g., No acute distress]
Head/eyes/nose/throat: [findings - e.g., Oropharynx moist, no lesions]
Neck: [findings - e.g., Supple, Trachea midline]
CV: [findings - e.g., S1, S2. Regular. No murmurs, gallops, or rubs]
Respiratory: [findings - e.g., Lungs clear to auscultation bilaterally]
Abdomen: [findings - e.g., Positive bowel sounds, soft, TTP throughout]
Extremities: [findings - e.g., No LE edema. No asymmetry]
Psych: [findings - e.g., Normal affect]

---

**Complications:** [List complications or "N/A"]

---

**Procedures:** [List procedures with dates - e.g., "I&D 12/19, 12/22" or "N/A"]

---

**Condition upon Discharge:** [Stable / Improved / Guarded / etc.]

---

**Discharge Medications:**
[List all discharge medications with dose, route, frequency, and any changes from admission medications. Indicate NEW, CHANGED, or DISCONTINUED medications]

---

**Discharge Instructions:**
[Patient-specific discharge instructions including:
- Activity restrictions
- Diet modifications
- Wound care instructions if applicable
- Warning signs to return to ED
- Medication instructions]

---

**Follow-up Appointments:**
[List follow-up appointments with specialty, provider name if known, and timeframe]

---

**To-Do At Follow-Up Visit:** [Tasks for outpatient follow-up - e.g., "f/u surgeon", "repeat labs"]

---

**Unresulted Tests/Studies:** [List any pending results or "N/A"]`,

  icu_tracker: `You are a clinical operations analyst reviewing cardiac ICU patient data. Analyze all available documentation and produce a structured census summary optimized for bed management and resource planning.

### Input Data Types You May Receive:
- Progress notes (attending, fellow, NP/PA, nursing)
- H&P (History & Physical)
- Procedure notes
- Consult notes
- Active medication list / MAR
- Vital signs / flowsheet data
- Lab results
- Imaging reports
- Device/equipment status

---

### For Each Patient, Extract and Summarize:

#### 1. ADMISSION REASON (1-2 sentences)
- Primary cardiac diagnosis driving ICU admission
- Key precipitating event (e.g., STEMI s/p PCI, cardiogenic shock, post-op CABG)

#### 2. CURRENT ICU-LEVEL CARE REQUIREMENTS
Identify ALL that apply:

**Mechanical Circulatory Support:**
- [ ] VA-ECMO
- [ ] VV-ECMO
- [ ] IABP (Intra-aortic balloon pump)
- [ ] Impella (specify: CP, 5.0, 5.5, RP)
- [ ] LVAD (temporary or durable)
- [ ] Other MCS: ___________

**Vasoactive Infusions:**
- [ ] Vasopressors (list: norepinephrine, vasopressin, phenylephrine, epinephrine, dopamine)
- [ ] Inotropes (list: dobutamine, milrinone, epinephrine)
- [ ] Vasodilators (nitroglycerin, nitroprusside)
- Specify current doses if available

**Respiratory Support:**
- [ ] Mechanical ventilation (mode, FiO2, PEEP)
- [ ] BiPAP/CPAP
- [ ] High-flow nasal cannula
- [ ] Standard O2 (NC, face mask)
- [ ] Room air

**Cardiac Monitoring/Devices:**
- [ ] Continuous telemetry with active arrhythmia management
- [ ] Temporary pacemaker (transvenous, epicardial)
- [ ] Swan-Ganz/PA catheter with active hemodynamic monitoring
- [ ] Arterial line
- [ ] Post-arrest care / TTM (targeted temperature management)

**Renal Support:**
- [ ] CRRT (continuous renal replacement therapy)
- [ ] Intermittent HD
- [ ] No renal support

**Other ICU Requirements:**
- [ ] Q1h neuro checks
- [ ] Active bleeding / massive transfusion
- [ ] Chest tubes with active drainage
- [ ] Open chest / delayed sternal closure
- [ ] High-risk arrhythmia monitoring (e.g., recurrent VT/VF)

#### 3. PENDING PROCEDURES / INTERVENTIONS
- Awaiting cardiac cath? (diagnostic vs. intervention)
- Awaiting cardiac surgery? (specify: CABG, valve, transplant, VAD implant)
- Awaiting EP procedure? (ablation, device implant)
- Awaiting other procedure? (bronchoscopy, IR, etc.)
- Estimated timing if known

#### 4. BARRIERS TO DOWNGRADE
List specific clinical factors preventing transfer to step-down/telemetry:
- Active drips requiring ICU titration
- Hemodynamic instability
- Respiratory failure / vent dependency
- Device management (MCS, temp pacer)
- High risk for decompensation
- Awaiting urgent procedure
- Neuro status / sedation
- Other: ___________

#### 5. TRAJECTORY ASSESSMENT

**Current Trend:**
- [ ] Improving
- [ ] Stable
- [ ] Worsening
- [ ] Unstable/Fluctuating

**Estimated ICU Length of Stay:**
- [ ] <24 hours
- [ ] 1-2 days
- [ ] 3-5 days
- [ ] 6-14 days
- [ ] >14 days / Prolonged
- [ ] Unable to predict (explain why)

**Downgrade Potential:**
- [ ] Ready now
- [ ] Likely within 24h
- [ ] Likely within 48-72h
- [ ] Not in near future (specify barrier)
- [ ] Goals of care discussion needed

#### 6. ACUITY SCORE (1-5)
Rate overall nursing acuity:
- **1** = Stable, minimal interventions, ready for downgrade
- **2** = Stable but requires ICU monitoring (drips, devices)
- **3** = Moderately complex, active titrations, frequent assessments
- **4** = High acuity, multiple organ support, 1:1 nursing likely
- **5** = Extremely critical, MCS, unstable, possible 2:1 nursing

#### 7. ONE-LINE SUMMARY
[Diagnosis] | [Key Support] | [Pending] | [Est. ICU Days] | [Downgrade?]

---

### Output Format for Spreadsheet

Generate a table with the following columns:

| Room | MRN | Patient | Age | Admission Dx | Key ICU Needs | Drips | Respiratory | MCS | Pending Procedure | Barriers to Downgrade | Trend | Est ICU Days | Downgrade ETA | Acuity (1-5) | One-Line Summary |
|------|-----|---------|-----|--------------|---------------|-------|-------------|-----|-------------------|----------------------|-------|--------------|---------------|--------------|------------------|

---

### Clinical Reasoning Guidelines

**For LOS Predictions, Consider:**

| Scenario | Typical ICU Course |
|----------|-------------------|
| Uncomplicated STEMI s/p PCI | 1-2 days |
| NSTEMI, stable, awaiting cath | 1-2 days |
| Post-CABG (uncomplicated) | 1-2 days |
| Post-CABG (complicated: bleeding, AFib, resp failure) | 3-7 days |
| Cardiogenic shock on single pressor | 2-5 days |
| Cardiogenic shock on MCS (Impella, IABP) | 5-14+ days |
| VA-ECMO | 7-21+ days, highly variable |
| Post-cardiac arrest / TTM | 3-7 days minimum |
| Acute decompensated HF on inotropes | 3-7 days |
| Pre-transplant / VAD bridge | Weeks to months |
| Post-heart transplant | 7-14 days |
| Post-TAVR (uncomplicated) | 1-2 days |
| Malignant arrhythmia, awaiting ablation/ICD | 2-5 days |

**Red Flags for Prolonged Stay:**
- Multi-organ failure
- Recurrent arrhythmias
- Failure to wean MCS
- Infection/sepsis
- Delirium
- Poor nutrition status
- Goals of care uncertainty
- Social/placement issues

---

### Example Output Row

| Room | MRN | Patient | Age | Admission Dx | Key ICU Needs | Drips | Respiratory | MCS | Pending Procedure | Barriers to Downgrade | Trend | Est ICU Days | Downgrade ETA | Acuity | One-Line |
|------|-----|---------|-----|--------------|---------------|-------|-------------|-----|-------------------|----------------------|-------|--------------|---------------|--------|----------|
| 5A-12 | 123456 | Smith, J | 67 | STEMI s/p PCI to LAD, cardiogenic shock | Hemodynamic monitoring, drip titration | Norepinephrine 0.1 mcg/kg/min, Dobutamine 5 mcg/kg/min | 2L NC | Impella CP | None | On pressors + inotropes, Impella in place | Improving | 3-5 days | 48-72h if weans | 3 | STEMI/shock \\| Impella+drips \\| None \\| 3-5d \\| 48-72h |

---

## Usage Instructions

1. **Input**: Paste or upload patient documentation (progress notes, flowsheets, med lists)
2. **Specify**: Number of patients and any specific focus areas
3. **Output**: Request either detailed analysis per patient OR spreadsheet format

---

## Privacy Reminder
⚠️ Ensure all PHI is handled in compliance with HIPAA. Use within institutional guidelines only.`,
};

const SYSTEM_PROMPT = `You are a clinical documentation assistant helping healthcare providers create structured clinical notes.

Your role is to:
1. Synthesize the provided patient data into a well-organized clinical note
2. Use appropriate medical terminology
3. Maintain a professional, objective tone
4. Include only information that is supported by the provided data
5. Do NOT fabricate or hallucinate any clinical information
6. If information is missing or unclear, indicate this appropriately (e.g., "not documented", "unable to determine from available data")

Important: This is a documentation tool. The output must be reviewed by the healthcare provider before clinical use.`;

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { noteType, patientData } = await request.json();

  if (!noteType || !patientData) {
    return new Response("Missing required fields", { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response("API key not configured", { status: 500 });
  }

  const anthropic = new Anthropic({ apiKey });
  const noteTypePrompt = NOTE_TYPE_PROMPTS[noteType];

  if (!noteTypePrompt) {
    return new Response("Invalid note type", { status: 400 });
  }

  const userPrompt = `${noteTypePrompt}

Based on the following patient data, generate the clinical note:

---
${patientData}
---

Generate the note now:`;

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
