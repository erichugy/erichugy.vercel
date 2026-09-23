"use client";

import { SAMPLE_SCHEMAS } from "@/tools/sql-erd";

export interface ExamplePickerProps {
  onLoadExample: (exampleId: string) => void;
}

export default function ExamplePicker({ onLoadExample }: ExamplePickerProps) {
  return (
    <ul className="space-y-2">
      {SAMPLE_SCHEMAS.map((example) => (
        <li key={example.id}>
          <button
            type="button"
            onClick={() => onLoadExample(example.id)}
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-left transition-colors hover:border-accent"
          >
            <span className="block font-mono text-[12px] font-semibold text-heading">
              {example.name}
            </span>
            <span className="mt-0.5 block text-[11px] leading-relaxed text-muted">
              {example.description}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
