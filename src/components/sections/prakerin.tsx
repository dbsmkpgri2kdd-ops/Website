'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type IndustryPartner } from '@/lib/data';
import { Award, Briefcase, CheckCircle, Factory, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Image from 'next/image';
import { convertGoogleDriveLink } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

const PrakerinSection = () => {
    const firestore = useFirestore();
    const partnersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/industryPartners`);
        return query(ref, orderBy('name'));
    }, [firestore]);

    const { data: partners, isLoading } = useCollection<IndustryPartner>(partnersQuery);
    
    const benefits = [
        {
            icon: Briefcase,
            title: "Pengalaman Kerja Nyata",
            description: "Siswa mendapatkan pengalaman langsung di lingkungan kerja profesional, mengaplikasikan teori yang telah dipelajari di kelas."
        },
        {
            icon: Users,
            title: "Membangun Jaringan",
            description: "Kesempatan untuk berinteraksi dan membangun koneksi dengan para profesional di industri terkait."
        },
        {
            icon: Award,
            title: "Sertifikat Industri",
            description: "Siswa yang menyelesaikan program dengan baik akan mendapatkan sertifikat resmi dari perusahaan tempat prakerin."
        },
        {
            icon: CheckCircle,
            title: "Meningkatkan Kompetensi",
            description: "Mengasah keterampilan teknis (hard skills) dan non-teknis (soft skills) yang sangat dibutuhkan di dunia kerja."
        }
    ];

    return (
        <section className="py-16 animate-fade-in space-y-20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold font-headline text-primary">Program Prakerin/PKL</h2>
                    <p className="text-lg text-muted-foreground mt-2">Menjembatani Dunia Pendidikan dan Industri.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h3 className="text-3xl font-bold font-headline text-primary mb-4">Tentang Program</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Praktek Kerja Lapangan (Prakerin) atau Praktek Kerja Industri (PKL) adalah bagian integral dari kurikulum kami yang dirancang untuk memberikan siswa pengalaman kerja nyata di industri. Program ini bertujuan untuk membekali siswa dengan kompetensi yang relevan, etos kerja profesional, dan pemahaman mendalam tentang dunia kerja sebelum mereka lulus.
                        </p>
                    </div>
                     <div className="grid grid-cols-2 gap-6">
                        {benefits.map(benefit => (
                            <Card key={benefit.title} className="bg-muted/50 border-none shadow-lg">
                                <CardContent className="p-6 text-center flex flex-col items-center">
                                    <benefit.icon className="h-10 w-10 text-primary mb-3"/>
                                    <h4 className="font-bold font-headline">{benefit.title}</h4>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-6">
                 <div className="text-center mb-12">
                    <h3 className="text-3xl font-bold font-headline text-primary">Mitra Prakerin Kami</h3>
                    <p className="text-lg text-muted-foreground mt-2">Kami bangga bekerja sama dengan berbagai perusahaan terkemuka.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                    {isLoading && Array.from({length: 10}).map((_, i) => (
                        <Card key={i} className="flex items-center justify-center p-6 h-32 rounded-2xl shadow-md"><Skeleton className="h-12 w-24"/></Card>
                    ))}
                    {partners?.map(partner => (
                        <a key={partner.id} href={partner.websiteUrl || '#'} target="_blank" rel="noopener noreferrer">
                            <Card className="flex items-center justify-center p-6 h-32 rounded-2xl shadow-md hover:shadow-xl transition-shadow group">
                                <Image
                                    src={convertGoogleDriveLink(partner.logoUrl)}
                                    alt={partner.name}
                                    width={120}
                                    height={60}
                                    className="object-contain grayscale group-hover:grayscale-0 transition-all"
                                    unoptimized
                                />
                            </Card>
                        </a>
                    ))}
                    {!isLoading && partners?.length === 0 && (
                        <p className="col-span-full text-center text-muted-foreground">Data mitra industri belum ditambahkan.</p>
                    )}
                </div>
            </div>

        </section>
    );
};

export default PrakerinSection;
