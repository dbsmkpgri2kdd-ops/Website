'use client';

import { type IndustryPartner } from '@/lib/data';
import Image from 'next/image';
import { convertGoogleDriveLink } from '@/lib/utils';

type PartnersSliderProps = {
  partners: IndustryPartner[];
};

const PartnersSlider = ({ partners }: PartnersSliderProps) => {
  if (!partners || partners.length === 0) {
    return null;
  }
  
  const extendedPartners = [...partners, ...partners, ...partners, ...partners];

  return (
    <div className="w-full overflow-hidden relative group">
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10"></div>
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10"></div>
      <div className="flex w-max marquee group-hover:pause">
        {extendedPartners.map((partner, index) => (
          <div key={`${partner.id}-${index}`} className="flex-shrink-0 w-48 h-24 mx-8 flex items-center justify-center">
            <a href={partner.websiteUrl || '#'} target="_blank" rel="noopener noreferrer" className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <Image
                src={convertGoogleDriveLink(partner.logoUrl)}
                alt={partner.name}
                width={150}
                height={60}
                className="object-contain max-h-16"
                unoptimized
              />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartnersSlider;
