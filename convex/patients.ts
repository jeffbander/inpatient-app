import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("patients").collect();
  },
});

export const get = query({
  args: { id: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByMRN = query({
  args: { mrn: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("patients")
      .withIndex("by_mrn", (q) => q.eq("mrn", args.mrn))
      .first();
  },
});

export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.string(),
    mrn: v.string(),
    gender: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    primaryCareProvider: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("patients", args);
  },
});
