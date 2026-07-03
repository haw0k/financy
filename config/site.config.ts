const isProduction = process.env.NODE_ENV === 'production';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

if (isProduction && !siteUrl) {
  throw new Error('NEXT_PUBLIC_SITE_URL is required in production');
}

export const siteConfig = {
  name: 'Financy',
  description: 'Personal finance tracker',
  accentColor: '#00A541',
  logoFontSize: '26px',
  logoFontWeight: 700,
  version: '1.0',
  url: siteUrl ?? 'http://localhost:3000',
  socialPreview: '/social-preview.png',
} as const;
