// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview AI-powered Mermaid syntax repair flow.
 *
 * - mermaidSyntaxRepair - A function that repairs syntax errors in Mermaid code.
 * - MermaidSyntaxRepairInput - The input type for the mermaidSyntaxRepair function.
 * - MermaidSyntaxRepairOutput - The return type for the mermaidSyntaxRepair function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MermaidSyntaxRepairInputSchema = z.object({
  mermaidCode: z
    .string()
    .describe('The Mermaid code to be repaired. If the code is valid, the same code is returned.'),
});
export type MermaidSyntaxRepairInput = z.infer<typeof MermaidSyntaxRepairInputSchema>;

const MermaidSyntaxRepairOutputSchema = z.object({
  repairedMermaidCode: z
    .string()
    .describe('The repaired Mermaid code. If no errors were found, the original code is returned.'),
  explanation: z
    .string()
    .optional()
    .describe('Explanation of the changes made, if any.'),
});
export type MermaidSyntaxRepairOutput = z.infer<typeof MermaidSyntaxRepairOutputSchema>;

export async function mermaidSyntaxRepair(input: MermaidSyntaxRepairInput): Promise<MermaidSyntaxRepairOutput> {
  return mermaidSyntaxRepairFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mermaidSyntaxRepairPrompt',
  input: {schema: MermaidSyntaxRepairInputSchema},
  output: {schema: MermaidSyntaxRepairOutputSchema},
  prompt: `You are a helpful AI assistant that specializes in repairing Mermaid code.

  You will receive Mermaid code as input. If the code has syntax errors, you will repair the code and return the repaired code.
  If the code does not have syntax errors, you will return the original code.
  If you repaired any code, provide a brief explanation of the changes you made.

  Mermaid code: {{{mermaidCode}}}`,
});

const mermaidSyntaxRepairFlow = ai.defineFlow(
  {
    name: 'mermaidSyntaxRepairFlow',
    inputSchema: MermaidSyntaxRepairInputSchema,
    outputSchema: MermaidSyntaxRepairOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
