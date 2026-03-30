import {
    Home, Info, Newspaper, UserPlus, Phone, Users, GraduationCap, Award, BookOpen, ImageIcon,
    Building, Quote, Activity, MessageSquare, Calendar, Download, CalendarClock, Library, PenSquare,
    Megaphone, Briefcase, Building2, Factory, ShieldCheck, ScanSearch, FileText, BadgeCheck,
    Map, CircleHelp, Network, UserCheck, Clipboard, Wallet, ScrollText, FolderKanban, UserCog, BrainCircuit, ArrowRightLeft, BookUser, AppWindow, Settings, LayoutDashboard, Database, HardDrive, BarChart3, ShieldAlert, MonitorDot, Palmtree, Link, Globe, Laptop, Sparkles, Palette, MoveUp, MoveDown, GripVertical, ChevronRight, ChevronDown
} from 'lucide-react';

export type NavLink =
    'home' | 'profil-sejarah' | 'fasilitas' | 'staf-guru' |
    'berita-pengumuman' | 'agenda-akademik' | 'galeri-foto-video' |
    'jurusan-kompetensi' | 'prestasi-siswa' | 'ekstrakurikuler' | 'perpustakaan' |
    'mitra-industri' | 'bkk' | 'teaching-factory' | 'lsp-sertifikasi' | 'tracer-study' |
    'ppdb-online' | 'cek-status-kelulusan' |
    'kontak' | 'jadwal-pelajaran'|
    'testimoni-alumni' | 'database-alumni' | 'pojok-literasi' | 'osis-corner' | 
    'dokumen-download' | 'prakerin-pkl' | 'buku-tamu' | 'showcase-karya';

export type NavItem = {
    id?: NavLink;
    label: string;
    icon?: string;
    children?: NavItem[];
};

export const NAV_MENU_DEFAULT: NavItem[] = [
    { id: 'home', label: 'Beranda' },
    {
        label: 'Profil',
        children: [
            { id: 'profil-sejarah', label: 'Profil & Sejarah' },
            { id: 'fasilitas', label: 'Fasilitas' },
            { id: 'staf-guru', label: 'Staf & Guru' },
        ],
    },
    {
        label: 'Informasi',
        children: [
            { id: 'berita-pengumuman', label: 'Berita & Pengumuman' },
            { id: 'agenda-akademik', label: 'Agenda Sekolah' },
            { id: 'galeri-foto-video', label: 'Galeri Media' },
        ],
    },
    {
        label: 'Akademik',
        children: [
            { id: 'jurusan-kompetensi', label: 'Jurusan' },
            { id: 'prestasi-siswa', label: 'Prestasi Siswa' },
            { id: 'ekstrakurikuler', label: 'Ekstrakurikuler' },
            { id: 'perpustakaan', label: 'Perpustakaan' },
            { id: 'showcase-karya', label: 'Pameran Karya' },
        ],
    },
    {
        label: 'Industri',
        children: [
            { id: 'mitra-industri', label: 'Mitra Industri' },
            { id: 'bkk', label: 'Bursa Kerja (BKK)' },
            { id: 'teaching-factory', label: 'Teaching Factory' },
            { id: 'lsp-sertifikasi', label: 'LSP & Sertifikasi' },
            { id: 'tracer-study', label: 'Penelusuran Alumni' },
        ],
    },
    {
        label: 'Layanan',
        children: [
            { id: 'ppdb-online', label: 'PPDB Online' },
            { id: 'cek-status-kelulusan', label: 'Cek Kelulusan' },
            { id: 'dokumen-download', label: 'Pusat Unduhan' },
        ],
    },
    { id: 'kontak', label: 'Kontak' },
];

export const SCHOOL_DATA_ID = "smks-pgri-2-kedondong";

export type School = {
    id: string;
    name: string;
    shortName: string;
    address: string;
    phone: string;
    email: string;
    principalName: string;
    principalMessage: string;
    history?: string;
    vision: string;
    mission: string[];
    logoUrl?: string;
    instagramUrl?: string;
    tiktokUrl?: string;
    facebookUrl?: string;
    whatsappUrl?: string;
    youtubeUrl?: string;
    studentCount?: number;
    teacherCount?: number;
    industryPartnerCount?: number;
    isMaintenanceMode?: boolean;
    selectedTemplate?: string;
    primaryColor?: string;
    accentColor?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    welcomeTitle?: string;
    ctaTitle?: string;
    layoutSettings?: {
      showHero?: boolean;
      showPartners?: boolean;
      showStats?: boolean;
      showMajors?: boolean;
      showNews?: boolean;
      showCta?: boolean;
      showShowcase?: boolean;
      sectionOrder?: string[];
    };
    customMenu?: NavItem[];
};

