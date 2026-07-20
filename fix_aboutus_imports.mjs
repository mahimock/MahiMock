import fs from 'fs';

let content = fs.readFileSync('src/pages/AboutUs.tsx', 'utf8');

content = content.replace("import { Target, Eye, User, Mail, Globe, CheckCircle2, Facebook, Instagram, Youtube, Rocket, Laptop, Heart, Camera, Loader2 } from 'lucide-react';", "import { Target, Eye, User, Mail, Globe, CheckCircle2, Facebook, Instagram, Youtube, Rocket, Laptop, Heart, Camera, Loader2, MessageCircle, Send } from 'lucide-react';\nimport { useBranding } from '../contexts/BrandingContext';\nimport MahiMockLogo from '../components/MahiMockLogo';");

fs.writeFileSync('src/pages/AboutUs.tsx', content);
