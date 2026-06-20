'use server';
/**
 * @fileOverview A Genkit flow for generating personalized follow-up messages or conversation starters.
 *
 * - generateFollowUpMessage - A function that handles the message generation process.
 * - GenerateFollowUpMessageInput - The input type for the generateFollowUpMessage function.
 * - GenerateFollowUpMessageOutput - The return type for the generateFollowUpMessage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateFollowUpMessageInputSchema = z.object({
  leadName: z.string().describe("The name of the lead to personalize the message."),
  niche: z.string().describe("The niche of the lead (e.g., 'e-commerce', 'real estate')."),
  serviceOffered: z.string().describe("The service being offered to the lead (e.g., 'digital marketing', 'lead generation')."),
  interactionHistory: z.string().describe("A summary or log of past interactions with the lead, including previous messages sent and their responses."),
});
export type GenerateFollowUpMessageInput = z.infer<typeof GenerateFollowUpMessageInputSchema>;

const GenerateFollowUpMessageOutputSchema = z.object({
  message: z.string().describe("A personalized follow-up message or conversation starter."),
});
export type GenerateFollowUpMessageOutput = z.infer<typeof GenerateFollowUpMessageOutputSchema>;

export async function generateFollowUpMessage(input: GenerateFollowUpMessageInput): Promise<GenerateFollowUpMessageOutput> {
  return generateFollowUpMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFollowUpMessagePrompt',
  input: { schema: GenerateFollowUpMessageInputSchema },
  output: { schema: GenerateFollowUpMessageOutputSchema },
  prompt: `You are an AI assistant specialized in crafting personalized and effective follow-up messages for sales outreach.
Your goal is to generate a concise and engaging follow-up message or conversation starter for a lead, considering their specific niche, the service offered, and any previous interactions.

Use the following information to tailor your message:

Lead Name: {{{leadName}}}
Lead Niche: {{{niche}}}
Service Offered: {{{serviceOffered}}}
Interaction History: {{{interactionHistory}}}

Craft a message that:
1. References the lead's niche and how the service is relevant to them.
2. Acknowledges any previous interaction or lack thereof.
3. Is friendly, professional, and encourages a response.
4. Avoids being overly salesy and focuses on providing value or opening a dialogue.

Generate only the message. Do not include any other text or greetings outside the message itself.`,
});

const generateFollowUpMessageFlow = ai.defineFlow(
  {
    name: 'generateFollowUpMessageFlow',
    inputSchema: GenerateFollowUpMessageInputSchema,
    outputSchema: GenerateFollowUpMessageOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
