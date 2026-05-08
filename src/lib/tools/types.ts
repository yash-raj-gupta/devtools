import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

export type ToolCategory =
  | "Encode / Decode"
  | "Crypto & Hashing"
  | "Generators"
  | "Formatters"
  | "Converters"
  | "Files & Documents"
  | "Text";

export interface ToolDefinition {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  keywords: string[];
  icon: LucideIcon;
  Component: ComponentType;
}
