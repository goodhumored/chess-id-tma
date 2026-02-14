export type DisplaySkillLevel = "новичок" | "любитель" | "профессионал";
export type ApiSkillLevel = "Newbie" | "Nonpro" | "Pro";

const displayToApiMap: Record<DisplaySkillLevel, ApiSkillLevel> = {
  "новичок": "Newbie",
  "любитель": "Nonpro",
  "профессионал": "Pro",
};

const apiToDisplayMap: Record<ApiSkillLevel, DisplaySkillLevel> = {
  "Newbie": "новичок",
  "Nonpro": "любитель",
  "Pro": "профессионал",
};

export function toApiSkillLevel(display: string | null): string | null {
  if (!display) return null;
  return displayToApiMap[display as DisplaySkillLevel] ?? display;
}

export function toDisplaySkillLevel(api: string | null): string | null {
  if (!api) return null;
  return apiToDisplayMap[api as ApiSkillLevel] ?? api;
}
