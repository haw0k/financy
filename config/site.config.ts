import { env } from './env.config';

export const siteConfig = {
  name: 'Financy',
  description: 'Personal finance tracker',
  accentColor: '#00A541',
  logoFontSize: '26px',
  logoFontWeight: 700,
  version: '1.0',
  url: env.siteUrl ?? 'http://localhost:3000',
  socialPreview: '/social-preview.png',
} as const;
