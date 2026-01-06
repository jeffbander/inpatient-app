"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CopyButton } from "./CopyButton";

const NOTE_TYPE_LABELS: Record<string, string> = {
  progress: "Progress Note",
  hp: "H&P",
  consult: "Consult Note",
  discharge: "Discharge Summary",
};

const NOTE_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "progress", label: "Progress Note" },
  { value: "hp", label: "H&P" },
  { value: "consult", label: "Consult Note" },
  { value: "discharge", label: "Discharge Summary" },
];

interface NoteHistoryProps {
  onLoadNote?: (content: string) => void;
}

export function NoteHistory({ onLoadNote }: NoteHistoryProps) {
  const notes = useQuery(api.notes.getNotes);
  const deleteNote = useMutation(api.notes.deleteNote);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");

  const filteredNotes = useMemo(() => {
    if (!notes) return [];

    return notes.filter((note) => {
      const matchesSearch = searchQuery === "" ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "" || note.noteType === filterType;
      return matchesSearch && matchesType;
    });
  }, [notes, searchQuery, filterType]);

  const handleDelete = async (noteId: Id<"notes">) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    setDeletingId(noteId);
    try {
      await deleteNote({ noteId });
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const truncate = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  if (!notes) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Note History</h2>
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Note History</h2>
        <p className="text-gray-500 text-sm">No saved notes yet. Generate and save a note to see it here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Note History</h2>
        <span className="text-sm text-gray-500">
          {filteredNotes.length === notes.length
            ? `${notes.length} note${notes.length === 1 ? "" : "s"}`
            : `${filteredNotes.length} of ${notes.length} notes`}
        </span>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
          >
            {NOTE_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <p className="text-gray-500 text-sm py-4 text-center">
          No notes match your search criteria.
        </p>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {filteredNotes.map((note) => (
          <div
            key={note._id}
            className="border border-gray-200 rounded-md p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                  {NOTE_TYPE_LABELS[note.noteType]}
                </span>
                <span className="ml-2 text-xs text-gray-500">
                  {formatDate(note.createdAt)}
                </span>
              </div>
              <div className="flex gap-2">
                <CopyButton text={note.content} className="text-xs py-1 px-2" />
                <button
                  onClick={() => handleDelete(note._id)}
                  disabled={deletingId === note._id}
                  className="px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded disabled:opacity-50"
                >
                  {deletingId === note._id ? "..." : "Delete"}
                </button>
              </div>
            </div>

            {expandedId === note._id ? (
              <>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded mt-2 max-h-64 overflow-y-auto">
                  {note.content}
                </pre>
                <button
                  onClick={() => setExpandedId(null)}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  Collapse
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 mt-2">
                  {truncate(note.content, 150)}
                </p>
                <button
                  onClick={() => setExpandedId(note._id)}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  Expand
                </button>
              </>
            )}

            {onLoadNote && (
              <button
                onClick={() => onLoadNote(note.content)}
                className="mt-2 ml-2 text-xs text-blue-600 hover:text-blue-700"
              >
                Load into editor
              </button>
            )}
          </div>
        ))}
        </div>
      )}
    </div>
  );
}
