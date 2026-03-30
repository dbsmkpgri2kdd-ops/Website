/**
 * @fileOverview AI Flow untuk analisis status sekolah bagi administrator.
 * Diadaptasi untuk berjalan di sisi klien guna mendukung Static Export.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '@/firebase';
import { SCHOOL_DATA_ID } from '@/lib/data';

const AdminAnalysisInputSchema = z.object({
  adminName: z.string().describe('Nama administrator yang meminta analisis.'),
});
export type AdminAnalysisInput = z.infer<typeof AdminAnalysisInputSchema>;

const AdminAnalysisOutputSchema = z.object({
  summary: z.string().describe('Ringkasan status sekolah secara naratif.'),
  insights: z.array(z.string()).describe('Daftar poin-poin penting atau saran tindakan.'),
});
export type AdminAnalysisOutput = z.infer<typeof AdminAnalysisOutputSchema>;

const getStats = ai.defineTool(
  {
    name: 'getSchoolStats',
    description: 'Mengambil data statistik mentah dari pendaftaran PPDB dan pesan kontak.',
    inputSchema: z.object({}),
    outputSchema: z.any(),
  },
  async () => {
    if (!firestore) return { error: 'DB error' };
    
    try {
      const ppdbSnap = await getDocs(collection(firestore, `schools/${SCHOOL_DATA_ID}/studentApplications`));
      const msgSnap = await getDocs(collection(firestore, `schools/${SCHOOL_DATA_ID}/contactMessages`));
      const guestSnap = await getDocs(collection(firestore, `schools/${SCHOOL_DATA_ID}/guestbookEntries`));

      return {
        totalPpdb: ppdbSnap.size,
        totalMessages: msgSnap.size,
        totalGuestbook: guestSnap.size,
        recentPpdb: ppdbSnap.docs.slice(0, 3).map(d => d.data().studentName),
      };
    } catch (e) {
      return { error: 'Permission denied or empty' };
    }
  }
);

const prompt = ai.definePrompt({
  name: 'adminAnalysisPrompt',
  input: { schema: AdminAnalysisInputSchema },
  output: { schema: AdminAnalysisOutputSchema },
  tools: [getStats],
  prompt: `Anda adalah asisten cerdas sistem manajemen sekolah ("hPanel Analytics").
  
Tugas Anda adalah memberikan laporan singkat kepada Administrator ({{{adminName}}}) tentang kondisi data di sistem saat ini.

Gunakan tool getSchoolStats untuk mengetahui jumlah pendaftaran dan interaksi terkini.

Berikan analisis yang:
1. Profesional dan memberikan semangat.
2. Menyebutkan jumlah pendaftar PPDB jika ada.
3. Memberikan 2-3 poin saran tindakan.

Pastikan output sesuai dengan skema JSON yang diminta.`,
});

export async function generateAdminAnalysis(input: AdminAnalysisInput): Promise<AdminAnalysisOutput> {
  try {
    const { output } = await prompt(input);
    return output!;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      summary: "Sistem AI sedang melakukan sinkronisasi database.",
      insights: ["Silakan periksa data pendaftaran secara manual di tabel bawah.", "Pastikan koneksi internet stabil untuk fitur AI."]
    };
  }
}
