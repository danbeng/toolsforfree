import type { Tool } from '../data/tools';

export interface ToolLabels {
  name: string;
  shortDescription: string;
}

export function toolLabels(
  tools: Record<string, { name: string; shortDescription: string }>,
  tool: Tool,
): ToolLabels {
  const entry = tools[tool.slug];
  if (entry) {
    return { name: entry.name, shortDescription: entry.shortDescription };
  }
  return { name: tool.name, shortDescription: tool.shortDescription };
}
