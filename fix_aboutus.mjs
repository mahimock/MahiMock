import fs from 'fs';

let content = fs.readFileSync('src/pages/AboutUs.tsx', 'utf8');

content = content.replace("import { Target, Eye, CheckCircle2, Facebook, Instagram, Youtube, Mail, Globe, Heart } from 'lucide-react';", "import { Target, Eye, CheckCircle2, Facebook, Instagram, Youtube, Mail, Globe, Heart, MessageCircle, Send } from 'lucide-react';\nimport { useBranding } from '../contexts/BrandingContext';\nimport MahiMockLogo from '../components/MahiMockLogo';");

content = content.replace(/export default function AboutUs\(\) \{/, `export default function AboutUs() {
  const { branding } = useBranding();
  const about = branding.aboutContent;
`);

content = content.replace(/<div className="text-center space-y-4 pt-4">[\s\S]*?<\/div>/, `<div className="text-center space-y-6 pt-4">
          <div className="flex justify-center mb-6">
             <MahiMockLogo size="lg" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B5FFB]/10 border border-[#5B5FFB]/20 text-[#5B5FFB] text-[10px] font-bold uppercase tracking-widest">
            App Version 1.0.0
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            India's Premium Government Exam Preparation Platform
          </h2>
        </div>`);

content = content.replace(/<p className="text-gray-600 dark:text-gray-400 leading-relaxed">\s*To make quality government exam preparation affordable and accessible.*?\n\s*<\/p>/, `<p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {about?.mission || "To make quality government exam preparation affordable and accessible for every student, empowering them to achieve their career goals regardless of their geographical location or financial background."}
            </p>`);

content = content.replace(/<p className="text-gray-600 dark:text-gray-400 leading-relaxed">\s*To become one of India's most trusted government exam.*?\n\s*<\/p>/, `<p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {about?.vision || "To become one of India's most trusted government exam preparation platforms, known for its excellence in content, innovative learning methodologies, and outstanding student success rates."}
            </p>`);

// Also add founder section before Why Choose MahiMock
content = content.replace(/\{\/\* Why Choose MahiMock \*\/\}/, `{/* Founder Information */}
        {about?.founderName && (
          <div className="bg-white dark:bg-[#1E1E2D] p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
            
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-[#151521] shadow-xl overflow-hidden shrink-0 z-10 bg-gray-100 dark:bg-[#151521]">
              {about.founderPhotoUrl ? (
                <img src={about.founderPhotoUrl} alt={about.founderName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-black text-gray-400">
                  {about.founderName.charAt(0)}
                </div>
              )}
            </div>
            
            <div className="text-center md:text-left z-10 flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-3">
                Founder & CEO
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">{about.founderName}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg italic">
                "{about.founderBio || "An educator with a vision to democratize competitive exam preparation in India."}"
              </p>
            </div>
          </div>
        )}

        {/* Why Choose MahiMock */}`);

content = content.replace(/\{\/\* Contact & Socials \*\/\}/, `{/* Features Map replacement */}
        {about?.features && about.features.length > 0 && (
          <div className="bg-white dark:bg-[#1E1E2D] rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 dark:border-white/5 mt-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose {branding.websiteName}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {about.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent">
                  <div className="w-10 h-10 rounded-full bg-[#5B5FFB]/10 flex flex-shrink-0 items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-[#5B5FFB]" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-md">{feature}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact & Socials */}`);

content = content.replace(/<div className="space-y-6">[\s\S]*?<\/div>\s*<\/div>\s*<div className="bg-white dark:bg-\[\#1E1E2D\] p-8 rounded-\[2rem\] shadow-sm border border-gray-100 dark:border-white\/5 flex flex-col justify-center">[\s\S]*?<\/div>\s*<\/div>/, `<div className="space-y-4">
              {about?.email && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Email Support</p>
                    <a href={\`mailto:\${about.email}\`} className="text-gray-900 dark:text-white font-semibold hover:text-[#5B5FFB] transition-colors">{about.email}</a>
                  </div>
                </div>
              )}
              {about?.website && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Website</p>
                    <a href={about.website} target="_blank" rel="noopener noreferrer" className="text-gray-900 dark:text-white font-semibold hover:text-[#5B5FFB] transition-colors">{about.website.replace('https://', '')}</a>
                  </div>
                </div>
              )}
              {about?.whatsapp && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">WhatsApp</p>
                    <a href={\`https://wa.me/\${about.whatsapp.replace(/\\D/g, '')}\`} target="_blank" rel="noopener noreferrer" className="text-gray-900 dark:text-white font-semibold hover:text-[#5B5FFB] transition-colors">{about.whatsapp}</a>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white dark:bg-[#1E1E2D] p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Follow Us</h2>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              {about?.facebook && (
                <a href={about.facebook} target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-full bg-[#1877F2]/10 hover:bg-[#1877F2]/20 flex items-center justify-center text-[#1877F2] transition-all hover:scale-110 shadow-sm">
                  <Facebook className="w-6 h-6" />
                </a>
              )}
              {about?.instagram && (
                <a href={about.instagram} target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-full bg-[#E4405F]/10 hover:bg-[#E4405F]/20 flex items-center justify-center text-[#E4405F] transition-all hover:scale-110 shadow-sm">
                  <Instagram className="w-6 h-6" />
                </a>
              )}
              {about?.youtube && (
                <a href={about.youtube} target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-full bg-[#FF0000]/10 hover:bg-[#FF0000]/20 flex items-center justify-center text-[#FF0000] transition-all hover:scale-110 shadow-sm">
                  <Youtube className="w-6 h-6" />
                </a>
              )}
              {about?.telegram && (
                <a href={about.telegram} target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-full bg-[#0088cc]/10 hover:bg-[#0088cc]/20 flex items-center justify-center text-[#0088cc] transition-all hover:scale-110 shadow-sm">
                  <Send className="w-6 h-6" />
                </a>
              )}
            </div>
          </div>`);

fs.writeFileSync('src/pages/AboutUs.tsx', content);
