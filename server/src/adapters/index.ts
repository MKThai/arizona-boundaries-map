export type { SourceAdapter } from "./types.js";
export { openStatesCsvAdapter } from "./openstates-csv.adapter.js";
export {
  openStatesExecutiveAdapter,
  openStatesMunicipalitiesAdapter,
} from "./openstates-yaml.adapter.js";
export { congressLegislatorsAdapter } from "./congress-legislators.adapter.js";
export { azExecutiveSupplementAdapter } from "./az-executive-supplement.adapter.js";

import type { SourceAdapter } from "./types.js";
import { openStatesCsvAdapter } from "./openstates-csv.adapter.js";
import {
  openStatesExecutiveAdapter,
  openStatesMunicipalitiesAdapter,
} from "./openstates-yaml.adapter.js";
import { congressLegislatorsAdapter } from "./congress-legislators.adapter.js";
import { azExecutiveSupplementAdapter } from "./az-executive-supplement.adapter.js";

/** All adapters run during a state scrape, in order. */
export const STATE_OFFICIAL_ADAPTERS: SourceAdapter[] = [
  congressLegislatorsAdapter,
  openStatesCsvAdapter,
  openStatesExecutiveAdapter,
  azExecutiveSupplementAdapter,
  openStatesMunicipalitiesAdapter,
];
