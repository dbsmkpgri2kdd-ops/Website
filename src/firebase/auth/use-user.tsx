'use client';
/**
 * File ini sekarang hanya bertindak sebagai alias untuk useUser dari provider utama.
 * Hal ini dilakukan untuk menghindari kebingungan impor ganda.
 */
export { useUser } from '@/firebase/provider';
export type { AppUser } from '@/firebase/provider';
