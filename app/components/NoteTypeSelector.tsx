"use client";

type NoteType = "progress" | "hp" | "consult" | "discharge" | "icu_tracker";

interface NoteTypeSelectorProps {
  value: NoteType;
  onChange: (value: NoteType) => void;
}

const NOTE_TYPES: { value: NoteType; label: string }[] = [
  { value: "progress", label: "Progress Note" },
  { value: "hp", label: "H&P" },
  { value: "consult", label: "Consult Note" },
  { value: "discharge", label: "Discharge Summary" },
  { value: "icu_tracker", label: "ICU Patient Tracker" },
];

export function NoteTypeSelector({ value, onChange }: NoteTypeSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as NoteType)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
    >
      {NOTE_TYPES.map((type) => (
        <option key={type.value} value={type.value}>
          {type.label}
        </option>
      ))}
    </select>
  );
}
