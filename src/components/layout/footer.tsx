'use client';

import React, { useState, useEffect } from 'react';
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin } from 'lucide-react';
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
        title: "Profil",
        links: [
            { id: 'profil-sejarah', label: 'Sejarah' },
            { id: 'fasilitas', label: 'Fasilitas' },
            { id: 'staf-guru', label: 'Guru & Staf' },
            { id: 'kontak', label: 'Kontak' },
        ]
    },
    {
        title: "Akademik",
        links: [
            { id: 'jurusan-kompetensi', label: 'Jurusan' },
            { id: 'jadwal-pelajaran', label: 'Jadwal' },
            { id: 'perpustakaan', label: 'Library' },
            { id: 'ekstrakurikuler', label: 'Ekskul' },
        ]
    },
    {
        title: "Layanan",
        links: [
            { id: 'ppdb-online', label: 'PPDB' },
            { id: 'bkk', label: 'Bursa Kerja' },
            { id: 'prakerin-pkl', label: 'Prakerin' },
            { id: 'cek-status-kelulusan', label: 'Kelulusan' },
        ]
    }
  ];

  return (
    <footer className="bg-[#0a0c1b] text-white pt-12 md:pt-20 pb-8 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[120px] -ml-48 -mb-48"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 mb-10">
        
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 md:w-12 md:h-12 bg-white p-1.5 rounded-xl shadow-2xl relative overflow-hidden">
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
              <div className="font-bold text-lg md:text-xl tracking-tight">
                {isSchoolDataLoading ? <Skeleton className="h-6 w-32" /> : (schoolData?.shortName || "SMKS PGRI 2")}
              </div>
            </div>
            
            <div className="space-y-3 text-gray-400">
                <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-primary mt-1 shrink-0" />
                    <div className="text-xs leading-relaxed flex-1 opacity-80">
                      {isSchoolDataLoading ? (
                        <Skeleton className="h-3 w-full" />
                      ) : (
                        <div className="whitespace-pre-wrap">{schoolData?.address}</div>
                      )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Phone size={14} className="text-primary shrink-0" />
                    <div className="text-xs flex-1 opacity-80">
                      {isSchoolDataLoading ? (
                        <Skeleton className="h-3 w-24" />
                      ) : (
                        <div>{schoolData?.phone}</div>
                      )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Mail size={14} className="text-primary shrink-0" />
                    <div className="text-xs flex-1 opacity-80">
                      {isSchoolDataLoading ? (
                        <Skeleton className="h-3 w-32" />
                      ) : (
                        <div>{schoolData?.email}</div>
                      )}
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
              {schoolData?.facebookUrl && (
                  <Button asChild variant="secondary" size="icon" className="h-8 w-8 rounded-lg bg-white/5 hover:bg-primary hover:text-white border-white/5">
                  <a href={schoolData.facebookUrl} target='_blank' rel='noopener noreferrer' aria-label="Facebook"><Facebook size={14}/></a>
                  </Button>
              )}
              {schoolData?.instagramUrl && (
                  <Button asChild variant="secondary" size="icon" className="h-8 w-8 rounded-lg bg-white/5 hover:bg-primary hover:text-white border-white/5">
                  <a href={schoolData.instagramUrl} target='_blank' rel='noopener noreferrer' aria-label="Instagram"><Instagram size={14}/></a>
                  </Button>
              )}
              {schoolData?.tiktokUrl && (
                  <Button asChild variant="secondary" size="icon" className="h-8 w-8 rounded-lg bg-white/5 hover:bg-primary hover:text-white border-white/5">
                  <a href={schoolData.tiktokUrl} target='_blank' rel='noopener noreferrer' aria-label="TikTok"><TiktokIcon className="w-3.5 h-3.5 fill-current" /></a>
                  </Button>
              )}
              {schoolData?.youtubeUrl && (
                  <Button asChild variant="secondary" size="icon" className="h-8 w-8 rounded-lg bg-white/5 hover:bg-primary hover:text-white border-white/5">
                  <a href={schoolData.youtubeUrl} target='_blank' rel='noopener noreferrer' aria-label="YouTube"><Youtube size={14}/></a>
                  </Button>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {columns.map((col, idx) => (
              <div key={idx} className="space-y-4">
                  <h5 className="font-bold text-[11px] text-primary tracking-wider">{col.title}</h5>
                  <ul className="space-y-2.5">
                      {col.links.map(link => (
                          <li key={link.label}>
                              <button 
                                  onClick={() => setActiveTab(link.id as NavLink)} 
                                  className="text-gray-400 hover:text-white text-xs transition-colors duration-300 flex items-center group font-medium"
                              >
                                  <span className="w-0 group-hover:w-1.5 h-[1px] bg-primary mr-0 group-hover:mr-1.5 transition-all"></span>
                                  {link.label}
                              </button>
                          </li>
                      ))}
                  </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-[10px] font-medium tracking-tight">
          <div className="flex flex-col md:flex-row items-center gap-1 text-center md:text-left">
            <span>© {currentYear || '2024'} {schoolData?.name || "SMKS PGRI 2 Kedondong"}.</span>
            <span className="hidden md:inline">|</span>
            <span>Educational excellence for future leaders.</span>
          </div>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;