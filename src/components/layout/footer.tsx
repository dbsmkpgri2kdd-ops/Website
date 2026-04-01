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
  const [mounted, setMounted] = useState(false);
  const [currentYear, setCurrentYear] = useState<number>(2025);

  useEffect(() => {
    setMounted(true);
    setCurrentYear(new Date().getFullYear());
  }, []);
  
  const columns = [
    {
        title: "Profil",
        links: [
            { id: 'profil-sejarah', label: 'Sejarah' },
            { id: 'fasilitas', label: 'Fasilitas' },
            { id: 'staf-guru', label: 'Staf & Guru' },
            { id: 'kontak', label: 'Kontak Kami' },
        ]
    },
    {
        title: "Akademik",
        links: [
            { id: 'jurusan-kompetensi', label: 'Program Jurusan' },
            { id: 'jadwal-pelajaran', label: 'Jadwal Pelajaran' },
            { id: 'perpustakaan', label: 'Perpustakaan Digital' },
            { id: 'ekstrakurikuler', label: 'Kegiatan Eskul' },
        ]
    },
    {
        title: "Layanan",
        links: [
            { id: 'ppdb-online', label: 'Ppdb Online' },
            { id: 'bkk', label: 'Bursa Kerja' },
            { id: 'prakerin-pkl', label: 'Program Prakerin' },
            { id: 'cek-status-kelulusan', label: 'Status Kelulusan' },
        ]
    }
  ];

  const defaultLogo = 'https://firebasestorage.googleapis.com/v0/b/firebasestudio-images/o/user-uploaded-image.png?alt=media';

  return (
    <footer className="bg-white border-t border-slate-100 pt-20 pb-32 md:pb-16 tech-mesh relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-20">
        
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-primary/5 p-2 rounded-2xl relative overflow-hidden shadow-inner border border-primary/5">
                  {isSchoolDataLoading ? (
                      <Skeleton className="w-full h-full" />
                  ) : (
                      <Image
                      src={convertGoogleDriveLink(schoolData?.logoUrl || defaultLogo)}
                      alt="Logo"
                      fill
                      className='object-contain p-1.5'
                      unoptimized
                      />
                  )}
               </div>
              <div className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
                {isSchoolDataLoading ? <Skeleton className="h-6 w-40" /> : (schoolData?.name || "SMKS PGRI 2 Kedondong")}
              </div>
            </div>
            
            <div className="space-y-5 text-slate-500">
                <div className="flex items-start gap-4">
                    <div className='p-2 bg-primary/5 text-primary rounded-xl shrink-0 mt-0.5'><MapPin size={18} /></div>
                    <div className="text-[14px] leading-relaxed flex-1 font-medium">
                      {isSchoolDataLoading ? (
                        <Skeleton className="h-4 w-full" />
                      ) : (
                        <div className="whitespace-pre-wrap text-slate-600">{schoolData?.address}</div>
                      )}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className='p-2 bg-primary/5 text-primary rounded-xl shrink-0'><Phone size={16} /></div>
                    <div className="text-[14px] text-slate-600 font-bold">
                      {isSchoolDataLoading ? <Skeleton className="h-4 w-32" /> : schoolData?.phone}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className='p-2 bg-primary/5 text-primary rounded-xl shrink-0'><Mail size={16} /></div>
                    <div className="text-[14px] text-slate-600 font-bold">
                      {isSchoolDataLoading ? <Skeleton className="h-4 w-48" /> : schoolData?.email}
                    </div>
                </div>
            </div>

            <div className="flex gap-3 pt-4">
              {[
                { icon: Facebook, url: schoolData?.facebookUrl },
                { icon: Instagram, url: schoolData?.instagramUrl },
                { icon: TiktokIcon, url: schoolData?.tiktokUrl, isSvg: true },
                { icon: Youtube, url: schoolData?.youtubeUrl }
              ].map((social, i) => (
                social.url && (
                  <Button key={i} asChild variant="outline" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all duration-300">
                    <a href={social.url} target='_blank' rel='noopener noreferrer' aria-label={`Media Sosial ${i}`}>
                      {social.isSvg ? <social.icon className="w-4 h-4 fill-current" /> : <social.icon size={18}/>}
                    </a>
                  </Button>
                )
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-12">
            {columns.map((col, idx) => (
              <div key={idx} className="space-y-6">
                  <h5 className="font-extrabold text-[15px] text-slate-900 tracking-tight">{col.title}</h5>
                  <ul className="space-y-4">
                      {col.links.map(link => (
                          <li key={link.label}>
                              <button 
                                  onClick={() => setActiveTab(link.id as NavLink)} 
                                  className="text-slate-500 hover:text-primary text-[14px] transition-colors duration-300 flex items-center font-medium"
                              >
                                  {link.label}
                              </button>
                          </li>
                      ))}
                  </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400 text-[12px] font-bold">
          <div className="text-center md:text-left opacity-60">
            <span>&copy; {mounted ? currentYear : '2026'} {schoolData?.shortName || "SMK PRIDA"}. Official Digital Hub.</span>
          </div>
          <div className="flex gap-10 opacity-60">
            <span className="hover:text-primary cursor-pointer transition-colors">Kebijakan Privasi</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Syarat & Ketentuan</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;