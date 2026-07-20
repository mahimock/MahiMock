import fs from 'fs';

let content = fs.readFileSync('src/contexts/BrandingContext.tsx', 'utf8');
content = content.replace(/setBranding\(\{\n          logoUrl: data\.logoUrl \|\| DEFAULT_BRANDING\.logoUrl,\n          websiteName: data\.websiteName \|\| DEFAULT_BRANDING\.websiteName,\n          faviconUrl: data\.faviconUrl \|\| DEFAULT_BRANDING\.faviconUrl,\n        \}\);/, `setBranding({
          logoUrl: data.logoUrl || DEFAULT_BRANDING.logoUrl,
          websiteName: data.websiteName || DEFAULT_BRANDING.websiteName,
          faviconUrl: data.faviconUrl || DEFAULT_BRANDING.faviconUrl,
          aboutContent: data.aboutContent || DEFAULT_BRANDING.aboutContent,
        });`);

fs.writeFileSync('src/contexts/BrandingContext.tsx', content);
