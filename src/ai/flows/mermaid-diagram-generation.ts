'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating Mermaid code from a natural language description.
 *
 * - generateMermaidDiagram - A function that takes a natural language description and generates Mermaid code.
 * - GenerateMermaidDiagramInput - The input type for the generateMermaidDiagram function.
 * - GenerateMermaidDiagramOutput - The return type for the generateMermaidDiagram function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMermaidDiagramInputSchema = z.object({
  description: z
    .string()
    .describe('A natural language description of the diagram to generate.'),
});
export type GenerateMermaidDiagramInput = z.infer<typeof GenerateMermaidDiagramInputSchema>;

const GenerateMermaidDiagramOutputSchema = z.object({
  mermaidCode: z
    .string()
    .describe('The Mermaid code generated from the natural language description.'),
});
export type GenerateMermaidDiagramOutput = z.infer<typeof GenerateMermaidDiagramOutputSchema>;

export async function generateMermaidDiagram(
  input: GenerateMermaidDiagramInput
): Promise<GenerateMermaidDiagramOutput> {
  return generateMermaidDiagramFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMermaidDiagramPrompt',
  input: {schema: GenerateMermaidDiagramInputSchema},
  output: {schema: GenerateMermaidDiagramOutputSchema},
  prompt: `You are an expert in generating Mermaid code.  Given the following natural language description, generate the corresponding Mermaid code.  The code should be syntactically correct and follow best practices for Mermaid diagrams.\n\nDescription: {{{description}}}`,
});

const generateMermaidDiagramFlow = ai.defineFlow(
  {
    name: 'generateMermaidDiagramFlow',
    inputSchema: GenerateMermaidDiagramInputSchema,
    outputSchema: GenerateMermaidDiagramOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
