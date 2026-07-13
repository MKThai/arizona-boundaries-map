import type { CanonicalOfficial } from "../types/canonical-official.js";

export interface SourceAdapter {
  source: string;
  description: string;
  fetch(state: string): Promise<CanonicalOfficial[]>;
}
