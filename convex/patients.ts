import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getPatients = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const patients = await ctx.db
      .query("patients")
      .withIndex("by_user_date", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    return patients;
  },
});

export const createPatient = mutation({
  args: {
    service: v.string(),
    patientName: v.string(),
    mrn: v.string(),
    primaryDiagnosis: v.string(),
    clinicalStatus: v.string(),
    dispositionConsiderations: v.string(),
    strikeAction: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    const patientId = await ctx.db.insert("patients", {
      userId: identity.subject,
      service: args.service,
      patientName: args.patientName,
      mrn: args.mrn,
      primaryDiagnosis: args.primaryDiagnosis,
      clinicalStatus: args.clinicalStatus,
      dispositionConsiderations: args.dispositionConsiderations,
      strikeAction: args.strikeAction,
      createdAt: now,
      updatedAt: now,
    });

    return patientId;
  },
});

export const updatePatient = mutation({
  args: {
    patientId: v.id("patients"),
    service: v.string(),
    patientName: v.string(),
    mrn: v.string(),
    primaryDiagnosis: v.string(),
    clinicalStatus: v.string(),
    dispositionConsiderations: v.string(),
    strikeAction: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const patient = await ctx.db.get(args.patientId);
    if (!patient) {
      throw new Error("Patient not found");
    }
    if (patient.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.patientId, {
      service: args.service,
      patientName: args.patientName,
      mrn: args.mrn,
      primaryDiagnosis: args.primaryDiagnosis,
      clinicalStatus: args.clinicalStatus,
      dispositionConsiderations: args.dispositionConsiderations,
      strikeAction: args.strikeAction,
      updatedAt: Date.now(),
    });
  },
});

export const deletePatient = mutation({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const patient = await ctx.db.get(args.patientId);
    if (!patient) {
      throw new Error("Patient not found");
    }
    if (patient.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.patientId);
  },
});
