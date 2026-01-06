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

  consult: `Generate a Consultation Note with these sections:
- Reason for Consultation
- History of Present Illness
- Relevant Past Medical History
- Current Medications
- Physical Examination Findings
- Relevant Lab/Imaging Results
- Assessment
- Recommendations`,

  discharge: `Generate a Discharge Summary with these sections:
- Admission Date / Discharge Date
- Admitting Diagnosis
- Discharge Diagnosis
- Hospital Course
- Procedures Performed
- Discharge Medications
- Discharge Instructions
- Follow-up Appointments`,
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
