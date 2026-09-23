import type { Tool } from '../data/tools';

export function toolLabels(
  _tools: Record<string, { name: string; shortDescription: string }>,
  _tool: Tool,
): { name: string; shortDescription: string } {
  throw new Error('not implemented');
}
