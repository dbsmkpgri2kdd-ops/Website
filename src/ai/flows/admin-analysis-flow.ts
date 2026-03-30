
/**
 * @fileOverview AI Flow untuk analisis status sekolah bagi administrator.
 * Mock implementation untuk mendukung Static Build.
 */

import { z } from 'zod';

const AdminAnalysisInputSchema = z.object({
  adminName: z.string(),
});
export type AdminAnalysisInput = z.infer<typeof AdminAnalysisInputSchema>;

const AdminAnalysisOutputSchema = z.object({
  summary: z.string(),
  insights: z.array(z.string()),
});
export type AdminAnalysisOutput = z.infer<typeof AdminAnalysisOutputSchema>;

/**
 * Fungsi mock untuk analisis AI guna mencegah error build statis.
 * Dalam lingkungan hosting dinamis, hubungkan ke API eksternal.
 */
export async function generateAdminAnalysis(input: AdminAnalysisInput): Promise<AdminAnalysisOutput> {
  // Simulasi pemrosesan data di sisi klien
  return {
    summary: `Halo ${input.adminName}, sistem sedang menganalisis data pendaftaran terbaru.`,
    insights: [
      "Periksa tab PPDB untuk melihat pendaftar terbaru hari ini.",
      "Pastikan semua jadwal ujian online telah dikonfigurasi.",
      "Pantau aktivitas buku tamu untuk melihat feedback pengunjung."
    ]
  };
}
