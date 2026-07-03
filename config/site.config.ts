export const siteConfig = {
  name: 'Financy',
  description: 'Personal finance tracker',
  accentColor: '#00A541',
  logoFontSize: '26px',
  logoFontWeight: 700,
  version: '1.0',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  socialPreview: '/social-preview.png',
} as const;
