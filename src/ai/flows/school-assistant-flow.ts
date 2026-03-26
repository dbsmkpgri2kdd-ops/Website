'use server';
/**
 * @fileOverview Asisten Pintar Sekolah berbasis AI.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SchoolAssistantInputSchema = z.object({
  query: z.string().describe('Pertanyaan dari pengguna/orang tua siswa.'),
});
export type SchoolAssistantInput = z.infer<typeof SchoolAssistantInputSchema>;

const SchoolAssistantOutputSchema = z.object({
  answer: z.string().describe('Jawaban asisten AI.'),
});
export type SchoolAssistantOutput = z.infer<typeof SchoolAssistantOutputSchema>;

const schoolInfoTool = ai.defineTool(
  {
    name: 'getSchoolFAQ',
    description: 'Mengambil informasi FAQ sekolah seperti pendaftaran, fasilitas, dan kontak.',
    inputSchema: z.object({ category: z.string() }),
    outputSchema: z.string(),
  },
  async () => {
    return `
      SMKS PGRI 2 KEDONDONG FAQ:
      1. Pendaftaran (PPDB): Dibuka setiap tahun ajaran baru secara online melalui menu PPDB. Syarat: Fotokopi Ijazah, KK, Akta Lahir.
      2. Fasilitas: Lab Komputer TKJ, Bengkel Otomotif, Perpustakaan Digital, Musholla, Lapangan Olahraga.
      3. Jurusan: Teknik Komputer & Jaringan (TKJ), Akuntansi, Multimedia.
      4. Kontak: Jalan Raya Kedondong No. 123, WA: 0812-3456-7890.
      5. Visi: Mencetak lulusan kompeten yang siap kerja dan mandiri.
    `;
  }
);

const prompt = ai.definePrompt({
  name: 'schoolAssistantPrompt',
  input: { schema: SchoolAssistantInputSchema },
  output: { schema: SchoolAssistantOutputSchema },
  tools: [schoolInfoTool],
  prompt: `Anda adalah asisten pintar untuk SMKS PGRI 2 KEDONDONG. 
  Gunakan tool getSchoolFAQ untuk memberikan jawaban yang akurat kepada orang tua siswa.
  
  Gaya bicara: Ramah, profesional, informatif, dan membantu.
  
  Pertanyaan: {{{query}}}`,
});

const assistantFlow = ai.defineFlow(
  {
    name: 'schoolAssistantFlow',
    inputSchema: SchoolAssistantInputSchema,
    outputSchema: SchoolAssistantOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function chatWithSchoolAI(input: SchoolAssistantInput): Promise<SchoolAssistantOutput> {
  return assistantFlow(input);
}