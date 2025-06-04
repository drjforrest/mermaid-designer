'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing Mermaid code completion suggestions.
 *
 * - mermaidCodeCompletion - A function that provides Mermaid code completion suggestions.
 * - MermaidCodeCompletionInput - The input type for the mermaidCodeCompletion function.
 * - MermaidCodeCompletionOutput - The return type for the mermaidCodeCompletion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MermaidCodeCompletionInputSchema = z.object({
  codePrefix: z
    .string()
    .describe('The current code prefix in the editor.'),
});
export type MermaidCodeCompletionInput = z.infer<typeof MermaidCodeCompletionInputSchema>;

const MermaidCodeCompletionOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of Mermaid code suggestions based on the code prefix.'),
});
export type MermaidCodeCompletionOutput = z.infer<typeof MermaidCodeCompletionOutputSchema>;

export async function mermaidCodeCompletion(input: MermaidCodeCompletionInput): Promise<MermaidCodeCompletionOutput> {
  return mermaidCodeCompletionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mermaidCodeCompletionPrompt',
  input: {schema: MermaidCodeCompletionInputSchema},
  output: {schema: MermaidCodeCompletionOutputSchema},
  prompt: `You are an AI-powered code assistant specializing in Mermaid syntax.
  Based on the given code prefix, provide suggestions for completing the Mermaid code.
  Return an array of possible code snippets to complete the Mermaid syntax.

  Code Prefix: {{{codePrefix}}}

  Suggestions:`, // Prompt for generating Mermaid code completion suggestions
});

const mermaidCodeCompletionFlow = ai.defineFlow(
  {
    name: 'mermaidCodeCompletionFlow',
    inputSchema: MermaidCodeCompletionInputSchema,
    outputSchema: MermaidCodeCompletionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
