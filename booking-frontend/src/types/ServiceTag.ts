export type ServiceTagType = "CATEGORY" | "LOCATION";
export interface ServiceTag { type: ServiceTagType; value: string; normalizedName?: string; aliases?: string[]; }
export interface TagSuggestion { id: string; name: string; parentCategory?: string; district?: string; state?: string; }
