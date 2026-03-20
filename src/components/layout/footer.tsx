'use client';

import React, { useState, useEffect } from 'react';
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';
import { type School } from '@/lib/data';
import type { NavLink } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { convertGoogleDriveLink } from '@/lib/utils';

type FooterProps = {
  setActiveTab: (tab: NavLink) => void;
  schoolData: School | null;
  isSchoolDataLoading: boolean;
};

const TiktokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12.525 0.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
);

const Footer = ({ setActiveTab, schoolData, isSchoolDataLoading }: FooterProps) => {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);
  
  const columns = [
    {
        title: "Tentang Sekolah",
        links: [
            { id: 'profil-sejarah', label: 'Profil & Sejarah' },
            { id: 'fasilitas', label: 'Fasilitas' },
            { id: 'staf-guru', label: 'Staf & Guru' },
            { id: 'kontak', label: 'Kontak Kami' },
        ]
    },
    {
        title: "Akademik",
        links: [
            { id: 'jurusan-kompetensi', label: 'Jurusan' },
            { id: 'jadwal-pelajaran', label: 'Jadwal' },
            { id: 'perpustakaan', label: 'Perpustakaan' },
            { id: 'ekstrakurikuler', label: 'Ekstrakurikuler' },
        ]
    },
    {
        title: "Layanan Siswa",
        links: [
            { id: 'ppdb-online', label: 'PPDB Online' },
            { id: 'bkk', label: 'Bursa Kerja (BKK)' },
            { id: 'prakerin-pkl', label: 'Prakerin/PKL' },
            { id: 'cek-status-kelulusan', label: 'Cek Kelulusan' },
        ]
    }
  ];

  return (
    <footer className="bg-[#0a0c1b] text-white pt-24 pb-12 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[120px] -ml-48 -mb-48"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-16 mb-20">
        
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-white p-2 rounded-2xl shadow-2xl relative overflow-hidden">
                  {isSchoolDataLoading ? (
                      <Skeleton className="w-full h-full rounded-lg" />
                  ) : (
                      <Image
                      src={convertGoogleDriveLink(schoolData?.logoUrl || "https://picsum.photos/seed/logo/40/40")}
                      alt="Logo"
                      fill
                      className='object-contain p-1'
                      unoptimized
                      />
                  )}
               </div>
              <div className="font-black text-2xl font-headline tracking-tighter">
                {isSchoolDataLoading ? <Skeleton className="h-8 w-40" /> : (schoolData?.shortName || "SMKS PGRI 2")}
              </div>
            </div>
            
            <div className="space-y-4 text-gray-400">
                <div className="flex items-start gap-3">
                    <MapPin size={20} className="text-primary mt-1 shrink-0" />
                    <div className="text-sm leading-relaxed flex-1">
                      {isSchoolDataLoading ? (
                        <Skeleton className="h-10 w-full" />
                      ) : (
                        <div className="whitespace-pre-wrap">{schoolData?.address}</div>
                      )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Phone size={18} className="text-primary shrink-0" />
                    <div className="text-sm flex-1">
                      {isSchoolDataLoading ? (
                        <Skeleton className="h-4 w-32" />
                      ) : (
                        <div>{schoolData?.phone}</div>
                      )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Mail size={18} className="text-primary shrink-0" />
                    <div className="text-sm flex-1">
                      {isSchoolDataLoading ? (
                        <Skeleton className="h-4 w-40" />
                      ) : (
                        <div>{schoolData?.email}</div>
                      )}
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
              {schoolData?.facebookUrl && (
                  <Button asChild variant="secondary" size="icon" className="rounded-xl bg-white/5 hover:bg-primary hover:text-white border-white/10">
                  <a href={schoolData.facebookUrl} target='_blank' rel='noopener noreferrer' aria-label="Facebook"><Facebook size={18}/></a>
                  </Button>
              )}
              {schoolData?.instagramUrl && (
                  <Button asChild variant="secondary" size="icon" className="rounded-xl bg-white/5 hover:bg-primary hover:text-white border-white/10">
                  <a href={schoolData.instagramUrl} target='_blank' rel='noopener noreferrer' aria-label="Instagram"><Instagram size={18}/></a>
                  </Button>
              )}
              {schoolData?.tiktokUrl && (
                  <Button asChild variant="secondary" size="icon" className="rounded-xl bg-white/5 hover:bg-primary hover:text-white border-white/10">
                  <a href={schoolData.tiktokUrl} target='_blank' rel='noopener noreferrer' aria-label="TikTok"><TiktokIcon className="w-4 h-4 fill-current" /></a>
                  </Button>
              )}
              {schoolData?.youtubeUrl && (
                  <Button asChild variant="secondary" size="icon" className="rounded-xl bg-white/5 hover:bg-primary hover:text-white border-white/10">
                  <a href={schoolData.youtubeUrl} target='_blank' rel='noopener noreferrer' aria-label="YouTube"><Youtube size={18}/></a>
                  </Button>
              )}
            </div>
          </div>
          
          {columns.map((col, idx) => (
            <div key={idx} className="lg:col-span-1 space-y-6">
                <h5 className="font-black text-xs uppercase tracking-[0.2em] text-primary">{col.title}</h5>
                <ul className="space-y-4">
                    {col.links.map(link => (
                        <li key={link.label}>
                            <button 
                                onClick={() => setActiveTab(link.id as NavLink)} 
                                className="text-gray-400 hover:text-white text-sm transition-colors duration-300 flex items-center group font-medium"
                            >
                                <span className="w-0 group-hover:w-2 h-[1px] bg-primary mr-0 group-hover:mr-2 transition-all"></span>
                                {link.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
          ))}

          <div className="lg:col-span-1 space-y-6">
             <h5 className="font-black text-xs uppercase tracking-[0.2em] text-primary">Akses Cepat</h5>
             <div className="space-y-4">
                <Button variant="outline" size="sm" className="w-full justify-start rounded-xl border-white/10 bg-white/5 hover:bg-white/10 font-bold" onClick={() => setActiveTab('login')}>
                    <ExternalLink size={14} className="mr-2" /> Portal Login
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start rounded-xl border-white/10 bg-white/5 hover:bg-white/10 font-bold" onClick={() => setActiveTab('buku-tamu')}>
                    <ExternalLink size={14} className="mr-2" /> Buku Tamu
                </Button>
             </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-500 text-xs font-bold uppercase tracking-widest">
          <div className="flex flex-col md:flex-row items-center gap-2 text-center md:text-left">
            <span>© {currentYear || '2024'} {schoolData?.name || "SMKS PGRI 2 KEDONDONG"}.</span>
            <span className="hidden md:inline">|</span>
            <span>Dibuat dengan dedikasi.</span>
          </div>
          <div className="flex gap-8">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;