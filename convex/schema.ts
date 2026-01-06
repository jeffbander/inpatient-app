import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  notes: defineTable({
    userId: v.string(),
    noteType: v.union(
      v.literal("progress"),
      v.literal("hp"),
      v.literal("consult"),
      v.literal("discharge")
    ),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "createdAt"]),

  patients: defineTable({
    userId: v.string(),
    service: v.string(),
    patientName: v.string(),
    mrn: v.string(),
    primaryDiagnosis: v.string(),
    clinicalStatus: v.string(),
    dispositionConsiderations: v.string(),
    strikeAction: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "createdAt"]),
});
