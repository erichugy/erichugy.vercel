export interface ViewportPreset {
  id: string;
  label: string;
  /** null renders at the full width of the stage. */
  width: number | null;
}

export const VIEWPORT_PRESETS: readonly ViewportPreset[] = [
  { id: "mobile", label: "375", width: 375 },
  { id: "tablet", label: "768", width: 768 },
  { id: "laptop", label: "1024", width: 1024 },
  { id: "full", label: "Full", width: null },
];

export const DEFAULT_VIEWPORT_ID = "full";

/** Query keys, so a preview can be linked to directly. */
export const ENTRY_PARAM = "c";
export const VARIANT_PARAM = "v";
