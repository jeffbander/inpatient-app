import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";

const NOTE_TYPE_PROMPTS: Record<string, string> = {
  progress: `Generate a Progress Note in SOAP format:
- Subjective: Patient's reported symptoms, concerns, and history
- Objective: Vital signs, physical exam findings, lab results, imaging
- Assessment: Clinical interpretation and diagnoses
- Plan: Treatment plan, medications, follow-up`,

  hp: `Generate a History and Physical (H&P) note with these sections:
- Chief Complaint
- History of Present Illness (HPI)
- Past Medical History (PMH)
- Medications
- Allergies
- Social History
- Family History
- Review of Systems
- Physical Examination
- Assessment
- Plan`,

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
