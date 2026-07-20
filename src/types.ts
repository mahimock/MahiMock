export interface BrandingSettings {
  logoUrl: string;
  websiteName: string;
  faviconUrl: string;
  aboutContent?: {
    mission: string;
    vision: string;
    features: string[];
    founderName: string;
    founderBio: string;
    founderPhotoUrl?: string;
    website: string;
    email: string;
    whatsapp: string;
    facebook: string;
    instagram: string;
    youtube: string;
    telegram: string;
  };
}

export const DEFAULT_BRANDING: BrandingSettings = {
  logoUrl: '/logo.svg',
  websiteName: 'MahiMock',
  faviconUrl: '/logo.svg',
  aboutContent: {
    mission: "To provide accessible, high-quality, and comprehensive test preparation resources to aspirants across India, enabling them to achieve their dreams of securing prestigious government jobs.",
    vision: "To become India's most trusted and preferred platform for government exam preparation, known for our innovative learning approach, accurate mock tests, and student-centric focus.",
    features: [
      "Exam-specific Mock Tests",
      "Detailed Performance Analytics",
      "Previous Year Question Papers",
      "Bilingual Support (English/Hindi)",
      "Current Affairs & Updates",
      "Expert Study Materials"
    ],
    founderName: "Manish Kumar",
    founderBio: "An educator with a vision to democratize competitive exam preparation in India.",
    website: "https://mahimock.com",
    email: "support@mahimock.com",
    whatsapp: "+911234567890",
    facebook: "https://facebook.com/mahimock",
    instagram: "https://instagram.com/mahimock",
    youtube: "https://youtube.com/mahimock",
    telegram: "https://t.me/mahimock"
  }
};

export type Theme = 'light' | 'dark' | 'system';

export interface UserProfile {
  name: string;
  email: string;
  photoURL?: string;
  role?: 'student' | 'admin';
  theme?: Theme;
  status?: 'active' | 'suspended';
  createdAt?: number;
  lastLogin?: number;
}

export interface ExamCategory {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  order?: number;
}

export interface Exam {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  syllabus?: string;
  order?: number;
}

export interface Subject {
  id: string;
  examId: string;
  name: string;
  slug: string;
  logoUrl?: string;
  order?: number;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  slug: string;
  order?: number;
}
