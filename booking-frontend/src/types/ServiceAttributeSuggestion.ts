export type ServiceAttributeType = "FACILITY" | "AMENITY";

export interface ServiceAttributeSuggestion {
  id?: string;
  category: string;
  type: ServiceAttributeType;
  name: string;
  normalizedName?: string;
  active?: boolean;
  systemDefined?: boolean;
  approvalStatus?: "APPROVED" | "PENDING" | "REJECTED";
  displayOrder?: number;
}
