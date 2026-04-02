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
      return '/';
    default:
      return '/';
  }
};

export const formatDate = (date: any): string => {
  if (!date) {
    return 'Tanggal tidak tersedia';
  }

  let dateObject: Date;

  if (typeof date.toDate === 'function') {
    dateObject = date.toDate();
  } else if (date instanceof Date) {
    dateObject = date;
  } else if (typeof date === 'object' && date.seconds) {
    dateObject = new Date(date.seconds * 1000);
  } else {
    dateObject = new Date(date);
  }

  if (isNaN(dateObject.getTime())) {
    return 'Format tanggal salah';
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
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

  return R * c; 
}
