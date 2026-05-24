import { z, ZodSchema } from 'zod';

// ============================================
// Base Skill Interface
// ============================================

export interface Skill<TInput, TOutput> {
  name: string;
  description: string;
  inputSchema: ZodSchema<TInput>;
  outputSchema: ZodSchema<TOutput>;
  execute(input: TInput): Promise<TOutput>;
}

export class SkillError extends Error {
  constructor(
    public skillName: string,
    public code: string,
    message: string,
    public cause?: unknown,
  ) {
    super(`[${skillName}] ${code}: ${message}`);
    this.name = 'SkillError';
  }
}
