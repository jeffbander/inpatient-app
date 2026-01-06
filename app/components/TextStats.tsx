"use client";

interface TextStatsProps {
  text: string;
  className?: string;
}

export function TextStats({ text, className = "" }: TextStatsProps) {
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lineCount = text ? text.split("\n").length : 0;

  return (
    <div className={`flex items-center gap-4 text-xs text-gray-500 ${className}`}>
      <span>
        <span className="font-medium text-gray-700">{wordCount.toLocaleString()}</span> words
      </span>
      <span>
        <span className="font-medium text-gray-700">{charCount.toLocaleString()}</span> chars
      </span>
      <span>
        <span className="font-medium text-gray-700">{lineCount.toLocaleString()}</span> lines
      </span>
    </div>
  );
}
