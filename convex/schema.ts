import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  patients: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.string(),
    mrn: v.string(),
    gender: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    primaryCareProvider: v.optional(v.string()),
  }).index("by_mrn", ["mrn"]),

  progressNotes: defineTable({
    patientId: v.id("patients"),
    encounterId: v.optional(v.string()),
    encounterDate: v.string(),
    noteType: v.string(), // "Cardiology Ambulatory", "Electrophysiology Office Visit", etc.
    status: v.string(), // "draft", "signed", "cosigned"

    // Provider info
    provider: v.object({
      name: v.string(),
      title: v.string(),
      specialty: v.string(),
      credentials: v.optional(v.string()),
      contactInfo: v.optional(v.object({
        phone: v.optional(v.string()),
        fax: v.optional(v.string()),
        email: v.optional(v.string()),
      })),
    }),
    scribe: v.optional(v.object({
      name: v.string(),
      title: v.string(),
    })),
    referringProvider: v.optional(v.string()),
    cardiologist: v.optional(v.string()),

    // Clinical content
    historyOfPresentIllness: v.string(),

    pastMedicalHistory: v.optional(v.array(v.object({
      diagnosis: v.string(),
      date: v.optional(v.string()),
      notes: v.optional(v.string()),
    }))),

    pastSurgicalHistory: v.optional(v.array(v.object({
      procedure: v.string(),
      laterality: v.optional(v.string()),
      date: v.optional(v.string()),
      notes: v.optional(v.string()),
    }))),

    familyHistory: v.optional(v.array(v.object({
      relation: v.string(),
      condition: v.string(),
      ageAtOnset: v.optional(v.string()),
      notes: v.optional(v.string()),
    }))),

    socialHistory: v.optional(v.object({
      tobacco: v.optional(v.string()),
      alcohol: v.optional(v.string()),
      drugs: v.optional(v.string()),
      occupation: v.optional(v.string()),
      supportSystem: v.optional(v.string()),
      other: v.optional(v.string()),
    })),

    allergies: v.optional(v.array(v.object({
      allergen: v.string(),
      reaction: v.optional(v.string()),
    }))),

    currentMedications: v.optional(v.array(v.object({
      name: v.string(),
      dose: v.optional(v.string()),
      frequency: v.optional(v.string()),
    }))),

    reviewOfSystems: v.optional(v.object({
      general: v.optional(v.string()),
      constitutional: v.optional(v.string()),
      cardiovascular: v.optional(v.string()),
      respiratory: v.optional(v.string()),
      gastrointestinal: v.optional(v.string()),
      genitourinary: v.optional(v.string()),
      musculoskeletal: v.optional(v.string()),
      skin: v.optional(v.string()),
      neurologic: v.optional(v.string()),
      psychiatric: v.optional(v.string()),
      endocrine: v.optional(v.string()),
      hematologic: v.optional(v.string()),
      allergicImmunologic: v.optional(v.string()),
      other: v.optional(v.string()),
    })),

    physicalExam: v.object({
      vitals: v.optional(v.object({
        bloodPressure: v.optional(v.string()),
        bloodPressureLocation: v.optional(v.string()),
        bloodPressurePosition: v.optional(v.string()),
        heartRate: v.optional(v.string()),
        respiratoryRate: v.optional(v.string()),
        temperature: v.optional(v.string()),
        oxygenSaturation: v.optional(v.string()),
        height: v.optional(v.string()),
        weight: v.optional(v.string()),
        bmi: v.optional(v.string()),
      })),
      constitutional: v.optional(v.string()),
      eyes: v.optional(v.string()),
      enmt: v.optional(v.string()),
      neck: v.optional(v.string()),
      cardiovascular: v.optional(v.string()),
      respiratory: v.optional(v.string()),
      gastrointestinal: v.optional(v.string()),
      extremities: v.optional(v.string()),
      skin: v.optional(v.string()),
      neurologic: v.optional(v.string()),
      psychiatric: v.optional(v.string()),
    }),

    diagnostics: v.optional(v.object({
      labs: v.optional(v.array(v.object({
        date: v.string(),
        results: v.string(),
      }))),
      imaging: v.optional(v.array(v.object({
        type: v.string(),
        date: v.string(),
        findings: v.string(),
      }))),
      ekg: v.optional(v.array(v.object({
        date: v.string(),
        findings: v.string(),
      }))),
      other: v.optional(v.array(v.object({
        type: v.string(),
        date: v.string(),
        findings: v.string(),
      }))),
    })),

    assessment: v.string(),

    plan: v.array(v.object({
      problem: v.optional(v.string()),
      details: v.string(),
    })),

    // Orders and diagnoses
    ordersPlaced: v.optional(v.array(v.string())),
    visitDiagnoses: v.optional(v.array(v.string())),
    medicationChanges: v.optional(v.array(v.string())),

    // Attestation
    attestation: v.optional(v.object({
      scribeAttestation: v.optional(v.object({
        text: v.string(),
        signedBy: v.string(),
        signedAt: v.string(),
      })),
      providerAttestation: v.optional(v.object({
        text: v.string(),
        signedBy: v.string(),
        signedAt: v.string(),
      })),
      cosignedBy: v.optional(v.object({
        name: v.string(),
        signedAt: v.string(),
      })),
    })),

    // Metadata
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_patient", ["patientId"])
    .index("by_encounter_date", ["encounterDate"])
    .index("by_status", ["status"]),
});
