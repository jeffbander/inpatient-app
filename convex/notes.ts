import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getNotes = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user_date", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    return notes;
  },
});

export const createNote = mutation({
  args: {
    noteType: v.union(
      v.literal("progress"),
      v.literal("hp"),
      v.literal("consult"),
      v.literal("discharge"),
      v.literal("icu_tracker")
    ),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const noteId = await ctx.db.insert("notes", {
      userId: identity.subject,
      noteType: args.noteType,
      content: args.content,
      createdAt: Date.now(),
    });

    return noteId;
  },
});

export const deleteNote = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get(args.noteId);
    if (!note) {
      throw new Error("Note not found");
    }
    if (note.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.noteId);
  },
});
