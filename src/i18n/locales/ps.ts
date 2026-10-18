import { production } from "./production";
import { reportDashboard } from "./reportDashboard";
import { payments } from "./payments";
import { common } from "./common";
import { calendar } from "./calendar";
import { shops } from "./shops";
import { rent } from "./rent";
import { expenses } from "./expenses";
import { reports } from "./reports";
import { settings } from "./settings";
import { onboarding } from "./onboarding";
import { reference } from "./reference";
import { sampleData } from "./sampleData";

export const ps: Record<string, string> = {
  ...common,
  ...payments,
  ...calendar,
  ...shops,
  ...rent,
  ...expenses,
  ...reports,
  ...reportDashboard,
  ...settings,
  ...onboarding,
  ...reference,
  ...sampleData,
  ...production,
};