export type QuickLink = {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: string;
  audience: 'all' | 'public' | 'guru' | 'siswa';
  createdAt: any;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: any;
};

export type Major = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export type NewsArticle = {
  id: string;
  title: string;
  category: string;
  content: string;
  imageUrl: string;
  datePublished: any; 
};

export type Facility = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
};

export type OsisPost = {
  id: string;
  title: string;
  category: string;
  content: string;
  imageUrl: string;
  datePublished: any;
};

export type LiteracyArticle = {
  id: string;
  title: string;
  category: string;
  content: string;
  studentName: string;
  studentClass: string;
  imageUrl?: string;
  datePublished: any;
};

export type StudentApplication = {
  id: string;
  schoolId: string;
  studentName: string;
  chosenMajor: string;
  parentPhone: string;
  submissionDate: any;
  status: 'PENDING' | 'DITERIMA' | 'CADANGAN' | 'DITOLAK';
  birthDate?: string;
  gender?: string;
  originSchool?: string;
};

export type ExtracurricularApplication = {
  id: string;
  studentName: string;
  studentClass: string;
  extracurricularName: string;
  submissionDate: any;
};

export type GalleryImage = {
  id: string;
  mediaType: 'image' | 'video';
  imageUrl: string;
  description: string;
  imageHint: string;
  createdAt: any;
};

export type Achievement = {
  id: string;
  title: string;
  studentName: string;
  competitionName: string;
  level: string;
  dateAchieved: any;
  imageUrl: string;
  description?: string;
};

export type Testimonial = {
  id: string;
  studentName: string;
  graduationYear: string;
  occupation: string;
  content: string;
  studentPhotoUrl: string;
  createdAt: any;
};

export type Extracurricular = {
  id: string;
  name: string;
  description: string;
  icon: string;
  schedule: string;
};

export type GuestbookEntry = {
  id: string;
  name: string;
  origin: string;
  message: string;
  createdAt: any;
};

export type Event = {
  id: string;
  title: string;
  description?: string;
  date: any;
  category: string;
};

export type DownloadableFile = {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  category: string;
  createdAt: any;
};

export type Schedule = {
  id: string;
  className: string;
  dayOfWeek: string;
  timeSlot: string;
  subjectName: string;
  teacherName: string;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  publisher?: string;
  yearPublished?: string;
  isbn?: string;
  coverImageUrl: string;
  description?: string;
  isAvailable: boolean;
  createdAt: any;
};

export type IndustryPartner = {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  websiteUrl?: string;
};

export type Teacher = {
    id: string;
    name: string;
    title: string;
    photoUrl: string;
    bio?: string;
    email?: string;
};

export type Alumnus = {
    id: string;
    name: string;
    graduationYear: string;
    occupation: string;
    photoUrl: string;
    notes?: string;
};

export type JobVacancy = {
  id: string;
  title: string;
  companyName: string;
  location: string;
  description: string;
  requirements: string[];
  applyUrl: string;
  postedDate: any;
  closingDate?: any;
};

export type TeachingFactoryProduct = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price?: string;
  studentCreator?: string; 
  createdAt: any;
};

export type UserProfile = {
    id?: string;
    email: string;
    displayName?: string;
    role: 'admin' | 'guru' | 'siswa' | 'alumni';
};

export type LspCertification = {
    id: string;
    name: string;
    schemaNumber: string;
    description: string;
};

export type TracerStudyResponse = {
    id: string;
    name: string;
    graduationYear: string;
    status: 'Bekerja' | 'Kuliah' | 'Wirausaha' | 'Lainnya';
    currentActivityDetail: string;
    suggestions?: string;
    submissionDate: any;
};

export type GraduationStatus = {
  id: string;
  studentIdentifier: string;
  studentName: string;
  status: 'LULUS' | 'TIDAK LULUS' | 'DIPROSES';
  notes?: string;
};

export type Prakerin = {
  id: string;
  studentName: string;
  studentClass: string;
  companyName: string;
  startDate: any;
  endDate?: any;
  status: 'Aktif' | 'Selesai' | 'Dibatalkan';
};

export type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  projectUrl?: string;
  isPublic?: boolean;
  studentName?: string;
  studentClass?: string;
  createdAt: any;
};

export type ERapor = {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  schoolYear: string;
  semester: string;
  createdAt: any;
};

export type Grade = {
  id: string;
  subjectName: string;
  score: number;
  description: string;
};

export type AttendanceRecord = {
  id: string;
  studentId: string;
  studentName: string;
  date: any;
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';
  notes?: string;
};