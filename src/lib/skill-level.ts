export type DisplaySkillLevel = "Новичок" | "Любитель" | "Профессионал";
export type ApiSkillLevel = "Newbie" | "Nonpro" | "Pro";

const displayToApiMap: Record<DisplaySkillLevel, ApiSkillLevel> = {
  "Новичок": "Newbie",
  "Любитель": "Nonpro",
  "Профессионал": "Pro",
};

const apiToDisplayMap: Record<ApiSkillLevel, DisplaySkillLevel> = {
  "Newbie": "Новичок",
  "Nonpro": "Любитель",
  "Pro": "Профессионал",
};

export function toApiSkillLevel(display: string | null): string | null {
  if (!display) return null;
  return displayToApiMap[display as DisplaySkillLevel] ?? display;
}

export function toDisplaySkillLevel(api: string | null): string | null {
  if (!api) return null;
  return apiToDisplayMap[api as ApiSkillLevel] ?? api;
}
