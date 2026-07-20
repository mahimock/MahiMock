import fs from 'fs';

let content = fs.readFileSync('src/types.ts', 'utf8');
content = content.replace(/export interface BrandingSettings \{[\s\S]*?\}/, `export interface BrandingSettings {
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
}`);

content = content.replace(/export const DEFAULT_BRANDING: BrandingSettings = \{[\s\S]*?\};/, `export const DEFAULT_BRANDING: BrandingSettings = {
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
};`);

fs.writeFileSync('src/types.ts', content);
