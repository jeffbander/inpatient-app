import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    patientId: v.optional(v.id("patients")),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let notesQuery = ctx.db.query("progressNotes");

    if (args.patientId) {
      notesQuery = notesQuery.withIndex("by_patient", (q) =>
        q.eq("patientId", args.patientId!)
      );
    }

    const notes = await notesQuery.collect();

    if (args.status) {
      return notes.filter((n) => n.status === args.status);
    }

    return notes;
  },
});

export const get = query({
  args: { id: v.id("progressNotes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getWithPatient = query({
  args: { id: v.id("progressNotes") },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.id);
    if (!note) return null;

    const patient = await ctx.db.get(note.patientId);
    return { note, patient };
  },
});

export const create = mutation({
  args: {
    patientId: v.id("patients"),
    encounterId: v.optional(v.string()),
    encounterDate: v.string(),
    noteType: v.string(),
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
    ordersPlaced: v.optional(v.array(v.string())),
    visitDiagnoses: v.optional(v.array(v.string())),
    medicationChanges: v.optional(v.array(v.string())),
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
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("progressNotes", {
      ...args,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("progressNotes"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: new Date().toISOString(),
    });
  },
});
