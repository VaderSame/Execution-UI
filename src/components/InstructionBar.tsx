import React, { useState } from "react";

interface Props {
  onSubmit: (instruction: string) => void;
  disabled?: boolean;
}

export function InstructionBar({ onSubmit, disabled }: Props) {
  const [instruction, setInstruction] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim() || disabled) return;
    onSubmit(instruction);
    setInstruction("");
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-900 border-t border-gray-800 flex-shrink-0">
      <div className="flex space-x-2 max-w-4xl mx-auto">
        <input
          type="text"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="Enter instruction..."
          disabled={disabled}
          className="flex-1 bg-gray-950 border border-gray-800 rounded px-4 py-3 text-gray-100 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !instruction.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-500 text-white font-medium rounded transition-colors"
        >
          Run
        </button>
      </div>
    </form>
  );
}
