import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  notes: defineTable({
    userId: v.string(),
    noteType: v.union(
      v.literal("progress"),
      v.literal("hp"),
      v.literal("consult"),
      v.literal("discharge"),
      v.literal("icu_tracker")
    ),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "createdAt"]),
});
