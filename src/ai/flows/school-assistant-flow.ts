
/**
 * @fileOverview AI Flow untuk asisten pintar sekolah.
 * Mock implementation untuk mendukung Static Build.
 */

import { z } from 'zod';

const SchoolAssistantInputSchema = z.object({
  query: z.string(),
});
export type SchoolAssistantInput = z.infer<typeof SchoolAssistantInputSchema>;

const SchoolAssistantOutputSchema = z.object({
  answer: z.string(),
});
export type SchoolAssistantOutput = z.infer<typeof SchoolAssistantOutputSchema>;

export async function chatWithSchoolAI(input: SchoolAssistantInput): Promise<SchoolAssistantOutput> {
  return {
    answer: "Maaf, fitur asisten AI sedang dalam pemeliharaan berkala untuk meningkatkan kualitas jawaban. Silakan hubungi kami via menu kontak."
  };
}
