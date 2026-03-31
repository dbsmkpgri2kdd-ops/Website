
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertGoogleDriveLink(url: string): string {
  if (!url || !url.includes('drive.google.com')) {
    return url;
  }

  const regex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);

  if (match && match[1]) {
    const fileId = match[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  return url;
}

export function convertGoogleDriveLinkForEmbed(url: string): string {
  if (!url || !url.includes('drive.google.com')) {
    return url;
  }

  const regex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);

  if (match && match[1]) {
    const fileId = match[1];
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  return url;
}

export const getDashboardByRole = (role?: string) => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'guru':
      return '/guru';
    case 'siswa':
      return '/siswa';
    case 'alumni':
      return '/'; // Alumni stay on the homepage
    default:
      return '/'; // Default to homepage for unknown or no role
  }
};

export const formatDate = (date: any): string => {
  if (!date) {
    return 'Tanggal tidak tersedia';
  }

  // Firestore Timestamps have toDate() method
  const dateObject = date.toDate ? date.toDate() : new Date(date);

  if (isNaN(dateObject.getTime())) {
    return 'Tanggal tidak valid';
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
  }).format(dateObject);
};

/**
 * Menghitung jarak antara dua koordinat GPS dalam meter menggunakan formula Haversine.
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Radius bumi dalam meter
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Hasil dalam meter
}
