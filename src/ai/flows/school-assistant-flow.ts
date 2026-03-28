
'use server';
/**
 * @fileOverview AI Flow untuk asisten pintar sekolah dengan kemampuan tool calling.
 * Mengambil informasi nyata dari database untuk menjawab pertanyaan pengguna.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/firebase';
import { SCHOOL_DATA_ID } from '@/lib/data';

// --- TOOLS DEFINITION ---

const getSchoolProfile = ai.defineTool(
  {
    name: 'getSchoolProfile',
    description: 'Mendapatkan informasi profil sekolah seperti visi, misi, sejarah, alamat, dan kontak.',
    inputSchema: z.object({}),
    outputSchema: z.any(),
  },
  async () => {
    if (!firestore) return { error: 'Database not available' };
    const docRef = doc(firestore, 'schools', SCHOOL_DATA_ID);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : { message: 'Data profil sekolah tidak ditemukan' };
  }
);

const getAvailableMajors = ai.defineTool(
  {
    name: 'getAvailableMajors',
    description: 'Mendapatkan daftar lengkap jurusan atau kompetensi keahlian yang ada di sekolah.',
    inputSchema: z.object({}),
    outputSchema: z.array(z.any()),
  },
  async () => {
    if (!firestore) return [];
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/majors`);
    const snap = await getDocs(query(ref, orderBy('name')));
    return snap.docs.map(d => ({ name: d.data().name, description: d.data().description }));
  }
);

const getLatestNews = ai.defineTool(
  {
    name: 'getLatestNews',
    description: 'Mendapatkan daftar berita atau pengumuman terbaru dari sekolah.',
    inputSchema: z.object({}),
    outputSchema: z.array(z.any()),
  },
  async () => {
    if (!firestore) return [];
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/newsArticles`);
    const snap = await getDocs(query(ref, orderBy('datePublished', 'desc'), limit(5)));
    return snap.docs.map(d => ({ title: d.data().title, category: d.data().category }));
  }
);

// --- FLOW DEFINITION ---

const SchoolAssistantInputSchema = z.object({
  query: z.string().describe('Pertanyaan dari pengguna mengenai sekolah.'),
});
export type SchoolAssistantInput = z.infer<typeof SchoolAssistantInputSchema>;

const SchoolAssistantOutputSchema = z.object({
  answer: z.string().describe('Jawaban yang informatif, ramah, dan akurat berdasarkan data sekolah.'),
});
export type SchoolAssistantOutput = z.infer<typeof SchoolAssistantOutputSchema>;

const prompt = ai.definePrompt({
  name: 'schoolAssistantPrompt',
  input: { schema: SchoolAssistantInputSchema },
  output: { schema: SchoolAssistantOutputSchema },
  tools: [getSchoolProfile, getAvailableMajors, getLatestNews],
  prompt: `Anda adalah SmartSchool Assistant, asisten cerdas resmi dari SMKS PGRI 2 Kedondong.
  
Tugas utama Anda adalah:
1. Memberikan informasi yang SANGAT AKURAT mengenai visi, misi, jurusan, dan berita sekolah.
2. Selalu gunakan tools yang tersedia untuk memastikan jawaban Anda berbasis data nyata (Real-time).
3. Jika ditanya tentang pendaftaran (PPDB), jelaskan bahwa pendaftaran tahun 2025 sudah dibuka dan dapat diakses melalui menu "PPDB Online".
4. Kepribadian Anda: Profesional, hangat, informatif, dan sangat bangga dengan prestasi sekolah.
5. Gunakan Bahasa Indonesia yang sopan dan mudah dipahami.
6. Alamat Sekolah: Kedondong, Pesawaran, Lampung.

Pertanyaan Pengguna: {{{query}}}`,
});

export async function chatWithSchoolAI(input: SchoolAssistantInput): Promise<SchoolAssistantOutput> {
  return schoolAssistantFlow(input);
}

const schoolAssistantFlow = ai.defineFlow(
  {
    name: 'schoolAssistantFlow',
    inputSchema: SchoolAssistantInputSchema,
    outputSchema: SchoolAssistantOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      return output!;
    } catch (error) {
      console.error("AI Assistant Flow Error:", error);
      return { answer: "Mohon maaf, saya sedang melakukan sinkronisasi database. Silakan coba ajukan pertanyaan Anda kembali dalam beberapa saat atau hubungi admin kami." };
    }
  }
);
