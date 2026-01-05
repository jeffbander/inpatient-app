"use client";

import { useState } from "react";
import { ProgressNoteDisplay } from "@/components/ProgressNote";
import {
  samplePatient,
  sampleProgressNote,
  samplePatient2,
  sampleProgressNote2,
} from "@/lib/sampleData";

export default function Home() {
  const [selectedNote, setSelectedNote] = useState<1 | 2>(1);
  const [copySuccess, setCopySuccess] = useState(false);

  const currentPatient = selectedNote === 1 ? samplePatient : samplePatient2;
  const currentNote = selectedNote === 1 ? sampleProgressNote : sampleProgressNote2;

  const handleCopy = () => {
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSave = () => {
    alert("Note saved! (Demo only - Convex integration pending)");
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Progress Notes
          </h1>
          <p className="text-gray-600">
            Clinical documentation with proper EMR-style formatting
          </p>
        </div>

        {/* Note selector */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setSelectedNote(1)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedNote === 1
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Cardiology Note - {samplePatient.lastName}
          </button>
          <button
            onClick={() => setSelectedNote(2)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedNote === 2
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            EP Note - {samplePatient2.lastName}
          </button>
        </div>

        {/* Copy success toast */}
        {copySuccess && (
          <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
            Note copied to clipboard!
          </div>
        )}

        {/* Progress Note Display */}
        <ProgressNoteDisplay
          note={currentNote}
          patient={currentPatient}
          onCopy={handleCopy}
          onSave={handleSave}
        />

        {/* Footer info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Demo data based on Mount Sinai cardiology note format.
            <br />
            Connect to Convex backend to persist real patient data.
          </p>
        </div>
      </div>
    </div>
  );
}
