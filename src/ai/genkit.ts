import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Main Genkit v1.x configuration.
 * Dioptimalkan untuk berjalan di lingkungan Next.js Server.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash',
});
