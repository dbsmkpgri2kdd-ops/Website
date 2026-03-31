
import {
    Home, Info, Newspaper, UserPlus, Phone, Users, GraduationCap, Award, BookOpen, ImageIcon,
    Building, Quote, Activity, MessageSquare, Calendar, Download, CalendarClock, Library, PenSquare,
    Megaphone, Briefcase, Building2, Factory, ShieldCheck, ScanSearch, FileText, BadgeCheck,
    Map, CircleHelp, Network, UserCheck, Clipboard, Wallet, ScrollText, FolderKanban, UserCog, BrainCircuit, ArrowRightLeft, BookUser, AppWindow, Settings, LayoutDashboard, Database, HardDrive, BarChart3, ShieldAlert, MonitorPlay, Palmtree, Link, Globe, Laptop, Sparkles, Palette, MoveUp, MoveDown, GripVertical, ChevronRight, ChevronDown, Lock, QrCode, Monitor, Camera, CameraOff, Search, MonitorCheck, Fingerprint, MapPin, Venus, Mars, ScanFace, HeartPulse, User
} from 'lucide-react';

export type NavLink =
    'home' | 'profil-sejarah' | 'fasilitas' | 'staf-guru' |
    'berita-pengumuman' | 'agenda-akademik' | 'galeri-foto-video' |
    'jurusan-kompetensi' | 'prestasi-siswa' | 'ekstrakurikuler' | 'perpustakaan' |
    'mitra-industri' | 'bkk' | 'teaching-factory' | 'lsp-sertifikasi' | 'tracer-study' |
    'ppdb-online' | 'cek-status-kelulusan' | 'cek-pendaftaran-ppdb' |
    'kontak' | 'jadwal-pelajaran'|
    'testimoni-alumni' | 'database-alumni' | 'pojok-literasi' | 'osis-corner' | 
    'dokumen-download' | 'prakerin-pkl' | 'buku-tamu' | 'showcase-karya' | 'exambro' | 'biometric-admin';

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
            { id: 'cek-pendaftaran-ppdb', label: 'Cek Status PPDB' },
            { id: 'cek-status-kelulusan', label: 'Cek Kelulusan' },
            { id: 'dokumen-download', label: 'Pusat Unduhan' },
        ],
    },
    { id: 'kontak', label: 'Kontak' },
];

export const SCHOOL_DATA_ID = "smks-pgri-2-kedondong";

export interface Exam {
  id: string;
  title: string;
  subject: string;
  class: string;
  date: any;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  token: string;
  url: string;
  isActive: boolean;
  isCameraRequired: boolean;
  teacherName: string;
  createdAt: any;
}

export interface CsvMappings {
  nis: string;
  name: string;
  class: string;
  session: string;
  address: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  bkTeacher: string;
  homeroomTeacher: string;
  guardianTeacher: string;
  studentAffairs: string;
}

export interface School {
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
    studentDatabaseUrl?: string;
    attendanceWebhookUrl?: string; 
    csvMappings?: CsvMappings;
    latitude?: number;
    longitude?: number;
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
}

export interface QuickLink {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: string;
  audience: 'all' | 'public' | 'guru' | 'siswa';
  createdAt: any;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: any;
}

export interface Major {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  imageUrl: string;
  datePublished: any; 
}

export interface Facility {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface OsisPost {
  id: string;
  title: string;
  category: string;
  content: string;
  imageUrl: string;
  datePublished: any;
}

export interface LiteracyArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  studentName: string;
  studentClass: string;
  imageUrl?: string;
  datePublished: any;
}

export interface StudentApplication {
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
}

export interface ExtracurricularApplication {
  id: string;
  studentName: string;
  studentClass: string;
  extracurricularName: string;
  submissionDate: any;
}

export interface GalleryImage {
  id: string;
  mediaType: 'image' | 'video';
  imageUrl: string;
  description: string;
  imageHint: string;
  createdAt: any;
}

export interface Achievement {
  id: string;
  title: string;
  studentName: string;
  competitionName: string;
  level: string;
  dateAchieved: any;
  imageUrl: string;
  description?: string;
}

export interface Testimonial {
  id: string;
  studentName: string;
  graduationYear: string;
  occupation: string;
  content: string;
  studentPhotoUrl: string;
  createdAt: any;
}

export interface Extracurricular {
  id: string;
  name: string;
  description: string;
  icon: string;
  schedule: string;
}

export interface GuestbookEntry {
  id: string;
  name: string;
  origin: string;
  message: string;
  createdAt: any;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: any;
  category: string;
}

export interface DownloadableFile {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  category: string;
  createdAt: any;
}

export interface Schedule {
  id: string;
  className: string;
  dayOfWeek: string;
  timeSlot: string;
  subjectName: string;
  teacherName: string;
}

export interface Book {
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
}

export interface IndustryPartner {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  websiteUrl?: string;
}

export interface Teacher {
    id: string;
    name: string;
    title: string;
    photoUrl: string;
    bio?: string;
    email?: string;
}

export interface Alumnus {
    id: string;
    name: string;
    graduationYear: string;
    occupation: string;
    photoUrl: string;
    notes?: string;
}

export interface JobVacancy {
  id: string;
  title: string;
  companyName: string;
  location: string;
  description: string;
  requirements: string[];
  applyUrl: string;
  postedDate: any;
  closingDate?: any;
}

export interface TeachingFactoryProduct {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price?: string;
  studentCreator?: string; 
  createdAt: any;
}

export interface UserProfile {
    id?: string;
    email: string;
    displayName?: string;
    role: 'admin' | 'guru' | 'siswa' | 'alumni';
    nis?: string;
    className?: string;
    session?: 'Pagi' | 'Siang';
    address?: string;
    phone?: string;
    parentName?: string;
    parentPhone?: string;
    bkTeacher?: string;
    homeroomTeacher?: string;
    guardianTeacher?: string;
    studentAffairs?: string;
    lastSyncedAt?: any;
    biometricSignature?: string;
}

export interface LspCertification {
    id: string;
    name: string;
    schemaNumber: string;
    description: string;
}

export interface TracerStudyResponse {
    id: string;
    name: string;
    graduationYear: string;
    status: 'Bekerja' | 'Kuliah' | 'Wirausaha' | 'Lainnya';
    currentActivityDetail: string;
    suggestions?: string;
    submissionDate: any;
}

export interface GraduationStatus {
  id: string;
  studentIdentifier: string;
  studentName: string;
  status: 'LULUS' | 'TIDAK LULUS' | 'DIPROSES';
  notes?: string;
}

export interface Prakerin {
  id: string;
  studentName: string;
  studentClass: string;
  companyName: string;
  startDate: any;
  endDate?: any;
  status: 'Aktif' | 'Selesai' | 'Dibatalkan';
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  projectUrl?: string;
  isPublic?: boolean;
  studentName?: string;
  studentClass?: string;
  createdAt: any;
}

export interface ERapor {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  schoolYear: string;
  semester: string;
  createdAt: any;
}

export interface Grade {
  id: string;
  subjectName: string;
  score: number;
  description: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentNis?: string;
  studentClass?: string;
  date: any;
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';
  notes?: string;
  biometricCode?: string;
  metadata?: any;
}
