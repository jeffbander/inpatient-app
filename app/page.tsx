"use client";

import { useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { NoteTypeSelector } from "./components/NoteTypeSelector";
import { CopyButton } from "./components/CopyButton";
import { Disclaimer } from "./components/Disclaimer";
import { NoteHistory } from "./components/NoteHistory";
import { TextStats } from "./components/TextStats";

type NoteType = "progress" | "hp" | "consult" | "discharge";

export default function Home() {
  const { user } = useUser();
  const [patientData, setPatientData] = useState("");
  const [noteType, setNoteType] = useState<NoteType>("progress");
  const [generatedNote, setGeneratedNote] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const createNote = useMutation(api.notes.createNote);

  const handleGenerate = async () => {
    if (!patientData.trim()) return;

    setIsGenerating(true);
    setGeneratedNote("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteType, patientData }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate note");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let text = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setGeneratedNote(text);
      }
    } catch (error) {
      console.error("Generation error:", error);
      setGeneratedNote("Error generating note. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedNote.trim()) return;

    setIsSaving(true);
    try {
      await createNote({ noteType, content: generatedNote });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">NoteForge</h1>
            <p className="text-sm text-gray-500">AI-powered clinical documentation</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.emailAddresses[0]?.emailAddress}</span>
            <UserButton />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <Disclaimer />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Patient Data</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note Type
              </label>
              <NoteTypeSelector value={noteType} onChange={setNoteType} />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste patient data (notes, labs, imaging, procedures)
              </label>
              <textarea
                value={patientData}
                onChange={(e) => setPatientData(e.target.value)}
                placeholder="Paste all relevant patient information here..."
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
              />
              <TextStats text={patientData} className="mt-2" />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!patientData.trim() || isGenerating}
              className="w-full py-3 px-4 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? "Generating..." : "Generate Note"}
            </button>
          </div>

          {/* Output Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Generated Note</h2>
              <div className="flex gap-2">
                <CopyButton text={generatedNote} />
                <button
                  onClick={handleSave}
                  disabled={!generatedNote.trim() || isSaving}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    saveSuccess
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  } disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed`}
                >
                  {saveSuccess ? "Saved!" : isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            <textarea
              value={generatedNote}
              onChange={(e) => setGeneratedNote(e.target.value)}
              placeholder={isGenerating ? "Generating note..." : "Generated note will appear here..."}
              className="w-full h-[400px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none font-mono text-sm"
            />
            <TextStats text={generatedNote} className="mt-2" />
          </div>
        </div>

        {/* Note History */}
        <div className="mt-6">
          <NoteHistory onLoadNote={setGeneratedNote} />
        </div>
      </div>
    </main>
  );
}
