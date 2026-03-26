'use client';

import { MapPin, Phone, Mail } from 'lucide-react';
import { type School } from '@/lib/data';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';

type ContactSectionProps = {
    schoolData: School | null;
    isSchoolDataLoading: boolean;
};

const ContactSection = ({ schoolData, isSchoolDataLoading }: ContactSectionProps) => {

    const contactInfo = [
        {
          label: 'Alamat',
          value: schoolData?.address,
          icon: MapPin,
          isLoading: isSchoolDataLoading
        },
        {
          label: 'Telepon',
          value: schoolData?.phone,
          icon: Phone,
          isLoading: isSchoolDataLoading
        },
        {
          label: 'Email',
          value: schoolData?.email,
          icon: Mail,
          isLoading: isSchoolDataLoading
        },
      ];

  return (
    <section className="py-16 max-w-7xl mx-auto px-6 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary">Hubungi Kami</h2>
        <p className="text-base md:text-lg text-muted-foreground mt-2">Kami siap membantu Anda. Jangan ragu untuk menghubungi kami.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        {contactInfo.map((info) => (
          <Card key={info.label} className="rounded-2xl text-center shadow-lg p-6 flex flex-col items-center">
            <CardHeader className="p-0 mb-4">
              <div className={`w-14 h-14 md:w-16 md:h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto`}>
                <info.icon size={24} />
              </div>
            </CardHeader>
            <CardContent className="p-0 w-full">
              <h4 className="font-bold mb-2 text-lg md:text-xl font-headline">{info.label}</h4>
              <div className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                {info.isLoading ? (
                  <Skeleton className='h-4 w-4/5 mx-auto' />
                ) : (
                  <div className="whitespace-pre-wrap">{info.value || '-'}</div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 md:mt-16 h-[300px] md:h-96 rounded-3xl overflow-hidden shadow-xl border bg-muted flex items-center justify-center relative">
         <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15844.414414141414!2d105.1!3d-5.4!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMjQnMDAuMCJTIDEwNcKwMDYnMDAuMCJF!5e0!3m2!1sen!2sid!4v1700000000000" 
            width="100%" 
            height="100%" 
            style={{border:0}} 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Lokasi Sekolah">
        </iframe>
      </div>
    </section>
  );
};

export default ContactSection;
